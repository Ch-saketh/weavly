package com.luxzera.server.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "restock_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestockHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "inventory_item_id", nullable = false)
    private UUID inventoryItemId;

    @Column(nullable = false)
    private Integer quantity;

    private String note;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
