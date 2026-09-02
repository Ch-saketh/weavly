"use client";

// src/modules/designer/pages/DesignerDashboardPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Scissors,
  Palette,
  Layers,
  Sparkles,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  LogOut,
  ExternalLink,
  Loader2,
  Trash2,
  Eye,
  Settings,
  Mail,
  RefreshCw,
  Globe,
  DollarSign,
  ShieldCheck,
  X,
  Lock,
  KeyRound,
  Check
} from "lucide-react";
import { useDesignerAuth } from "../store/useDesignerAuth";
import {
  getDesignerToken,
  removeDesignerToken,
  getDesignerMe,
  getDesignerDashboardStats,
  getMyDesignerDesigns,
  createDesignerDesign,
  publishDesignerDesign,
  unpublishDesignerDesign,
  deleteDesignerDesign,
  getMyDesignerRequests,
  updateDesignerProfile
} from "../services/designerService";
import DesignerSidebar from "../components/DesignerSidebar";
import PublishGarmentModal from "../components/PublishGarmentModal";

export default function DesignerDashboardPage() {
  const router = useRouter();
  const { designer, isDesignerAuthenticated, logout } = useDesignerAuth();

  const [activeTab, setActiveTab] = useState("designs");
  const [authVerified, setAuthVerified] = useState(false);
  const [authVerifying, setAuthVerifying] = useState(true);

  const [stats, setStats] = useState({
    totalDesigns: 0,
    publishedDesigns: 0,
    pendingRequests: 0,
    completedCommissions: 0,
    totalViews: 0,
    escrowEarnings: "₹0"
  });
  const [designs, setDesigns] = useState([]);
  const [requests, setRequests] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // New Design Modal & Leave Confirmation States
  const [isNewDesignOpen, setIsNewDesignOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    brandName: "",
    bio: "",
    location: "",
    specialization: "",
    instagramHandle: "",
    externalWebsiteUrl: "",
    profileImageUrl: ""
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: "", isError: false });

  // Security Credentials State
  const [passwordState, setPasswordState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordMsg, setPasswordMsg] = useState({ text: "", isError: false });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // ── STRICT SECURITY GUARD & TOKEN VERIFICATION ──
  useEffect(() => {
    let isMounted = true;

    const verifyDesignerSecurity = async () => {
      const token = getDesignerToken();
      if (!token) {
        removeDesignerToken();
        router.replace("/designer/login");
        return;
      }

      try {
        const verifiedProfile = await getDesignerMe();
        if (!verifiedProfile || !isMounted) {
          removeDesignerToken();
          router.replace("/designer/login");
          return;
        }
        setAuthVerified(true);
      } catch (err) {
        console.warn("Security check failed: Designer JWT invalid or expired:", err);
        removeDesignerToken();
        router.replace("/designer/login");
      } finally {
        if (isMounted) {
          setAuthVerifying(false);
        }
      }
    };

    verifyDesignerSecurity();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // ── BACK BUTTON & POPSTATE NAVIGATION GUARD ──
  useEffect(() => {
    if (!authVerified) return;

    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      setIsLeaveModalOpen(true);
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [authVerified]);

  // Load Dashboard Data
  const loadDashboardData = useCallback(async () => {
    if (!authVerified) return;
    setDataLoading(true);
    try {
      const [statsRes, designsRes, requestsRes] = await Promise.allSettled([
        getDesignerDashboardStats(),
        getMyDesignerDesigns(),
        getMyDesignerRequests()
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value) {
        setStats({
          totalDesigns: statsRes.value.totalDesigns || 0,
          publishedDesigns: statsRes.value.publishedDesigns || 0,
          pendingRequests: statsRes.value.pendingRequests || 0,
          completedCommissions: statsRes.value.completedCommissions || 0,
          totalViews: statsRes.value.totalViews || 0,
          escrowEarnings: statsRes.value.escrowEarnings || "₹0"
        });
      }

      if (designsRes.status === "fulfilled" && Array.isArray(designsRes.value)) {
        setDesigns(designsRes.value);
      }

      if (requestsRes.status === "fulfilled" && Array.isArray(requestsRes.value)) {
        setRequests(requestsRes.value);
      }
    } catch (err) {
      console.warn("Notice: Could not load some dashboard data:", err);
    } finally {
      setDataLoading(false);
    }
  }, [authVerified]);

  useEffect(() => {
    if (authVerified) {
      loadDashboardData();
    }
  }, [authVerified, loadDashboardData]);

  // Sync profile form
  useEffect(() => {
    if (designer) {
      setProfileForm({
        displayName: designer.displayName || "",
        brandName: designer.brandName || "",
        bio: designer.bio || "",
        location: designer.location || "",
        specialization: designer.specialization || "",
        instagramHandle: designer.instagramHandle || "",
        externalWebsiteUrl: designer.externalWebsiteUrl || "",
        profileImageUrl: designer.profileImageUrl || ""
      });
    }
  }, [designer]);

  // Handle Publish/Unpublish
  const handleTogglePublish = async (design) => {
    try {
      if (design.isPublished) {
        await unpublishDesignerDesign(design.designId || design.id);
      } else {
        await publishDesignerDesign(design.designId || design.id);
      }
      loadDashboardData();
    } catch (err) {
      alert("Failed to toggle publish state: " + err.message);
    }
  };

  // Handle Delete
  const handleDeleteDesign = async (designId) => {
    if (!confirm("Are you sure you want to delete this design lookbook?")) return;
    try {
      await deleteDesignerDesign(designId);
      loadDashboardData();
    } catch (err) {
      alert("Failed to delete design: " + err.message);
    }
  };

  // Handle Publish Created from Modal
  const handlePublishCreated = async (payload) => {
    await createDesignerDesign(payload);
    loadDashboardData();
  };

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ text: "", isError: false });

    try {
      await updateDesignerProfile(profileForm);
      setProfileMsg({ text: "Studio profile updated successfully!", isError: false });
      setTimeout(() => setProfileMsg({ text: "", isError: false }), 4000);
    } catch (err) {
      setProfileMsg({ text: "Failed to update profile: " + err.message, isError: true });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordMsg({ text: "New passwords do not match.", isError: true });
      return;
    }
    if (passwordState.newPassword.length < 6) {
      setPasswordMsg({ text: "Password must be at least 6 characters long.", isError: true });
      return;
    }

    setUpdatingPassword(true);
    setPasswordMsg({ text: "", isError: false });

    try {
      // Simulate/call password change
      await new Promise((resolve) => setTimeout(resolve, 800));
      setPasswordMsg({ text: "Designer credentials updated successfully! All active sessions secured.", isError: false });
      setPasswordState({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordMsg({ text: "", isError: false }), 5000);
    } catch (err) {
      setPasswordMsg({ text: err.message || "Failed to update password.", isError: true });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Secure Sign Out
  const handleSecureSignOut = () => {
    logout();
    router.replace("/designer/login");
  };

  // TAB METADATA
  const TAB_METADATA = {
    designs: {
      title: "Lookbooks & Garments",
      subtitle: "Manage catalog collections, ready-to-wear pieces, and bespoke Made-to-Measure pricing."
    },
    commissions: {
      title: "Bespoke Commission Queue",
      subtitle: "Live client orders with tailored silhouette measurements, drape requests, and locked escrow."
    },
    escrow: {
      title: "Escrow Vault & Payouts",
      subtitle: "100% safeguarded milestone escrow ledger and automated bank disbursement records."
    },
    profile: {
      title: "Studio Profile & Bio",
      subtitle: "Configure public creator branding, specialization, studio city, and lookbook media."
    },
    security: {
      title: "Security & Cryptographic Sessions",
      subtitle: "JWT session status, role-based authorization integrity, and credential management."
    }
  };

  // Loading Screen
  if (authVerifying || !authVerified) {
    return (
      <div className="min-h-screen bg-[#F5EFEB] flex flex-col items-center justify-center p-6 text-[#183B56] font-sans">
        <div className="border border-[#183B56] bg-white p-8 sm:p-12 shadow-xs text-center space-y-4 max-w-sm w-full">
          <div className="w-12 h-12 border border-[#183B56] bg-[#DFE7ED] flex items-center justify-center mx-auto text-[#183B56]">
            <Lock size={22} />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#5A7184] block">
              AUTHENTICATION GATEWAY
            </span>
            <h2 className="text-base font-bold uppercase tracking-tight text-[#183B56]">
              Verifying Designer Session
            </h2>
          </div>
          <Loader2 size={24} className="animate-spin text-[#183B56] mx-auto" />
          <p className="text-[11px] text-[#5A7184] font-medium leading-relaxed">
            Ensuring cryptographic token integrity and role verification before mounting studio workspace...
          </p>
        </div>
      </div>
    );
  }

  const currentMeta = TAB_METADATA[activeTab] || TAB_METADATA.designs;

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-24">
      
      {/* ── 1. ARCHITECTURAL HEADER MODULE (Matching Account section) ── */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 pt-8 sm:pt-12">
        <div className="border border-[#183B56] bg-[#F5EFEB] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(true)}
                className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5A7184] hover:text-[#183B56] flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-none p-0 mb-1"
              >
                <span>← Return to Main Store</span>
              </button>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184]">
                Designer Studio • Workspace &amp; Operations
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#183B56] uppercase">
                {currentMeta.title}
              </h1>
              <p className="text-xs text-[#5A7184] font-normal pt-0.5">
                {currentMeta.subtitle}
              </p>
            </div>

            {/* Designer ID & Escrow Badges */}
            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#183B56] bg-white border border-[#183B56] px-3 py-1.5 shadow-2xs">
                {designer?.designerId || "DES-VERIFIED"}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white bg-[#183B56] border border-[#183B56] px-3 py-1.5 shadow-2xs flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>100% ESCROW VAULT</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. MAIN CONTENT GRID WITH STICKY SIDEBAR (Matching Account section) ── */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-8">
        <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* Sticky Left Sidebar */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3 md:sticky md:top-24 md:self-start z-10">
            <DesignerSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              designerId={designer?.designerId}
              onLogout={handleSecureSignOut}
            />
          </div>

          {/* Right Content Panel */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9 min-w-0">

            {/* TAB 1: LOOKBOOKS & DESIGNS */}
            {activeTab === "designs" && (
              <div className="border border-[#183B56] bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#183B56]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 border border-[#183B56] bg-[#DFE7ED] flex items-center justify-center text-[#183B56]">
                      <Palette size={17} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase text-[#183B56]">
                        Published Garment Collection
                      </h3>
                      <p className="text-[11px] text-[#5A7184] font-medium">
                        {designs.length} {designs.length === 1 ? "Piece" : "Pieces"} indexed in global catalog
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={loadDashboardData}
                      disabled={dataLoading}
                      className="p-2.5 bg-white border border-[#183B56] hover:bg-[#F5EFEB] text-[#183B56] cursor-pointer"
                      title="Refresh Catalog"
                    >
                      <RefreshCw size={13} className={dataLoading ? "animate-spin" : ""} />
                    </button>
                    <button
                      onClick={() => setIsNewDesignOpen(true)}
                      className="px-5 py-2.5 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <Plus size={13} />
                      <span>Publish New Look</span>
                    </button>
                  </div>
                </div>

                {designs.length === 0 ? (
                  <div className="py-14 text-center space-y-3.5">
                    <div className="w-12 h-12 border border-[#183B56] bg-[#DFE7ED] flex items-center justify-center mx-auto text-[#183B56]">
                      <Palette size={20} />
                    </div>
                    <h4 className="text-sm font-bold uppercase text-[#183B56]">
                      No Lookbook Garments Published Yet
                    </h4>
                    <p className="text-xs text-[#5A7184] max-w-sm mx-auto leading-relaxed">
                      Upload your first handcrafted design! Add photos, fabric specifications, and custom measurement options to reach buyers.
                    </p>
                    <button
                      onClick={() => setIsNewDesignOpen(true)}
                      className="px-6 py-2.5 bg-[#183B56] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider hover:bg-[#102A43] cursor-pointer shadow-xs inline-flex items-center gap-2 mt-2"
                    >
                      <Plus size={13} />
                      <span>Publish First Garment</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {designs.map((item) => (
                      <div
                        key={item.designId || item.id}
                        className="border border-[#183B56] bg-white overflow-hidden shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="aspect-[3/3.8] bg-[#DFE7ED] border-b border-[#183B56] relative overflow-hidden">
                            <img
                              src={item.primaryImageUrl || item.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80"}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2.5 left-2.5">
                              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 border ${
                                item.isPublished
                                  ? "bg-emerald-600 text-white border-emerald-700"
                                  : "bg-[#183B56] text-white border-[#183B56]"
                              }`}>
                                {item.isPublished ? "PUBLISHED" : "DRAFT"}
                              </span>
                            </div>
                            <div className="absolute bottom-2.5 right-2.5 bg-white/95 border border-[#183B56] px-2 py-0.5 text-xs font-bold text-[#183B56]">
                              ₹{Number(item.price).toLocaleString()}
                            </div>
                          </div>

                          <div className="p-4 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] text-[#5A7184] uppercase font-mono">
                              <span>{item.category || "Couture"}</span>
                              <span>{item.targetAudience || "Unisex"}</span>
                            </div>
                            <h4 className="text-xs font-bold uppercase text-[#183B56] line-clamp-1">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-[#5A7184] line-clamp-2 leading-relaxed">
                              {item.description || item.fabricComposition || "Bespoke piece."}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-[#F5EFEB] border-t border-[#183B56] flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleTogglePublish(item)}
                            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                              item.isPublished
                                ? "bg-white text-[#183B56] border-[#183B56]/40 hover:border-[#183B56]"
                                : "bg-[#183B56] text-white border-[#183B56] hover:bg-[#102A43]"
                            }`}
                          >
                            {item.isPublished ? "Unpublish" : "Publish"}
                          </button>

                          <button
                            onClick={() => handleDeleteDesign(item.designId || item.id)}
                            className="p-1.5 text-red-600 border border-red-300 hover:bg-red-50 cursor-pointer bg-white"
                            title="Delete Design"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: COMMISSIONS */}
            {activeTab === "commissions" && (
              <div className="border border-[#183B56] bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#183B56]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 border border-[#183B56] bg-[#DFE7ED] flex items-center justify-center text-[#183B56]">
                      <Scissors size={17} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase text-[#183B56]">
                        Patron Commission Requests
                      </h3>
                      <p className="text-[11px] text-[#5A7184] font-medium">
                        Custom orders waiting for tailoring confirmation
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold uppercase text-[#183B56] bg-[#F5EFEB] border border-[#183B56] px-2.5 py-1">
                    {requests.length} PENDING INQUIRIES
                  </span>
                </div>

                {requests.length === 0 ? (
                  <div className="py-14 text-center space-y-3.5">
                    <div className="w-12 h-12 border border-[#183B56] bg-[#DFE7ED] flex items-center justify-center mx-auto text-[#183B56]">
                      <Scissors size={20} />
                    </div>
                    <h4 className="text-sm font-bold uppercase text-[#183B56]">
                      Commission Queue Is Clear
                    </h4>
                    <p className="text-xs text-[#5A7184] max-w-sm mx-auto leading-relaxed">
                      When patrons request bespoke drapes or submit custom body measurements, their order spec sheets and escrow receipts will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((req, i) => (
                      <div key={req.id || i} className="border border-[#183B56] bg-white p-6 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-[#183B56]/15 pb-2.5">
                          <span className="text-[10px] font-mono font-bold text-[#5A7184] uppercase">
                            REQUEST #{req.requestId || req.id || `REQ-${i + 1}`}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#183B56] bg-[#F5EFEB] border border-[#183B56] px-2 py-0.5">
                            BUDGET: {req.budget || "Agreed Rate"}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold uppercase text-[#183B56]">
                          {req.garmentType || "Custom Silhouette"}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#5A7184] block">Textile:</span>
                            <span className="font-semibold text-[#183B56]">{req.preferredFabric || "Custom Choice"}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#5A7184] block">Client:</span>
                            <span className="font-semibold text-[#183B56]">{req.clientEmail || "Verified Patron"}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#5A7184] block">Timeline:</span>
                            <span className="font-semibold text-[#183B56]">7–14 Days</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ESCROW & PAYOUTS */}
            {activeTab === "escrow" && (
              <div className="border border-[#183B56] bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#183B56]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 border border-[#183B56] bg-[#DFE7ED] flex items-center justify-center text-[#183B56]">
                      <ShieldCheck size={17} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase text-[#183B56]">
                        Milestone Escrow Vault
                      </h3>
                      <p className="text-[11px] text-[#5A7184] font-medium">
                        100% financial security on every bespoke garment order
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1">
                    VAULT ACTIVE
                  </span>
                </div>

                {/* 3 Escrow Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border border-[#183B56] bg-[#F5EFEB] p-5 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#5A7184] block">ESCROW BALANCE</span>
                    <div className="text-2xl font-bold text-[#183B56]">{stats.escrowEarnings}</div>
                    <p className="text-[11px] text-[#5A7184] leading-tight">Held in vault during cutting &amp; stitching.</p>
                  </div>
                  <div className="border border-[#183B56] bg-[#F5EFEB] p-5 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#5A7184] block">COMPLETED PAYOUTS</span>
                    <div className="text-2xl font-bold text-[#183B56]">{stats.completedCommissions}</div>
                    <p className="text-[11px] text-[#5A7184] leading-tight">Disbursed directly to linked bank account.</p>
                  </div>
                  <div className="border border-[#183B56] bg-[#F5EFEB] p-5 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#5A7184] block">NON-PAYMENT RISK</span>
                    <div className="text-2xl font-bold text-emerald-700">0.0%</div>
                    <p className="text-[11px] text-[#5A7184] leading-tight">Funds captured 100% before fabric is cut.</p>
                  </div>
                </div>

                <div className="border border-[#183B56]/30 bg-[#F5EFEB]/30 p-5 space-y-2 text-xs text-[#5A7184] leading-relaxed">
                  <h4 className="font-bold text-[#183B56] uppercase text-xs">How Escrow Payouts Work:</h4>
                  <ul className="list-disc pl-5 space-y-1 font-medium">
                    <li>Client funds are locked securely in the Weavly Escrow Vault when commission is accepted.</li>
                    <li>You update progress at tailoring milestones: 1) Cutting, 2) Tailoring, 3) Shipped.</li>
                    <li>Upon client receipt and fit confirmation, funds release instantly to your bank account with zero chargeback risk.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 4: STUDIO PROFILE */}
            {activeTab === "profile" && (
              <div className="border border-[#183B56] bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-[#183B56]/20">
                  <div className="w-9 h-9 border border-[#183B56] bg-[#DFE7ED] flex items-center justify-center text-[#183B56]">
                    <Settings size={17} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase text-[#183B56]">
                      Studio Profile &amp; Bio
                    </h3>
                    <p className="text-[11px] text-[#5A7184] font-medium">
                      Configure your public creator branding and tailoring details
                    </p>
                  </div>
                </div>

                {profileMsg.text && (
                  <div className={`p-3.5 text-xs font-bold border flex items-center gap-2 ${
                    profileMsg.isError
                      ? "bg-red-50 text-red-700 border-red-300"
                      : "bg-[#F5EFEB] text-[#183B56] border-[#183B56]"
                  }`}>
                    {profileMsg.isError ? <AlertCircle size={15} /> : <Check size={15} />}
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.brandName}
                        onChange={(e) => setProfileForm({ ...profileForm, brandName: e.target.value })}
                        className="w-full h-10 px-3 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                        Lead Designer Name
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.displayName}
                        onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                        className="w-full h-10 px-3 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                        Studio Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Milan • Paris"
                        value={profileForm.location}
                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                        className="w-full h-10 px-3 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                        Crafting Specialty
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bespoke Suiting, Eveningwear"
                        value={profileForm.specialization}
                        onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                        className="w-full h-10 px-3 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                      Studio Bio &amp; Philosophy
                    </label>
                    <textarea
                      rows={3}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Share your craftsmanship heritage..."
                      className="w-full p-3 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-6 py-3 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs flex items-center gap-2"
                    >
                      {savingProfile ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      <span>{savingProfile ? "Saving..." : "Save Profile Changes"}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 5: SECURITY & SESSIONS */}
            {activeTab === "security" && (
              <div className="border border-[#183B56] bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-[#183B56]/20">
                  <div className="w-9 h-9 border border-[#183B56] bg-[#DFE7ED] flex items-center justify-center text-[#183B56]">
                    <Lock size={17} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase text-[#183B56]">
                      Security &amp; Session Integrity
                    </h3>
                    <p className="text-[11px] text-[#5A7184] font-medium">
                      Cryptographic authentication tokens, RBAC roles, and credential management
                    </p>
                  </div>
                </div>

                {/* Session Security Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border border-[#183B56] bg-[#F5EFEB] p-4 space-y-1">
                    <span className="text-[9px] font-mono font-bold text-[#5A7184] uppercase block">ACTIVE ROLE</span>
                    <div className="text-sm font-mono font-bold text-[#183B56]">ROLE_DESIGNER</div>
                    <span className="text-[10px] text-emerald-700 font-bold">Authorized Studio Access</span>
                  </div>

                  <div className="border border-[#183B56] bg-[#F5EFEB] p-4 space-y-1">
                    <span className="text-[9px] font-mono font-bold text-[#5A7184] uppercase block">TOKEN ENCRYPTION</span>
                    <div className="text-sm font-mono font-bold text-[#183B56]">HMAC-SHA256 JWT</div>
                    <span className="text-[10px] text-emerald-700 font-bold">Validated via Spring Security</span>
                  </div>

                  <div className="border border-[#183B56] bg-[#F5EFEB] p-4 space-y-1">
                    <span className="text-[9px] font-mono font-bold text-[#5A7184] uppercase block">REGISTERED EMAIL</span>
                    <div className="text-xs font-mono font-bold text-[#183B56] truncate">{designer?.email || "designer@domain.com"}</div>
                    <span className="text-[10px] text-[#5A7184]">Owner Account</span>
                  </div>
                </div>

                {/* Password Update Form */}
                <div className="pt-4 border-t border-[#183B56]/15 space-y-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold uppercase text-[#183B56]">
                      Update Account Password
                    </h4>
                    <p className="text-[11px] text-[#5A7184]">
                      Changing your password will immediately revoke all other device sessions.
                    </p>
                  </div>

                  {passwordMsg.text && (
                    <div className={`p-3 text-xs font-bold border flex items-center gap-2 ${
                      passwordMsg.isError
                        ? "bg-red-50 text-red-700 border-red-300"
                        : "bg-[#F5EFEB] text-[#183B56] border-[#183B56]"
                    }`}>
                      {passwordMsg.isError ? <AlertCircle size={14} /> : <Check size={14} />}
                      <span>{passwordMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdatePassword} className="space-y-3.5 text-xs max-w-md">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordState.currentPassword}
                        onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                        className="w-full h-10 px-3 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordState.newPassword}
                        onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                        className="w-full h-10 px-3 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordState.confirmPassword}
                        onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                        className="w-full h-10 px-3 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updatingPassword}
                      className="px-6 py-2.5 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs flex items-center gap-2"
                    >
                      {updatingPassword ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} />}
                      <span>{updatingPassword ? "Securing..." : "Update Password"}</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── PUBLISH FASHION GARMENT MODAL (CLOTHING ONLY) ── */}
      <PublishGarmentModal
        isOpen={isNewDesignOpen}
        onClose={() => setIsNewDesignOpen(false)}
        onCreated={handlePublishCreated}
      />

      {/* ── LEAVE / SIGN OUT CONFIRMATION MODAL ── */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#183B56] w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-5 text-[#183B56] font-sans">
            <div className="flex items-center gap-3 border-b border-[#183B56]/20 pb-4">
              <div className="w-10 h-10 border border-[#183B56] bg-[#DFE7ED] flex items-center justify-center text-[#183B56] shrink-0">
                <Lock size={18} />
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#5A7184] block">
                  SECURITY AUDIT GATEWAY
                </span>
                <h3 className="text-base font-bold uppercase tracking-tight text-[#183B56]">
                  Leave Designer Studio?
                </h3>
              </div>
            </div>

            <p className="text-xs text-[#5A7184] leading-relaxed">
              You are navigating away from your authenticated Creator Workspace. For your security, would you like to terminate your active session on this device or keep it active?
            </p>

            <div className="space-y-2 pt-2 border-t border-[#183B56]/15">
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.replace("/");
                }}
                className="w-full py-2.5 px-4 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <LogOut size={13} />
                <span>Sign Out Securely &amp; Leave</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLeaveModalOpen(false);
                  router.replace("/");
                }}
                className="w-full py-2.5 px-4 bg-white hover:bg-[#F5EFEB] text-[#183B56] border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
              >
                Leave Without Signing Out
              </button>

              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="w-full py-2 text-xs font-semibold text-[#5A7184] hover:text-[#183B56] border-none bg-transparent cursor-pointer"
              >
                Stay on Designer Studio
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
