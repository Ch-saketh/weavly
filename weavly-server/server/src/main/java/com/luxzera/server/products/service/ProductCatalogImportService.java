package com.luxzera.server.products.service;

import com.luxzera.server.products.enums.Audience;
import com.luxzera.server.products.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductCatalogImportService {

    private final ProductRepository productRepository;
    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        try {
            long existingCount = productRepository.count();
            log.info("Current product count in PostgreSQL: {}", existingCount);
            if (existingCount < 12465) {
                log.info("Catalog has {} products (< 12,465). Triggering auto-import of real product metadata...", existingCount);
                int imported = importCatalogFromCsv();
                log.info("Auto-import completed successfully! Total imported/updated: {}", imported);
            } else {
                log.info("Product catalog already fully populated with {} products.", existingCount);
            }
        } catch (Exception e) {
            log.warn("Auto-import notice (will remain available via manual trigger): {}", e.getMessage());
        }
    }

    @Transactional
    public int importCatalogFromCsv() {
        try {
            Resource resource = new ClassPathResource("data/product_metadata.csv");
            if (!resource.exists()) {
                log.warn("product_metadata.csv not found in classpath data/ directory");
                return 0;
            }

            List<ProductCsvRecord> records = parseCsv(resource);
            // Ensure category_id column nullable or populated
            try {
                jdbcTemplate.execute("ALTER TABLE products ALTER COLUMN category_id DROP NOT NULL");
            } catch (Exception ignored) {}

            UUID defaultCategoryId;
            try {
                List<UUID> catIds = jdbcTemplate.query("SELECT id FROM categories LIMIT 1", (rs, rowNum) -> (UUID) rs.getObject("id"));
                if (catIds.isEmpty()) {
                    defaultCategoryId = UUID.nameUUIDFromBytes("weavly-default-category".getBytes(StandardCharsets.UTF_8));
                    jdbcTemplate.update("INSERT INTO categories (id, name, slug, description, hidden, display_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING",
                            defaultCategoryId, "Fashion", "fashion", "Curated Fashion & Apparel", false, 0, Timestamp.from(Instant.now()), Timestamp.from(Instant.now()));
                } else {
                    defaultCategoryId = catIds.get(0);
                }
            } catch (Exception e) {
                defaultCategoryId = UUID.nameUUIDFromBytes("weavly-default-category".getBytes(StandardCharsets.UTF_8));
            }

            String sql = "INSERT INTO products (id, product_id, name, brand_name, category_name, category_id, audience, base_price, sale_price, image_url, product_url, description, created_at, updated_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                    "ON CONFLICT (product_id) DO UPDATE SET " +
                    "name = EXCLUDED.name, " +
                    "brand_name = EXCLUDED.brand_name, " +
                    "category_name = EXCLUDED.category_name, " +
                    "audience = EXCLUDED.audience, " +
                    "base_price = EXCLUDED.base_price, " +
                    "sale_price = EXCLUDED.sale_price, " +
                    "image_url = EXCLUDED.image_url, " +
                    "product_url = EXCLUDED.product_url, " +
                    "description = EXCLUDED.description, " +
                    "updated_at = EXCLUDED.updated_at";

            int batchSize = 500;
            List<Object[]> batchArgs = new ArrayList<>(batchSize);
            int totalImported = 0;
            Timestamp now = Timestamp.from(Instant.now());

            for (ProductCsvRecord r : records) {
                UUID id = UUID.nameUUIDFromBytes(("weavly-prod-" + r.productId).getBytes(StandardCharsets.UTF_8));
                Audience audience = mapAudience(r.gender);
                BigDecimal price = r.price != null && r.price.compareTo(BigDecimal.ZERO) > 0 ? r.price : BigDecimal.valueOf(999);
                String productUrl = "/product/" + r.productId;

                batchArgs.add(new Object[]{
                        id,
                        r.productId,
                        r.name,
                        r.brand,
                        r.category,
                        defaultCategoryId,
                        audience.name(),
                        price,
                        price,
                        r.imageUrl,
                        productUrl,
                        r.description,
                        now,
                        now
                });

                if (batchArgs.size() >= batchSize) {
                    jdbcTemplate.batchUpdate(sql, batchArgs);
                    totalImported += batchArgs.size();
                    batchArgs.clear();
                }
            }

            if (!batchArgs.isEmpty()) {
                jdbcTemplate.batchUpdate(sql, batchArgs);
                totalImported += batchArgs.size();
                batchArgs.clear();
            }

            log.info("Batch import completed: {} products processed.", totalImported);
            return totalImported;
        } catch (Exception e) {
            log.error("Failed to import product catalog: {}", e.getMessage(), e);
            throw new RuntimeException("Product catalog import failed: " + e.getMessage(), e);
        }
    }

    private Audience mapAudience(String gender) {
        if (gender == null) return Audience.UNISEX;
        String g = gender.trim().toUpperCase();
        if (g.startsWith("MEN") || g.startsWith("MAN") || g.startsWith("MALE")) return Audience.MEN;
        if (g.startsWith("WOM") || g.startsWith("FEMALE")) return Audience.WOMEN;
        if (g.startsWith("KID") || g.startsWith("BOY") || g.startsWith("GIRL")) return Audience.KIDS;
        return Audience.UNISEX;
    }

    private List<ProductCsvRecord> parseCsv(Resource resource) throws Exception {
        List<ProductCsvRecord> list = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) return list;

            String line;
            while ((line = reader.readLine()) != null) {
                if (!line.trim().isEmpty()) {
                    List<String> tokens = parseCsvLine(line);
                    if (tokens.size() >= 6) {
                        String productId = tokens.get(0).trim();
                        String name = tokens.get(1).trim();
                        String brand = tokens.get(2).trim();
                        String gender = tokens.get(3).trim();
                        String category = tokens.get(4).trim();
                        BigDecimal price = parsePrice(tokens.get(5));
                        String imageUrl = tokens.size() > 6 ? tokens.get(6).trim() : null;
                        String description = tokens.size() > 7 ? tokens.get(7).trim() : null;

                        list.add(new ProductCsvRecord(productId, name, brand, gender, category, price, imageUrl, description));
                    }
                }
            }
        }
        return list;
    }

    private BigDecimal parsePrice(String s) {
        try {
            if (s == null || s.trim().isEmpty()) return BigDecimal.valueOf(999);
            return new BigDecimal(s.trim());
        } catch (Exception e) {
            return BigDecimal.valueOf(999);
        }
    }

    private List<String> parseCsvLine(String line) {
        List<String> tokens = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '\"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                tokens.add(sb.toString());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        tokens.add(sb.toString());
        return tokens;
    }

    private record ProductCsvRecord(
            String productId,
            String name,
            String brand,
            String gender,
            String category,
            BigDecimal price,
            String imageUrl,
            String description
    ) {}
}
