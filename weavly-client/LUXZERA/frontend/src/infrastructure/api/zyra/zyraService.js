import { config } from "@/infrastructure/api/gateway/config";

/**
 * Fetch Top 10 recommendations from Zyra Recommendation API for ZeraCollection.
 *
 * Connects the frontend directly to the Zyra Recommendation API endpoint (POST /api/v1/zyra/recommendations).
 * Does NOT access Qdrant, Product DB, or internal Zyra models.
 *
 * @param {Object} params
 * @param {string} params.userId - Authenticated user identifier
 * @param {string} [params.occasion="casual"] - Target occasion (e.g. college, casual, party, formal, wedding, date, work, sport)
 * @param {number} [params.limit=10] - Number of recommendations (1 to 10)
 * @param {boolean} [params.forceRefresh=false] - If true, bypasses cached recommendations
 * @returns {Promise<Object>} Recommendation response containing Top 10 products
 */
export async function fetchZyraRecommendations({
  userId,
  occasion = "casual",
  limit = 10,
  forceRefresh = false,
  gender = null,
}) {
  if (!userId) {
    throw new Error("userId is required for Zyra recommendations");
  }

  const url = `${config.zyraApiUrl}/recommendations`;

  const body = {
    userId,
    occasion,
    limit: Math.min(limit, 10),
    forceRefresh,
  };
  if (gender) body.gender = gender.toLowerCase();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Zyra recommendation API error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Fetch multi-occasion recommendations from Zyra Recommendation API.
 *
 * @param {Object} params
 * @param {string} params.userId - Authenticated user identifier
 * @param {Array<string>} [params.occasions] - List of requested occasions
 * @param {number} [params.limit=10] - Number of recommendations per occasion
 * @param {boolean} [params.forceRefresh=false] - If true, bypasses cached recommendations
 * @returns {Promise<Object>} Multi-occasion recommendation response
 */
export async function fetchZyraMultiRecommendations({
  userId,
  occasions = ["college", "casual", "party", "formal"],
  limit = 10,
  forceRefresh = false,
}) {
  if (!userId) {
    throw new Error("userId is required for Zyra recommendations");
  }

  const url = `${config.zyraApiUrl}/recommendations/multi`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      occasions,
      limit: Math.min(limit, 10),
      forceRefresh,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Zyra multi-recommendation API error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}
