package com.url.shortener.config;

import io.lettuce.core.ClientOptions;
import io.lettuce.core.SocketOptions;
import io.lettuce.core.TimeoutOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.data.redis.LettuceClientConfigurationBuilderCustomizer;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.interceptor.SimpleCacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.Map;

@Slf4j
@Configuration
public class RedisConfig implements CachingConfigurer {

    /** How long a single Redis command may take before it is abandoned. */
    @Value("${app.redis.command-timeout-ms:250}")
    private long commandTimeoutMs;

    /** How long to wait for the TCP connection itself. */
    @Value("${app.redis.connect-timeout-ms:1000}")
    private long connectTimeoutMs;

    /**
     * Makes Redis fail FAST instead of hanging.
     *
     * Without this, Lettuce waits up to 60 s for a command and queues commands
     * while disconnected. A Redis outage would then block Tomcat request threads
     * on the redirect hot path until the pool is exhausted and the whole site
     * stops responding — even though every Redis call is already wrapped in a
     * fallback. A fallback that takes 60 s to trigger is not a fallback.
     *
     * With these options an outage costs ~250 ms per request at worst, the
     * CacheErrorHandler below fires, and the request is served from Postgres.
     * REJECT_COMMANDS makes calls fail immediately once Lettuce knows it is
     * disconnected, so the steady-state cost during an outage is near zero.
     * autoReconnect means normal service resumes on its own when Redis returns.
     */
    @Bean
    public LettuceClientConfigurationBuilderCustomizer lettuceFailFastCustomizer() {
        Duration commandTimeout = Duration.ofMillis(commandTimeoutMs);

        return builder -> builder
                .commandTimeout(commandTimeout)
                .clientOptions(ClientOptions.builder()
                        .autoReconnect(true)
                        .disconnectedBehavior(ClientOptions.DisconnectedBehavior.REJECT_COMMANDS)
                        .socketOptions(SocketOptions.builder()
                                .connectTimeout(Duration.ofMillis(connectTimeoutMs))
                                .build())
                        .timeoutOptions(TimeoutOptions.enabled(commandTimeout))
                        .build());
    }

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                new GenericJackson2JsonRedisSerializer()
                        )
                )
                .disableCachingNullValues();

        // Keep hot short URL mappings in Redis until memory pressure requires cleanup.
        RedisCacheConfiguration shortUrlCacheConfig = defaultConfig.entryTtl(Duration.ZERO);

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(Map.of("shortUrls", shortUrlCacheConfig))
                .build();
    }

    /**
     * Silently log Redis errors instead of propagating them.
     * If Redis is down or returns bad data, Spring will call the real method
     * (i.e., MySQL) as a fallback — the user never sees a 500.
     */
    @Override
    public CacheErrorHandler errorHandler() {
        return new SimpleCacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException e, org.springframework.cache.Cache cache, Object key) {
                log.warn("Redis cache GET error on cache='{}' key='{}': {} — falling back to DB",
                        cache.getName(), key, e.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException e, org.springframework.cache.Cache cache, Object key, Object value) {
                log.warn("Redis cache PUT error on cache='{}' key='{}': {}",
                        cache.getName(), key, e.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException e, org.springframework.cache.Cache cache, Object key) {
                log.warn("Redis cache EVICT error on cache='{}' key='{}': {}",
                        cache.getName(), key, e.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException e, org.springframework.cache.Cache cache) {
                log.warn("Redis cache CLEAR error on cache='{}': {}", cache.getName(), e.getMessage());
            }
        };
    }

    /**
     * General-purpose String RedisTemplate used by ClickBuffer for raw
     * Redis commands (INCR counters, SADD tracking set).
     */
    @Bean
    public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        StringRedisSerializer serializer = new StringRedisSerializer();
        template.setKeySerializer(serializer);
        template.setValueSerializer(serializer);
        template.setHashKeySerializer(serializer);
        template.setHashValueSerializer(serializer);
        template.afterPropertiesSet();
        return template;
    }
}
