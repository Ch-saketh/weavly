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
  X
} from "lucide-react";
import { useDesignerAuth } from "../store/useDesignerAuth";
import {
  getDesignerDashboardStats,
  getMyDesignerDesigns,
  createDesignerDesign,
  publishDesignerDesign,
  unpublishDesignerDesign,
  deleteDesignerDesign,
  getMyDesignerRequests,
  updateDesignerProfile
} from "../services/designerService";

export default function DesignerDashboardPage() {
  const router = useRouter();
  const { designer, loading: authLoading, isDesignerAuthenticated, logout } = useDesignerAuth();

  const [activeTab, setActiveTab] = useState("designs"); // "designs", "commissions", "profile"
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

  // New Design Modal State
  const [isNewDesignOpen, setIsNewDesignOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newDesignForm, setNewDesignForm] = useState({
    title: "",
    category: "Eveningwear",
    targetAudience: "Women",
    price: "",
    fabricComposition: "100% Silk Faille",
    primaryImageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    description: "",
    customizationAvailable: true
  });

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

  // Load Dashboard Data
  const loadDashboardData = useCallback(async () => {
    if (!isDesignerAuthenticated) return;
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
      console.warn("Could not fetch some designer dashboard data:", err);
    } finally {
      setDataLoading(false);
    }
  }, [isDesignerAuthenticated]);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !isDesignerAuthenticated) {
      router.push("/designer/login");
    }
  }, [authLoading, isDesignerAuthenticated, router]);

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
      loadDashboardData();
    }
  }, [designer, loadDashboardData]);

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

  // Handle Create Design
  const handleCreateDesign = async (e) => {
    e.preventDefault();
    if (!newDesignForm.title.trim() || !newDesignForm.price) return;
    setCreating(true);

    try {
      await createDesignerDesign({
        ...newDesignForm,
        price: parseFloat(newDesignForm.price) || 0
      });
      setIsNewDesignOpen(false);
      setNewDesignForm({
        title: "",
        category: "Eveningwear",
        targetAudience: "Women",
        price: "",
        fabricComposition: "100% Silk Faille",
        primaryImageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
        description: "",
        customizationAvailable: true
      });
      loadDashboardData();
    } catch (err) {
      alert("Failed to create design: " + err.message);
    } finally {
      setCreating(false);
    }
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

  const handleLogout = () => {
    logout();
    router.push("/designer/login");
  };

  if (authLoading || (!isDesignerAuthenticated && authLoading)) {
    return (
      <div className="min-h-screen bg-[#F5EFEB] flex flex-col items-center justify-center p-6 text-[#183B56]">
        <Loader2 size={32} className="animate-spin mb-3 text-[#183B56]" />
        <p className="text-xs font-bold uppercase tracking-wider text-[#5A7184]">
          Authenticating Designer Studio...
        </p>
      </div>
    );
  }

  if (!isDesignerAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-24">
      <main className="max-w-[1360px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-8 sm:py-12 space-y-8 sm:space-y-10">

        {/* ── 1. STUDIO HEADER MODULE ── */}
        <section className="border border-[#183B56] bg-white p-6 sm:p-8 md:p-10 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#183B56]/20">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 border border-[#183B56] bg-[#DFE7ED] shrink-0 overflow-hidden flex items-center justify-center text-xl font-bold text-[#183B56]">
                {designer?.profileImageUrl ? (
                  <img src={designer.profileImageUrl} alt="Designer" className="w-full h-full object-cover" />
                ) : (
                  <Scissors size={24} />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#183B56] bg-[#F5EFEB] border border-[#183B56] px-2 py-0.5">
                    {designer?.designerId || "DES-VERIFIED"}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    <span>VERIFIED CREATOR</span>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#183B56]">
                  {designer?.brandName || designer?.displayName || "Designer Studio"}
                </h1>
                <p className="text-xs text-[#5A7184] font-medium">
                  {designer?.specialization || "Custom Tailoring & Bespoke Couture"} • {designer?.location || "Global Atelier"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsNewDesignOpen(true)}
                className="px-5 py-2.5 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-2"
              >
                <Plus size={14} />
                <span>Publish New Look</span>
              </button>

              {designer?.designerId && (
                <button
                  onClick={() => router.push(`/designers/${designer.designerId}`)}
                  className="px-4 py-2.5 bg-white hover:bg-[#F5EFEB] text-[#183B56] border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Eye size={13} />
                  <span>View Public Storefront</span>
                  <ExternalLink size={11} />
                </button>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2.5 bg-[#F5EFEB] hover:bg-red-50 hover:text-red-700 hover:border-red-400 text-[#5A7184] border border-[#183B56]/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div className="border border-[#183B56]/20 bg-[#F5EFEB]/40 p-4 space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#5A7184] uppercase block">
                PUBLISHED LOOKBOOKS
              </span>
              <div className="text-2xl font-bold text-[#183B56]">
                {designs.length}
              </div>
              <span className="text-[11px] text-[#5A7184]">Active on marketplace</span>
            </div>

            <div className="border border-[#183B56]/20 bg-[#F5EFEB]/40 p-4 space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#5A7184] uppercase block">
                COMMISSION QUEUE
              </span>
              <div className="text-2xl font-bold text-[#183B56]">
                {requests.length}
              </div>
              <span className="text-[11px] text-[#5A7184]">Pending custom drapes</span>
            </div>

            <div className="border border-[#183B56]/20 bg-[#F5EFEB]/40 p-4 space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#5A7184] uppercase block">
                ESCROW PROTECTION
              </span>
              <div className="text-2xl font-bold text-[#183B56] flex items-center gap-1">
                <ShieldCheck size={20} className="text-[#183B56]" />
                <span>100%</span>
              </div>
              <span className="text-[11px] text-[#5A7184]">Guaranteed disbursements</span>
            </div>

            <div className="border border-[#183B56]/20 bg-[#F5EFEB]/40 p-4 space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#5A7184] uppercase block">
                ESCROW EARNINGS
              </span>
              <div className="text-2xl font-bold text-[#183B56]">
                {stats.escrowEarnings}
              </div>
              <span className="text-[11px] text-[#5A7184]">Fulfilled &amp; in-vault</span>
            </div>
          </div>
        </section>

        {/* ── 2. WORKSPACE TAB NAVIGATION ── */}
        <section className="border border-[#183B56] bg-white p-1.5 shadow-xs">
          <div className="flex flex-col sm:flex-row gap-1">
            <button
              onClick={() => setActiveTab("designs")}
              className={`flex-1 py-3 px-6 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "designs"
                  ? "bg-[#183B56] text-white shadow-xs"
                  : "bg-transparent text-[#183B56] hover:bg-[#F5EFEB]"
              }`}
            >
              <Palette size={15} />
              <span>01 My Lookbooks &amp; Garments ({designs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("commissions")}
              className={`flex-1 py-3 px-6 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "commissions"
                  ? "bg-[#183B56] text-white shadow-xs"
                  : "bg-transparent text-[#183B56] hover:bg-[#F5EFEB]"
              }`}
            >
              <Scissors size={15} />
              <span>02 Bespoke Commission Queue ({requests.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-3 px-6 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "profile"
                  ? "bg-[#183B56] text-white shadow-xs"
                  : "bg-transparent text-[#183B56] hover:bg-[#F5EFEB]"
              }`}
            >
              <Settings size={15} />
              <span>03 Studio Profile &amp; Settings</span>
            </button>
          </div>
        </section>

        {/* ── 3. TAB CONTENT VIEWS ── */}

        {/* TAB 1: MY DESIGNS & LOOKBOOKS */}
        {activeTab === "designs" && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#183B56]/20 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184] block">
                  Catalog Inventory
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#183B56]">
                  Your Lookbook Garments
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadDashboardData}
                  disabled={dataLoading}
                  className="p-2.5 bg-white border border-[#183B56] hover:bg-[#F5EFEB] text-[#183B56] cursor-pointer"
                  title="Refresh Inventory"
                >
                  <RefreshCw size={14} className={dataLoading ? "animate-spin" : ""} />
                </button>
                <button
                  onClick={() => setIsNewDesignOpen(true)}
                  className="px-5 py-2.5 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Create New Look</span>
                </button>
              </div>
            </div>

            {designs.length === 0 ? (
              <div className="border border-[#183B56] bg-white p-12 text-center space-y-4">
                <div className="w-12 h-12 border border-[#183B56] bg-[#DFE7ED] flex items-center justify-center mx-auto text-[#183B56]">
                  <Palette size={20} />
                </div>
                <h3 className="text-base font-bold uppercase text-[#183B56]">
                  No Lookbook Garments Published Yet
                </h3>
                <p className="text-xs text-[#5A7184] max-w-md mx-auto leading-relaxed">
                  Start drafting your first piece! Upload high-res photography, configure made-to-measure sizing, and make it available for global patrons.
                </p>
                <button
                  onClick={() => setIsNewDesignOpen(true)}
                  className="px-6 py-3 bg-[#183B56] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider hover:bg-[#102A43] cursor-pointer shadow-xs inline-flex items-center gap-2"
                >
                  <Plus size={14} />
                  <span>Publish Your First Design</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {designs.map((item) => (
                  <div
                    key={item.designId || item.id}
                    className="border border-[#183B56] bg-white overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Preview */}
                      <div className="aspect-[3/3.8] bg-[#DFE7ED] border-b border-[#183B56] relative overflow-hidden">
                        <img
                          src={item.primaryImageUrl || item.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 border ${
                            item.isPublished
                              ? "bg-emerald-600 text-white border-emerald-700"
                              : "bg-[#183B56] text-white border-[#183B56]"
                          }`}>
                            {item.isPublished ? "PUBLISHED LIVE" : "DRAFT"}
                          </span>
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 bg-white/95 border border-[#183B56] px-2 py-0.5 text-xs font-bold text-[#183B56]">
                          ₹{Number(item.price).toLocaleString()}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-[#5A7184] uppercase font-mono">
                          <span>{item.category || "Couture"}</span>
                          <span>{item.targetAudience || "Unisex"}</span>
                        </div>
                        <h4 className="text-sm font-bold uppercase text-[#183B56] line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-[#5A7184] line-clamp-2 leading-relaxed">
                          {item.description || item.fabricComposition || "Bespoke handcrafted piece."}
                        </p>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="p-3 bg-[#F5EFEB] border-t border-[#183B56] flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                          item.isPublished
                            ? "bg-white text-[#183B56] border-[#183B56]/40 hover:border-[#183B56]"
                            : "bg-[#183B56] text-white border-[#183B56] hover:bg-[#102A43]"
                        }`}
                      >
                        {item.isPublished ? "Unpublish" : "Publish Live"}
                      </button>

                      <button
                        onClick={() => handleDeleteDesign(item.designId || item.id)}
                        className="p-2 text-red-600 border border-red-300 hover:bg-red-50 cursor-pointer bg-white"
                        title="Delete Design"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: BESPOKE COMMISSION QUEUE */}
        {activeTab === "commissions" && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#183B56]/20 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184] block">
                  Patron Orders
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#183B56]">
                  Bespoke Commission Requests
                </h2>
              </div>

              <div className="flex items-center gap-2 bg-[#F5EFEB] border border-[#183B56] px-3 py-1.5 text-xs font-mono font-bold text-[#183B56]">
                <ShieldCheck size={14} />
                <span>100% ESCROW VAULT SECURED</span>
              </div>
            </div>

            {requests.length === 0 ? (
              <div className="border border-[#183B56] bg-white p-12 text-center space-y-3">
                <div className="w-12 h-12 border border-[#183B56] bg-[#DFE7ED] flex items-center justify-center mx-auto text-[#183B56]">
                  <Scissors size={20} />
                </div>
                <h3 className="text-base font-bold uppercase text-[#183B56]">
                  Commission Queue Is Clear
                </h3>
                <p className="text-xs text-[#5A7184] max-w-md mx-auto leading-relaxed">
                  When patrons submit custom drape inquiries or made-to-measure orders for your lookbooks, their architectural spec sheets and locked escrow balances will populate here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req, i) => (
                  <div key={req.id || i} className="border border-[#183B56] bg-white p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#183B56]/15 pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#5A7184] uppercase">
                          REQUEST #{req.requestId || req.id || `REQ-${i + 1}`}
                        </span>
                        <h4 className="text-sm font-bold uppercase text-[#183B56]">
                          {req.garmentType || "Custom Silhouette"}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#183B56] bg-[#F5EFEB] border border-[#183B56] px-2.5 py-1 self-start sm:self-auto">
                        BUDGET: {req.budget || "Agreed Rate"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="font-bold uppercase text-[10px] text-[#5A7184] block">Preferred Textile:</span>
                        <span className="font-semibold text-[#183B56]">{req.preferredFabric || "Custom Sourcing"}</span>
                      </div>
                      <div>
                        <span className="font-bold uppercase text-[10px] text-[#5A7184] block">Client Contact:</span>
                        <span className="font-semibold text-[#183B56]">{req.clientEmail || "Weavly Verified Patron"}</span>
                      </div>
                      <div>
                        <span className="font-bold uppercase text-[10px] text-[#5A7184] block">Fulfillment Timeline:</span>
                        <span className="font-semibold text-[#183B56]">7–14 Business Days</span>
                      </div>
                    </div>

                    {req.notes && (
                      <div className="p-3 bg-[#F5EFEB] border border-[#183B56]/20 text-xs text-[#5A7184]">
                        <span className="font-bold text-[#183B56] block text-[10px] uppercase">Patron Notes:</span>
                        {req.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: STUDIO PROFILE & SETTINGS */}
        {activeTab === "profile" && (
          <section className="border border-[#183B56] bg-white p-6 sm:p-10 shadow-xs space-y-6">
            <div className="border-b border-[#183B56]/20 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184] block">
                Brand Configuration
              </span>
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#183B56]">
                Studio Profile &amp; Bio
              </h2>
            </div>

            {profileMsg.text && (
              <div className={`p-3.5 text-xs font-bold border flex items-center gap-2 ${
                profileMsg.isError
                  ? "bg-red-50 text-red-700 border-red-300"
                  : "bg-[#F5EFEB] text-[#183B56] border-[#183B56]"
              }`}>
                {profileMsg.isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6 text-xs max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1.5">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.brandName}
                    onChange={(e) => setProfileForm({ ...profileForm, brandName: e.target.value })}
                    className="w-full h-11 px-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1.5">
                    Lead Designer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.displayName}
                    onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                    className="w-full h-11 px-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1.5">
                    Location &amp; Studio City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Milan • Mumbai"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full h-11 px-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1.5">
                    Crafting Specialization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Haute Couture, Bespoke Suiting, Avant-Garde"
                    value={profileForm.specialization}
                    onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                    className="w-full h-11 px-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1.5">
                  Studio Bio &amp; Craftsmanship Philosophy
                </label>
                <textarea
                  rows={4}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Share your heritage, textile sourcing standards, and tailoring background..."
                  className="w-full p-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none leading-relaxed resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1.5">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    placeholder="@yourbrand"
                    value={profileForm.instagramHandle}
                    onChange={(e) => setProfileForm({ ...profileForm, instagramHandle: e.target.value })}
                    className="w-full h-11 px-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1.5">
                    Website or Portfolio URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={profileForm.externalWebsiteUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, externalWebsiteUrl: e.target.value })}
                    className="w-full h-11 px-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1.5">
                  Profile Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={profileForm.profileImageUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, profileImageUrl: e.target.value })}
                  className="w-full h-11 px-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[#183B56]/20">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-8 py-3.5 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-2"
                >
                  {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>{savingProfile ? "Saving Profile..." : "Save Studio Profile"}</span>
                </button>
              </div>
            </form>
          </section>
        )}

      </main>

      {/* ── MODAL: PUBLISH NEW DESIGN LOOKBOOK ── */}
      {isNewDesignOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#183B56] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#183B56]/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 border border-[#183B56] bg-[#DFE7ED] flex items-center justify-center text-[#183B56]">
                  <Palette size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5A7184] block">
                    Catalog Addition
                  </span>
                  <h3 className="text-base font-bold uppercase text-[#183B56]">
                    Publish New Lookbook Garment
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsNewDesignOpen(false)}
                className="p-1.5 border border-[#183B56]/30 hover:bg-[#F5EFEB] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateDesign} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                  Garment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sculpted Silk Faille Evening Gown"
                  value={newDesignForm.title}
                  onChange={(e) => setNewDesignForm({ ...newDesignForm, title: e.target.value })}
                  className="w-full h-11 px-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                    Category
                  </label>
                  <select
                    value={newDesignForm.category}
                    onChange={(e) => setNewDesignForm({ ...newDesignForm, category: e.target.value })}
                    className="w-full h-11 px-3 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                  >
                    <option value="Eveningwear">Eveningwear</option>
                    <option value="Bespoke Suiting">Bespoke Suiting</option>
                    <option value="Outerwear & Coats">Outerwear &amp; Coats</option>
                    <option value="Festive & Ceremonial">Festive &amp; Ceremonial</option>
                    <option value="Artisanal Streetwear">Artisanal Streetwear</option>
                    <option value="Casual Drape">Casual Drape</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                    Retail Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 18500"
                    value={newDesignForm.price}
                    onChange={(e) => setNewDesignForm({ ...newDesignForm, price: e.target.value })}
                    className="w-full h-11 px-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                    Target Audience
                  </label>
                  <select
                    value={newDesignForm.targetAudience}
                    onChange={(e) => setNewDesignForm({ ...newDesignForm, targetAudience: e.target.value })}
                    className="w-full h-11 px-3 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                  >
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                    Fabric Composition
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Raw Silk & Linen"
                    value={newDesignForm.fabricComposition}
                    onChange={(e) => setNewDesignForm({ ...newDesignForm, fabricComposition: e.target.value })}
                    className="w-full h-11 px-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                  Primary Photo URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={newDesignForm.primaryImageUrl}
                  onChange={(e) => setNewDesignForm({ ...newDesignForm, primaryImageUrl: e.target.value })}
                  className="w-full h-11 px-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                  Description &amp; Drape Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the silhouette cut, lining, and occasion suitability..."
                  value={newDesignForm.description}
                  onChange={(e) => setNewDesignForm({ ...newDesignForm, description: e.target.value })}
                  className="w-full p-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#183B56]/20">
                <button
                  type="button"
                  onClick={() => setIsNewDesignOpen(false)}
                  className="px-5 py-2.5 bg-white border border-[#183B56]/40 text-[#5A7184] hover:text-[#183B56] text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs flex items-center gap-2"
                >
                  {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  <span>{creating ? "Publishing..." : "Publish Lookbook"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
