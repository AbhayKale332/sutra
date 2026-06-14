package com.url.shortener.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.Properties;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisStartupDiagnostics implements ApplicationRunner {

    private final RedisConnectionFactory redisConnectionFactory;
    private final Environment environment;

    @Override
    public void run(ApplicationArguments args) {
        String configuredUrl = environment.getProperty("spring.data.redis.url");
        log.info("Redis startup diagnostics: configured target={}", sanitizeRedisUrl(configuredUrl));

        try (RedisConnection connection = redisConnectionFactory.getConnection()) {
            String pingResponse = connection.ping();
            Properties serverInfo = connection.serverCommands().info("server");
            Object redisVersion = serverInfo == null ? null : serverInfo.get("redis_version");
            log.info("Redis startup diagnostics: ping={} redis_version={}",
                    pingResponse,
                    redisVersion == null ? "unknown" : redisVersion);
        } catch (Exception e) {
            log.error("Redis startup diagnostics failed: {}", e.getMessage(), e);
        }
    }

    private String sanitizeRedisUrl(String redisUrl) {
        if (redisUrl == null || redisUrl.isBlank()) {
            return "<missing>";
        }

        try {
            URI uri = URI.create(redisUrl);
            String scheme = uri.getScheme() == null ? "redis" : uri.getScheme();
            String host = uri.getHost() == null ? "<unknown-host>" : uri.getHost();
            int port = uri.getPort();

            return port > 0
                    ? String.format("%s://%s:%d", scheme, host, port)
                    : String.format("%s://%s", scheme, host);
        } catch (IllegalArgumentException e) {
            return "<invalid-redis-url>";
        }
    }
}
