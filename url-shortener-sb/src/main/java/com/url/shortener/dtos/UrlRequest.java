package com.url.shortener.dtos;

import lombok.Data;

@Data
public class UrlRequest {
    private String originalUrl;
    private String shortUrl;
}
