package com.luxzera.server.designer.entity;

import com.luxzera.server.designer.enums.CustomizationRequestStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "designer_customization_requests", indexes = {
        @Index(name = "idx_custom_req_id", columnList = "request_id", unique = true),
        @Index(name = "idx_custom_req_designer", columnList = "designer_id"),
        @Index(name = "idx_custom_req_customer", columnList = "customer_id"),
        @Index(name = "idx_custom_req_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignerCustomizationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "request_id", nullable = false, unique = true, length = 32)
    private String requestId;

    @Column(name = "customer_id")
    private UUID customerId;

    @Column(name = "customer_name", nullable = false, length = 120)
    private String customerName;

    @Column(name = "customer_email", nullable = false, length = 180)
    private String customerEmail;

    @Column(name = "customer_phone", length = 32)
    private String customerPhone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "designer_id", nullable = false)
    private Designer designer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "design_id")
    private DesignerDesign design;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "reference_image_urls", columnDefinition = "TEXT")
    private String referenceImageUrls;

    @Column(name = "preferred_color", length = 80)
    private String preferredColor;

    @Column(name = "preferred_fabric", length = 120)
    private String preferredFabric;

    @Column(name = "measurements_json", columnDefinition = "TEXT")
    private String measurementsJson;

    @Column(name = "budget", precision = 12, scale = 2)
    private BigDecimal budget;

    @Column(name = "requested_completion_date")
    private LocalDate requestedCompletionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private CustomizationRequestStatus status = CustomizationRequestStatus.PENDING;

    @Column(name = "designer_notes", columnDefinition = "TEXT")
    private String designerNotes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
