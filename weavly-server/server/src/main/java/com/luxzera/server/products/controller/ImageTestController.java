package com.luxzera.server.products.controller;

import com.luxzera.server.products.storage.service.ImageStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/test/images")
public class ImageTestController {

    private final ImageStorageService imageStorageService;

    public ImageTestController(ImageStorageService imageStorageService) {
        this.imageStorageService = imageStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> testUpload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please select a file to upload"));
        }

        try {
            // Upload to Cloudflare R2 and get the public URL string
            String publicUrl = imageStorageService.uploadProductImage(file);

            return ResponseEntity.ok(Map.of(
                    "message", "🚀 Upload to Cloudflare R2 successful!",
                    "imageUrl", publicUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Upload failed",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * Test Single Image Delete
     * DELETE /api/v1/test/images/delete?imageUrl=https://pub-xxx.r2.dev/products/filename.png
     */
    @DeleteMapping("/delete")
    public ResponseEntity<?> testDelete(@RequestParam("imageUrl") String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "imageUrl query parameter is required"));
        }

        try {
            imageStorageService.deleteImage(imageUrl);
            return ResponseEntity.ok(Map.of(
                    "message", "🗑️ Image deleted successfully from Cloudflare R2!",
                    "deletedUrl", imageUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Delete failed",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * Test Multiple Images Delete
     * DELETE /api/v1/test/images/delete-multiple
     * Body (JSON Array): ["https://pub-xxx.r2.dev/products/1.png", "https://pub-xxx.r2.dev/products/2.png"]
     */
    @DeleteMapping("/delete-multiple")
    public ResponseEntity<?> testDeleteMultiple(@RequestBody List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Image URLs list cannot be empty"));
        }

        try {
            imageStorageService.deleteImages(imageUrls);
            return ResponseEntity.ok(Map.of(
                    "message", "🗑️ Images deleted successfully from Cloudflare R2!",
                    "count", imageUrls.size(),
                    "deletedUrls", imageUrls
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Multiple delete failed",
                    "details", e.getMessage()
            ));
        }
    }
}