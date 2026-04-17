package com.url.shortener.controller;

import com.url.shortener.service.UrlMappingService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class RedirectController {

    private UrlMappingService urlMappingService;

    @GetMapping("/")
    public String home() {
        return "Sutra API is running!";
    }

    @GetMapping("/{shortUrl}")
    public ResponseEntity<Void> redirect(@PathVariable String shortUrl) {
        String originalUrl = urlMappingService.getOriginalUrl(shortUrl);
        if (originalUrl != null) {
            // Fire-and-forget: runs in background thread, 302 is sent immediately
            urlMappingService.recordClick(shortUrl);

            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.add("Location", originalUrl);
            return ResponseEntity.status(302).headers(httpHeaders).build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
