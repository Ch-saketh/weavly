"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Palette,
  Scissors,
  Settings,
  Plus,
  LogOut,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  Eye,
  EyeOff,
  Edit3,
  X,
  MapPin,
  Instagram,
  Globe,
  DollarSign,
  Calendar,
  BarChart3,
  Heart,
  Bookmark,
  TrendingUp,
} from "lucide-react";
import { useDesignerAuth } from "../store/useDesignerAuth";
import {
  getDesignerDashboardStats,
  getDesignerAnalytics,
  getMyDesignerDesigns,
  createDesignerDesign,
  updateDesignerDesign,
  publishDesignerDesign,
  unpublishDesignerDesign,
  deleteDesignerDesign,
  getMyDesignerRequests,
  updateDesignerRequestStatus,
  updateDesignerProfile,
  changeDesignerPassword,
  getDesignerActiveSessions,
  revokeDesignerSession,
  revokeDesignerOtherSessions,
} from "../services/designerService";

export default function DesignerStudioPage() {
  const router = useRouter();
  const { designer, isDesignerAuthenticated, loading: authLoading, logout, refreshDesigner } = useDesignerAuth();

  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'designs' | 'requests' | 'analytics' | 'settings'

  // Data States
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Design Modal State (Create / Edit)
  const [designModalOpen, setDesignModalOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState(null);
  const [designForm, setDesignForm] = useState({
    title: "",
    description: "",
    category: "couture",
    style: "Contemporary",
    targetAudience: "Women",
    primaryImageUrl: "",
    materials: "",
    estimatedPrice: "",
    status: "PUBLISHED",
  });
  const [designSubmitting, setDesignSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    brandName: "",
    bio: "",
    profileImageUrl: "",
    coverImageUrl: "",
    location: "",
    specialization: "",
    experienceYears: "",
    qualifications: "",
    skills: "",
    designPhilosophy: "",
    servicesOffered: "",
    externalWebsiteUrl: "",
    instagramHandle: "",
    behanceUrl: "",
    linkedinUrl: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const loadStudioData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [statsData, analyticsData, designsData, requestsData] = await Promise.all([
        getDesignerDashboardStats().catch(() => null),
        getDesignerAnalytics().catch(() => null),
        getMyDesignerDesigns().catch(() => []),
        getMyDesignerRequests().catch(() => []),
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
      setDesigns(designsData || []);
      setRequests(requestsData || []);
    } catch (err) {
      console.warn("Studio data load warning:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isDesignerAuthenticated) {
      router.replace("/designer/login");
      return;
    }
    if (isDesignerAuthenticated) {
      loadStudioData();
    }
  }, [authLoading, isDesignerAuthenticated, router, loadStudioData]);

  useEffect(() => {
    if (designer) {
      setProfileForm({
        displayName: designer.displayName || "",
        brandName: designer.brandName || "",
        bio: designer.bio || "",
        profileImageUrl: designer.profileImageUrl || "",
        coverImageUrl: designer.coverImageUrl || "",
        location: designer.location || "",
        specialization: designer.specialization || "",
        experienceYears: designer.experienceYears || "",
        qualifications: designer.qualifications || "",
        skills: designer.skills || "",
        designPhilosophy: designer.designPhilosophy || "",
        servicesOffered: designer.servicesOffered || "",
        externalWebsiteUrl: designer.externalWebsiteUrl || "",
        instagramHandle: designer.instagramHandle || "",
        behanceUrl: designer.behanceUrl || "",
        linkedinUrl: designer.linkedinUrl || "",
      });
    }
  }, [designer]);

  const handleOpenCreateDesign = () => {
    setEditingDesign(null);
    setDesignForm({
      title: "",
      description: "",
      category: "couture",
      style: "Contemporary",
      targetAudience: "Women",
      primaryImageUrl: "",
      materials: "",
      estimatedPrice: "",
      status: "PUBLISHED",
    });
    setModalError(null);
    setDesignModalOpen(true);
  };

  const handleOpenEditDesign = (d) => {
    setEditingDesign(d);
    setDesignForm({
      title: d.title || "",
      description: d.description || "",
      category: d.category || "couture",
      style: d.style || "Contemporary",
      targetAudience: d.targetAudience || "Women",
      primaryImageUrl: d.primaryImageUrl || "",
      materials: d.materials || "",
      estimatedPrice: d.estimatedPrice || "",
      status: d.status || "PUBLISHED",
    });
    setModalError(null);
    setDesignModalOpen(true);
  };

  const handleSaveDesign = async (e) => {
    e.preventDefault();
    setDesignSubmitting(true);
    setModalError(null);

    try {
      const payload = {
        ...designForm,
        estimatedPrice: designForm.estimatedPrice ? Number(designForm.estimatedPrice) : null,
      };

      if (editingDesign) {
        await updateDesignerDesign(editingDesign.designId, payload);
      } else {
        await createDesignerDesign(payload);
      }
      setDesignModalOpen(false);
      await loadStudioData();
    } catch (err) {
      setModalError(err.message || "Failed to save design");
    } finally {
      setDesignSubmitting(false);
    }
  };

  const handleTogglePublish = async (d) => {
    try {
      if (d.status === "PUBLISHED") {
        await unpublishDesignerDesign(d.designId);
      } else {
        await publishDesignerDesign(d.designId);
      }
      await loadStudioData();
    } catch (err) {
      alert(err.message || "Failed to update publish state");
    }
  };

  const handleDeleteDesign = async (designId) => {
    if (!window.confirm("Are you sure you want to delete this design permanently?")) return;
    try {
      await deleteDesignerDesign(designId);
      await loadStudioData();
    } catch (err) {
      alert(err.message || "Failed to delete design");
    }
  };

  const handleUpdateRequestStatus = async (requestId, newStatus) => {
    try {
      await updateDesignerRequestStatus(requestId, newStatus);
      await loadStudioData();
    } catch (err) {
      alert(err.message || "Failed to update request status");
    }
  };

  // Security & Sessions State
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionMsg, setSessionMsg] = useState("");

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const data = await getDesignerActiveSessions();
      if (Array.isArray(data)) setSessions(data);
    } catch (e) {
      console.warn("Failed to load designer sessions:", e.message);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "settings") {
      loadSessions();
    }
  }, [activeTab, loadSessions]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError("New passwords do not match.");
      return;
    }
    if (pwdForm.newPassword.length < 8) {
      setPwdError("New password must be at least 8 characters.");
      return;
    }
    setPwdSaving(true);
    try {
      const res = await changeDesignerPassword(pwdForm.currentPassword, pwdForm.newPassword);
      setPwdSuccess(res?.message || "Password changed successfully! All other active sessions have been signed out.");
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      loadSessions();
      setTimeout(() => setPwdSuccess(""), 5000);
    } catch (err) {
      setPwdError(err.message || "Failed to update password.");
    } finally {
      setPwdSaving(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await revokeDesignerSession(sessionId);
      setSessionMsg("Session revoked.");
      loadSessions();
      setTimeout(() => setSessionMsg(""), 3000);
    } catch (err) {
      setPwdError(err.message || "Failed to revoke session.");
    }
  };

  const handleRevokeOtherSessions = async () => {
    if (!confirm("Are you sure you want to sign out of all other devices?")) return;
    try {
      await revokeDesignerOtherSessions();
      setSessionMsg("Signed out of all other devices.");
      loadSessions();
      setTimeout(() => setSessionMsg(""), 3000);
    } catch (err) {
      setPwdError(err.message || "Failed to sign out other devices.");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(false);

    try {
      const payload = {
        ...profileForm,
        experienceYears: profileForm.experienceYears ? Number(profileForm.experienceYears) : null,
      };
      await updateDesignerProfile(payload);
      await refreshDesigner();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      alert(err.message || "Failed to save profile");
    } finally {
      setProfileSaving(false);
    }
  };

  if (authLoading || !designer) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#1D1D1F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#86868B]">Verifying atelier session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-[#1D1D1F] flex flex-col md:flex-row pt-20">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-[#ECECEC] p-6 shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Atelier Brand Badge */}
          <div className="flex items-center gap-3 pb-6 border-b border-[#ECECEC]">
            <div className="w-12 h-12 rounded-2xl bg-[#1D1D1F] text-[#F07020] flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
              {designer.profileImageUrl ? (
                <img src={designer.profileImageUrl} alt="Atelier" className="w-full h-full object-cover" />
              ) : (
                <span>{(designer.displayName || "D")[0]}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-[#1D1D1F] truncate block">
                  {designer.displayName}
                </span>
                <ShieldCheck size={13} className="text-[#F07020]" />
              </div>
              <span className="text-[10px] font-mono text-[#86868B] block">
                {designer.designerId}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "dashboard"
                  ? "bg-[#1D1D1F] text-white shadow-sm"
                  : "text-[#6E6E73] hover:bg-[#FAFAF9] hover:text-[#1D1D1F]"
              }`}
            >
              <LayoutDashboard size={16} /> Overview
            </button>

            <button
              onClick={() => setActiveTab("designs")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "designs"
                  ? "bg-[#1D1D1F] text-white shadow-sm"
                  : "text-[#6E6E73] hover:bg-[#FAFAF9] hover:text-[#1D1D1F]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Palette size={16} /> My Lookbooks
              </div>
              <span className="text-[10px] opacity-80">{designs.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("requests")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "requests"
                  ? "bg-[#1D1D1F] text-white shadow-sm"
                  : "text-[#6E6E73] hover:bg-[#FAFAF9] hover:text-[#1D1D1F]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Scissors size={16} /> Custom Requests
              </div>
              {requests.filter((r) => r.status === "PENDING").length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#F07020] text-white text-[9px] font-bold">
                  {requests.filter((r) => r.status === "PENDING").length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "analytics"
                  ? "bg-[#1D1D1F] text-white shadow-sm"
                  : "text-[#6E6E73] hover:bg-[#FAFAF9] hover:text-[#1D1D1F]"
              }`}
            >
              <BarChart3 size={16} /> Analytics
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "settings"
                  ? "bg-[#1D1D1F] text-white shadow-sm"
                  : "text-[#6E6E73] hover:bg-[#FAFAF9] hover:text-[#1D1D1F]"
              }`}
            >
              <Settings size={16} /> Atelier Profile
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-[#ECECEC] space-y-2">
          <button
            onClick={() => router.push(`/designers/${designer.designerId}`)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#FAFAF9] border border-[#ECECEC] text-[#1D1D1F] text-xs font-medium hover:bg-[#F0F0F0] transition-colors"
          >
            <ExternalLink size={13} /> View Public Atelier
          </button>
          <button
            onClick={() => {
              logout();
              router.push("/designer/login");
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {/* ── TAB 1: DASHBOARD OVERVIEW ── */}
        {activeTab === "dashboard" && (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1D1D1F]">
                  Atelier Dashboard
                </h1>
                <p className="text-xs text-[#86868B] mt-1">
                  Real-time lookbook metrics and customer commissions.
                </p>
              </div>
              <button
                onClick={handleOpenCreateDesign}
                className="px-5 py-2.5 rounded-full bg-[#F07020] hover:bg-[#e06214] text-white text-xs font-medium shadow-md flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus size={15} /> Upload Design
              </button>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] shadow-sm">
                <span className="text-xs text-[#86868B] block font-medium">Published Creations</span>
                <span className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] mt-1 block">
                  {stats ? stats.publishedDesigns : 0}
                </span>
                <span className="text-[11px] text-[#86868B] mt-1 block">
                  {stats ? stats.draftDesigns : 0} in drafts
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] shadow-sm">
                <span className="text-xs text-[#86868B] block font-medium">Pending Requests</span>
                <span className="text-2xl sm:text-3xl font-bold text-[#F07020] mt-1 block">
                  {stats ? stats.pendingRequests : 0}
                </span>
                <span className="text-[11px] text-[#86868B] mt-1 block">Awaiting your review</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] shadow-sm">
                <span className="text-xs text-[#86868B] block font-medium">Active Commissions</span>
                <span className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] mt-1 block">
                  {stats ? stats.activeCommissions : 0}
                </span>
                <span className="text-[11px] text-emerald-600 mt-1 block">In progress & tailored</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] shadow-sm">
                <span className="text-xs text-[#86868B] block font-medium">Completed Garments</span>
                <span className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] mt-1 block">
                  {stats ? stats.completedCommissions : 0}
                </span>
                <span className="text-[11px] text-[#86868B] mt-1 block">Fulfilled orders</span>
              </div>
            </div>

            {/* Quick Sections: Recent Designs & Pending Requests */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Designs */}
              <div className="bg-white rounded-2xl border border-[#ECECEC] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-[#1D1D1F]">Recent Lookbooks</h3>
                  <button
                    onClick={() => setActiveTab("designs")}
                    className="text-xs text-[#F07020] font-medium hover:underline"
                  >
                    View All
                  </button>
                </div>

                {designs.length > 0 ? (
                  <div className="space-y-3">
                    {designs.slice(0, 4).map((d) => (
                      <div key={d.designId} className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF9] border border-[#ECECEC]">
                        <div className="flex items-center gap-3">
                          <img src={d.primaryImageUrl} alt={d.title} className="w-10 h-10 rounded-lg object-cover bg-[#E5E5E5]" />
                          <div>
                            <span className="font-medium text-xs text-[#1D1D1F] block">{d.title}</span>
                            <span className="text-[10px] text-[#86868B] capitalize">{d.category} • {d.targetAudience}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          d.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"
                        }`}>
                          {d.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#86868B] py-6 text-center">No lookbooks published yet.</p>
                )}
              </div>

              {/* Pending Requests */}
              <div className="bg-white rounded-2xl border border-[#ECECEC] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-[#1D1D1F]">Pending Commissions</h3>
                  <button
                    onClick={() => setActiveTab("requests")}
                    className="text-xs text-[#F07020] font-medium hover:underline"
                  >
                    View Queue
                  </button>
                </div>

                {requests.length > 0 ? (
                  <div className="space-y-3">
                    {requests.slice(0, 4).map((r) => (
                      <div key={r.requestId} className="p-3 rounded-xl bg-[#FAFAF9] border border-[#ECECEC] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs text-[#1D1D1F]">{r.customerName}</span>
                          <span className="text-[10px] font-mono font-semibold text-[#86868B]">{r.requestId}</span>
                        </div>
                        <p className="text-[11px] text-[#6E6E73] line-clamp-1">{r.description}</p>
                        <div className="flex items-center justify-between text-[10px] text-[#86868B] pt-1">
                          <span>Budget: {r.budget ? `₹${r.budget.toLocaleString()}` : "Flexible"}</span>
                          <span className="font-semibold text-[#F07020] uppercase">{r.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#86868B] py-6 text-center">No custom requests in queue.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: MY DESIGNS / LOOKBOOKS ── */}
        {activeTab === "designs" && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold font-serif text-[#1D1D1F]">Lookbook & Design Management</h1>
                <p className="text-xs text-[#86868B] mt-1">Upload and manage original creations exposed across Weavly.</p>
              </div>
              <button
                onClick={handleOpenCreateDesign}
                className="px-5 py-2.5 rounded-full bg-[#F07020] hover:bg-[#e06214] text-white text-xs font-medium shadow-md flex items-center gap-2"
              >
                <Plus size={15} /> Upload Creation
              </button>
            </div>

            {designs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {designs.map((d) => (
                  <div key={d.designId} className="bg-white rounded-2xl border border-[#ECECEC] overflow-hidden shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="aspect-[3/4] bg-[#F4F1EC] relative">
                        <img src={d.primaryImageUrl} alt={d.title} className="w-full h-full object-cover" />
                        <span className={`absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          d.status === "PUBLISHED" ? "bg-emerald-600 text-white" : "bg-black/60 text-white backdrop-blur-md"
                        }`}>
                          {d.status}
                        </span>
                      </div>

                      <div className="p-4 space-y-1.5">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-sm text-[#1D1D1F] line-clamp-1">{d.title}</h3>
                          <span className="text-[11px] font-mono text-[#86868B]">{d.designId}</span>
                        </div>
                        <p className="text-xs text-[#6E6E73] line-clamp-2">{d.description || "Original atelier design."}</p>
                        <div className="pt-2 flex justify-between text-xs">
                          <span className="font-bold text-[#1D1D1F]">
                            {d.estimatedPrice ? `₹${d.estimatedPrice.toLocaleString()}` : "Price on request"}
                          </span>
                          <span className="text-[#86868B] capitalize">{d.category}</span>
                        </div>
                        <div className="flex items-center gap-3 pt-1 text-[11px] text-[#86868B]">
                          <span className="flex items-center gap-1"><Eye size={11} /> {d.viewCount || 0}</span>
                          <span className="flex items-center gap-1"><Heart size={11} /> {d.likeCount || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="p-4 pt-0 border-t border-[#ECECEC] mt-3 flex items-center justify-between text-xs pt-3">
                      <button
                        onClick={() => handleTogglePublish(d)}
                        className={`flex items-center gap-1 font-medium transition-colors ${
                          d.status === "PUBLISHED" ? "text-amber-600 hover:text-amber-700" : "text-emerald-600 hover:text-emerald-700"
                        }`}
                      >
                        {d.status === "PUBLISHED" ? <EyeOff size={13} /> : <Eye size={13} />}
                        {d.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditDesign(d)}
                          className="p-1.5 rounded-lg hover:bg-[#F0F0F0] text-[#1D1D1F]"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteDesign(d.designId)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-white rounded-3xl border border-[#ECECEC] p-8">
                <Palette size={32} className="mx-auto text-[#8C827A] mb-3" />
                <h3 className="text-base font-semibold text-[#1D1D1F]">No Creations in Lookbook</h3>
                <p className="text-xs text-[#86868B] mt-1 mb-5">
                  Upload your original sketches, gowns, and bespoke fashion creations.
                </p>
                <button
                  onClick={handleOpenCreateDesign}
                  className="px-5 py-2.5 rounded-full bg-[#F07020] text-white text-xs font-medium shadow-md"
                >
                  Upload First Design
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: CUSTOMIZATION REQUEST QUEUE ── */}
        {activeTab === "requests" && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold font-serif text-[#1D1D1F]">Custom Commission Requests</h1>
              <p className="text-xs text-[#86868B] mt-1">Review bespoke garment inquiries and custom sizing specifications submitted by customers.</p>
            </div>

            {requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((r) => (
                  <div key={r.requestId} className="bg-white rounded-2xl border border-[#ECECEC] p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#ECECEC]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1D1D1F]">{r.customerName}</span>
                          <span className="text-[10px] font-mono font-semibold bg-[#F4F1EC] text-[#8C827A] px-2 py-0.5 rounded">
                            {r.requestId}
                          </span>
                        </div>
                        <span className="text-xs text-[#86868B]">{r.customerEmail} {r.customerPhone && `• ${r.customerPhone}`}</span>
                      </div>

                      <span className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto ${
                        r.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                        r.status === "ACCEPTED" ? "bg-blue-100 text-blue-700" :
                        r.status === "IN_PROGRESS" ? "bg-purple-100 text-purple-700" :
                        r.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                        "bg-zinc-100 text-zinc-600"
                      }`}>
                        {r.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                      <div className="md:col-span-2 space-y-2">
                        <span className="font-bold text-[#86868B] uppercase tracking-wider block">Description & Vision</span>
                        <p className="text-[#3A3A3C] leading-relaxed whitespace-pre-line bg-[#FAFAF9] p-3.5 rounded-xl border border-[#ECECEC]">
                          {r.description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <span className="font-bold text-[#86868B] uppercase tracking-wider block">Specs & Budget</span>
                        <div className="space-y-1.5 text-xs">
                          {r.preferredColor && <div><span className="text-[#86868B]">Color:</span> <span className="font-medium">{r.preferredColor}</span></div>}
                          {r.preferredFabric && <div><span className="text-[#86868B]">Fabric:</span> <span className="font-medium">{r.preferredFabric}</span></div>}
                          <div><span className="text-[#86868B]">Budget:</span> <span className="font-bold text-[#1D1D1F]">{r.budget ? `₹${r.budget.toLocaleString()}` : "Flexible"}</span></div>
                          {r.requestedCompletionDate && <div><span className="text-[#86868B]">Date:</span> <span className="font-medium">{r.requestedCompletionDate}</span></div>}
                        </div>
                      </div>
                    </div>

                    {/* Status Management Actions */}
                    <div className="pt-3 border-t border-[#ECECEC] flex flex-wrap items-center justify-end gap-2 text-xs">
                      {r.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleUpdateRequestStatus(r.requestId, "DECLINED")}
                            className="px-4 py-1.5 rounded-lg border border-[#ECECEC] text-red-600 hover:bg-red-50 font-medium"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleUpdateRequestStatus(r.requestId, "ACCEPTED")}
                            className="px-4 py-1.5 rounded-lg bg-[#1D1D1F] hover:bg-[#F07020] text-white font-medium shadow-sm"
                          >
                            Accept Request
                          </button>
                        </>
                      )}
                      {r.status === "ACCEPTED" && (
                        <button
                          onClick={() => handleUpdateRequestStatus(r.requestId, "IN_PROGRESS")}
                          className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-medium shadow-sm"
                        >
                          Mark In Progress
                        </button>
                      )}
                      {r.status === "IN_PROGRESS" && (
                        <button
                          onClick={() => handleUpdateRequestStatus(r.requestId, "COMPLETED")}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-medium shadow-sm"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-white rounded-3xl border border-[#ECECEC] p-8">
                <Scissors size={32} className="mx-auto text-[#8C827A] mb-3" />
                <h3 className="text-base font-semibold text-[#1D1D1F]">No Custom Requests Yet</h3>
                <p className="text-xs text-[#86868B] mt-1">
                  When customers commission garments from your atelier, they will appear here in real time.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: PRIVATE ANALYTICS (ZERO MOCK DATA) ── */}
        {activeTab === "analytics" && (
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D1D1F] text-white text-[11px] font-semibold mb-2">
                <BarChart3 size={13} className="text-[#F07020]" /> Private Atelier Analytics
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1D1D1F]">
                Performance & Audience Insights
              </h1>
              <p className="text-xs text-[#86868B] mt-1">
                Real-time engagement telemetry tracked directly from customer interactions on your atelier and creations.
              </p>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-[#ECECEC] shadow-sm">
                <div className="flex items-center justify-between text-[#86868B] mb-2">
                  <span className="text-xs font-medium">Profile Views</span>
                  <Eye size={16} />
                </div>
                <span className="text-3xl font-bold text-[#1D1D1F]">
                  {analytics ? analytics.profileViews : 0}
                </span>
                <span className="text-[11px] text-[#86868B] mt-1 block">Visits to your public atelier</span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#ECECEC] shadow-sm">
                <div className="flex items-center justify-between text-[#86868B] mb-2">
                  <span className="text-xs font-medium">Lookbook Views</span>
                  <TrendingUp size={16} className="text-[#F07020]" />
                </div>
                <span className="text-3xl font-bold text-[#1D1D1F]">
                  {analytics ? analytics.totalDesignViews : 0}
                </span>
                <span className="text-[11px] text-[#86868B] mt-1 block">Total creation impressions</span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#ECECEC] shadow-sm">
                <div className="flex items-center justify-between text-[#86868B] mb-2">
                  <span className="text-xs font-medium">Creation Likes</span>
                  <Heart size={16} className="text-rose-500" />
                </div>
                <span className="text-3xl font-bold text-[#1D1D1F]">
                  {analytics ? analytics.totalDesignLikes : 0}
                </span>
                <span className="text-[11px] text-[#86868B] mt-1 block">Customer endorsements</span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#ECECEC] shadow-sm">
                <div className="flex items-center justify-between text-[#86868B] mb-2">
                  <span className="text-xs font-medium">Custom Inquiries</span>
                  <Scissors size={16} className="text-purple-600" />
                </div>
                <span className="text-3xl font-bold text-[#1D1D1F]">
                  {analytics ? analytics.totalRequests : 0}
                </span>
                <span className="text-[11px] text-[#86868B] mt-1 block">Total bespoke commissions</span>
              </div>
            </div>

            {/* Top Performing Lookbooks */}
            <div className="bg-white rounded-2xl border border-[#ECECEC] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-[#1D1D1F]">Top Performing Lookbooks</h3>
                  <p className="text-xs text-[#86868B] mt-0.5">Creations ordered by customer engagement.</p>
                </div>
                <span className="text-xs text-[#86868B]">Real telemetry</span>
              </div>

              {analytics && analytics.topDesigns && analytics.topDesigns.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[10px] text-[#86868B] uppercase border-b border-[#ECECEC]">
                      <tr>
                        <th className="py-2.5 px-3">Creation</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Base Price</th>
                        <th className="py-2.5 px-3 text-center">Views</th>
                        <th className="py-2.5 px-3 text-center">Likes</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECECEC]">
                      {analytics.topDesigns.map((d) => (
                        <tr key={d.designId} className="hover:bg-[#FAFAF9]">
                          <td className="py-3 px-3 flex items-center gap-3">
                            <img src={d.primaryImageUrl} alt={d.title} className="w-8 h-8 rounded-lg object-cover bg-[#E5E5E5]" />
                            <span className="font-medium text-[#1D1D1F]">{d.title}</span>
                          </td>
                          <td className="py-3 px-3 capitalize text-[#6E6E73]">{d.category}</td>
                          <td className="py-3 px-3 font-semibold">{d.estimatedPrice ? `₹${d.estimatedPrice.toLocaleString()}` : "Upon Request"}</td>
                          <td className="py-3 px-3 text-center font-mono">{d.viewCount || 0}</td>
                          <td className="py-3 px-3 text-center font-mono text-rose-500">{d.likeCount || 0}</td>
                          <td className="py-3 px-3 text-right">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                              d.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"
                            }`}>
                              {d.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-[#86868B] py-8 text-center">No lookbook analytics recorded yet.</p>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 5: ATELIER SETTINGS ── */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-[#ECECEC] p-8 sm:p-10 shadow-sm space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-serif text-[#1D1D1F]">Atelier Profile Settings</h1>
              <p className="text-xs text-[#86868B] mt-1">Update your creator biography, qualifications, social links, and atelier portfolio information.</p>
            </div>

            {profileSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 size={16} /> Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">Display Name *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.displayName}
                    onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">Brand / Studio Name</label>
                  <input
                    type="text"
                    value={profileForm.brandName}
                    onChange={(e) => setProfileForm({ ...profileForm, brandName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#1D1D1F] mb-1">Atelier Bio / Story</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Share your atelier background, signature cuts, and design heritage..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">Qualifications & Education</label>
                  <input
                    type="text"
                    value={profileForm.qualifications}
                    onChange={(e) => setProfileForm({ ...profileForm, qualifications: e.target.value })}
                    placeholder="e.g. NIFT Graduate, London College of Fashion"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">Core Skills & Techniques</label>
                  <input
                    type="text"
                    value={profileForm.skills}
                    onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                    placeholder="e.g. Pattern Making, Draping, Hand Embroidery"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">Profile Image URL</label>
                  <input
                    type="url"
                    value={profileForm.profileImageUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, profileImageUrl: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">Cover Banner URL</label>
                  <input
                    type="url"
                    value={profileForm.coverImageUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, coverImageUrl: e.target.value })}
                    placeholder="https://example.com/banner.jpg"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">Location</label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    placeholder="e.g. Milan, Italy"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">Specialization</label>
                  <input
                    type="text"
                    value={profileForm.specialization}
                    onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                    placeholder="e.g. Bespoke Tailoring"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#1D1D1F] mb-1">Design Philosophy</label>
                <input
                  type="text"
                  value={profileForm.designPhilosophy}
                  onChange={(e) => setProfileForm({ ...profileForm, designPhilosophy: e.target.value })}
                  placeholder="e.g. Minimalist luxury crafted with zero fabric waste."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">External Website URL</label>
                  <input
                    type="url"
                    value={profileForm.externalWebsiteUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, externalWebsiteUrl: e.target.value })}
                    placeholder="https://myatelier.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">Instagram Handle</label>
                  <input
                    type="text"
                    value={profileForm.instagramHandle}
                    onChange={(e) => setProfileForm({ ...profileForm, instagramHandle: e.target.value })}
                    placeholder="@vance_couture"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">Behance Portfolio URL</label>
                  <input
                    type="url"
                    value={profileForm.behanceUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, behanceUrl: e.target.value })}
                    placeholder="https://behance.net/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={profileForm.linkedinUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-6 py-2.5 rounded-full bg-[#1D1D1F] hover:bg-[#2C2C2E] text-white font-medium text-xs shadow-md disabled:opacity-60"
                >
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* ── ATELIER SECURITY & SESSIONS CARD ── */}
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-[#ECECEC] p-8 sm:p-10 shadow-sm space-y-8 mt-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={20} className="text-[#A66A2C]" />
                <h2 className="text-xl font-bold font-serif text-[#1D1D1F]">Atelier Password & Security</h2>
              </div>
              <p className="text-xs text-[#86868B]">
                Update your atelier password and manage active devices signed in to your designer studio.
              </p>
            </div>

            {pwdSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 size={16} /> {pwdSuccess}
              </div>
            )}

            {pwdError && (
              <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                {pwdError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#1D1D1F] mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">New Password (Min 8 chars) *</label>
                  <input
                    type="password"
                    required
                    value={pwdForm.newPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    value={pwdForm.confirmPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={pwdSaving}
                  className="px-6 py-2.5 rounded-full bg-[#1D1D1F] hover:bg-[#2C2C2E] text-white font-medium text-xs shadow-md disabled:opacity-60"
                >
                  {pwdSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>

            {/* Active Sessions */}
            <div className="pt-6 border-t border-[#ECECEC]">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#1D1D1F]">Active Atelier Sessions</h3>
                  <p className="text-[11px] text-[#86868B]">Devices currently authorized to access this Designer Studio.</p>
                </div>
                {sessions.filter(s => !s.current).length > 0 && (
                  <button
                    type="button"
                    onClick={handleRevokeOtherSessions}
                    className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-semibold transition-all"
                  >
                    Sign Out Other Devices
                  </button>
                )}
              </div>

              {sessionMsg && (
                <div className="p-3 mb-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs border border-emerald-200">
                  {sessionMsg}
                </div>
              )}

              {sessionsLoading && sessions.length === 0 ? (
                <div className="py-4 text-center text-xs text-[#86868B]">Loading sessions...</div>
              ) : sessions.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#FAFAF9] text-center text-xs text-[#86868B]">No active sessions found.</div>
              ) : (
                <div className="space-y-2.5">
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1D1D1F] truncate">{sess.deviceName || "Web Browser"}</span>
                          {sess.current && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#86868B] mt-0.5">
                          IP: {sess.ipAddress}
                        </div>
                      </div>

                      {!sess.current && (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(sess.id)}
                          className="px-3 py-1 rounded-lg border border-[#ECECEC] bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-[#4B5563] text-[11px] font-medium"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </div>
        )}
      </main>

      {/* ── CREATE / EDIT DESIGN MODAL ── */}
      {designModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#ECECEC] w-full max-w-lg p-6 sm:p-8 shadow-2xl relative my-8 text-xs">
            <button
              onClick={() => setDesignModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#F0F0F0] text-[#6E6E73]"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#F07020]">
                Lookbook Publisher
              </span>
              <h3 className="text-xl font-bold font-serif text-[#1D1D1F] mt-1">
                {editingDesign ? "Edit Lookbook Creation" : "Publish New Creation"}
              </h3>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 border border-red-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveDesign} className="space-y-4">
              <div>
                <label className="block font-medium text-[#1D1D1F] mb-1">Creation Title *</label>
                <input
                  type="text"
                  required
                  value={designForm.title}
                  onChange={(e) => setDesignForm({ ...designForm, title: e.target.value })}
                  placeholder="e.g. Silk Velvet Evening Gown"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-[#1D1D1F] mb-1">Design Description</label>
                <textarea
                  rows={3}
                  value={designForm.description}
                  onChange={(e) => setDesignForm({ ...designForm, description: e.target.value })}
                  placeholder="Describe the silhouette, draping, and inspiration..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-medium text-[#1D1D1F] mb-1">Primary Image URL *</label>
                <input
                  type="url"
                  required
                  value={designForm.primaryImageUrl}
                  onChange={(e) => setDesignForm({ ...designForm, primaryImageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">Category</label>
                  <select
                    value={designForm.category}
                    onChange={(e) => setDesignForm({ ...designForm, category: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] text-xs capitalize"
                  >
                    <option value="dresses">Dresses</option>
                    <option value="suits">Suits</option>
                    <option value="couture">Couture</option>
                    <option value="outerwear">Outerwear</option>
                    <option value="bridal">Bridal</option>
                    <option value="tops">Tops</option>
                    <option value="traditional">Traditional</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">Style</label>
                  <select
                    value={designForm.style}
                    onChange={(e) => setDesignForm({ ...designForm, style: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] text-xs"
                  >
                    <option value="Contemporary">Contemporary</option>
                    <option value="Minimalist">Minimalist</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Avant-Garde">Avant-Garde</option>
                    <option value="Bohemian">Bohemian</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">Audience</label>
                  <select
                    value={designForm.targetAudience}
                    onChange={(e) => setDesignForm({ ...designForm, targetAudience: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] text-xs"
                  >
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">Materials</label>
                  <input
                    type="text"
                    value={designForm.materials}
                    onChange={(e) => setDesignForm({ ...designForm, materials: e.target.value })}
                    placeholder="e.g. Mulberry Silk"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">Est. Base Price (₹)</label>
                  <input
                    type="number"
                    value={designForm.estimatedPrice}
                    onChange={(e) => setDesignForm({ ...designForm, estimatedPrice: e.target.value })}
                    placeholder="15000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDesignModalOpen(false)}
                  className="px-5 py-2 rounded-full hover:bg-[#F0F0F0] text-[#6E6E73] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={designSubmitting}
                  className="px-6 py-2.5 rounded-full bg-[#F07020] hover:bg-[#e06214] text-white font-medium shadow-md disabled:opacity-60"
                >
                  {designSubmitting ? "Saving..." : editingDesign ? "Update Creation" : "Publish Creation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
