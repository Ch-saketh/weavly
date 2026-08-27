package com.luxzera.server.products.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "feedbacks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // The user who left the review
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // The product being reviewed
    @Column(name = "product_id", nullable = false)
    private UUID productId;

    // Star rating from 1 to 5
    @Column(nullable = false)
    private Integer rating;
    // 📸 The array of image links uploaded by the user
    @ElementCollection
    @CollectionTable(name = "feedback_images", joinColumns = @JoinColumn(name = "feedback_id"))
    @Column(name = "image_url")
    private List<String> imageUrls;

    // 🎥 The array of video links (unboxing, etc.)
    @ElementCollection
    @CollectionTable(name = "feedback_videos", joinColumns = @JoinColumn(name = "feedback_id"))
    @Column(name = "video_url")
    private List<String> videoUrls;

    // The actual text review
    @Column(columnDefinition = "TEXT")
    private String comment;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}