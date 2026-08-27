// src/auth/index.js — barrel export for all auth pages and service
export { default as LoginPage } from "./LoginPage";
export { default as RegisterPage } from "./RegisterPage";
export { default as VerifyOtpPage } from "./VerifyOtpPage";
export { default as ForgotPasswordPage } from "./ForgotPasswordPage";
export { default as CompleteGoogleSignupPage } from "./CompleteGoogleSignupPage";
export * from "../services/auth/authService";
