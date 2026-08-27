import { searchProducts as baseSearchProducts } from "@/modules/products/services/productService";

/**
 * Search products from the backend Product API.
 */
export const searchProductsAi = async (query, params = {}) => {
  try {
    const results = await baseSearchProducts(query, params);
    return results;
  } catch (error) {
    console.error("Error fetching search results:", error);
    return [];
  }
};

export const searchProducts = baseSearchProducts;
