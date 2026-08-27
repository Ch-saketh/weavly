"use client";

import { Suspense } from "react";
import VerifyOtpPage from "@/modules/auth/pages/VerifyOtpPage";

export default function VerifyOtpRoute() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpPage />
    </Suspense>
  );
}
