// src/modules/profile/services/userFitDataService.js
import { usersClient } from "@/infrastructure/api/gateway/apiGateway";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (val) => typeof val === "string" && UUID_REGEX.test(val);

/**
 * Fetches the user's fit and 15-questionnaire data from Spring Boot.
 * @param {string} userId - UUID or session indicator
 * @returns {Promise<Object>} FitDataResponseDto
 */
export const getFitData = async (userId) => {
  if (!userId || String(userId).startsWith("customer_dev_")) return null;
  try {
    const endpoint = isUuid(userId) ? `/user-fit-data/${userId}` : `/user-fit-data/me`;
    const response = await usersClient.get(endpoint);
    return response.data;
  } catch (err) {
    console.warn("Fit data fetch notice:", err?.message || err);
    return null;
  }
};

/**
 * Submits the complete 15-area UserFitData questionnaire to Spring Boot.
 * Automatically updates UserProfile.profileCompleted to true upon saving.
 * @param {string} userId - UUID or session indicator
 * @param {Object} fitData - SaveFitDataRequestDto payload
 * @returns {Promise<Object>} FitDataResponseDto
 */
export const saveFitData = async (userId, fitData) => {
  // Clean payload: ensure null/empty are normalized and numbers are parsed
  const payload = {
    heightRange: fitData.heightRange || null,
    exactHeightCm: fitData.exactHeightCm ? Number(fitData.exactHeightCm) : null,
    weightRange: fitData.weightRange || null,
    exactWeightKg: fitData.exactWeightKg ? Number(fitData.exactWeightKg) : null,
    clothingSize: fitData.clothingSize || null,
    fitPreferences: Array.isArray(fitData.fitPreferences) ? fitData.fitPreferences : [],
    preferredStyles: Array.isArray(fitData.preferredStyles) ? fitData.preferredStyles : [],
    avoidedStyles: Array.isArray(fitData.avoidedStyles) ? fitData.avoidedStyles : [],
    preferredClothingTypes: Array.isArray(fitData.preferredClothingTypes) ? fitData.preferredClothingTypes : [],
    avoidedClothingTypes: Array.isArray(fitData.avoidedClothingTypes) ? fitData.avoidedClothingTypes : [],
    preferredColors: Array.isArray(fitData.preferredColors) ? fitData.preferredColors : [],
    avoidedColors: Array.isArray(fitData.avoidedColors) ? fitData.avoidedColors : [],
    occasions: Array.isArray(fitData.occasions) ? fitData.occasions : [],
    primaryOccasion: fitData.primaryOccasion || null,
    budgetRange: fitData.budgetRange || null,
    shoppingPriorities: Array.isArray(fitData.shoppingPriorities) ? fitData.shoppingPriorities.slice(0, 3) : [],
    fashionGoals: Array.isArray(fitData.fashionGoals) ? fitData.fashionGoals : [],
  };

  const endpoint = isUuid(userId) ? `/user-fit-data/${userId}` : `/user-fit-data/me`;
  const response = await usersClient.put(endpoint, payload);
  return response.data;
};
