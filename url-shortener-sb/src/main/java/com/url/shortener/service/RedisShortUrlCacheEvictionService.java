package com.url.shortener.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Properties;

/**
 * Keeps as many cached short URLs as possible in Redis and only evicts the most
 * idle URL cache entries when memory crosses the configured threshold.
 *
 * This preserves the current cache-backed lookup flow while avoiding global
 * Redis eviction policies that could also remove click buffer keys.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RedisShortUrlCacheEvictionService {

    private static final String USED_MEMORY_KEY = "used_memory";

    private final RedisTemplate<String, String> redisTemplate;

    @Value("${app.redis.short-url-cache.enabled:true}")
    private boolean enabled;

    @Value("${app.redis.short-url-cache.cache-name:shortUrls}")
    private String cacheName;

    @Value("${app.redis.short-url-cache.memory-threshold-bytes:26214400}")
    private long memoryThresholdBytes;

    @Value("${app.redis.short-url-cache.target-memory-bytes:23068672}")
    private long targetMemoryBytes;

    @Value("${app.redis.short-url-cache.scan-count:1000}")
    private int scanCount;

    @Scheduled(fixedDelayString = "${app.redis.short-url-cache.cleanup-interval-ms:60000}")
    public void evictIdleShortUrlCacheEntries() {
        if (!enabled) {
            return;
        }

        long usedMemory = getUsedMemoryBytes();
        if (usedMemory < 0 || usedMemory <= memoryThresholdBytes) {
            return;
        }

        List<CacheKeyIdleTime> evictionCandidates = loadEvictionCandidates();
        if (evictionCandidates.isEmpty()) {
            log.warn("Redis cache cleanup: used_memory={} bytes but found no '{}' cache keys to evict",
                    usedMemory, cacheName);
            return;
        }

        evictionCandidates.sort(Comparator.comparing(CacheKeyIdleTime::idleTime).reversed());

        long currentMemory = usedMemory;
        int deletedKeys = 0;

        for (CacheKeyIdleTime candidate : evictionCandidates) {
            if (currentMemory <= targetMemoryBytes) {
                break;
            }

            Boolean deleted = redisTemplate.execute((RedisCallback<Boolean>) connection ->
                    connection.keyCommands().unlink(candidate.keyBytes()) > 0);

            if (Boolean.TRUE.equals(deleted)) {
                deletedKeys++;
                currentMemory = getUsedMemoryBytes();
            }
        }

        log.info("Redis cache cleanup: evicted {} idle '{}' key(s), used_memory={} -> {} bytes",
                deletedKeys, cacheName, usedMemory, currentMemory);
    }

    private List<CacheKeyIdleTime> loadEvictionCandidates() {
        return redisTemplate.execute((RedisCallback<List<CacheKeyIdleTime>>) connection -> {
            List<CacheKeyIdleTime> keys = new ArrayList<>();
            ScanOptions options = ScanOptions.scanOptions()
                    .match(cacheName + "::*")
                    .count(scanCount)
                    .build();

            try (Cursor<byte[]> cursor = connection.keyCommands().scan(options)) {
                while (cursor.hasNext()) {
                    byte[] key = cursor.next();
                    Duration idleTime = connection.keyCommands().idletime(key);
                    keys.add(new CacheKeyIdleTime(key, idleTime == null ? Duration.ZERO : idleTime));
                }
            } catch (Exception e) {
                log.warn("Redis cache cleanup: failed scanning '{}' keys: {}", cacheName, e.getMessage());
            }

            return keys;
        });
    }

    private long getUsedMemoryBytes() {
        Long usedMemory = redisTemplate.execute((RedisCallback<Long>) connection -> extractUsedMemory(connection));
        return usedMemory == null ? -1L : usedMemory;
    }

    private long extractUsedMemory(RedisConnection connection) {
        Properties memoryInfo = connection.serverCommands().info("memory");
        if (memoryInfo == null) {
            return -1L;
        }

        Object usedMemory = memoryInfo.get(USED_MEMORY_KEY);
        if (usedMemory == null) {
            return -1L;
        }

        try {
            return Long.parseLong(usedMemory.toString());
        } catch (NumberFormatException e) {
            log.warn("Redis cache cleanup: could not parse used_memory='{}'", usedMemory);
            return -1L;
        }
    }

    private record CacheKeyIdleTime(byte[] keyBytes, Duration idleTime) {
        @Override
        public String toString() {
            return new String(keyBytes, StandardCharsets.UTF_8);
        }
    }
}
