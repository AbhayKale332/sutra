package com.url.shortener.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.StandardEnvironment;

class DatabaseUrlEnvironmentPostProcessorTest {

    private StandardEnvironment environmentWith(Map<String, Object> values) {
        StandardEnvironment environment = new StandardEnvironment();
        environment.getPropertySources().addFirst(new MapPropertySource("test", values));
        new DatabaseUrlEnvironmentPostProcessor().postProcessEnvironment(environment, null);
        return environment;
    }

    @Test
    void convertsProviderUriAndExtractsCredentials() {
        StandardEnvironment env = environmentWith(Map.of("DB_URL",
                "postgresql://postgres.abc:p%40ss@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require"));

        assertEquals("jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require",
                env.getProperty("spring.datasource.url"));
        assertEquals("postgres.abc", env.getProperty("spring.datasource.username"));
        assertEquals("p@ss", env.getProperty("spring.datasource.password"));
    }

    @Test
    void explicitCredentialsWinOverUriCredentials() {
        StandardEnvironment env = environmentWith(Map.of(
                "DB_URL", "postgres://uriuser:uripass@host:5432/db",
                "DB_USERNAME", "explicit",
                "DB_PASSWORD", "explicitpass"));

        assertEquals("jdbc:postgresql://host:5432/db", env.getProperty("spring.datasource.url"));
        // The URI credentials are not contributed at all, so application.properties keeps
        // binding spring.datasource.username/password to DB_USERNAME/DB_PASSWORD.
        MapPropertySource added = (MapPropertySource) env.getPropertySources().get("normalizedDatabaseUrl");
        assertFalse(added.containsProperty("spring.datasource.username"));
        assertFalse(added.containsProperty("spring.datasource.password"));
    }

    @Test
    void leavesJdbcUrlUntouched() {
        StandardEnvironment env = environmentWith(Map.of("DB_URL", "jdbc:postgresql://localhost:5432/urlshortenerdb"));
        assertNull(env.getPropertySources().get("normalizedDatabaseUrl"));
    }
}
