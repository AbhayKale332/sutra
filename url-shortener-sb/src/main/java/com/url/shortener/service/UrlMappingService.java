package com.url.shortener.service;

import com.url.shortener.dtos.ClickEventDTO;
import com.url.shortener.dtos.UrlMappingDTO;
import com.url.shortener.models.ClickEvent;
import com.url.shortener.models.UrlMapping;
import com.url.shortener.models.User;
import com.url.shortener.repository.ClickEventRepository;
import com.url.shortener.repository.UrlMappingRepository;
import lombok.AllArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UrlMappingService {

    private UrlMappingRepository urlMappingRepository;
    private ClickEventRepository clickEventRepository;
    private ClickBufferService clickBufferService;

    @CacheEvict(value = "urls", key = "#user.id")
    public UrlMappingDTO createShortUrl(String originalUrl, String customSlug, User user) {
        String shortUrl;
        if (customSlug != null && !customSlug.isEmpty()) {
            if (urlMappingRepository.findByShortUrl(customSlug) != null) {
                throw new RuntimeException("Custom link is already taken!");
            }
            shortUrl = customSlug;
        } else {
            shortUrl = generateShortUrl();
        }
        
        UrlMapping urlMapping = new UrlMapping();
        urlMapping.setOriginalUrl(originalUrl);
        urlMapping.setShortUrl(shortUrl);
        urlMapping.setUser(user);
        urlMapping.setCreatedDate(LocalDateTime.now());
        UrlMapping savedUrlMapping = urlMappingRepository.save(urlMapping);
        return convertToDto(savedUrlMapping);
    }

    private UrlMappingDTO convertToDto(UrlMapping urlMapping){
        UrlMappingDTO urlMappingDTO = new UrlMappingDTO();
        urlMappingDTO.setId(urlMapping.getId());
        urlMappingDTO.setOriginalUrl(urlMapping.getOriginalUrl());
        urlMappingDTO.setShortUrl(urlMapping.getShortUrl());
        urlMappingDTO.setClickCount(urlMapping.getClickCount());
        urlMappingDTO.setCreatedDate(urlMapping.getCreatedDate());
        urlMappingDTO.setUsername(urlMapping.getUser().getUsername());
        return urlMappingDTO;
    }

    private String generateShortUrl() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        Random random = new Random();
        StringBuilder shortUrl = new StringBuilder(8);

        for (int i = 0; i < 8; i++) {
            shortUrl.append(characters.charAt(random.nextInt(characters.length())));
        }
        return shortUrl.toString();
    }

    @Cacheable(value = "urls", key = "#user.id")
    public List<UrlMappingDTO> getUrlsByUser(User user) {
        return urlMappingRepository.findByUser(user).stream()
                .map(this::convertToDto)
                .toList();
    }

    public List<ClickEventDTO> getClickEventsByDate(String shortUrl, LocalDateTime start, LocalDateTime end) {
        UrlMapping urlMapping = urlMappingRepository.findByShortUrl(shortUrl);
        if (urlMapping != null) {
            return clickEventRepository.findByUrlMappingAndClickDateBetween(urlMapping, start, end).stream()
                    .collect(Collectors.groupingBy(click -> click.getClickDate().toLocalDate(), Collectors.counting()))
                    .entrySet().stream()
                    .map(entry -> {
                        ClickEventDTO clickEventDTO = new ClickEventDTO();
                        clickEventDTO.setClickDate(entry.getKey());
                        clickEventDTO.setCount(entry.getValue());
                        return clickEventDTO;
                    })
                    .collect(Collectors.toList());
        }
        return null;
    }

    public Map<LocalDate, Long> getTotalClicksByUserAndDate(User user, LocalDate start, LocalDate end) {
        List<UrlMapping> urlMappings = urlMappingRepository.findByUser(user);
        List<ClickEvent> clickEvents = clickEventRepository.findByUrlMappingInAndClickDateBetween(urlMappings, start.atStartOfDay(), end.plusDays(1).atStartOfDay());
        return clickEvents.stream()
                .collect(Collectors.groupingBy(click -> click.getClickDate().toLocalDate(), Collectors.counting()));

    }

    /**
     * Hot path — called on every redirect.
     * Only reads from MySQL (or hits the @Cacheable shortUrls cache);
     * the click is recorded asynchronously in Redis by ClickBufferService.
     */
    @Cacheable(value = "shortUrls", key = "#shortUrl")
    public UrlMapping getOriginalUrl(String shortUrl) {
        return urlMappingRepository.findByShortUrl(shortUrl);
    }

    /**
     * Called by RedirectController after getOriginalUrl returns.
     * Enqueues the click in Redis — returns in ~1ms, no MySQL involved.
     */
    public void recordClick(String shortUrl) {
        clickBufferService.recordClick(shortUrl);
    }
}
