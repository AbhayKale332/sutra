package com.url.shortener.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;

/**
 * Buffers click events in Redis instead of writing to MySQL on every redirect.
 *
 * Memory model (free-tier safe):
 *   click:count:{shortUrl}  → INCR integer string  (~15 bytes each)
 *   click:tracked           → SET of active shortUrls (~10 bytes/member)
 *
 * We deliberately do NOT store individual timestamps — that would grow
 * proportionally to click volume and exhaust the 30 MB free tier quickly.
 * Instead, the sync job stamps each batch with LocalDateTime.now(), which
 * preserves daily-level analytics accuracy (sufficient for the dashboard).
 *
 * Safety nets against memory leaks:
 *   ‣ Count keys get a 24-hour TTL — auto-expire if sync never runs
 *   ‣ The tracked SET gets a rolling 24-hour TTL on every write
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ClickBufferService {

    static final String COUNT_KEY_PREFIX = "click:count:";
    static final String TRACKED_SET_KEY  = "click:tracked";

    /** Keys expire after 24 h if sync never drains them (crash / deploy gap). */
    private static final Duration KEY_TTL = Duration.ofHours(24);

    private final RedisTemplate<String, String> redisTemplate;

    /**
     * Hot path — called on every redirect.
     * Pipelines two Redis commands: INCR counter + SADD tracking set.
     * Memory cost is constant (~15 bytes) regardless of click volume.
     */
    public void recordClick(String shortUrl) {
        String countKey = COUNT_KEY_PREFIX + shortUrl;

        redisTemplate.executePipelined((org.springframework.data.redis.connection.RedisConnection conn) -> {
            // Increment the pending-click counter for this URL
            conn.stringCommands().incr(countKey.getBytes());
            // Mark this URL as having un-synced clicks
            conn.setCommands().sAdd(TRACKED_SET_KEY.getBytes(), shortUrl.getBytes());
            return null;
        });

        // Rolling TTL — keys auto-delete 24 h after the last click if sync dies
        redisTemplate.expire(countKey, KEY_TTL);
        redisTemplate.expire(TRACKED_SET_KEY, KEY_TTL);

        log.debug("Buffered click for '{}'", shortUrl);
    }

    // ── Drain helpers called by ClickSyncService ───────────────────────────

    /** Returns all shortUrls that have un-synced clicks. */
    public Set<String> getTrackedUrls() {
        return redisTemplate.opsForSet().members(TRACKED_SET_KEY);
    }

    /**
     * Atomically reads and deletes the click count delta for a shortUrl.
     * Returns 0 if the key was already expired or never existed.
     */
    public long drainClickCount(String shortUrl) {
        String raw = redisTemplate.opsForValue().getAndDelete(COUNT_KEY_PREFIX + shortUrl);
        return raw == null ? 0L : Long.parseLong(raw);
    }

    /** Remove a shortUrl from the tracking set after it has been synced. */
    public void removeFromTracked(String shortUrl) {
        redisTemplate.opsForSet().remove(TRACKED_SET_KEY, shortUrl);
    }
}
