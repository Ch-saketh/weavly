import axios from "axios";
import { getToken, removeToken } from "@/shared/utils/token";
import { config } from "@/infrastructure/api/gateway/config";

// Base function to create configured Axios clients
const createClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request Interceptor: Attach JWT token if logged in
  client.interceptors.request.use(
    (config) => {
      const token = getToken();
      const url = config.url || "";
      const isAuthEndpoint = url.startsWith("/auth/");
      const isSearchEndpoint = url.startsWith("/search/");
      
      const requiresToken =
        token &&
        (!isAuthEndpoint || url.startsWith("/auth/complete-google-signup")) &&
        !isSearchEndpoint;

      if (requiresToken) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor: Handle errors globally
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Log technical error details exclusively to browser console for developers
      if (error?.config) {
        console.warn("🔴 [API Gateway Technical Error]:", {
          url: error.config.url,
          method: error.config.method,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
      } else {
        console.warn("🔴 [API Gateway Technical Error]:", error?.message || error);
      }

      if (error.response) {
        const url = error.config?.url || "";
        const isAuthEndpoint = url.includes("/auth/");
        
        // Clean up local auth session only for non-auth protected endpoints when token is expired
        if (error.response.status === 401 && !isAuthEndpoint) {
          removeToken();
          if (typeof window !== "undefined") {
            if (window.location.pathname !== "/" && window.location.pathname !== "/login" && !window.location.pathname.startsWith("/admin/login")) {
              window.location.href = "/";
            }
          }
        }
        const data = error.response.data;
        const status = error.response.status;
        const statusText = error.response.statusText;

        let errPayload;
        if (data && typeof data === "object" && Object.keys(data).length > 0) {
          errPayload = { ...data, status: data.status || status };
        } else if (typeof data === "string" && data.trim()) {
          errPayload = { message: data, status };
        } else {
          const defaultMsg = status === 401 ? "Invalid email or password." : status === 403 ? "Access denied" : status === 404 ? "Resource not found" : `Request failed with status ${status}`;
          errPayload = { message: defaultMsg, status, error: statusText || "Error" };
        }

        return Promise.reject(errPayload);
      }

      // If no response (network error / connection refused)
      return Promise.reject({
        message: error.message || "Unable to connect right now. Please try again in a moment.",
        isNetworkError: true
      });
    }
  );

  return client;
};

// Export domain-specific clients
export const authClient = createClient(config.authApiUrl);
export const usersClient = createClient(config.usersApiUrl);
export const productsClient = createClient(config.productsApiUrl);
export const searchClient = createClient(config.searchApiUrl);

export const apiGateway = {
  auth: authClient,
  users: usersClient,
  products: productsClient,
  search: searchClient,
};
