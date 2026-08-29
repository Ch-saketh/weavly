"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from "@/modules/cart/store/CartContext";
import { WardrobeProvider } from "@/modules/wishlist/store/WardrobeContext";
import { AuthProvider } from "@/modules/auth/store/AuthContext";
import { DesignerAuthProvider } from "@/modules/designer/store/DesignerAuthContext";
import ErrorBoundary from "@/shared/components/ui/ErrorBoundary";

const googleClientId = (
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "404546324859-fd8p2oag64g22bpf27o1p6qpidu6mb8l.apps.googleusercontent.com"
).trim();

export default function Providers({ children }) {
  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={googleClientId}>
        <CartProvider>
          <WardrobeProvider>
            <AuthProvider>
              <DesignerAuthProvider>
                {children}
              </DesignerAuthProvider>
            </AuthProvider>
          </WardrobeProvider>
        </CartProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}
