package com.luxzera.server.zeracart.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "zera_cart_items", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ZeraCartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    @Column(name = "product_id", nullable = false)
    private UUID productId;
    @Column(name = "source", nullable = false)
    private String source;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recommendation_context", columnDefinition = "jsonb")
    private Map<String, Object> recommendationContext;
    @CreationTimestamp
    private LocalDateTime createdAt;
}
