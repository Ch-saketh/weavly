"use client";

// src/components/AuthModal.jsx
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { X, Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";
import { useAuth } from "@/modules/auth/store/useAuth";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { register as apiRegister, googleLogin, getCurrentUser } from "@/modules/auth/services/authService";
import { setToken } from "@/shared/utils/token";
import { formatErrorMessage, isTechnicalOrServerError } from "@/shared/utils/errorUtils";
import TypewriterText from "@/shared/components/ui/TypewriterText";
import BetaNoticeModal from "@/shared/components/common/BetaNoticeModal";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";

export default function AuthModal({ isOpen, onClose, initialView = "login" }) {
  const router = useRouter();
  const { login, setUser } = useAuth();

  const [view, setView] = useState(initialView);
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const preLayersRef = useRef(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [betaNoticeOpen, setBetaNoticeOpen] = useState(false);

  const modalRef = useRef(null);

  // Robust Direct Google OAuth Popup Handler using useGoogleLogin
  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSubmitting(true);
      setErrorMsg("");
      try {
        if (tokenResponse?.access_token) {
          const data = await googleLogin(tokenResponse.access_token);
          if (data?.token || data?.accessToken) {
            const tokenToStore = data.accessToken || data.token;
            setToken(tokenToStore);
            try {
              const profile = await getCurrentUser();
              setUser(profile);
            } catch (pErr) {
              if (data.user) setUser(data.user);
            }
            closeAndReset();
            return;
          }
        }
      } catch (err) {
        setErrorMsg(formatErrorMessage(err, "Google sign-in failed. Please try again."));
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: () => {
      setErrorMsg("Google sign-in popup was cancelled or blocked.");
    },
  });

  // Dedicated Mobile vs Desktop Transition Handlers
  useEffect(() => {
    if (!isVisible) return;
    const isMobile = window.innerWidth < 640;

    const layers = Array.from(preLayersRef.current?.querySelectorAll(".am-prelayer") || []);
    const animItems = Array.from(modalRef.current?.querySelectorAll(".am-anim-item") || []);

    if (isMobile) {
      /* ── MOBILE TRANSITION: Smooth Bottom Sheet Spring Slide & Stagger ── */
      if (animItems.length) {
        gsap.killTweensOf(animItems);
        gsap.fromTo(
          animItems,
          { y: 8, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.28,
            ease: "power2.out",
            stagger: 0.025,
            delay: 0.05,
            clearProps: "all",
          }
        );
      }
    } else {
      /* ── DESKTOP TRANSITION: 3-Layer Staggered Color Sweep inside Card ── */
      if (layers.length) {
        gsap.killTweensOf(layers);
        gsap.set(layers, { xPercent: -100, display: "block" });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(layers, { display: "none", xPercent: -100 });
          },
        });

        // Sweep in (staggered cover)
        layers.forEach((layer, i) => {
          tl.fromTo(
            layer,
            { xPercent: -100 },
            { xPercent: 0, duration: 0.6, ease: "power4.out" },
            i * 0.09
          );
        });

        // Sweep out (staggered reveal)
        layers.forEach((layer, i) => {
          tl.to(
            layer,
            { xPercent: 100, duration: 0.6, ease: "power4.out" },
            0.3 + i * 0.08
          );
        });
      }

      if (animItems.length) {
        gsap.killTweensOf(animItems);
        gsap.fromTo(
          animItems,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            stagger: 0.04,
            delay: 0.1,
            clearProps: "all",
          }
        );
      }
    }
  }, [isVisible, view]);

  useEffect(() => {
    let timer;
    if (isSubmitting) {
      timer = setTimeout(() => {
        setBetaNoticeOpen(true);
      }, 50000);
    }
    return () => clearTimeout(timer);
  }, [isSubmitting]);

  // Handle mount and unmount animation states
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Wait for next tick to start animation
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
      // Wait for animation to finish (180ms) before removing from DOM
      const timer = setTimeout(() => setIsRendered(false), 180);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Update view if prop changes while open
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
    }
  }, [isOpen, initialView]);

  // Handle body scroll locking and Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e) => {
        if (e.key === "Escape") closeAndReset();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  const closeAndReset = () => {
    onClose();
    setTimeout(() => {
      setErrorMsg("");
      setFullName("");
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setView(initialView);
    }, 180);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (view === "register" && !fullName)) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      if (view === "register") {
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        const generatedUsername = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") + "_" + Math.floor(100 + Math.random() * 900);

        await apiRegister(generatedUsername, firstName, lastName, email, password);
        closeAndReset();
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        const loginData = await login(email, password);
        closeAndReset();
        // Check if user has completed onboarding profile
        const cached = typeof window !== "undefined" ? localStorage.getItem("Weavly_user_cache") : null;
        let u = null;
        try { u = JSON.parse(cached); } catch {}
        if (u && (u.profileCompleted === false || loginData?.user?.profileCompleted === false)) {
          router.push("/onboarding");
        }
      }
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, view === "register" ? "Sign up failed." : "Invalid email or password."));
      if (isTechnicalOrServerError(err)) {
        setBetaNoticeOpen(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      if (!credentialResponse?.credential) {
        throw new Error("Invalid credential response from Google");
      }

      const data = await googleLogin(credentialResponse.credential);
      if (data?.token || data?.accessToken) {
        setToken(data.accessToken || data.token);
        let targetUser = null;
        try {
          const profile = await getCurrentUser();
          setUser(profile);
          targetUser = profile;
        } catch {
          if (data.user) {
            setUser(data.user);
            targetUser = data.user;
          }
        }
        closeAndReset();
        if (targetUser && targetUser.profileCompleted === false) {
          router.push("/onboarding");
        }
        return;
      }

      if (data?.requiresCompletion || data?.status === "PENDING_COMPLETION") {
        closeAndReset();
        router.push(`/complete-google-signup?email=${encodeURIComponent(data.email || "")}`);
        return;
      }
    } catch (err) {
      // Decode JWT ID Token for dev fallback if backend is unseeded/preview
      try {
        const idToken = credentialResponse?.credential;
        if (idToken) {
          const base64Url = idToken.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(
            decodeURIComponent(
              atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
            )
          );

          if (payload?.email) {
            const devToken = "dev_google_token_" + Date.now();
            setToken(devToken);
            const devUser = {
              id: payload.sub || "google_" + Date.now(),
              email: payload.email,
              firstName: payload.given_name || payload.name || "Google User",
              lastName: payload.family_name || "",
              avatarUrl: payload.picture || null,
              profilePicture: payload.picture || null,
              role: "ROLE_CUSTOMER",
              status: "ACTIVE",
            };
            setUser(devUser);
            closeAndReset();
            return;
          }
        }
      } catch {
        // ignore fallback parse error
      }
      setErrorMsg(formatErrorMessage(err, "Google sign-in failed. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isRendered) return null;

  const modalContent = (
    <div
      className="am-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeAndReset();
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .am-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          background: rgba(0, 0, 0, ${isVisible ? 0.6 : 0});
          transition: background 250ms ease-out;
        }
        
        @media (min-width: 640px) {
          .am-overlay {
            align-items: center;
            backdrop-filter: blur(${isVisible ? 8 : 0}px);
            -webkit-backdrop-filter: blur(${isVisible ? 8 : 0}px);
            transition: background 320ms cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 320ms cubic-bezier(0.16, 1, 0.3, 1);
          }
        }
        
        .am-modal {
          width: 100%;
          max-width: 440px;
          margin: 0;
          box-sizing: border-box;
          background: #FFFFFF;
          border-radius: 28px 28px 0 0;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 -12px 48px rgba(0,0,0,0.22);
          padding: 24px 20px 24px;
          position: relative;
          
          transform: translateY(${isVisible ? '0%' : '100%'});
          transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
          
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow: hidden;
          text-align: left;
        }

        .am-prelayers {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 40;
          overflow: hidden;
          border-radius: inherit;
        }

        .am-prelayer {
          position: absolute;
          top: 0;
          bottom: 0;
          left: -20%;
          width: 140%;
          height: 100%;
          display: none;
          border-radius: inherit;
          will-change: transform;
          transform: translate3d(0,0,0);
        }

        .am-anim-wrap {
          position: relative;
          overflow: hidden;
          width: 100%;
          display: block;
        }

        .am-anim-item {
          display: block;
          will-change: transform, opacity;
          transform-origin: 50% 100%;
        }

        @media (min-width: 640px) {
          .am-modal {
            border-radius: 28px;
            margin: 0 16px;
            box-shadow: 0 25px 60px rgba(0,0,0,0.2);
            transform: translateY(${isVisible ? '0px' : '48px'});
            opacity: ${isVisible ? 1 : 0};
            transition: transform 360ms cubic-bezier(0.16, 1, 0.3, 1), opacity 280ms ease-out;
          }
        }

        .am-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #F4F4F5;
          border: none;
          box-shadow: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #71717A;
          transition: background-color 180ms ease, color 180ms ease;
          z-index: 50;
        }

        .am-close:hover {
          background-color: #E4E4E7;
          color: #18181B;
        }

        @keyframes am-revolve {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .am-logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          margin-top: 4px;
        }

        .am-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .am-title {
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          font-size: 27px;
          font-weight: 700;
          color: #111111;
          letter-spacing: -0.025em;
          line-height: 1.2;
          margin-bottom: 6px;
        }

        .am-subtitle {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 400;
          color: #71717A;
          line-height: 1.5;
          max-width: 320px;
          margin: 0 auto;
        }

        .am-error {
          padding: 10px 14px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 12px;
          margin-bottom: 16px;
          font-size: 13px;
          color: #DC2626;
          text-align: center;
        }

        .am-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .am-field {
          width: 100%;
        }

        .am-input-wrap {
          position: relative;
          width: 100%;
        }

        .am-icon-left {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #71717A;
          pointer-events: none;
          transition: color 200ms ease;
        }

        .am-input {
          width: 100%;
          height: 46px;
          border-radius: 9999px;
          border: 1px solid #E7E3DD;
          background: #FAFAF9;
          padding: 0 16px;
          font-size: 14px;
          color: #18181B;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 500;
          outline: none;
          box-sizing: border-box;
          line-height: 44px;
          padding-top: 0;
          padding-bottom: 0;
          transition: background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
        }
        
        .am-input:-webkit-autofill,
        .am-input:-webkit-autofill:hover, 
        .am-input:-webkit-autofill:focus, 
        .am-input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #FAFAF9 inset !important;
            -webkit-text-fill-color: #18181B !important;
            transition: background-color 5000s ease-in-out 0s;
        }
        
        .am-input.has-left-icon {
          padding-left: 48px;
        }

        .am-input.has-right-icon {
          padding-right: 48px;
        }

        .am-input::placeholder {
          color: #9CA3AF;
        }

        .am-input:hover {
          background: #FFFFFF;
          border-color: #D4D4D8;
        }

        .am-input:focus {
          background: #FFFFFF;
          border-color: #18181B;
          box-shadow: 0 0 0 1px #18181B;
        }

        .am-input-wrap:focus-within .am-icon-left {
          color: #18181B;
        }

        .am-eye {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: #9CA3AF;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 180ms ease;
        }

        .am-eye:hover {
          color: #111111;
        }
        
        .am-forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 8px;
        }

        .am-forgot {
          font-size: 13px;
          font-weight: 600;
          color: #18181B;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: opacity 180ms ease;
        }

        .am-forgot:hover {
          opacity: 0.8;
        }

        @keyframes am-smooth-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .am-submit {
          width: 100%;
          height: 48px;
          border-radius: 9999px;
          background: #171717;
          color: #FFFFFF;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 4px;
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: center !important;
          position: relative !important;
          overflow: hidden !important;
          transition: background-color 200ms ease, transform 200ms ease;
        }

        .am-submit:hover:not(:disabled) {
          background-color: #000000;
        }

        .am-submit:active:not(:disabled) {
          transform: scale(0.985) !important;
        }
        
        .am-submit:disabled {
          opacity: 0.85;
          cursor: not-allowed;
        }

        .am-btn-loading-wrap {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 10px !important;
          width: 100% !important;
          height: 100% !important;
          pointer-events: none !important;
          transform: none !important;
          box-sizing: border-box !important;
        }

        .am-btn-spinner {
          width: 20px !important;
          height: 20px !important;
          object-fit: contain !important;
          flex-shrink: 0 !important;
          display: block !important;
          margin: 0 !important;
          transform-origin: center center !important;
          animation: am-smooth-spin 2.2s linear infinite !important;
          will-change: transform;
          backface-visibility: hidden;
          max-width: 100% !important;
          max-height: 100% !important;
        }

        .am-btn-loading-text {
          color: #FFFFFF !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          letter-spacing: 0.01em !important;
          white-space: nowrap !important;
          transform: none !important;
          animation: none !important;
        }

        .am-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 16px 0;
        }

        .am-divider-line {
          flex: 1;
          height: 1px;
          background: #ECECEC;
        }

        .am-divider-text {
          font-size: 13px;
          color: #9CA3AF;
        }

        .am-socials {
          display: flex;
          gap: 12px;
          width: 100%;
        }

        .am-social {
          position: relative;
          width: 100%;
          height: 44px;
          border-radius: 9999px;
          border: 1px solid #E5E7EB;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #111111;
          cursor: pointer;
          transition: background-color 180ms ease;
        }
        
        .am-social svg {
          flex-shrink: 0;
        }

        .am-social:hover {
          background-color: #F9FAFB;
        }
        
        .am-google-wrap {
          position: relative;
          flex: 1;
          height: 44px;
          display: flex;
        }
        
        .am-google-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.001;
          z-index: 2;
          overflow: hidden;
          border-radius: 9999px;
          cursor: pointer;
        }

        .am-footer {
          margin-top: 20px;
          text-align: center;
          font-size: 13px;
          color: #6B7280;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .am-footer-btn {
          background: none;
          border: none;
          padding: 0;
          margin-left: 4px;
          display: inline-block;
          font-size: inherit;
          font-weight: 600;
          color: #111111;
          cursor: pointer;
          transition: color 180ms ease;
        }
        
        .am-footer-btn.orange {
          color: #F07020;
        }
        
        .am-footer-btn.orange:hover {
          opacity: 0.8;
        }

        .am-footer-terms {
          font-size: 12px;
          color: #9CA3AF;
          line-height: 1.5;
        }

        .am-footer-terms strong {
          color: #6B7280;
          font-weight: 600;
        }
      `}</style>

      <div ref={modalRef} className="am-modal">
        {/* 3-Layer Staggered Sweep Transition */}
        <div ref={preLayersRef} className="am-prelayers" aria-hidden="true">
          <div className="am-prelayer" style={{ background: "#F07020" }} />
          <div className="am-prelayer" style={{ background: "#1D1D1F" }} />
          <div className="am-prelayer" style={{ background: "#FAF8F5" }} />
        </div>

        <button
          className="am-close"
          onClick={closeAndReset}
          aria-label="Close modal"
        >
          <X size={24} strokeWidth={1.5} />
        </button>

        <div className="am-logo-container am-anim-item flex items-center justify-center">
          <WeavlyLogo size="lg" showBeta={false} />
        </div>

        <div className="am-header am-anim-item">
          <h2 className="am-title">
            {view === "register" ? "You belong here." : "Look who's back."}
          </h2>
          {view === "register" && (
            <p className="am-subtitle">
              Create your account to start curating.
            </p>
          )}
        </div>

        {errorMsg && (
          <div className="am-error am-anim-item">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="am-form" noValidate>
          {view === "register" && (
            <div className="am-input-wrap am-anim-item">
              <User size={18} className="am-icon-left" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="am-input has-left-icon"
              />
            </div>
          )}

          <div className="am-input-wrap am-anim-item">
            <Mail size={18} strokeWidth={1.5} className="am-icon-left" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="am-input has-left-icon"
            />
          </div>

          <div className="am-anim-item">
            <div className="am-input-wrap">
              <Lock size={18} strokeWidth={1.5} className="am-icon-left" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="am-input has-left-icon has-right-icon"
              />
              <button
                type="button"
                className="am-eye"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
              </button>
            </div>

            {view === "login" && (
              <div className="am-forgot-row">
                <button
                  type="button"
                  className="am-forgot"
                  onClick={() => {
                    closeAndReset();
                    router.push("/forgot-password");
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          <button type="submit" className="am-submit am-anim-item" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="am-btn-loading-wrap flex items-center justify-center gap-2.5">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="am-btn-loading-text text-white text-xs font-bold uppercase tracking-wider">
                  {view === "register" ? "Creating Account..." : "Signing in..."}
                </span>
              </div>
            ) : (
              view === "register" ? "Create account" : "Log in"
            )}
          </button>
        </form>

        <div className="am-divider am-anim-item">
          <div className="am-divider-line" />
          <span className="am-divider-text">or continue with</span>
          <div className="am-divider-line" />
        </div>

        <div className="am-socials am-anim-item">
          <button
            type="button"
            className="am-social"
            onClick={() => triggerGoogleLogin()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="am-footer am-anim-item">
          <div>
            {view === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  className="am-footer-btn orange"
                  onClick={() => setView("register")}
                >
                  Create account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="am-footer-btn"
                  onClick={() => setView("login")}
                >
                  Log in
                </button>
              </>
            )}
          </div>

          <div className="am-footer-terms">
            By continuing, you agree to our <strong>Terms of Service</strong><br />
            and <strong>Privacy Policy</strong>.
          </div>
        </div>

        <BetaNoticeModal
          isOpen={betaNoticeOpen}
          onClose={() => setBetaNoticeOpen(false)}
          title="Server Response Notice"
          message="Authentication servers are currently in Beta preview testing. If login or sign up is taking over 50 seconds or fails to respond, feel free to try refreshing or checking back shortly."
        />
      </div>
    </div>
  );

  if (typeof window === "undefined" || !document.body) return null;
  return createPortal(modalContent, document.body);
}
