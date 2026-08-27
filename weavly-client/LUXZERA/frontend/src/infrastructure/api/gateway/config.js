const getApiBaseUrl = () => {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return "https://zera-server.onrender.com/api";
};

const getZyraApiUrl = () => {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_ZYRA_API_URL) {
    return process.env.NEXT_PUBLIC_ZYRA_API_URL;
  }
  return "http://localhost:8001/api/v1/zyra";
};

const getProductsApiUrl = () => {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_PRODUCTS_API_URL) {
    return process.env.NEXT_PUBLIC_PRODUCTS_API_URL;
  }
  return `${getApiBaseUrl()}/products`;
};

const resolveUrl = (envVar) => {
  return envVar || getApiBaseUrl();
};

export const config = {
  authApiUrl: resolveUrl(process.env.NEXT_PUBLIC_AUTH_API_URL),
  usersApiUrl: resolveUrl(process.env.NEXT_PUBLIC_USERS_API_URL),
  productsApiUrl: getProductsApiUrl(),
  searchApiUrl: resolveUrl(process.env.NEXT_PUBLIC_SEARCH_API_URL),
  zyraApiUrl: getZyraApiUrl(),
};
