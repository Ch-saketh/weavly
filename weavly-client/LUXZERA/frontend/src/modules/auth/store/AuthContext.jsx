"use client";

// src/modules/auth/store/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { 
  login as apiLogin, 
  getCurrentUser as apiGetCurrentUser, 
  logout as apiLogout 
} from "../services/authService";
import { setToken, getToken, removeToken } from "@/shared/utils/token";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserRaw] = useState(null);
  const [loading, setLoading] = useState(true);

  // Custom setter to always keep localStorage and cookies in sync
  const setUser = (newUser) => {
    if (typeof window !== "undefined") {
      if (newUser) {
        localStorage.setItem("Weavly_user_cache", JSON.stringify(newUser));
        document.cookie = `Weavly_user_cache=${encodeURIComponent(JSON.stringify(newUser))}; path=/; max-age=604800; samesite=lax`;
      } else {
        localStorage.removeItem("Weavly_user_cache");
        document.cookie = `Weavly_user_cache=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    }
    setUserRaw(newUser);
  };

  // Hydrate user cache and auto-login on mount if a token is present
  useEffect(() => {
    const initAuth = async () => {
      // 1. Initial synchronous hydration from client storage
      try {
        const cached = localStorage.getItem("Weavly_user_cache");
        if (cached) {
          setUserRaw(JSON.parse(cached));
        }
      } catch (e) {
        // ignore corrupted JSON
      }

      // 2. Token verification with backend
      const token = getToken();
      if (token) {
        try {
          // Non-blocking background sync with backend
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Auth sync timeout")), 3000)
          );
          const profile = await Promise.race([apiGetCurrentUser(), timeoutPromise]);
          if (profile) {
            setUser(profile);
          }
        } catch (error) {
          console.warn("Session background sync:", error?.message);
          // ONLY clear session if server explicitly returns 401 Unauthorized or 403 Forbidden (expired/invalid token)
          if (error?.response?.status === 401 || error?.status === 401 || error?.response?.status === 403 || error?.status === 403) {
            removeToken();
            setUser(null);
          }
          // For network hiccups or any other status, maintain cached user session!
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      if (data?.requiresOtp || data?.otpRequired) {
        setLoading(false);
        return data;
      }
      if (data?.accessToken || data?.token) {
        const tokenToStore = data.accessToken || data.token;
        setToken(tokenToStore);
        try {
          const profile = await apiGetCurrentUser();
          setUser(profile);
        } catch {
          setUser(data.user || { email, role: "ROLE_CUSTOMER" });
        }
        setLoading(false);
        return data;
      }
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithToken = async (jwtToken) => {
    setLoading(true);
    try {
      setToken(jwtToken);
      const profile = await apiGetCurrentUser();
      setUser(profile);
      setLoading(false);
      return profile;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = (redirectToOnboarding = true) => {
    // 1. Synchronously remove authentication and user state
    removeToken();
    setUserRaw(null);
    setLoading(false);

    // 2. Clear all user-specific storage caches immediately
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("Weavly_user_cache");
        localStorage.removeItem("Weavly-wardrobe");
        localStorage.removeItem("Weavly-cart-items");
        sessionStorage.clear();
        document.cookie = "Weavly_user_cache=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } catch (e) {
        console.warn("Storage cleanup notice:", e);
      }
    }

    // 3. Fire-and-forget backend session cleanup in the background
    try {
      apiLogout().catch((err) => console.warn("Background API logout:", err?.message));
    } catch (e) {}

    // 4. Force redirect to guest onboarding page if specified
    if (redirectToOnboarding && typeof window !== "undefined") {
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await apiGetCurrentUser();
      setUser(profile);
      return profile;
    } catch (error) {
      console.error("Failed to refresh user:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        loginWithToken,
        logout,
        refreshUser,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
