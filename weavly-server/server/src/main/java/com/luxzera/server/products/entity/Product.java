package com.luxzera.server.products.entity;

import com.luxzera.server.products.enums.Audience;
import com.luxzera.server.products.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_products_product_id", columnList = "product_id"),
        @Index(name = "idx_products_audience", columnList = "audience"),
        @Index(name = "idx_products_category_name", columnList = "category_name"),
        @Index(name = "idx_products_brand_name", columnList = "brand_name"),
        @Index(name = "idx_products_status", columnList = "status"),
        @Index(name = "idx_products_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "product_id", unique = true)
    private String productId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    @Column(name = "base_price", nullable = false)
    private BigDecimal basePrice;

    @Column(name = "sale_price")
    private BigDecimal salePrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Audience audience;

    @Column(name = "brand_name")
    private String brandName;

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "product_url", columnDefinition = "TEXT")
    private String productUrl;

    @Column(name = "embedding", columnDefinition = "text")
    private String embedding;

    @Column(name = "category_id")
    private UUID categoryId;

    // 🌉 The Bridge Table for Collaborations (EAGER loaded to prevent session errors)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "product_brands",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "brand_id")
    )
    private Set<Brand> brands;

    // 📸 The General Gallery
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> imageUrls;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}