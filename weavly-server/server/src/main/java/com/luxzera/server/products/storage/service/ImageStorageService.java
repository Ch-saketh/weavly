package com.luxzera.server.products.storage.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ImageStorageService {

    String uploadProductImage(MultipartFile file);

    String uploadProfileImage(MultipartFile file);

    String uploadAdminApplicationImage(MultipartFile file);

    String uploadRecommendationImage(MultipartFile file);

    void deleteImage(String imageUrl);

    void deleteImages(List<String> imageUrls);
}