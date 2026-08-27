import axios from 'axios';
import { getToken } from '@/shared/utils/token';

const API_BASE_URL =
  (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL)) ||
  'http://localhost:8081';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject Bearer token for protected admin routes
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token =
        localStorage.getItem('Weavly_admin_token') ||
        getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error payload
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const data = error.response.data;
      const status = error.response.status;
      const statusText = error.response.statusText;

      let errPayload;
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        errPayload = { ...data, status: data.status || status };
      } else if (typeof data === 'string' && data.trim()) {
        errPayload = { message: data, status };
      } else {
        const defaultMsg =
          status === 401 ? 'Invalid admin credentials.' :
          status === 400 ? 'Invalid request parameter.' :
          status === 403 ? 'Access denied.' :
          status === 404 ? 'Resource not found.' : `Request failed with status ${status}`;
        errPayload = { message: defaultMsg, status, error: statusText || 'Error' };
      }
      return Promise.reject(errPayload);
    }
    return Promise.reject({
      message: error.message || 'Unable to connect right now. Please try again in a moment.',
      isNetworkError: true,
    });
  }
);
