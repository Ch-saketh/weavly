"use client";

import { Suspense } from "react";
import CompleteGoogleSignupPage from "@/modules/auth/pages/CompleteGoogleSignupPage";

export default function CompleteGoogleSignupRoute() {
  return (
    <Suspense fallback={null}>
      <CompleteGoogleSignupPage />
    </Suspense>
  );
}
