import { apiClient } from '@/api/client';
import { setToken, getToken } from '@/shared/utils/token';

/**
 * 1. Admin Authentication & Session Management
 */

// Step 1: Send credentials (username@weavly or email + password) to trigger database-backed OTP email
export const adminLogin = async (identifier, password) => {
  const response = await apiClient.post('/api/admin/auth/login', { 
    identifier: identifier.trim(), 
    password 
  });
  return response.data;
};

// Step 2: Verify 6-digit cryptographic OTP and store the returned Admin JWT token and session
export const verifyAdminOtp = async (identifier, otp) => {
  const response = await apiClient.post('/api/admin/auth/verify-otp', { 
    identifier: identifier.trim(), 
    otp: otp.trim() 
  });
  const data = response.data;
  const token = data?.accessToken || data?.token;
  if (token) {
    setToken(token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('Weavly_admin_token', token);
      if (data?.sessionId) {
        localStorage.setItem('Weavly_admin_session_id', data.sessionId);
      }
    }
  }
  return data;
};

// Revoke active Admin Session (Logout)
export const adminLogout = async () => {
  let sessionId = null;
  if (typeof window !== 'undefined') {
    sessionId = localStorage.getItem('Weavly_admin_session_id');
  }
  try {
    await apiClient.post(`/api/admin/auth/logout${sessionId ? `?sessionId=${sessionId}` : ''}`);
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('Weavly_admin_token');
      localStorage.removeItem('Weavly_admin_session_id');
      localStorage.removeItem('token');
    }
  }
};

// Revoke all active sessions for current admin
export const adminLogoutAll = async () => {
  try {
    await apiClient.post('/api/admin/auth/logout-all');
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('Weavly_admin_token');
      localStorage.removeItem('Weavly_admin_session_id');
      localStorage.removeItem('token');
    }
  }
};

// Fetch current authenticated administrator profile
export const getCurrentAdmin = async () => {
  const response = await apiClient.get('/api/admin/auth/me');
  return response.data;
};

/**
 * 2. Administrator Management & RBAC APIs (Super Admin)
 */

export const listAdmins = async () => {
  const response = await apiClient.get('/api/admin/admins');
  return response.data;
};

export const getAdminDetail = async (id) => {
  const response = await apiClient.get(`/api/admin/admins/${id}`);
  return response.data;
};

export const updateAdminRole = async (id, role) => {
  const response = await apiClient.patch(`/api/admin/admins/${id}`, { role });
  return response.data;
};

export const updateAdminStatus = async (id, status) => {
  const response = await apiClient.patch(`/api/admin/admins/${id}/status`, { status });
  return response.data;
};

export const getAdminPermissions = async (id) => {
  const response = await apiClient.get(`/api/admin/admins/${id}/permissions`);
  return response.data;
};

export const updateAdminPermissions = async (id, payload) => {
  const response = await apiClient.put(`/api/admin/admins/${id}/permissions`, payload);
  return response.data;
};

export const revokeAdminSessions = async (id) => {
  const response = await apiClient.post(`/api/admin/admins/${id}/revoke-sessions`);
  return response.data;
};

export const deleteAdmin = async (id) => {
  const response = await apiClient.delete(`/api/admin/admins/${id}`);
  return response.data;
};

/**
 * 3. Audit Logs, Security Telemetry & Activity Intelligence
 */

export const getAuditSummary = async () => {
  const response = await apiClient.get('/api/admin/audit/summary');
  return response.data;
};

export const getAuditLogs = async (params = {}) => {
  const response = await apiClient.get('/api/admin/audit/logs', { params });
  return response.data;
};

export const getAuditLogDetail = async (id) => {
  const response = await apiClient.get(`/api/admin/audit/logs/${id}`);
  return response.data;
};

export const getSecurityEvents = async (params = {}) => {
  const response = await apiClient.get('/api/admin/audit/security-events', { params });
  return response.data;
};

export const getSecurityEventDetail = async (id) => {
  const response = await apiClient.get(`/api/admin/audit/security-events/${id}`);
  return response.data;
};

export const getAdminActivity = async (adminId, params = {}) => {
  const response = await apiClient.get(`/api/admin/audit/activity/${adminId}`, { params });
  return response.data;
};

export const exportAuditLogs = async (params = {}) => {
  const response = await apiClient.get('/api/admin/audit/export', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

/**
 * 4. Customer Governance & User Administration
 */

export const getUsers = async (params = {}) => {
  const response = await apiClient.get('/api/admin/users', { params });
  return response.data;
};

export const getUserDetail = async (id) => {
  const response = await apiClient.get(`/api/admin/users/${id}`);
  return response.data;
};

export const updateUser = async (id, payload) => {
  const response = await apiClient.patch(`/api/admin/users/${id}`, payload);
  return response.data;
};

export const suspendUser = async (id, reason) => {
  const response = await apiClient.patch(`/api/admin/users/${id}/suspend`, { reason });
  return response.data;
};

export const restoreUser = async (id) => {
  const response = await apiClient.patch(`/api/admin/users/${id}/restore`);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/api/admin/users/${id}`);
  return response.data;
};

export const revokeUserSessions = async (id) => {
  const response = await apiClient.post(`/api/admin/users/${id}/revoke-sessions`);
  return response.data;
};

export const getUserUploads = async (userId) => {
  const response = await apiClient.get(`/api/admin/users/${userId}/uploads`);
  return response.data;
};

export const deleteUserUpload = async (userId, uploadId) => {
  const response = await apiClient.delete(`/api/admin/users/${userId}/uploads/${uploadId}`);
  return response.data;
};

export const exportUsers = async (params = {}) => {
  const response = await apiClient.get('/api/admin/users/export', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

/**
 * 5. Product Catalog Command, Inventory & Media
 */

export const getProducts = async (params = {}) => {
  const response = await apiClient.get('/api/admin/products', { params });
  return response.data;
};

export const getProductDetail = async (id) => {
  const response = await apiClient.get(`/api/admin/products/${id}`);
  return response.data;
};

export const createProduct = async (payload) => {
  const response = await apiClient.post('/api/admin/products', payload);
  return response.data;
};

export const updateProduct = async (id, payload) => {
  const response = await apiClient.patch(`/api/admin/products/${id}`, payload);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/api/admin/products/${id}`);
  return response.data;
};

export const publishProduct = async (id) => {
  const response = await apiClient.post(`/api/admin/products/${id}/publish`);
  return response.data;
};

export const archiveProduct = async (id) => {
  const response = await apiClient.post(`/api/admin/products/${id}/archive`);
  return response.data;
};

export const getProductInventory = async (id) => {
  const response = await apiClient.get(`/api/admin/products/${id}/inventory`);
  return response.data;
};

export const updateProductInventory = async (id, payload) => {
  const response = await apiClient.patch(`/api/admin/products/${id}/inventory`, payload);
  return response.data;
};

export const getProductMedia = async (id) => {
  const response = await apiClient.get(`/api/admin/products/${id}/media`);
  return response.data;
};

export const addProductMedia = async (id, file, setPrimary = false) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post(`/api/admin/products/${id}/media?setPrimary=${setPrimary}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteProductMedia = async (id, mediaUrl) => {
  const response = await apiClient.delete(`/api/admin/products/${id}/media?mediaUrl=${encodeURIComponent(mediaUrl)}`);
  return response.data;
};

export const importProducts = async () => {
  const response = await apiClient.post('/api/admin/products/import');
  return response.data;
};

export const exportProducts = async (params = {}) => {
  const response = await apiClient.get('/api/admin/products/export', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

/**
 * 6. Order Operations & Commerce Administration
 */

export const getOrders = async (params = {}) => {
  const response = await apiClient.get('/api/admin/orders', { params });
  return response.data;
};

export const getOrderDetail = async (id) => {
  const response = await apiClient.get(`/api/admin/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, payload) => {
  const response = await apiClient.patch(`/api/admin/orders/${id}/status`, payload);
  return response.data;
};

export const cancelOrder = async (id, payload) => {
  const response = await apiClient.post(`/api/admin/orders/${id}/cancel`, payload);
  return response.data;
};

export const getOrderTracking = async (id) => {
  const response = await apiClient.get(`/api/admin/orders/${id}/tracking`);
  return response.data;
};

export const updateOrderTracking = async (id, payload) => {
  const response = await apiClient.patch(`/api/admin/orders/${id}/tracking`, payload);
  return response.data;
};

export const requestOrderRefund = async (id, payload) => {
  const response = await apiClient.post(`/api/admin/orders/${id}/refund`, payload);
  return response.data;
};

export const getOrderTimeline = async (id) => {
  const response = await apiClient.get(`/api/admin/orders/${id}/timeline`);
  return response.data;
};

export const exportOrders = async (params = {}) => {
  const response = await apiClient.get('/api/admin/orders/export', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

/**
 * 7. Admin Invitations & Onboarding Lifecycle (Super Admin)
 */

// Super Admin sends invitation to email with assigned role
export const inviteAdmin = async (email, role) => {
  const response = await apiClient.post('/api/admin/admins/invite', { email, role });
  return response.data;
};

// Validate invitation token
export const validateInvitation = async (token) => {
  const response = await apiClient.get(`/api/admin/invitations/validate?token=${encodeURIComponent(token)}`);
  return response.data;
};

// Invitee accepts token and creates username@weavly identity
export const acceptInvitation = async (invitationToken, username, password) => {
  const response = await apiClient.post('/api/admin/invitations/accept', {
    invitationToken,
    username,
    password
  });
  return response.data;
};

// Invitee verifies 6-digit OTP to activate account
export const verifyInvitationOtp = async (invitationToken, otp) => {
  const response = await apiClient.post('/api/admin/invitations/verify-otp', {
    invitationToken,
    otp
  });
  return response.data;
};

/**
 * 3. Legacy Candidate Onboarding (Applications)
 */
export const submitAdminApplication = async (formData) => {
  const response = await apiClient.post('/api/admin/onboarding', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const submitAdminOnboarding = submitAdminApplication;

export const getPendingApplications = async () => {
  const response = await apiClient.get('/api/admin/onboarding/pending');
  return response.data;
};

export const approveAdminApplication = async (id) => {
  const response = await apiClient.post(`/api/admin/onboarding/approve/${id}`);
  return response.data;
};

export const approveApplication = approveAdminApplication;

export const rejectAdminApplication = async (id, reason = '') => {
  const response = await apiClient.post(`/api/admin/onboarding/reject/${id}`, { reason });
  return response.data;
};

export const rejectApplication = rejectAdminApplication;
