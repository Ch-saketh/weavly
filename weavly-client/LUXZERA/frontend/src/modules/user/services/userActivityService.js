"use client";

import { config } from "@/infrastructure/api/gateway/config";
import { getToken, isLoggedIn } from "@/shared/utils/token";

const LOCAL_SEARCH_KEY = "weavly_recent_searches_v1";

const getBaseUrl = () => {
  if (config.usersApiUrl) {
    const raw = config.usersApiUrl.replace(/\/$/, "");
    return raw.endsWith("/api") ? raw : `${raw}/api`;
  }
  return "http://localhost:8081/api";
};

/**
 * Record a search query into user history.
 */
export async function recordSearchActivity(query, resultCount = 0, audience = null) {
  if (!query || typeof query !== "string" || !query.trim()) return;
  const q = query.trim();

  // 1. Maintain local search cache for instant UI rendering
  try {
    const raw = localStorage.getItem(LOCAL_SEARCH_KEY);
    let list = raw ? JSON.parse(raw) : [];
    list = [q, ...list.filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, 10);
    localStorage.setItem(LOCAL_SEARCH_KEY, JSON.stringify(list));
  } catch (e) {
    // Ignore local storage error
  }

  // 2. Persist to backend if logged in
  if (isLoggedIn()) {
    try {
      const token = getToken();
      await fetch(`${getBaseUrl()}/users/me/history/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query: q, resultCount, audience }),
      });
    } catch (err) {
      console.warn("Could not sync search history to backend:", err);
    }
  }
}

/**
 * Record product click / view into user history.
 */
export async function recordClickActivity(product, source = "MARKET") {
  if (!product) return;
  const productId = product.id || product.productId;
  if (!productId) return;

  if (isLoggedIn()) {
    try {
      const token = getToken();
      await fetch(`${getBaseUrl()}/users/me/history/click`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          productId: Number(productId),
          productName: product.name || product.title,
          brand: product.brand,
          category: product.category,
          source,
        }),
      });
    } catch (err) {
      console.warn("Could not sync click history to backend:", err);
    }
  }
}

/**
 * Record bag / cart action into user history (ADD, REMOVE, CHECKOUT).
 */
export async function recordBagActivity(product, action = "ADD", size = "M") {
  if (!product) return;
  const productId = product.id || product.productId;
  if (!productId) return;

  if (isLoggedIn()) {
    try {
      const token = getToken();
      await fetch(`${getBaseUrl()}/users/me/history/bag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          productId: Number(productId),
          productName: product.name || product.title,
          brand: product.brand,
          category: product.category,
          price: product.price ? Number(product.price) : null,
          size: size || product.size || "M",
          action: action.toUpperCase(),
        }),
      });
    } catch (err) {
      console.warn("Could not sync bag history to backend:", err);
    }
  }
}

/**
 * Retrieve recent search queries (hybrid: backend + local).
 */
export async function getRecentSearches(limit = 6) {
  let serverList = [];
  if (isLoggedIn()) {
    try {
      const token = getToken();
      const res = await fetch(`${getBaseUrl()}/users/me/history/search?limit=${limit}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          serverList = data.map((item) => item.query).filter(Boolean);
        }
      }
    } catch (err) {
      // Fall back to local storage
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_SEARCH_KEY);
    const localList = raw ? JSON.parse(raw) : [];
    const merged = Array.from(new Set([...serverList, ...localList])).slice(0, limit);
    return merged;
  } catch (e) {
    return serverList.slice(0, limit);
  }
}

/**
 * Clear search history from backend and local cache.
 */
export async function clearSearchHistory() {
  try {
    localStorage.removeItem(LOCAL_SEARCH_KEY);
  } catch (e) {}

  if (isLoggedIn()) {
    try {
      const token = getToken();
      await fetch(`${getBaseUrl()}/users/me/history/search`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (err) {
      console.warn("Could not clear search history on backend:", err);
    }
  }
}
