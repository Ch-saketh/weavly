"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Palette, ArrowLeft, ShieldCheck, ShieldAlert, CheckCircle2,
  XCircle, AlertCircle, RefreshCw, Eye, Edit3, Trash2,
  ExternalLink, Layers, Image as ImageIcon, MapPin, Globe,
  Instagram, Linkedin, Award, Clock, FileText, UserCheck,
  Tag, Activity
} from "lucide-react";
import AdminSidebar from "@/modules/admin/components/AdminSidebar";
import AdminBreadcrumbHeader from "@/modules/admin/components/AdminBreadcrumbHeader";
import {
  getDesignerDetail,
  approveDesigner,
  suspendDesigner,
  restoreDesigner,
  updateDesigner,
  getDesignerProducts,
  getDesignerMedia,
  deleteDesignerMedia,
  getCurrentAdmin
} from "@/modules/admin/services/adminService";
import { formatErrorMessage } from "@/shared/utils/errorUtils";

export default function AdminDesignerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const designerIdParam = params?.id;

  // Active sub-tab
  const [activeTab, setActiveTab] = useState("overview"); // overview, designs, media, audit

  // Data states
  const [dossier, setDossier] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [designsTotal, setDesignsTotal] = useState(0);
  const [designsPage, setDesignsPage] = useState(0);
  const [designsLoading, setDesignsLoading] = useState(false);

  const [mediaAssets, setMediaAssets] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  // General loading & feedback
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [adminProfile, setAdminProfile] = useState(null);

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showDeleteMediaModal, setShowDeleteMediaModal] = useState(false);
  const [targetMedia, setTargetMedia] = useState(null);

  useEffect(() => {
    loadAdmin();
  }, []);

  useEffect(() => {
    if (designerIdParam) {
      loadDossier();
    }
  }, [designerIdParam]);

  useEffect(() => {
    if (activeTab === "designs" && designerIdParam) {
      loadDesigns();
    } else if (activeTab === "media" && designerIdParam) {
      loadMedia();
    }
  }, [activeTab, designerIdParam, designsPage]);

  const loadAdmin = async () => {
    try {
      const profile = await getCurrentAdmin();
      setAdminProfile(profile);
    } catch {
      router.push("/admin/login");
    }
  };

  const loadDossier = async () => {
    setLoading(true);
    try {
      const data = await getDesignerDetail(designerIdParam);
      setDossier(data);
      setEditForm({
        displayName: data.displayName || "",
        brandName: data.brandName || "",
        bio: data.bio || "",
        location: data.location || "",
        specialization: data.specialization || "",
        experienceYears: data.experienceYears ?? "",
        phone: data.phone || "",
        skills: data.skills || "",
        designPhilosophy: data.designPhilosophy || "",
        servicesOffered: data.servicesOffered || "",
        customizationAvailable: data.customizationAvailable ?? true,
        pricingTier: data.pricingTier || "",
        externalWebsiteUrl: data.externalWebsiteUrl || "",
        instagramHandle: data.instagramHandle || "",
        behanceUrl: data.behanceUrl || "",
        linkedinUrl: data.linkedinUrl || "",
      });
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push("/admin/login");
      } else {
        setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to load designer dossier.") });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDesigns = async () => {
    setDesignsLoading(true);
    try {
      const res = await getDesignerProducts(designerIdParam, { page: designsPage, size: 12 });
      setDesigns(res?.content || []);
      setDesignsTotal(res?.totalElements || 0);
    } catch (err) {
      console.warn("Could not load designs:", err.message);
    } finally {
      setDesignsLoading(false);
    }
  };

  const loadMedia = async () => {
    setMediaLoading(true);
    try {
      const list = await getDesignerMedia(designerIdParam);
      setMediaAssets(list || []);
    } catch (err) {
      console.warn("Could not load media:", err.message);
    } finally {
      setMediaLoading(false);
    }
  };

  const isSuper = adminProfile?.role === "SUPER_ADMIN";
  const permissions = new Set(adminProfile?.permissions || []);
  const can = (perm) => isSuper || permissions.has(perm);

  // Action handlers
  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const updated = await approveDesigner(designerIdParam);
      setDossier(updated);
      setShowApproveModal(false);
      setFeedback({ type: "success", message: `Designer ${updated.designerId} approved successfully!` });
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Approval failed.") });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async (e) => {
    e.preventDefault();
    if (!suspendReason.trim()) return;
    setActionLoading(true);
    try {
      const updated = await suspendDesigner(designerIdParam, suspendReason);
      setDossier(updated);
      setShowSuspendModal(false);
      setSuspendReason("");
      setFeedback({ type: "success", message: `Designer ${updated.designerId} suspended and sessions revoked.` });
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Suspension failed.") });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try {
      const updated = await restoreDesigner(designerIdParam);
      setDossier(updated);
      setShowRestoreModal(false);
      setFeedback({ type: "success", message: `Designer ${updated.designerId} restored to ACTIVE.` });
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Restoration failed.") });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...editForm,
        experienceYears: editForm.experienceYears ? parseInt(editForm.experienceYears, 10) : null,
      };
      const updated = await updateDesigner(designerIdParam, payload);
      setDossier(updated);
      setShowEditModal(false);
      setFeedback({ type: "success", message: "Designer profile information updated successfully." });
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Profile update failed.") });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMedia = async () => {
    if (!targetMedia) return;
    setActionLoading(true);
    try {
      await deleteDesignerMedia(designerIdParam, targetMedia.id);
      setShowDeleteMediaModal(false);
      setTargetMedia(null);
      setFeedback({ type: "success", message: "Media asset deleted successfully from storage and unlinked from database." });
      loadMedia();
      loadDossier();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Media deletion failed.") });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case "ACTIVE":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
            ACTIVE STOREFRONT
          </span>
        );
      case "APPROVED":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-300">
            APPROVED
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-300">
            PENDING REVIEW
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-300">
            SUSPENDED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-300">
            {st || "UNKNOWN"}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex bg-[#F5EFEB] min-h-screen text-[#183B56] font-sans antialiased">
        <AdminSidebar activeTab="designers" />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw size={24} className="animate-spin text-[#183B56]" />
            <span className="text-xs font-semibold text-[#5A7184]">Loading designer dossier...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="flex bg-[#F5EFEB] min-h-screen text-[#183B56] font-sans antialiased">
        <AdminSidebar activeTab="designers" />
        <main className="flex-1 p-8">
          <div className="bg-white border border-[#183B56]/15 p-8 max-w-xl mx-auto text-center flex flex-col gap-4">
            <AlertCircle size={32} className="mx-auto text-amber-600" />
            <h2 className="text-lg font-bold">Designer Not Found</h2>
            <p className="text-xs text-[#5A7184]">
              No designer record matching identifier &ldquo;{designerIdParam}&rdquo; was found in the control plane.
            </p>
            <Link
              href="/admin/designers"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#183B56] text-white text-xs font-semibold w-max mx-auto"
            >
              <ArrowLeft size={14} />
              Return to Designer Registry
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-[#F5EFEB] min-h-screen text-[#183B56] font-sans antialiased">
      <AdminSidebar activeTab="designers" />

      <main className="flex-1 flex flex-col min-w-0 bg-[#F5EFEB]">
        <AdminBreadcrumbHeader
          items={[
            { label: "Control Plane", href: "/admin/dashboard" },
            { label: "Designer Governance", href: "/admin/designers" },
            { label: dossier.designerId, href: `/admin/designers/${dossier.id}` },
          ]}
        />

        <div className="p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/admin/designers"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A7184] hover:text-[#183B56]"
            >
              <ArrowLeft size={14} />
              Back to Designer Registry
            </Link>
            <div className="text-[11px] font-mono text-[#5A7184]">
              Internal ID: {dossier.id}
            </div>
          </div>

          {/* Feedback Banners */}
          {feedback.message && (
            <div
              className={`p-3.5 border text-xs flex items-center justify-between ${
                feedback.type === "error"
                  ? "bg-rose-50 border-rose-300 text-rose-800"
                  : "bg-emerald-50 border-emerald-300 text-emerald-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === "error" ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
                <span>{feedback.message}</span>
              </div>
              <button
                onClick={() => setFeedback({ type: "", message: "" })}
                className="text-xs font-bold underline cursor-pointer ml-4"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Master Atelier Dossier Header Card */}
          <div className="bg-white border border-[#183B56]/15 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              {dossier.profileImageUrl ? (
                <img
                  src={dossier.profileImageUrl}
                  alt={dossier.displayName}
                  className="w-16 h-16 rounded-none object-cover border border-[#183B56]/20 bg-stone-100 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-none bg-[#183B56]/10 border border-[#183B56]/20 flex items-center justify-center font-bold text-[#183B56] text-xl shrink-0">
                  {dossier.displayName ? dossier.displayName.charAt(0).toUpperCase() : "D"}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight text-[#183B56]">
                    {dossier.displayName || "Independent Atelier"}
                  </h1>
                  <span className="font-mono text-xs px-2 py-0.5 bg-[#F5EFEB] border border-[#183B56]/20 text-[#183B56]">
                    {dossier.designerId}
                  </span>
                  {getStatusBadge(dossier.status)}
                </div>

                <div className="flex items-center gap-4 text-xs text-[#5A7184] mt-1.5 flex-wrap">
                  {dossier.brandName && (
                    <span className="font-semibold text-[#183B56]">{dossier.brandName}</span>
                  )}
                  <span>{dossier.email}</span>
                  {dossier.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {dossier.location}
                    </span>
                  )}
                  {dossier.specialization && (
                    <span className="flex items-center gap-1">
                      <Tag size={12} />
                      {dossier.specialization}
                    </span>
                  )}
                </div>

                {dossier.suspensionReason && dossier.status === "SUSPENDED" && (
                  <div className="mt-2 text-xs bg-rose-50 border border-rose-200 text-rose-800 p-2 font-medium">
                    <strong>Suspension Reason:</strong> {dossier.suspensionReason}
                  </div>
                )}
              </div>
            </div>

            {/* Governance Actions Bar */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {dossier.status === "PENDING" && can("designers.verify") && (
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 size={14} />
                  Approve Application
                </button>
              )}

              {dossier.status === "SUSPENDED" && can("designers.suspend") && (
                <button
                  onClick={() => setShowRestoreModal(true)}
                  className="px-3.5 py-1.5 bg-[#183B56] hover:bg-[#183B56]/90 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserCheck size={14} />
                  Restore to ACTIVE
                </button>
              )}

              {dossier.status !== "SUSPENDED" && can("designers.suspend") && (
                <button
                  onClick={() => setShowSuspendModal(true)}
                  className="px-3.5 py-1.5 border border-rose-300 text-rose-800 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldAlert size={14} />
                  Suspend Account
                </button>
              )}

              {can("designers.moderate") && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-3.5 py-1.5 border border-[#183B56]/30 hover:border-[#183B56] bg-white text-[#183B56] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 size={14} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Sub-navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-[#183B56]/15 bg-white px-4">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
                activeTab === "overview"
                  ? "border-[#183B56] text-[#183B56]"
                  : "border-transparent text-[#5A7184] hover:text-[#183B56]"
              }`}
            >
              Overview & Dossier
            </button>

            <button
              onClick={() => setActiveTab("designs")}
              className={`px-4 py-3 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === "designs"
                  ? "border-[#183B56] text-[#183B56]"
                  : "border-transparent text-[#5A7184] hover:text-[#183B56]"
              }`}
            >
              <Layers size={13} />
              Designs & Catalog ({dossier.totalDesigns || 0})
            </button>

            <button
              onClick={() => setActiveTab("media")}
              className={`px-4 py-3 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === "media"
                  ? "border-[#183B56] text-[#183B56]"
                  : "border-transparent text-[#5A7184] hover:text-[#183B56]"
              }`}
            >
              <ImageIcon size={13} />
              Studio Media Assets
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`px-4 py-3 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === "audit"
                  ? "border-[#183B56] text-[#183B56]"
                  : "border-transparent text-[#5A7184] hover:text-[#183B56]"
              }`}
            >
              <Activity size={13} />
              Audit Log ({dossier.auditLogs?.length || 0})
            </button>
          </div>

          {/* TAB 1: OVERVIEW & DOSSIER */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1 & 2: Main Profile & Studio Info */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Brand & Studio Profile Card */}
                <div className="bg-white border border-[#183B56]/15 p-6 flex flex-col gap-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#183B56] border-b border-[#183B56]/10 pb-2">
                    Studio & Atelier Profile
                  </h2>

                  {dossier.bio ? (
                    <div>
                      <span className="text-[11px] font-bold text-[#5A7184] uppercase">Bio / Editorial Statement</span>
                      <p className="text-xs text-[#183B56] mt-1 leading-relaxed whitespace-pre-line">
                        {dossier.bio}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#5A7184] italic">No bio submitted yet.</p>
                  )}

                  {dossier.designPhilosophy && (
                    <div>
                      <span className="text-[11px] font-bold text-[#5A7184] uppercase">Design Philosophy</span>
                      <p className="text-xs text-[#183B56] mt-1 leading-relaxed whitespace-pre-line">
                        {dossier.designPhilosophy}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-[#183B56]/10 text-xs">
                    <div>
                      <span className="text-[10px] text-[#5A7184] uppercase font-bold block">Experience</span>
                      <span className="font-semibold text-[#183B56]">
                        {dossier.experienceYears != null ? `${dossier.experienceYears} Years` : "Unspecified"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#5A7184] uppercase font-bold block">Pricing Tier</span>
                      <span className="font-semibold text-[#183B56] capitalize">
                        {dossier.pricingTier || "Couture Standard"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#5A7184] uppercase font-bold block">Bespoke Customization</span>
                      <span className="font-semibold text-[#183B56]">
                        {dossier.customizationAvailable ? "Available" : "Standard Collection Only"}
                      </span>
                    </div>
                  </div>

                  {dossier.servicesOffered && (
                    <div className="pt-2 border-t border-[#183B56]/10">
                      <span className="text-[10px] text-[#5A7184] uppercase font-bold block mb-1">Services Offered</span>
                      <span className="text-xs text-[#183B56]">{dossier.servicesOffered}</span>
                    </div>
                  )}

                  {dossier.skills && (
                    <div>
                      <span className="text-[10px] text-[#5A7184] uppercase font-bold block mb-1">Craftsmanship & Skills</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {dossier.skills.split(",").map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-[#F5EFEB] border border-[#183B56]/15 text-[11px] text-[#183B56]">
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Social & Portfolio Links Card */}
                <div className="bg-white border border-[#183B56]/15 p-6 flex flex-col gap-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#183B56] border-b border-[#183B56]/10 pb-2">
                    Verified Digital Footprint & Links
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-[#5A7184] shrink-0" />
                      <span className="text-[#5A7184] w-20 shrink-0">Website:</span>
                      {dossier.externalWebsiteUrl ? (
                        <a
                          href={dossier.externalWebsiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#183B56] font-semibold underline truncate flex items-center gap-1"
                        >
                          {dossier.externalWebsiteUrl}
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-[#5A7184] italic">Not provided</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Instagram size={14} className="text-[#5A7184] shrink-0" />
                      <span className="text-[#5A7184] w-20 shrink-0">Instagram:</span>
                      {dossier.instagramHandle ? (
                        <span className="text-[#183B56] font-semibold">@{dossier.instagramHandle.replace("@", "")}</span>
                      ) : (
                        <span className="text-[#5A7184] italic">Not provided</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Palette size={14} className="text-[#5A7184] shrink-0" />
                      <span className="text-[#5A7184] w-20 shrink-0">Behance:</span>
                      {dossier.behanceUrl ? (
                        <a
                          href={dossier.behanceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#183B56] font-semibold underline truncate flex items-center gap-1"
                        >
                          {dossier.behanceUrl}
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-[#5A7184] italic">Not provided</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Linkedin size={14} className="text-[#5A7184] shrink-0" />
                      <span className="text-[#5A7184] w-20 shrink-0">LinkedIn:</span>
                      {dossier.linkedinUrl ? (
                        <a
                          href={dossier.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#183B56] font-semibold underline truncate flex items-center gap-1"
                        >
                          {dossier.linkedinUrl}
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-[#5A7184] italic">Not provided</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Studio Metrics & Verification Metadata */}
              <div className="flex flex-col gap-6">
                {/* Metrics Summary */}
                <div className="bg-white border border-[#183B56]/15 p-6 flex flex-col gap-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#183B56] border-b border-[#183B56]/10 pb-2">
                    Studio Activity Metrics
                  </h2>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#F5EFEB]/50 border border-[#183B56]/10">
                      <span className="text-[10px] text-[#5A7184] uppercase font-bold block">Published Items</span>
                      <span className="text-xl font-bold text-[#183B56] mt-1 block">
                        {dossier.publishedDesigns || 0}
                      </span>
                    </div>

                    <div className="p-3 bg-[#F5EFEB]/50 border border-[#183B56]/10">
                      <span className="text-[10px] text-[#5A7184] uppercase font-bold block">Draft Items</span>
                      <span className="text-xl font-bold text-[#183B56] mt-1 block">
                        {dossier.draftDesigns || 0}
                      </span>
                    </div>

                    <div className="p-3 bg-[#F5EFEB]/50 border border-[#183B56]/10">
                      <span className="text-[10px] text-[#5A7184] uppercase font-bold block">Commissions</span>
                      <span className="text-xl font-bold text-[#183B56] mt-1 block">
                        {dossier.totalCustomizationRequests || 0}
                      </span>
                    </div>

                    <div className="p-3 bg-[#F5EFEB]/50 border border-[#183B56]/10">
                      <span className="text-[10px] text-[#5A7184] uppercase font-bold block">Store Views</span>
                      <span className="text-xl font-bold text-[#183B56] mt-1 block">
                        {dossier.profileViews || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Governance Metadata Card */}
                <div className="bg-white border border-[#183B56]/15 p-6 flex flex-col gap-3 text-xs">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#183B56] border-b border-[#183B56]/10 pb-2">
                    Administrative Record
                  </h2>

                  <div className="flex justify-between py-1 border-b border-[#183B56]/10">
                    <span className="text-[#5A7184]">Created / Joined:</span>
                    <span className="font-semibold text-[#183B56]">
                      {dossier.createdAt ? new Date(dossier.createdAt).toLocaleString() : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#183B56]/10">
                    <span className="text-[#5A7184]">Last Updated:</span>
                    <span className="font-semibold text-[#183B56]">
                      {dossier.updatedAt ? new Date(dossier.updatedAt).toLocaleString() : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#183B56]/10">
                    <span className="text-[#5A7184]">Approved At:</span>
                    <span className="font-semibold text-[#183B56]">
                      {dossier.approvedAt ? new Date(dossier.approvedAt).toLocaleString() : "Pending"}
                    </span>
                  </div>

                  {dossier.approvedBy && (
                    <div className="flex justify-between py-1 border-b border-[#183B56]/10">
                      <span className="text-[#5A7184]">Approved By:</span>
                      <span className="font-semibold text-[#183B56]">{dossier.approvedBy}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-1">
                    <span className="text-[#5A7184]">Lock Version:</span>
                    <span className="font-mono text-[#5A7184]">v{dossier.version ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DESIGNS & CATALOG */}
          {activeTab === "designs" && (
            <div className="bg-white border border-[#183B56]/15 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#183B56]/10 pb-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#183B56]">
                    Designs & Studio Creations
                  </h2>
                  <p className="text-xs text-[#5A7184]">
                    Total of {designsTotal} design records registered to this atelier.
                  </p>
                </div>
                <button
                  onClick={loadDesigns}
                  disabled={designsLoading}
                  className="px-3 py-1 border border-[#183B56]/20 text-xs font-semibold text-[#183B56] flex items-center gap-1"
                >
                  <RefreshCw size={12} className={designsLoading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>

              {designsLoading ? (
                <div className="py-12 text-center text-xs text-[#5A7184]">
                  <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-[#183B56]" />
                  Loading designs...
                </div>
              ) : designs.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#5A7184]">
                  No designs created yet by this designer.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {designs.map((design) => (
                    <div
                      key={design.designId}
                      className="border border-[#183B56]/15 p-3 flex flex-col justify-between bg-white hover:border-[#183B56] transition-colors"
                    >
                      {design.primaryImageUrl ? (
                        <img
                          src={design.primaryImageUrl}
                          alt={design.title}
                          className="w-full h-44 object-cover border border-[#183B56]/10 bg-stone-100"
                        />
                      ) : (
                        <div className="w-full h-44 bg-stone-100 border border-[#183B56]/10 flex items-center justify-center text-xs text-[#5A7184]">
                          No Image
                        </div>
                      )}

                      <div className="mt-3">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[10px] text-[#5A7184]">{design.designId}</span>
                          <span
                            className={`px-1.5 py-0.2 text-[9px] font-bold uppercase border ${
                              design.status === "PUBLISHED"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-stone-100 text-stone-700 border-stone-300"
                            }`}
                          >
                            {design.status}
                          </span>
                        </div>

                        <h3 className="font-bold text-xs text-[#183B56] mt-1 line-clamp-1">{design.title}</h3>

                        <div className="text-[11px] text-[#5A7184] flex items-center justify-between mt-1.5">
                          <span>{design.category || "Couture"}</span>
                          <span className="font-bold text-[#183B56]">
                            {design.estimatedPrice != null ? `₹${design.estimatedPrice.toLocaleString()}` : "Custom"}
                          </span>
                        </div>

                        <div className="text-[10px] text-[#5A7184] mt-1 flex items-center gap-2 pt-1.5 border-t border-[#183B56]/10">
                          <span>{design.viewCount || 0} views</span>
                          <span>•</span>
                          <span>{design.likeCount || 0} likes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MEDIA ASSETS */}
          {activeTab === "media" && (
            <div className="bg-white border border-[#183B56]/15 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#183B56]/10 pb-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#183B56]">
                    Uploaded Atelier Media Assets
                  </h2>
                  <p className="text-xs text-[#5A7184]">
                    Supervise profile imagery, cover artwork, and creation gallery images. Strict object-level ownership enforced.
                  </p>
                </div>
                <button
                  onClick={loadMedia}
                  disabled={mediaLoading}
                  className="px-3 py-1 border border-[#183B56]/20 text-xs font-semibold text-[#183B56] flex items-center gap-1"
                >
                  <RefreshCw size={12} className={mediaLoading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>

              {mediaLoading ? (
                <div className="py-12 text-center text-xs text-[#5A7184]">
                  <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-[#183B56]" />
                  Loading media assets...
                </div>
              ) : mediaAssets.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#5A7184]">
                  No media assets stored for this designer.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {mediaAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="border border-[#183B56]/15 p-2 flex flex-col justify-between bg-white"
                    >
                      <div className="relative group">
                        <img
                          src={asset.url}
                          alt={asset.id}
                          className="w-full h-36 object-cover border border-[#183B56]/10 bg-stone-100"
                        />
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 bg-[#183B56]/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold gap-1"
                        >
                          <ExternalLink size={12} /> View Full
                        </a>
                      </div>

                      <div className="mt-2 flex flex-col gap-1">
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-[#F5EFEB] border border-[#183B56]/15 text-[#183B56] w-max">
                          {asset.type}
                        </span>
                        {asset.designId && (
                          <span className="text-[10px] text-[#5A7184] font-mono truncate">
                            {asset.designId} • {asset.designTitle || "Design"}
                          </span>
                        )}

                        {can("designers.moderate") && (
                          <button
                            onClick={() => {
                              setTargetMedia(asset);
                              setShowDeleteMediaModal(true);
                            }}
                            className="mt-2 px-2 py-1 text-[11px] font-semibold border border-rose-300 text-rose-800 hover:bg-rose-50 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={11} />
                            Delete Media
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AUDIT LOG TIMELINE */}
          {activeTab === "audit" && (
            <div className="bg-white border border-[#183B56]/15 p-6 flex flex-col gap-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#183B56] border-b border-[#183B56]/10 pb-3">
                Administrative Governance History
              </h2>

              {!dossier.auditLogs || dossier.auditLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#5A7184]">
                  No administrative actions have been recorded yet for this atelier dossier.
                </div>
              ) : (
                <div className="divide-y divide-[#183B56]/10">
                  {dossier.auditLogs.map((logItem) => (
                    <div key={logItem.id} className="py-3 flex flex-col gap-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold px-2 py-0.5 bg-[#183B56] text-white text-[10px] uppercase tracking-wider">
                            {logItem.action}
                          </span>
                          <span className="font-semibold text-[#183B56]">
                            by {logItem.actor?.username || "Admin"}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#5A7184]">
                          {logItem.createdAt ? new Date(logItem.createdAt).toLocaleString() : "—"}
                        </span>
                      </div>

                      {logItem.changes && (
                        <div className="bg-[#F5EFEB]/50 p-2 font-mono text-[11px] text-[#183B56] border border-[#183B56]/10 overflow-x-auto whitespace-pre-wrap">
                          {logItem.changes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* APPROVE CONFIRMATION MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#183B56] p-6 max-w-md w-full flex flex-col gap-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-[#183B56]/15 pb-3">
              <CheckCircle2 size={18} className="text-emerald-700" />
              <h2 className="text-base font-bold text-[#183B56]">Approve Atelier Application</h2>
            </div>
            <p className="text-xs text-[#5A7184] leading-relaxed">
              Confirm approval for <strong className="text-[#183B56]">{dossier.displayName}</strong> ({dossier.designerId}).
              This will transition the account to <strong className="text-emerald-700">APPROVED</strong>, permitting studio activation and catalog publishing.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#183B56]/15">
              <button
                onClick={() => setShowApproveModal(false)}
                disabled={actionLoading}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#5A7184] hover:text-[#183B56] border border-[#183B56]/20 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
              >
                {actionLoading ? "Approving..." : "Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUSPEND MODAL */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSuspend} className="bg-white border border-rose-400 p-6 max-w-md w-full flex flex-col gap-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-rose-200 pb-3">
              <ShieldAlert size={18} className="text-rose-700" />
              <h2 className="text-base font-bold text-[#183B56]">Suspend Atelier Account</h2>
            </div>
            <p className="text-xs text-[#5A7184] leading-relaxed">
              Suspending <strong className="text-[#183B56]">{dossier.displayName}</strong> will immediately terminate all active sessions and block studio login.
            </p>
            <div>
              <label className="block text-xs font-bold text-[#183B56] mb-1">Reason for Suspension *</label>
              <textarea
                required
                rows={3}
                placeholder="Compliance violation, intellectual property complaint..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="w-full p-2.5 bg-[#F5EFEB]/50 border border-[#183B56]/20 text-xs text-[#183B56] focus:outline-none focus:border-[#183B56]"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#183B56]/15">
              <button
                type="button"
                onClick={() => setShowSuspendModal(false)}
                disabled={actionLoading}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#5A7184] hover:text-[#183B56] border border-[#183B56]/20 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || !suspendReason.trim()}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-700 hover:bg-rose-800 text-white cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? "Suspending..." : "Confirm Suspension"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RESTORE CONFIRMATION MODAL */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#183B56] p-6 max-w-md w-full flex flex-col gap-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-[#183B56]/15 pb-3">
              <UserCheck size={18} className="text-[#183B56]" />
              <h2 className="text-base font-bold text-[#183B56]">Restore Designer Account</h2>
            </div>
            <p className="text-xs text-[#5A7184] leading-relaxed">
              Are you sure you want to restore <strong className="text-[#183B56]">{dossier.displayName}</strong> to <strong className="text-emerald-700">ACTIVE</strong> status? This clears the suspension hold and re-enables designer studio access.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#183B56]/15">
              <button
                onClick={() => setShowRestoreModal(false)}
                disabled={actionLoading}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#5A7184] hover:text-[#183B56] border border-[#183B56]/20 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                disabled={actionLoading}
                className="px-4 py-1.5 text-xs font-semibold bg-[#183B56] hover:bg-[#183B56]/90 text-white cursor-pointer"
              >
                {actionLoading ? "Restoring..." : "Restore Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white border border-[#183B56] p-6 max-w-2xl w-full flex flex-col gap-4 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center gap-2 border-b border-[#183B56]/15 pb-3">
              <Edit3 size={18} className="text-[#183B56]" />
              <h2 className="text-base font-bold text-[#183B56]">Edit Designer Dossier Profile</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#183B56] mb-1">Display Name</label>
                <input
                  type="text"
                  value={editForm.displayName || ""}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  className="w-full p-2 bg-[#F5EFEB]/50 border border-[#183B56]/20 text-xs focus:outline-none focus:border-[#183B56]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#183B56] mb-1">Brand / Studio Name</label>
                <input
                  type="text"
                  value={editForm.brandName || ""}
                  onChange={(e) => setEditForm({ ...editForm, brandName: e.target.value })}
                  className="w-full p-2 bg-[#F5EFEB]/50 border border-[#183B56]/20 text-xs focus:outline-none focus:border-[#183B56]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#183B56] mb-1">Location</label>
                <input
                  type="text"
                  value={editForm.location || ""}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full p-2 bg-[#F5EFEB]/50 border border-[#183B56]/20 text-xs focus:outline-none focus:border-[#183B56]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#183B56] mb-1">Specialization</label>
                <input
                  type="text"
                  value={editForm.specialization || ""}
                  onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                  className="w-full p-2 bg-[#F5EFEB]/50 border border-[#183B56]/20 text-xs focus:outline-none focus:border-[#183B56]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#183B56] mb-1">Experience (Years)</label>
                <input
                  type="number"
                  value={editForm.experienceYears ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, experienceYears: e.target.value })}
                  className="w-full p-2 bg-[#F5EFEB]/50 border border-[#183B56]/20 text-xs focus:outline-none focus:border-[#183B56]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#183B56] mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={editForm.phone || ""}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full p-2 bg-[#F5EFEB]/50 border border-[#183B56]/20 text-xs focus:outline-none focus:border-[#183B56]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#183B56] mb-1">Bio / Editorial Statement</label>
                <textarea
                  rows={3}
                  value={editForm.bio || ""}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full p-2 bg-[#F5EFEB]/50 border border-[#183B56]/20 text-xs focus:outline-none focus:border-[#183B56]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#183B56] mb-1">Design Philosophy</label>
                <textarea
                  rows={2}
                  value={editForm.designPhilosophy || ""}
                  onChange={(e) => setEditForm({ ...editForm, designPhilosophy: e.target.value })}
                  className="w-full p-2 bg-[#F5EFEB]/50 border border-[#183B56]/20 text-xs focus:outline-none focus:border-[#183B56]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#183B56] mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={editForm.skills || ""}
                  onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                  className="w-full p-2 bg-[#F5EFEB]/50 border border-[#183B56]/20 text-xs focus:outline-none focus:border-[#183B56]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#183B56] mb-1">Website URL</label>
                <input
                  type="text"
                  value={editForm.externalWebsiteUrl || ""}
                  onChange={(e) => setEditForm({ ...editForm, externalWebsiteUrl: e.target.value })}
                  className="w-full p-2 bg-[#F5EFEB]/50 border border-[#183B56]/20 text-xs focus:outline-none focus:border-[#183B56]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#183B56] mb-1">Instagram Handle</label>
                <input
                  type="text"
                  value={editForm.instagramHandle || ""}
                  onChange={(e) => setEditForm({ ...editForm, instagramHandle: e.target.value })}
                  className="w-full p-2 bg-[#F5EFEB]/50 border border-[#183B56]/20 text-xs focus:outline-none focus:border-[#183B56]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#183B56] mb-1">Pricing Tier</label>
                <input
                  type="text"
                  value={editForm.pricingTier || ""}
                  onChange={(e) => setEditForm({ ...editForm, pricingTier: e.target.value })}
                  className="w-full p-2 bg-[#F5EFEB]/50 border border-[#183B56]/20 text-xs focus:outline-none focus:border-[#183B56]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#183B56]/15 mt-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                disabled={actionLoading}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#5A7184] hover:text-[#183B56] border border-[#183B56]/20 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-1.5 text-xs font-semibold bg-[#183B56] hover:bg-[#183B56]/90 text-white cursor-pointer"
              >
                {actionLoading ? "Saving..." : "Save Profile Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE MEDIA CONFIRMATION MODAL */}
      {showDeleteMediaModal && targetMedia && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-rose-400 p-6 max-w-md w-full flex flex-col gap-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-rose-200 pb-3">
              <Trash2 size={18} className="text-rose-700" />
              <h2 className="text-base font-bold text-[#183B56]">Delete Media Asset</h2>
            </div>
            <p className="text-xs text-[#5A7184] leading-relaxed">
              Are you sure you want to permanently delete media asset <strong className="text-[#183B56]">{targetMedia.id}</strong>?
              This will remove the file from Cloudflare R2 storage and uncouple it from the designer profile / design record.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#183B56]/15">
              <button
                onClick={() => {
                  setShowDeleteMediaModal(false);
                  setTargetMedia(null);
                }}
                disabled={actionLoading}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#5A7184] hover:text-[#183B56] border border-[#183B56]/20 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMedia}
                disabled={actionLoading}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-700 hover:bg-rose-800 text-white cursor-pointer"
              >
                {actionLoading ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
