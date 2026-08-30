import { authClient } from "@/infrastructure/api/gateway/apiGateway";

export const register = async (username, firstName, lastName, email, password) => {
  const response = await authClient.post("/auth/register", {
    username,
    firstName,
    lastName,
    email,
    password,
  });
  return response.data;
};

export const verifyOtp = async (email, otp) => {
  const response = await authClient.post("/auth/verify", {
    email,
    code: otp,
  });
  return response.data;
};

export const login = async (email, password) => {
  const response = await authClient.post("/auth/login", {
    email,
    password,
  });
  return response.data;
};

export const googleLogin = async (idToken) => {
  const response = await authClient.post("/auth/google", {
    idToken,
  });
  return response.data;
};

export const completeGoogleSignup = async (username, password) => {
  const response = await authClient.post("/auth/complete-google-signup", {
    username,
    password,
  });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await authClient.post("/auth/password/forgot", {
    email,
  });
  return response.data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const response = await authClient.post("/auth/password/reset", {
    email,
    otpCode: otp,
    newPassword,
  });
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await authClient.post("/auth/password/change", {
    currentPassword,
    newPassword,
  });
  return response.data;
};

export const setPassword = async (password) => {
  const response = await authClient.post("/auth/password/set", {
    password,
  });
  return response.data;
};

export const resendOtp = async (email) => {
  const response = await authClient.post("/auth/resend-otp", {
    email,
  });
  return response.data;
};

export const logout = async () => {
  try {
    await authClient.post("/auth/logout");
  } catch (err) {
    // Fail silently
  }
};

export const getCurrentUser = async () => {
  const response = await authClient.get("/users/me");
  return response.data;
};

export const getAuthMe = async () => {
  const response = await authClient.get("/auth/me");
  return response.data;
};

export const getActiveSessions = async () => {
  const response = await authClient.get("/auth/sessions");
  return response.data;
};

export const revokeSession = async (sessionId) => {
  const response = await authClient.delete(`/auth/sessions/${sessionId}`);
  return response.data;
};

export const revokeOtherSessions = async () => {
  const response = await authClient.delete("/auth/sessions");
  return response.data;
};
