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

export const completeGoogleSignup = async (username, password, email) => {
  const response = await authClient.post("/auth/complete-google-signup", {
    username,
    password,
  });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await authClient.post("/auth/forgot-password", {
    email,
  });
  return response.data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const response = await authClient.post("/auth/reset-password", {
    email,
    otpCode: otp,
    newPassword,
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
