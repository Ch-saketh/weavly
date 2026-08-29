"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";
import DraggableFloatingCart from "@/shared/components/layout/DraggableFloatingCart";
import AuthModal from "@/modules/auth/components/AuthModal";
import OnboardingModal from "@/modules/onboarding/components/OnboardingModal";
import BetaNoticeModal from "@/shared/components/common/BetaNoticeModal";
import { useCart } from "@/modules/cart/store/CartContext";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";
import { useAuth } from "@/modules/auth/store/useAuth";

export default function AppShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { cartCount } = useCart();
  const { wardrobeCount } = useWardrobe();
  const { user: currentUser, loading: authLoading, logout: logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  const [authOpen, setAuthOpen] = useState(false);
  const [authInitialView, setAuthInitialView] = useState("login");

  useEffect(() => {
    if (searchParams.get("openLogin") === "true" && !currentUser) {
      setAuthInitialView(searchParams.get("v") || "login");
      setAuthOpen(true);
    }
  }, [searchParams, currentUser]);

  useEffect(() => {
    const handleCustomOpenAuth = (e) => {
      setAuthInitialView(e.detail?.view || "login");
      setAuthOpen(true);
    };
    window.addEventListener("Weavly:openAuth", handleCustomOpenAuth);
    return () => window.removeEventListener("Weavly:openAuth", handleCustomOpenAuth);
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Strict Route Protection:
  // 1. Redirect unauthenticated guests to login on protected URLs
  // 2. Redirect incomplete authenticated users to / to complete onboarding questionnaire
  useEffect(() => {
    if (authLoading || !mounted) return;

    const publicPaths = [
      "/",
      "/verify-otp",
      "/forgot-password",
      "/reset-password",
      "/complete-google-signup",
      "/about",
      "/faqs",
      "/privacy",
      "/admin/login",
      "/admin/apply",
      "/login",
    ];
    const isDesignerRoute =
      pathname.startsWith("/designer") ||
      pathname.startsWith("/designs") ||
      pathname === "/become-designer" ||
      pathname === "/custom-design";

    const isPublic = publicPaths.includes(pathname) || isDesignerRoute;

    if (!currentUser && !isPublic && !pathname.startsWith("/admin")) {
      router.replace("/?openLogin=true");
      return;
    }

    // Incomplete profile gating: restrict navigation to store until questionnaire is saved
    if (currentUser && currentUser.profileCompleted === false && !isPublic && !pathname.startsWith("/admin") && pathname !== "/account") {
      router.replace("/");
    }
  }, [currentUser, authLoading, pathname, router, mounted]);

  const [isNearBottom, setIsNearBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      if (scrollHeight - scrollTop - clientHeight < 320) {
        setIsNearBottom(true);
      } else {
        setIsNearBottom(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleAppleSignInAction = () => {
    console.log("Apple secure token identity handshake triggered.");
  };

  const openAuthModal = (view = "login") => {
    setAuthInitialView(view);
    setAuthOpen(true);
  };

  const handleSearch = (query) => {
    router.push(`/market?q=${encodeURIComponent(query)}`);
  };

  const currentPage = (() => {
    if (pathname.startsWith("/product")) return "product";
    if (pathname === "/wardrobe") return "wardrobe";
    if (pathname.startsWith("/market") || pathname.startsWith("/shop")) {
      return "shop";
    }
    return pathname.split("/")[1] || "";
  })();

  const authPaths = ["/verify-otp", "/forgot-password", "/reset-password", "/complete-google-signup", "/login"];
  const isGuestOnboarding = mounted && !authLoading && pathname === "/" && !currentUser;
  const isHideLayout = pathname === "/designer-studio" || pathname === "/designer/dashboard" || pathname.startsWith("/admin") || authPaths.includes(pathname) || isGuestOnboarding;
  const showFloatingCart = cartCount > 0 && pathname !== "/cart" && !isHideLayout;
  const showNavbar = !isHideLayout;

  const [betaNoticeOpen, setBetaNoticeOpen] = useState(false);

  // Profile completion status is governed strictly by the backend
  const showOnboardingModal = mounted && !!currentUser && currentUser.profileCompleted === false;

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      {showNavbar && (
        <Navbar
          cartCount={cartCount}
          wardrobeCount={wardrobeCount}
          currentPage={currentPage}
          currentUser={currentUser}
          authLoading={authLoading}
          onLogoClick={() => router.push("/")}
          onShopClick={() => router.push("/market")}
          onMenClick={() => router.push("/men")}
          onWomenClick={() => router.push("/women")}
          onUnisexClick={() => router.push("/unisex")}
          onKidsClick={() => router.push("/kids")}
          onFaqClick={() => router.push("/faqs")}
          onCartClick={() => router.push("/cart")}
          onWardrobeClick={() => router.push("/wardrobe")}
          onAuthClick={() => openAuthModal("login")}
          onAccountClick={() => router.push("/account")}
          onOrdersClick={() => router.push("/orders")}
          onLogout={handleLogout}
          onSearch={handleSearch}
          onBetaClick={() => setBetaNoticeOpen(true)}
          onDesignerClick={() => router.push("/designer-studio")}
        />
      )}

      <main className="flex-1">{children}</main>

      {!isHideLayout && (
        <Footer
          onShopNow={() => router.push("/market")}
          onBetaClick={() => setBetaNoticeOpen(true)}
        />
      )}

      {showFloatingCart && (
        <DraggableFloatingCart cartCount={cartCount} isNearBottom={isNearBottom} />
      )}

      {/* Login & Registration Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => {
          setAuthOpen(false);
          if (searchParams.get("openLogin")) {
            router.replace(pathname);
          }
        }}
        initialView={authInitialView}
        onAppleSignIn={handleAppleSignInAction}
      />

      {/* Onboarding Questionnaire & Profile Setup Modal for Incomplete Profiles */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => {
          // Handled upon successful saveFitData / refreshUser
        }}
      />

      <BetaNoticeModal
        isOpen={betaNoticeOpen}
        onClose={() => setBetaNoticeOpen(false)}
      />
    </div>
  );
}
