// src/utils/token.js

const TOKEN_KEY = "accessToken";
const ADMIN_TOKEN_KEY = "Weavly_admin_token";
const LEGACY_TOKEN_KEY = "Weavly_token";

export const setToken = (token) => {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(LEGACY_TOKEN_KEY, token);
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=604800; samesite=lax`;
  } else {
    removeToken();
  }
};

export const getToken = () => {
  if (typeof window === "undefined") return null;
  const token = (
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem(LEGACY_TOKEN_KEY) ||
    localStorage.getItem(ADMIN_TOKEN_KEY)
  );
  if (!token || token === "undefined" || token === "null" || token.trim() === "") {
    return null;
  }
  return token;
};

export const removeToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

export const isLoggedIn = () => {
  return !!getToken();
};
