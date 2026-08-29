"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/store/useAuth";
import FamilyStudioHome from "@/modules/home/components/FamilyStudioHome";
import GuestOnboardingPage from "@/modules/onboarding/pages/GuestOnboardingPage";
import { HomeSkeleton } from "@/shared/components/ui/Skeleton";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleShopNow = () => {
    router.push("/market");
  };

  const handleOpenAuth = (view = "login") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("Weavly:openAuth", { detail: { view } }));
    }
    router.push(`/?openLogin=true&v=${view}&t=${Date.now()}`);
  };

  // While client is mounting or auth is hydrating, render the neutral skeleton to prevent visual flash
  if (!mounted || loading) {
    return <HomeSkeleton />;
  }

  // Once authentication resolution is complete:
  if (!user) {
    return <GuestOnboardingPage onOpenAuth={handleOpenAuth} />;
  }

  return <FamilyStudioHome onShopNow={handleShopNow} onOpenAuth={handleOpenAuth} />;
}
