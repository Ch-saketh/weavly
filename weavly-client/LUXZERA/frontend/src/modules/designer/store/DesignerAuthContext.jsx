"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getDesignerToken,
  setDesignerToken,
  removeDesignerToken,
  loginDesigner as apiLoginDesigner,
  registerDesigner as apiRegisterDesigner,
  getDesignerMe,
} from "../services/designerService";

const DesignerAuthContext = createContext(null);

export function DesignerAuthProvider({ children }) {
  const [designer, setDesigner] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshDesigner = useCallback(async () => {
    const token = getDesignerToken();
    if (!token) {
      setDesigner(null);
      setLoading(false);
      return;
    }
    try {
      const profile = await getDesignerMe();
      setDesigner(profile);
    } catch (err) {
      console.warn("Designer auth token expired or invalid:", err.message);
      removeDesignerToken();
      setDesigner(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDesigner();
  }, [refreshDesigner]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await apiLoginDesigner(credentials);
      await refreshDesigner();
      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const res = await apiRegisterDesigner(data);
      await refreshDesigner();
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeDesignerToken();
    setDesigner(null);
  };

  const isDesignerAuthenticated = !!designer;

  return (
    <DesignerAuthContext.Provider
      value={{
        designer,
        loading,
        isDesignerAuthenticated,
        login,
        register,
        logout,
        refreshDesigner,
      }}
    >
      {children}
    </DesignerAuthContext.Provider>
  );
}

export function useDesignerAuth() {
  const context = useContext(DesignerAuthContext);
  if (!context) {
    throw new Error("useDesignerAuth must be used within a DesignerAuthProvider");
  }
  return context;
}
