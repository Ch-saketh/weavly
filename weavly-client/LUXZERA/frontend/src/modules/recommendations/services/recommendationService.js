import { config } from "@/infrastructure/api/gateway/config";
import { getToken, isLoggedIn } from "@/shared/utils/token";

const getBaseUrl = () => {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:8081/api";
  }
  return "https://zera-server.onrender.com/api";
};

const ensureHttps = (url) => {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("http://assets.myntassets.com")) {
    return url.replace("http://assets.myntassets.com", "https://assets.myntassets.com");
  }
  if (url.startsWith("http://")) {
    return "https://" + url.slice(7);
  }
  return url;
};

/**
 * Normalizes a single recommendation item from the Spring Boot API.
 */
export const normalizeRecommendationItem = (item, index = 0) => {
  const rank = item.rank || index + 1;
  const productId = String(item.productId || item.id || "");
  const name = item.name || "Curated Fashion Item";
  const brand = item.brand || "Luxzera Studio";
  const gender = item.gender || "Unisex";
  const category = item.category || "Tops";
  const price = Number(item.price || 999);
  const similarity = Number(item.similarity || 0.0);
  const rawImg = item.imageUrl || item.image || (item.images && item.images[0]) || null;
  const imageUrl = ensureHttps(rawImg);
  const productUrl = item.productUrl || (productId ? `/product/${productId}` : "#");

  return {
    rank,
    id: productId || `rec-${rank}`,
    productId,
    name,
    title: name,
    brand,
    gender,
    department: gender,
    category,
    price,
    salePrice: price,
    basePrice: price,
    similarity,
    imageUrl,
    image: imageUrl,
    productUrl,
  };
};

/**
 * Normalizes the full recommendation collection response.
 */
export const normalizeRecommendationCollection = (data) => {
  if (!data) {
    return {
      generationId: null,
      productId: null,
      modelVersion: "zyra-v1-p9",
      count: 0,
      generatedAt: null,
      recommendations: [],
    };
  }

  const rawRecs = data.recommendations || [];
  const recommendations = rawRecs.map(normalizeRecommendationItem);

  return {
    generationId: data.generationId || null,
    productId: data.productId || null,
    modelVersion: data.modelVersion || "zyra-v1-p9",
    count: recommendations.length,
    generatedAt: data.generatedAt || null,
    recommendations,
  };
};

/**
 * Fetch the authenticated user's latest persisted Zera recommendations.
 * GET /api/recommendations/my
 */
export const getMyRecommendations = async (occasion = null) => {
  if (!isLoggedIn()) {
    return normalizeRecommendationCollection(null);
  }

  const token = getToken();
  let url = `${getBaseUrl()}/recommendations/my`;
  if (occasion) {
    url += `?occasion=${encodeURIComponent(occasion)}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401 || res.status === 403 || res.status === 404) {
    // Return empty collection without throwing for unauthenticated or first-time users
    return normalizeRecommendationCollection(null);
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to fetch recommendations: ${res.status}`);
  }

  const data = await res.json();
  return normalizeRecommendationCollection(data);
};

/**
 * Trigger recommendation generation for the authenticated user.
 * POST /api/recommendations/generate
 */
export const generateUserRecommendations = async (params = {}, fallbackTopK = 50) => {
  if (!isLoggedIn()) {
    throw new Error("Authentication required to generate recommendations");
  }

  const token = getToken();
  const url = `${getBaseUrl()}/recommendations/generate`;

  const payload = {};
  if (typeof params === "string" || typeof params === "number") {
    payload.productId = String(params).trim();
    payload.topK = fallbackTopK || 50;
  } else if (params && typeof params === "object") {
    if (params.productId && String(params.productId).trim()) {
      payload.productId = String(params.productId).trim();
    }
    if (params.occasion && String(params.occasion).trim()) {
      payload.occasion = String(params.occasion).trim();
    }
    payload.topK = typeof params.topK === "number" && params.topK >= 1 && params.topK <= 50 ? params.topK : (fallbackTopK || 50);
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to generate recommendations: ${res.status}`);
  }

  const data = await res.json();
  return normalizeRecommendationCollection(data);
};

/**
 * Fetch public occasion recommendations.
 * GET /api/recommendations/occasion/{occasion}
 */
export const getOccasionRecommendations = async (occasion, gender = "Women", topK = 50) => {
  if (!occasion) return [];
  const url = `${getBaseUrl()}/recommendations/occasion/${encodeURIComponent(occasion)}?gender=${encodeURIComponent(gender)}&topK=${topK}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const rawList = data.recommendations || [];
    return rawList.map(normalizeRecommendationItem);
  } catch (err) {
    console.warn("Occasion recommendation fetch notice:", err);
    return [];
  }
};

/**
 * Fetch public product recommendations for a specific product.
 * GET /api/recommendations/product/{productId}
 */
export const getProductRecommendations = async (productId, topK = 50) => {
  if (!productId) return [];
  const url = `${getBaseUrl()}/recommendations/product/${productId}?topK=${topK}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  const rawList = data.recommendations || [];
  return rawList.map(normalizeRecommendationItem);
};
