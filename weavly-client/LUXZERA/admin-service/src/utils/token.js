"use client";

export const setToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("luxzera_admin_token", token);
  }
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("luxzera_admin_token") || localStorage.getItem("accessToken");
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("luxzera_admin_token");
    localStorage.removeItem("accessToken");
  }
};
