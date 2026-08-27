import { config } from "@/infrastructure/api/gateway/config";
import { PRODUCTS } from "@/modules/products/data/products";

const FALLBACK_IMAGES = PRODUCTS.flatMap((product) =>
  product.images?.length ? product.images : [product.image]
).filter(Boolean);

const audienceToDepartment = (audience) => {
  if (!audience) return "Unisex";
  const normalized = String(audience).toLowerCase();
  if (normalized === "men") return "Men";
  if (normalized === "women") return "Women";
  if (normalized === "kids") return "Kids";
  return "Unisex";
};

const categoryToFilter = (categoryName) => {
  const normalized = String(categoryName || "").toLowerCase();
  if (normalized.includes("pant") || normalized.includes("skirt") || normalized.includes("bottom") || normalized.includes("jeans")) return "Bottoms";
  if (normalized.includes("jacket") || normalized.includes("coat") || normalized.includes("outer") || normalized.includes("sweater") || normalized.includes("blazer")) return "Outerwear";
  if (normalized.includes("dress") || normalized.includes("saree") || normalized.includes("kurta")) return "Dresses";
  if (normalized.includes("shoe") || normalized.includes("footwear") || normalized.includes("sneaker")) return "Footwear";
  if (normalized.includes("sunglass") || normalized.includes("watch") || normalized.includes("bag") || normalized.includes("access")) return "Accessories";
  return "Tops";
};

export const normalizeProduct = (product, index = 0) => {
  const images = product.images?.length
    ? product.images
    : product.imageUrls?.length
    ? product.imageUrls
    : [product.image || product.imageUrl || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]].filter(Boolean);

  const salePrice = Number(product.price || product.salePrice);
  const basePrice = Number(product.mrp || product.basePrice);
  const price = Number.isFinite(salePrice) && salePrice > 0 ? salePrice : basePrice || 2999.0;

  return {
    id: product.id || product.productId,
    productId: product.productId || product.id,
    name: product.name || product.title,
    title: product.title || product.name,
    description: product.description,
    brand: product.brand || product.brandNames?.[0] || "Luxzera Studio",
    department: audienceToDepartment(product.gender || product.audience),
    gender: product.gender || audienceToDepartment(product.audience),
    price: Number.isFinite(price) ? price : 2999.0,
    originalPrice: Number.isFinite(basePrice) && basePrice > price ? basePrice : null,
    discountPercent: product.discountPercent || (basePrice > price ? Math.round((1 - price / basePrice) * 100) : 0),
    rating: product.rating || 4.2,
    ratingCount: product.ratingCount || 120,
    image: images[0],
    imageUrl: images[0],
    images,
    badge: product.badge || null,
    sizes: product.sizes?.length ? product.sizes : ["S", "M", "L", "XL"],
    category: categoryToFilter(product.category || product.categoryName),
    subcategory: product.subcategory,
    attributes: product.attributes || {},
    occasions: product.occasions || ["casual", "college"],
  };
};

/**
 * Fetch products from backend Product API (mock_product_db in dev mode).
 */
export const getProducts = async (params = {}) => {
  const { category, gender, limit = 100, offset = 0 } = params;
  const url = new URL(config.productsApiUrl);
  if (category && category !== "All") url.searchParams.append("category", category);
  if (gender && gender !== "All") url.searchParams.append("gender", gender);
  url.searchParams.append("limit", limit.toString());
  url.searchParams.append("offset", offset.toString());

  try {
    const res = await fetch(url.toString());
    if (res.ok) {
      const data = await res.json();
      const rawProducts = data.products || data;
      if (Array.isArray(rawProducts) && rawProducts.length > 0) {
        return rawProducts.map(normalizeProduct);
      }
    }
  } catch (err) {
    console.warn("Product API fetch warning, falling back to local dataset:", err);
  }

  // Fallback to static catalog filtered if needed
  let list = PRODUCTS;
  if (gender && gender !== "All") {
    const gNorm = gender.toLowerCase();
    list = list.filter((p) => {
      const pg = (p.gender || p.department || "").toLowerCase();
      return !pg || pg === gNorm || pg === "unisex";
    });
  }
  return list.slice(offset, offset + limit).map(normalizeProduct);
};

/**
 * Fetch paginated products with hasMore flag for infinite scrolling.
 */
export const getPaginatedProducts = async (params = {}) => {
  const { category, gender, limit = 20, offset = 0 } = params;
  const url = new URL(config.productsApiUrl);
  if (category && category !== "All") url.searchParams.append("category", category);
  if (gender && gender !== "All") url.searchParams.append("gender", gender);
  url.searchParams.append("limit", limit.toString());
  url.searchParams.append("offset", offset.toString());

  try {
    const res = await fetch(url.toString());
    if (res.ok) {
      const data = await res.json();
      const rawProducts = data.products || data;
      const total = data.total ?? (Array.isArray(rawProducts) ? rawProducts.length : 0);
      if (Array.isArray(rawProducts)) {
        return {
          products: rawProducts.map(normalizeProduct),
          total,
          hasMore: offset + rawProducts.length < total && rawProducts.length > 0,
        };
      }
    }
  } catch (err) {
    console.warn("Paginated product fetch warning, using local dataset:", err);
  }

  let list = PRODUCTS;
  if (gender && gender !== "All") {
    const gNorm = gender.toLowerCase();
    list = list.filter((p) => {
      const pg = (p.gender || p.department || "").toLowerCase();
      return !pg || pg === gNorm || pg === "unisex";
    });
  }
  const sliced = list.slice(offset, offset + limit);
  return {
    products: sliced.map(normalizeProduct),
    total: list.length,
    hasMore: offset + sliced.length < list.length,
  };
};

/**
 * Fetch product by ID.
 */
export const getProductById = async (productId) => {
  const url = `${config.productsApiUrl}/${productId}`;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return normalizeProduct(data);
    }
  } catch (err) {
    console.warn(`Product API fetch failed for ${productId}:`, err);
  }

  const found = PRODUCTS.find((p) => String(p.id) === String(productId) || String(p.productId) === String(productId));
  return found ? normalizeProduct(found) : null;
};

/**
 * Search products by query term.
 */
export const searchProducts = async (query = "", params = {}) => {
  const url = new URL(`${config.productsApiUrl}/search`);
  url.searchParams.append("q", query);
  if (params.category && params.category !== "All") url.searchParams.append("category", params.category);
  if (params.sort) url.searchParams.append("sort", params.sort);
  if (params.limit) url.searchParams.append("limit", params.limit.toString());

  try {
    const res = await fetch(url.toString());
    if (res.ok) {
      const data = await res.json();
      const rawProducts = data.products || data;
      if (Array.isArray(rawProducts)) {
        return rawProducts.map(normalizeProduct);
      }
    }
  } catch (err) {
    console.warn("Product search API warning:", err);
  }

  // Fallback local search
  const qLower = query.toLowerCase();
  return PRODUCTS.filter((p) => p.name?.toLowerCase().includes(qLower) || p.category?.toLowerCase().includes(qLower)).map(normalizeProduct);
};
