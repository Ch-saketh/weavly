package com.luxzera.server.products.storage.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class ImageStorageServiceImpl implements ImageStorageService {

    private final S3Client s3Client;

    @Value("${cloudflare.r2.bucket-name}")
    private String bucketName;

    @Value("${cloudflare.r2.public-url}")
    private String publicUrl;

    public ImageStorageServiceImpl(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    @Override
    public String uploadProductImage(MultipartFile file) {
        return uploadImage(file, "products");
    }

    @Override
    public String uploadProfileImage(MultipartFile file) {
        return uploadImage(file, "profiles");
    }

    @Override
    public String uploadAdminApplicationImage(MultipartFile file) {
        return uploadImage(file, "admin-applications");
    }

    @Override
    public String uploadRecommendationImage(MultipartFile file) {
        return uploadImage(file, "recommendation-images");
    }

    @Override
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }

        try {
            // Extracts relative key (e.g., "products/uuid.jpg") from full public URL
            String fileKey;
            if (imageUrl.contains("/products/")) {
                fileKey = imageUrl.substring(imageUrl.indexOf("products/"));
            } else if (imageUrl.contains("/profiles/")) {
                fileKey = imageUrl.substring(imageUrl.indexOf("profiles/"));
            } else if (imageUrl.contains("/admin-applications/")) {
                fileKey = imageUrl.substring(imageUrl.indexOf("admin-applications/"));
            } else if (imageUrl.contains("/recommendation-images/")) {
                fileKey = imageUrl.substring(imageUrl.indexOf("recommendation-images/"));
            } else {
                fileKey = imageUrl;
            }

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);

        } catch (Exception e) {
            log.warn("Failed to delete image from Cloudflare R2: {}", imageUrl, e);
        }
    }

    @Override
    public void deleteImages(List<String> imageUrls) {
        if (imageUrls != null && !imageUrls.isEmpty()) {
            imageUrls.forEach(this::deleteImage);
        }
    }

    private String uploadImage(MultipartFile file, String folder) {
        String originalName = file.getOriginalFilename();
        String extension = (originalName != null && originalName.contains("."))
                ? originalName.substring(originalName.lastIndexOf("."))
                : ".jpg";

        String fileKey = folder + "/" + UUID.randomUUID().toString() + extension;

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            return publicUrl + "/" + fileKey;

        } catch (IOException e) {
            throw new RuntimeException("Failed to process and stream multipart asset file to Cloudflare R2", e);
        }
    }
}