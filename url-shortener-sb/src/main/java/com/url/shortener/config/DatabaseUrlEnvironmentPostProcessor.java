package com.url.shortener.config;

import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * Managed Postgres providers (Render, Supabase, Heroku, Neon) hand out a libpq
 * connection URI such as
 * {@code postgresql://user:password@host:5432/dbname?sslmode=require}, but the
 * JDBC driver only accepts {@code jdbc:postgresql://...} and takes the
 * credentials separately. Pasting the provider URI straight into DB_URL makes
 * startup fail with "URL must start with 'jdbc'".
 *
 * This translates that URI shape into the properties Spring expects, so DB_URL
 * accepts either form. A URL that already starts with {@code jdbc:} is left
 * untouched, and explicitly configured DB_USERNAME/DB_PASSWORD always win over
 * credentials embedded in the URI.
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PROPERTY_SOURCE_NAME = "normalizedDatabaseUrl";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String rawUrl = environment.getProperty("DB_URL");
        if (rawUrl == null) {
            return;
        }
        rawUrl = rawUrl.trim();
        if (!rawUrl.startsWith("postgres://") && !rawUrl.startsWith("postgresql://")) {
            return;
        }

        URI uri;
        try {
            uri = new URI(rawUrl);
        } catch (URISyntaxException ex) {
            // Leave it alone; the datasource will report the malformed URL itself.
            return;
        }

        StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://").append(uri.getHost());
        if (uri.getPort() != -1) {
            jdbcUrl.append(':').append(uri.getPort());
        }
        jdbcUrl.append(uri.getRawPath() == null || uri.getRawPath().isEmpty() ? "/" : uri.getRawPath());
        if (uri.getRawQuery() != null) {
            jdbcUrl.append('?').append(uri.getRawQuery());
        }

        Map<String, Object> properties = new HashMap<>();
        properties.put("spring.datasource.url", jdbcUrl.toString());

        String userInfo = uri.getRawUserInfo();
        if (userInfo != null && !userInfo.isEmpty()) {
            int separator = userInfo.indexOf(':');
            String username = decode(separator < 0 ? userInfo : userInfo.substring(0, separator));
            if (!username.isEmpty() && !hasText(environment.getProperty("DB_USERNAME"))) {
                properties.put("spring.datasource.username", username);
            }
            if (separator >= 0) {
                String password = decode(userInfo.substring(separator + 1));
                if (!password.isEmpty() && !hasText(environment.getProperty("DB_PASSWORD"))) {
                    properties.put("spring.datasource.password", password);
                }
            }
        }

        environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, properties));
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
