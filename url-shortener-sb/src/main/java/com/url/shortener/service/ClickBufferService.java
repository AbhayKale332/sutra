package com.url.shortener.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;

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

    /** Suppress repeat outage stack traces to at most one per minute. */
    private static final long OUTAGE_LOG_INTERVAL_MS = 60_000L;

    private final RedisTemplate<String, String> redisTemplate;

    private final AtomicLong suppressedFailures = new AtomicLong();
    private final AtomicLong lastOutageLogAt = new AtomicLong();

    /**
     * Hot path — called on every redirect (from a background thread via @Async).
     * All 4 Redis commands are pipelined into a single network round-trip.
     */
    public void recordClick(String shortUrl) {
        String countKey = COUNT_KEY_PREFIX + shortUrl;
        long ttlSeconds = KEY_TTL.getSeconds();

        try {
            // Single round-trip: INCR + SADD + EXPIRE(count) + EXPIRE(tracked)
            redisTemplate.executePipelined((org.springframework.data.redis.connection.RedisConnection conn) -> {
                byte[] countKeyBytes  = countKey.getBytes();
                byte[] trackedKeyBytes = TRACKED_SET_KEY.getBytes();
                conn.stringCommands().incr(countKeyBytes);
                conn.setCommands().sAdd(trackedKeyBytes, shortUrl.getBytes());
                conn.keyCommands().expire(countKeyBytes, ttlSeconds);
                conn.keyCommands().expire(trackedKeyBytes, ttlSeconds);
                return null;
            });

            log.debug("Buffered click for '{}'", shortUrl);
        } catch (RuntimeException e) {
            // This runs on every redirect. Logging a full stack trace per click
            // would flood the log during an outage and make the I/O itself a
            // bottleneck, so collapse repeats into one line per minute.
            logOutage(e);
        }
    }

    /**
     * Logs the first failure in each window with detail, and counts the rest.
     * Losing a buffered click is not worth taking the site down over: the
     * redirect itself already succeeded before this method was reached.
     */
    private void logOutage(RuntimeException e) {
        long now = System.currentTimeMillis();
        long last = lastOutageLogAt.get();

        if (now - last >= OUTAGE_LOG_INTERVAL_MS && lastOutageLogAt.compareAndSet(last, now)) {
            long skipped = suppressedFailures.getAndSet(0);
            if (skipped > 0) {
                log.warn("Redis click buffer unavailable: {} ({} further failure(s) suppressed in the last minute)",
                        e.getMessage(), skipped);
            } else {
                log.warn("Redis click buffer unavailable, clicks are not being counted: {}", e.getMessage());
            }
        } else {
            suppressedFailures.incrementAndGet();
        }
    }

    // ── Drain helpers called by ClickSyncService ───────────────────────────

    /**
     * Returns all shortUrls that have un-synced clicks.
     * Returns an empty set if Redis is unavailable, so the sync job simply
     * finds nothing to do instead of blowing up.
     */
    public Set<String> getTrackedUrls() {
        try {
            Set<String> tracked = redisTemplate.opsForSet().members(TRACKED_SET_KEY);
            return tracked == null ? Set.of() : tracked;
        } catch (RuntimeException e) {
            log.warn("Redis unavailable while reading the click tracking set: {}", e.getMessage());
            return Set.of();
        }
    }

    /**
     * Atomically reads and deletes the click count delta for a shortUrl.
     * Returns 0 if the key was already expired, never existed, or Redis is down.
     */
    public long drainClickCount(String shortUrl) {
        try {
            String raw = redisTemplate.opsForValue().getAndDelete(COUNT_KEY_PREFIX + shortUrl);
            return raw == null ? 0L : Long.parseLong(raw);
        } catch (NumberFormatException e) {
            log.warn("Discarding non-numeric click counter for '{}': {}", shortUrl, e.getMessage());
            return 0L;
        } catch (RuntimeException e) {
            log.warn("Redis unavailable while draining clicks for '{}': {}", shortUrl, e.getMessage());
            return 0L;
        }
    }

    /** Remove a shortUrl from the tracking set after it has been synced. */
    public void removeFromTracked(String shortUrl) {
        try {
            redisTemplate.opsForSet().remove(TRACKED_SET_KEY, shortUrl);
        } catch (RuntimeException e) {
            log.warn("Redis unavailable while clearing tracking entry for '{}': {}", shortUrl, e.getMessage());
        }
    }
}
