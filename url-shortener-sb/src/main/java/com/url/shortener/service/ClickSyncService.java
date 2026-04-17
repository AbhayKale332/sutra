package com.url.shortener.service;

import com.url.shortener.models.ClickEvent;
import com.url.shortener.models.UrlMapping;
import com.url.shortener.repository.ClickEventRepository;
import com.url.shortener.repository.UrlMappingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Periodically drains the Redis click buffer and persists it to MySQL.
 *
 * Runs every 30 seconds (configurable via app.click-sync.interval-ms).
 *
 * Memory design: Redis only holds one integer counter per active URL.
 * Individual click timestamps are NOT stored in Redis (would exhaust free tier).
 * Instead, all clicks in a sync window are stamped with LocalDateTime.now().
 * This preserves daily-level analytics accuracy at near-zero Redis memory cost.
 *
 * One sync cycle:
 *   1. Fetch all shortUrls with pending clicks (from the tracked SET)
 *   2. Drain the count delta (GETDEL on the counter key)
 *   3. Bump UrlMapping.clickCount in MySQL
 *   4. Batch-insert delta ClickEvent rows all dated to sync-time
 *   5. Remove the shortUrl from the tracking SET
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ClickSyncService {

    private final ClickBufferService clickBufferService;
    private final UrlMappingRepository urlMappingRepository;
    private final ClickEventRepository clickEventRepository;

    @Scheduled(fixedDelayString = "${app.click-sync.interval-ms:30000}")
    @Transactional
    public void syncClicksToDatabase() {
        Set<String> trackedUrls = clickBufferService.getTrackedUrls();
        if (trackedUrls == null || trackedUrls.isEmpty()) {
            return;
        }

        log.info("ClickSync: syncing {} URL(s) from Redis → MySQL", trackedUrls.size());

        List<ClickEvent> eventsToSave = new ArrayList<>();
        // Single sync timestamp for the whole batch — preserves date-level accuracy
        LocalDateTime syncTime = LocalDateTime.now();

        for (String shortUrl : trackedUrls) {
            // Drain the counter first — if this is 0, key already expired (crash gap)
            long delta = clickBufferService.drainClickCount(shortUrl);
            clickBufferService.removeFromTracked(shortUrl);

            if (delta == 0) {
                log.debug("ClickSync: no pending clicks for '{}' (key expired or already drained)", shortUrl);
                continue;
            }

            UrlMapping urlMapping = urlMappingRepository.findByShortUrl(shortUrl);
            if (urlMapping == null) {
                log.warn("ClickSync: shortUrl '{}' no longer exists, discarding {} buffered click(s)", shortUrl, delta);
                continue;
            }

            // Update the running total
            urlMapping.setClickCount(urlMapping.getClickCount() + (int) delta);
            urlMappingRepository.save(urlMapping);

            // Build delta ClickEvent rows all at syncTime
            // (date-level grouping for analytics is preserved — only sub-30s precision lost)
            for (int i = 0; i < delta; i++) {
                ClickEvent event = new ClickEvent();
                event.setClickDate(syncTime);
                event.setUrlMapping(urlMapping);
                eventsToSave.add(event);
            }

            log.debug("ClickSync: flushed {} click(s) for '{}'", delta, shortUrl);
        }

        if (!eventsToSave.isEmpty()) {
            clickEventRepository.saveAll(eventsToSave); // single batch INSERT
            log.info("ClickSync: batch-inserted {} ClickEvent row(s)", eventsToSave.size());
        }
    }
}
