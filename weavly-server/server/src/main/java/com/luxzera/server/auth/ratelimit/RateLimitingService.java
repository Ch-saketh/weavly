package com.luxzera.server.auth.ratelimit;

import com.luxzera.server.common.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
public class RateLimitingService {

    private static class WindowCounter {
        long windowStart;
        AtomicInteger count;

        WindowCounter(long windowStart) {
            this.windowStart = windowStart;
            this.count = new AtomicInteger(1);
        }
    }

    private final Map<String, WindowCounter> requestCounts = new ConcurrentHashMap<>();

    /**
     * Check rate limit for an action keyed by IP or identifier.
     * @param key unique identifier, e.g. "login:192.168.1.1" or "forgot:user@example.com"
     * @param maxRequests max requests allowed in the duration
     * @param windowSeconds sliding window in seconds
     * @throws BadRequestException if rate limit exceeded
     */
    public void checkRateLimit(String key, int maxRequests, long windowSeconds) {
        long now = System.currentTimeMillis();
        long windowMillis = windowSeconds * 1000;

        requestCounts.compute(key, (k, counter) -> {
            if (counter == null || (now - counter.windowStart) > windowMillis) {
                return new WindowCounter(now);
            }
            if (counter.count.incrementAndGet() > maxRequests) {
                log.warn("Rate limit exceeded for key={}, count={}, max={}", key, counter.count.get(), maxRequests);
                throw new BadRequestException("Too many requests. Please wait a few moments before trying again.");
            }
            return counter;
        });
    }

    /**
     * Periodic cleanup of stale window counters to prevent memory leaks.
     */
    public void cleanupStaleEntries() {
        long now = System.currentTimeMillis();
        requestCounts.entrySet().removeIf(entry -> (now - entry.getValue().windowStart) > 300_000); // 5 min TTL
    }
}
