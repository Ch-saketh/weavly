import { apiClient } from '@/api/client';
import { setToken, getToken } from '@/shared/utils/token';

/**
 * 1. Admin Login & OTP Verification
 */

// Step 1: Send credentials to trigger OTP email via Resend
export const adminLogin = async (email, password) => {
  const response = await apiClient.post('/api/auth/admin/login', { email, password });
  return response.data;
};

// Step 2: Verify 6-digit OTP and store the returned JWT token
export const verifyAdminOtp = async (email, otp) => {
  const response = await apiClient.post('/api/auth/admin/verify-otp', { email, otp });
  const data = response.data;
  const token = data?.accessToken || data?.token;
  if (token) {
    setToken(token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('Weavly_admin_token', token);
    }
  }
  return data;
};

/**
 * 2. Admin Onboarding Application (Multipart Form-Data)
 */
export const submitAdminApplication = async (formData) => {
  // formData is a FormData instance containing name, email, phoneNumber, reason, profilePhoto / photo
  const response = await apiClient.post('/api/admin/onboarding', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Alias for compatibility
export const submitAdminOnboarding = submitAdminApplication;

// Fetch pending applications (Requires Super Admin JWT)
export const getPendingApplications = async () => {
  const response = await apiClient.get('/api/admin/onboarding/pending');
  return response.data;
};

// Approve application
export const approveAdminApplication = async (id) => {
  const response = await apiClient.post(`/api/admin/onboarding/approve/${id}`);
  return response.data;
};

export const approveApplication = approveAdminApplication;

// Reject application
export const rejectAdminApplication = async (id, reason = '') => {
  const response = await apiClient.post(`/api/admin/onboarding/reject/${id}`, { reason });
  return response.data;
};

export const rejectApplication = rejectAdminApplication;

/**
 * 3. Product Catalog Management (Cloudflare R2 Multi-Image Uploads)
 */
export const fetchProducts = async () => {
  const response = await apiClient.get('/api/products');
  return response.data;
};

export const getAdminProducts = fetchProducts;

export const createProduct = async (productJsonData, imageFiles = []) => {
  const formData = new FormData();

  if (typeof window !== 'undefined' && productJsonData instanceof FormData) {
    const response = await apiClient.post('/api/products', productJsonData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  formData.append('product', JSON.stringify(productJsonData));
  formData.append('productData', JSON.stringify(productJsonData));

  if (Array.isArray(imageFiles)) {
    imageFiles.forEach((file) => {
      formData.append('images', file);
      formData.append('files', file);
    });
  }

  const response = await apiClient.post('/api/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateProduct = async (id, productDataOrFormData) => {
  const isFormData = typeof window !== 'undefined' && productDataOrFormData instanceof FormData;
  const response = await apiClient.put(`/api/products/${id}`, productDataOrFormData, {
    headers: {
      ...(isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }),
    },
  });
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/api/products/${id}`);
  return response.data;
};
