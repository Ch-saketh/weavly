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
  const endpoint = isUuid(userId) ? `/recommendation-images/${userId}` : `/recommendation-images/me`;
  const response = await usersClient.get(endpoint);
  return response.data;
};

/**
 * Uploads a single recommendation/outfit image to Cloudflare R2 via Spring Boot.
 * @param {string} userId - UUID or session indicator
 * @param {File} file - Image binary file
 * @returns {Promise<Object>} UserRecommendationImageResponseDto
 */
export const uploadRecommendationImage = async (userId, file) => {
  if (!file) throw new Error("Image file is required");

  const formData = new FormData();
  formData.append("image", file);

  const token = getToken();
  const endpointPath = isUuid(userId) ? `/recommendation-images/${userId}` : `/recommendation-images/me`;
  const response = await fetch(`${config.usersApiUrl}${endpointPath}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "Failed to upload recommendation image");
  }
  return data;
};

/**
 * Deletes a recommendation image by its ID.
 * @param {string} userId - UUID or session indicator
 * @param {string} imageId - UUID of the image
 * @returns {Promise<void>}
 */
export const deleteRecommendationImage = async (userId, imageId) => {
  if (!imageId) throw new Error("Image ID is required to delete recommendation image");
  if (isUuid(userId)) {
    await usersClient.delete(`/recommendation-images/${userId}/${imageId}`);
  } else {
    await usersClient.delete(`/recommendation-images/${imageId}`);
  }
};
