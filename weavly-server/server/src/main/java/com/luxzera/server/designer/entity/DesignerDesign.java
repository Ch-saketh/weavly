package com.luxzera.server.designer.entity;

import com.luxzera.server.designer.enums.DesignStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "designer_designs", indexes = {
        @Index(name = "idx_design_id", columnList = "design_id", unique = true),
        @Index(name = "idx_design_designer", columnList = "designer_id"),
        @Index(name = "idx_design_status", columnList = "status"),
        @Index(name = "idx_design_category", columnList = "category")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignerDesign {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "design_id", nullable = false, unique = true, length = 32)
    private String designId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "designer_id", nullable = false)
    private Designer designer;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category", length = 80)
    private String category;

    @Column(name = "style", length = 80)
    private String style;

    @Column(name = "target_audience", length = 40)
    private String targetAudience;

    @Column(name = "primary_image_url", nullable = false, length = 1024)
    private String primaryImageUrl;

    @Column(name = "gallery_image_urls", columnDefinition = "TEXT")
    private String galleryImageUrls;

    @Column(name = "materials", length = 255)
    private String materials;

    @Column(name = "estimated_price", precision = 12, scale = 2)
    private BigDecimal estimatedPrice;

    @Column(name = "is_customizable", nullable = false)
    @Builder.Default
    private Boolean isCustomizable = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private DesignStatus status = DesignStatus.PUBLISHED;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
