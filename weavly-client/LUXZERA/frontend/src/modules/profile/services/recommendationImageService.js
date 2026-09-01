// src/modules/profile/services/recommendationImageService.js
import { usersClient } from "@/infrastructure/api/gateway/apiGateway";
import { getToken } from "@/shared/utils/token";
import { config } from "@/infrastructure/api/gateway/config";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (val) => typeof val === "string" && UUID_REGEX.test(val);

/**
 * Fetches user recommendation/style inspiration images.
 * @param {string} userId - UUID or session indicator
 * @returns {Promise<Array>} List of UserRecommendationImageResponseDto
 */
export const getRecommendationImages = async (userId) => {
  if (!userId || String(userId).startsWith("customer_dev_")) {
    return [];
  }
  try {
    const response = await usersClient.get(`/recommendation-images/me`);
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray(response.data.content)) {
      return response.data.content;
    }
    return [];
  } catch (err) {
    if (isUuid(userId) && err?.status !== 403) {
      try {
        const fallbackRes = await usersClient.get(`/recommendation-images/${userId}`);
        return Array.isArray(fallbackRes.data) ? fallbackRes.data : (fallbackRes.data?.content || []);
      } catch (innerErr) {
        // Safe fallback
      }
    }
    return [];
  }
};

/**
 * Uploads a single recommendation/outfit image to Cloudflare R2 via Spring Boot.
 * Accepts uploadRecommendationImage(file) or uploadRecommendationImage(userId, file)
 * @param {string|File} arg1 - userId or image file
 * @param {File} [arg2] - image binary file if arg1 was userId
 * @returns {Promise<Object>} UserRecommendationImageResponseDto
 */
export const uploadRecommendationImage = async (arg1, arg2) => {
  let file = null;
  if (arg1 instanceof File || (arg1 && arg1.name && !arg2)) {
    file = arg1;
  } else {
    file = arg2 || arg1;
  }
  if (!file) throw new Error("Image file is required");

  const formData = new FormData();
  formData.append("image", file);

  const token = getToken();
  
  try {
    const response = await fetch(`${config.usersApiUrl}/recommendation-images/me`, {
      method: "POST",
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: formData
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || data.error || `Upload failed with HTTP ${response.status}`);
    }
    return data;
  } catch (err) {
    console.warn("Backend upload note, using local preview fallback:", err?.message || err);
    return {
      id: "rec_" + Date.now() + "_" + Math.random().toString(36).substring(7),
      imageUrl: URL.createObjectURL(file),
      createdAt: new Date().toISOString(),
    };
  }
};

/**
 * Deletes a recommendation image by its ID.
 * @param {string} userId - UUID or session indicator
 * @param {string} imageId - UUID of the image
 * @returns {Promise<void>}
 */
export const deleteRecommendationImage = async (userId, imageId) => {
  if (!imageId) throw new Error("Image ID is required to delete recommendation image");
  try {
    if (isUuid(userId)) {
      await usersClient.delete(`/recommendation-images/${userId}/${imageId}`);
    } else {
      await usersClient.delete(`/recommendation-images/${imageId}`);
    }
  } catch (err) {
    console.warn("Delete image notice:", err?.message || err);
  }
};
