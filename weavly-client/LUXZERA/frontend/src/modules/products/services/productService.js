import { config } from "@/infrastructure/api/gateway/config";

const NEUTRAL_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800' fill='none'%3E%3Crect width='600' height='800' fill='%23F4F1EC'/%3E%3Cpath d='M260 360C260 337.909 277.909 320 300 320C322.091 320 340 337.909 340 360V420C340 442.091 322.091 460 300 460C277.909 460 260 442.091 260 420V360Z' stroke='%23C5BCAD' stroke-width='8'/%3E%3Cpath d='M230 460C230 440 250 420 300 420C350 420 370 440 370 460V500H230V460Z' stroke='%23C5BCAD' stroke-width='8'/%3E%3Ctext x='50%25' y='560' font-family='sans-serif' font-size='16' font-weight='500' fill='%239E9484' text-anchor='middle' letter-spacing='2'%3ELUXZERA%3C/text%3E%3C/svg%3E";

const audienceToDepartment = (audience) => {
  if (!audience) return "Unisex";
  const normalized = String(audience).toLowerCase();
  if (normalized.startsWith("men") || normalized.startsWith("man") || normalized.startsWith("male")) return "Men";
  if (normalized.startsWith("wom") || normalized.startsWith("female")) return "Women";
  if (normalized.startsWith("kid") || normalized.startsWith("boy") || normalized.startsWith("girl")) return "Kids";
  return "Unisex";
};

const categoryToFilter = (categoryName) => {
  const normalized = String(categoryName || "").toLowerCase();
  if (normalized.includes("pant") || normalized.includes("skirt") || normalized.includes("bottom") || normalized.includes("jeans") || normalized.includes("trouser")) return "Bottoms";
  if (normalized.includes("jacket") || normalized.includes("coat") || normalized.includes("outer") || normalized.includes("sweater") || normalized.includes("blazer") || normalized.includes("suit")) return "Outerwear";
  if (normalized.includes("dress") || normalized.includes("saree") || normalized.includes("kurta") || normalized.includes("gown") || normalized.includes("lehenga")) return "Dresses";
  if (normalized.includes("shoe") || normalized.includes("footwear") || normalized.includes("sneaker") || normalized.includes("sandal") || normalized.includes("boot") || normalized.includes("heel")) return "Footwear";
  if (normalized.includes("sunglass") || normalized.includes("watch") || normalized.includes("bag") || normalized.includes("access") || normalized.includes("belt") || normalized.includes("perfume")) return "Accessories";
  return "Tops";
};

const ensureHttps = (url) => {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("http://assets.myntassets.com")) {
    return url.replace("http://assets.myntassets.com", "https://assets.myntassets.com");
  }
  if (url.startsWith("http://")) {
    return "https://" + url.slice(7);
  }
  return url;
};

export const normalizeProduct = (product) => {
  if (!product) return null;

  const rawList = product.images?.length
    ? product.images
    : product.imageUrls?.length
    ? product.imageUrls
    : [product.imageUrl || product.image].filter(Boolean);

  const images = rawList.map(ensureHttps).filter(Boolean);
  const primaryImage = images.length > 0 ? images[0] : (product.imageUrl ? ensureHttps(product.imageUrl) : NEUTRAL_PLACEHOLDER);

  const salePrice = Number(product.salePrice ?? product.price);
  const basePrice = Number(product.basePrice ?? product.mrp);
  const price = Number.isFinite(salePrice) && salePrice > 0 ? salePrice : (Number.isFinite(basePrice) && basePrice > 0 ? basePrice : 1499.0);

  const rawGender = product.gender || product.audience || "Unisex";
  const dept = audienceToDepartment(rawGender);

  return {
    id: String(product.id || product.productId || ""),
    productId: String(product.productId || product.id || ""),
    name: product.name || product.title || "Luxury Garment",
    title: product.title || product.name || "Luxury Garment",
    description: product.description || "",
    brand: product.brand || product.brandNames?.[0] || product.brandName || "Luxzera Studio",
    department: dept,
    gender: rawGender,
    audience: rawGender,
    price: Number.isFinite(price) ? price : 1499.0,
    originalPrice: Number.isFinite(basePrice) && basePrice > price ? basePrice : null,
    basePrice: Number.isFinite(basePrice) ? basePrice : price,
    salePrice: Number.isFinite(salePrice) ? salePrice : price,
    discountPercent: product.discountPercent || (basePrice > price ? Math.round((1 - price / basePrice) * 100) : 0),
    rating: product.rating || 4.5,
    ratingCount: product.ratingCount || 48,
    image: primaryImage,
    imageUrl: primaryImage,
    images: images.length > 0 ? images : [primaryImage],
    badge: product.badge || null,
    sizes: product.sizes?.length ? product.sizes : ["S", "M", "L", "XL"],
    category: categoryToFilter(product.category || product.categoryName),
    rawCategory: product.category || product.categoryName || "",
    subcategory: product.subcategory || "",
    attributes: product.attributes || {},
    occasions: product.occasions || [],
    productUrl: product.productUrl || "",
  };
};

// In-memory request deduplication and TTL cache (30s)
const requestCache = new Map();
const inFlightRequests = new Map();
const CACHE_TTL_MS = 30000;

/**
 * Fetch products from Spring Boot Product API with deduplication & caching.
 */
export const getProducts = async (params = {}) => {
  const { category, gender, limit = 50, offset = 0, search } = params;
  const baseUrl = config.productsApiUrl;
  const url = new URL(baseUrl);
  
  if (category && category !== "All") url.searchParams.append("category", category);
  if (gender && gender !== "All") url.searchParams.append("gender", gender);
  if (search && search.trim()) url.searchParams.append("search", search.trim());
  url.searchParams.append("limit", limit.toString());
  url.searchParams.append("offset", offset.toString());

  const cacheKey = url.toString();
  const now = Date.now();

  // Check TTL cache
  if (requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
    requestCache.delete(cacheKey);
  }

  // Deduplicate in-flight concurrent requests
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const rawProducts = data.products || (Array.isArray(data) ? data : []);
        const normalized = rawProducts.map(normalizeProduct).filter(Boolean);
        requestCache.set(cacheKey, { data: normalized, timestamp: Date.now() });
        return normalized;
      }
      console.warn(`Product API returned status ${res.status} for ${url.toString()}`);
    } catch (err) {
      console.error("Failed to fetch products from backend API:", err);
    } finally {
      inFlightRequests.delete(cacheKey);
    }
    return [];
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
};

/**
 * Fetch paginated products with hasMore flag for infinite scrolling.
 */
export const getPaginatedProducts = async (params = {}) => {
  const { category, gender, limit = 24, offset = 0, search } = params;
  const baseUrl = config.productsApiUrl;
  const url = new URL(baseUrl);
  
  if (category && category !== "All") url.searchParams.append("category", category);
  if (gender && gender !== "All") url.searchParams.append("gender", gender);
  if (search && search.trim()) url.searchParams.append("search", search.trim());
  url.searchParams.append("limit", limit.toString());
  url.searchParams.append("offset", offset.toString());

  const cacheKey = "paginated:" + url.toString();
  const now = Date.now();

  if (requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
    requestCache.delete(cacheKey);
  }

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const rawProducts = data.products || (Array.isArray(data) ? data : []);
        const total = Number(data.total ?? rawProducts.length);
        const hasMore = Boolean(data.hasMore ?? (offset + rawProducts.length < total));
        const result = {
          products: rawProducts.map(normalizeProduct).filter(Boolean),
          total,
          hasMore,
        };
        requestCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }
      console.warn(`Paginated product API returned status ${res.status} for ${url.toString()}`);
    } catch (err) {
      console.error("Failed to fetch paginated products from backend API:", err);
    } finally {
      inFlightRequests.delete(cacheKey);
    }
    return {
      products: [],
      total: 0,
      hasMore: false,
    };
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
};

/**
 * Fetch product by ID or Product ID from Spring Boot backend.
 */
export const getProductById = async (productId) => {
  if (!productId) return null;
  const url = `${config.productsApiUrl}/${encodeURIComponent(productId)}`;
  const cacheKey = "product:" + productId;
  const now = Date.now();

  if (requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
    requestCache.delete(cacheKey);
  }

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const normalized = normalizeProduct(data);
        if (normalized) {
          requestCache.set(cacheKey, { data: normalized, timestamp: Date.now() });
        }
        return normalized;
      }
      console.warn(`Product detail API returned ${res.status} for ID ${productId}`);
    } catch (err) {
      console.error(`Failed to fetch product ${productId}:`, err);
    } finally {
      inFlightRequests.delete(cacheKey);
    }
    return null;
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
};

/**
 * Search products by query term.
 */
export const searchProducts = async (query = "", params = {}) => {
  const q = (query || "").trim();
  if (!q) return [];

  const baseUrl = config.productsApiUrl;
  const url = new URL(baseUrl);
  url.searchParams.append("search", q);
  if (params.category && params.category !== "All") url.searchParams.append("category", params.category);
  if (params.gender && params.gender !== "All") url.searchParams.append("gender", params.gender);
  if (params.limit) url.searchParams.append("limit", params.limit.toString());

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const rawProducts = data.products || (Array.isArray(data) ? data : []);
      return rawProducts.map(normalizeProduct).filter(Boolean);
    }
  } catch (err) {
    console.error(`Failed to search products for "${q}":`, err);
  }

  return [];
};

/**
 * Fetch live search autocomplete suggestions.
 */
export const getSearchSuggestions = async (query = "", limit = 6) => {
  const q = (query || "").trim();
  if (!q || q.length < 2) return [];

  const baseUrl = `${config.productsApiUrl}/search/suggestions`;
  const url = new URL(baseUrl);
  url.searchParams.append("q", q);
  url.searchParams.append("limit", limit.toString());

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (err) {
    console.error(`Failed to fetch suggestions for "${q}":`, err);
  }
  return [];
};

