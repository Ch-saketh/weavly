"use client";

import { useEffect } from "react";

export default function AdminLoginRedirect() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = "http://localhost:3001/login";
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#18181B] text-white flex flex-col items-center justify-center space-y-3 font-sans">
      <div className="w-6 h-6 border-2 border-[#F07020] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs text-[#A1A1AA]">Redirecting to Weavly Admin Service Login (port 3001)...</p>
    </div>
  );
}
