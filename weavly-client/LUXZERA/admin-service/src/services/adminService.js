import axios from "axios";
import { getToken } from "@/utils/token";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || "API request failed.";

    const customError = new Error(message);
    customError.status = status;
    customError.data = error.response?.data;

    return Promise.reject(customError);
  }
);

export const adminLogin = async (email, password) => {
  const response = await api.post("/auth/admin/login", { email, password });
  return response.data;
};

export const verifyAdminOtp = async (email, otp) => {
  const response = await api.post("/auth/admin/verify-otp", { email, otp });
  return response.data;
};

export const submitAdminOnboarding = async (formData) => {
  const response = await api.post("/admin/onboarding", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getPendingApplications = async () => {
  try {
    const response = await api.get("/admin/onboarding/pending");
    return response.data;
  } catch (err) {
    const status = err.status || err.response?.status;
    if (status === 404 || status === 400 || status === 403) return [];
    return [];
  }
};

export const approveApplication = async (id) => {
  const response = await api.post(`/admin/onboarding/approve/${id}`);
  return response.data;
};

export const rejectApplication = async (id, reason) => {
  const response = await api.post(`/admin/onboarding/reject/${id}`, { reason });
  return response.data;
};

export const createAdminProduct = async (productData) => {
  try {
    const response = await api.post("/admin/products", productData);
    return response.data;
  } catch (err) {
    if (err.status === 404) {
      const response = await api.post("/products", productData);
      return response.data;
    }
    throw err;
  }
};

export const getAdminProducts = async () => {
  try {
    const response = await api.get("/admin/products");
    return response.data;
  } catch (err) {
    if (err.status === 404 || err.status === 400) {
      try {
        const response = await api.get("/products");
        return response.data;
      } catch (fallbackErr) {
        return [];
      }
    }
    throw err;
  }
};

export const deleteAdminProduct = async (id) => {
  try {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  } catch (err) {
    if (err.status === 404) {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    }
    throw err;
  }
};
