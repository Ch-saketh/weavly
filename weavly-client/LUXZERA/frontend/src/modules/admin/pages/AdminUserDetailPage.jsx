"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Shield, ShieldAlert, ShieldCheck, AlertTriangle, ArrowLeft,
  Calendar, ShoppingBag, Sparkles, Image as ImageIcon, Trash2,
  RefreshCw, CheckCircle2, XCircle, KeyRound, Edit3
} from "lucide-react";
import AdminSidebar from "@/modules/admin/components/AdminSidebar";
import AdminBreadcrumbHeader from "@/modules/admin/components/AdminBreadcrumbHeader";
import {
  getUserDetail, updateUser, suspendUser, restoreUser,
  deleteUser, revokeUserSessions, getUserUploads,
  deleteUserUpload, getCurrentAdmin
} from "@/modules/admin/services/adminService";
import { formatErrorMessage } from "@/shared/utils/errorUtils";

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id;

  const [detail, setDetail] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [adminProfile, setAdminProfile] = useState(null);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", username: "" });

  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [admin, userDetail, userUploads] = await Promise.all([
        getCurrentAdmin(),
        getUserDetail(userId),
        getUserUploads(userId).catch(() => [])
      ]);
      setAdminProfile(admin);
      setDetail(userDetail);
      setUploads(userUploads || []);
      setEditForm({
        firstName: userDetail.firstName || "",
        lastName: userDetail.lastName || "",
        username: userDetail.username || ""
      });
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push("/admin/login");
      } else {
        setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to load customer dossier.") });
      }
    } finally {
      setLoading(false);
    }
  };

  const isSuper = adminProfile?.role === "SUPER_ADMIN";
  const permissions = new Set(adminProfile?.permissions || []);
  const can = (perm) => isSuper || permissions.has(perm);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateUser(userId, editForm);
      setDetail(updated);
      setShowEditModal(false);
      setFeedback({ type: "success", message: "Customer profile updated successfully." });
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Update failed.") });
    }
  };

  const handleSuspend = async (e) => {
    e.preventDefault();
    if (!suspendReason.trim()) return;
    try {
      const updated = await suspendUser(userId, suspendReason);
      setDetail(updated);
      setShowSuspendModal(false);
      setSuspendReason("");
      setFeedback({ type: "success", message: "Customer account suspended and sessions revoked." });
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Suspension failed.") });
    }
  };

  const handleRestore = async () => {
    if (!confirm("Are you sure you want to restore this customer account to ACTIVE?")) return;
    try {
      const updated = await restoreUser(userId);
      setDetail(updated);
      setFeedback({ type: "success", message: "Customer account restored to ACTIVE." });
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Restoration failed.") });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(userId);
      setShowDeleteModal(false);
      setFeedback({ type: "success", message: "Customer account deactivated and active sessions terminated." });
      loadData();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Deactivation failed.") });
    }
  };

  const handleRevokeSessions = async () => {
    if (!confirm("Terminate all active login sessions for this customer?")) return;
    try {
      await revokeUserSessions(userId);
      setFeedback({ type: "success", message: "All customer sessions terminated." });
      loadData();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Session revocation failed.") });
    }
  };

  const handleDeleteUpload = async (uploadId) => {
    if (!confirm("Permanently delete this uploaded image from the customer profile?")) return;
    try {
      await deleteUserUpload(userId, uploadId);
      setFeedback({ type: "success", message: "Uploaded asset deleted." });
      setUploads((prev) => prev.filter((u) => u.id !== uploadId));
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to delete upload.") });
    }
  };

  return (
    <div className="flex h-screen bg-[#F5EFEB] font-sans antialiased text-[#183B56] overflow-hidden">
      <AdminSidebar activeTab="users" />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminBreadcrumbHeader
          breadcrumbs={[
            { label: "Control Plane", href: "/admin/dashboard" },
            { label: "Customer Governance", href: "/admin/users" },
            { label: detail?.fullName || "Dossier" }
          ]}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#183B56]/20 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/users"
                className="p-2 border border-[#183B56]/20 bg-white hover:bg-[#F5EFEB] text-[#183B56] transition-colors"
              >
                <ArrowLeft size={16} />
              </Link>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase bg-[#183B56] text-white px-2 py-0.5 font-bold">
                    CUSTOMER DOSSIER
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                    detail?.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : detail?.status === "SUSPENDED"
                      ? "bg-amber-50 text-amber-900 border-amber-300"
                      : "bg-rose-50 text-rose-800 border-rose-300"
                  }`}>
                    {detail?.status}
                  </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#183B56]">
                  {detail?.fullName || "Customer Dossier"}
                </h1>
                <span className="text-xs font-mono text-[#5A7184]">{detail?.email}</span>
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              {can("users.update") && detail?.status !== "DELETED" && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-3 py-1.5 border border-[#183B56]/30 bg-white text-[#183B56] text-xs font-semibold hover:bg-[#F5EFEB] flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit Details</span>
                </button>
              )}

              {can("users.sessions.revoke") && (
                <button
                  onClick={handleRevokeSessions}
                  className="px-3 py-1.5 border border-[#183B56]/30 bg-white text-[#183B56] text-xs font-semibold hover:bg-[#F5EFEB] flex items-center gap-1.5 cursor-pointer"
                >
                  <KeyRound size={13} />
                  <span>Revoke Sessions ({detail?.activeSessionCount || 0})</span>
                </button>
              )}

              {can("users.suspend") && detail?.status === "ACTIVE" && (
                <button
                  onClick={() => setShowSuspendModal(true)}
                  className="px-3 py-1.5 border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldAlert size={13} />
                  <span>Suspend Account</span>
                </button>
              )}

              {can("users.restore") && detail?.status === "SUSPENDED" && (
                <button
                  onClick={handleRestore}
                  className="px-3 py-1.5 border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-semibold hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck size={13} />
                  <span>Restore to Active</span>
                </button>
              )}

              {can("users.delete") && detail?.status !== "DELETED" && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3 py-1.5 border border-rose-300 bg-rose-50 text-rose-900 text-xs font-semibold hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Deactivate Account</span>
                </button>
              )}
            </div>
          </div>

          {/* Feedback banner */}
          {feedback.message && (
            <div className={`p-4 border flex items-center justify-between text-xs font-medium ${
              feedback.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}>
              <span>{feedback.message}</span>
              <button
                onClick={() => setFeedback({ type: "", message: "" })}
                className="text-gray-500 hover:text-black font-bold ml-4"
              >
                ✕
              </button>
            </div>
          )}

          {/* Top Dossier Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Identity & Security */}
            <div className="bg-white border border-[#183B56]/20 p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-sm text-[#183B56] border-b border-[#183B56]/15 pb-2 flex items-center gap-2">
                <User size={16} />
                <span>Identity & Security</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5A7184] block">Account ID</span>
                  <span className="font-mono text-[#183B56] text-[11px]">{detail?.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5A7184] block">Username</span>
                    <span className="font-mono text-[#183B56]">@{detail?.username || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5A7184] block">Phone Number</span>
                    <span className="font-mono text-[#183B56]">{detail?.phoneNumber || "—"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5A7184] block">Role</span>
                    <span className="font-mono text-[#183B56]">{detail?.role}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5A7184] block">Active Sessions</span>
                    <span className="font-mono font-bold text-[#183B56]">{detail?.activeSessionCount}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5A7184] block">Member Since</span>
                  <span className="font-mono text-[#183B56]">{new Date(detail?.createdAt).toLocaleString()}</span>
                </div>

                {detail?.deletedAt && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-700 block">Deactivated At</span>
                    <span className="font-mono text-rose-900">{new Date(detail.deletedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Commerce Summary */}
            <div className="bg-white border border-[#183B56]/20 p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-sm text-[#183B56] border-b border-[#183B56]/15 pb-2 flex items-center gap-2">
                <ShoppingBag size={16} />
                <span>Commerce Footprint</span>
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#F5EFEB]/40 border border-[#183B56]/10">
                  <span className="text-[10px] uppercase font-bold text-[#5A7184] block">Total Orders</span>
                  <span className="text-2xl font-bold font-mono text-[#183B56]">{detail?.orderCount}</span>
                </div>

                <div className="p-3 bg-[#F5EFEB]/40 border border-[#183B56]/10">
                  <span className="text-[10px] uppercase font-bold text-[#5A7184] block">Total Spend</span>
                  <span className="text-2xl font-bold font-mono text-[#183B56]">
                    ${Number(detail?.totalSpent || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="text-xs pt-2">
                <span className="text-[10px] uppercase font-bold text-[#5A7184] block">Last Order Placed</span>
                <span className="font-mono text-[#183B56]">
                  {detail?.lastOrderDate ? new Date(detail.lastOrderDate).toLocaleString() : "No orders on record"}
                </span>
              </div>
            </div>

            {/* Column 3: Profile & Personalization */}
            <div className="bg-white border border-[#183B56]/20 p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-sm text-[#183B56] border-b border-[#183B56]/15 pb-2 flex items-center gap-2">
                <Sparkles size={16} />
                <span>Personalization Status</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5A7184] block">Onboarding Questionnaire</span>
                  {detail?.profileCompleted ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300 mt-1">
                      <CheckCircle2 size={12} />
                      <span>Completed</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-300 mt-1">
                      <AlertTriangle size={12} />
                      <span>Incomplete</span>
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5A7184] block">Bio</span>
                  <p className="text-[#5A7184] italic mt-0.5">{detail?.bio || "No biographical note provided."}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5A7184] block">Gender</span>
                  <span className="font-semibold text-[#183B56]">{detail?.gender || "Not specified"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 15-Point User Fit Data Dossier */}
          {detail?.fitData?.available && (
            <div className="bg-white border border-[#183B56]/20 p-6 shadow-sm space-y-4">
              <div className="border-b border-[#183B56]/15 pb-2 flex items-center justify-between">
                <h2 className="font-bold text-sm text-[#183B56]">
                  15-Point Fit & Wardrobe Dossier
                </h2>
                <span className="text-[10px] font-mono text-[#5A7184] uppercase">Non-Sensitive Operational Telemetry</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-[#F5EFEB]/30 border border-[#183B56]/10">
                  <span className="text-[10px] uppercase font-bold text-[#5A7184] block">Height</span>
                  <span className="font-semibold text-[#183B56]">
                    {detail.fitData.heightRange || (detail.fitData.exactHeightCm ? `${detail.fitData.exactHeightCm} cm` : "—")}
                  </span>
                </div>

                <div className="p-3 bg-[#F5EFEB]/30 border border-[#183B56]/10">
                  <span className="text-[10px] uppercase font-bold text-[#5A7184] block">Weight</span>
                  <span className="font-semibold text-[#183B56]">
                    {detail.fitData.weightRange || (detail.fitData.exactWeightKg ? `${detail.fitData.exactWeightKg} kg` : "—")}
                  </span>
                </div>

                <div className="p-3 bg-[#F5EFEB]/30 border border-[#183B56]/10">
                  <span className="text-[10px] uppercase font-bold text-[#5A7184] block">Clothing / Top Size</span>
                  <span className="font-semibold text-[#183B56]">
                    {detail.fitData.clothingSize || detail.fitData.topSize || "—"}
                  </span>
                </div>

                <div className="p-3 bg-[#F5EFEB]/30 border border-[#183B56]/10">
                  <span className="text-[10px] uppercase font-bold text-[#5A7184] block">Bottom / Shoe Size</span>
                  <span className="font-semibold text-[#183B56]">
                    {detail.fitData.bottomSize || "—"} / {detail.fitData.shoeSize || "—"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5A7184] block mb-1">Fit Preferences</span>
                  <div className="flex flex-wrap gap-1">
                    {detail.fitData.fitPreferences?.map((fp, i) => (
                      <span key={i} className="px-2 py-0.5 bg-[#F5EFEB] border border-[#183B56]/20 text-[#183B56] font-semibold text-[11px]">
                        {fp}
                      </span>
                    )) || <span className="text-[#5A7184] italic">None recorded</span>}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5A7184] block mb-1">Preferred Fashion Styles</span>
                  <div className="flex flex-wrap gap-1">
                    {detail.fitData.preferredStyles?.map((ps, i) => (
                      <span key={i} className="px-2 py-0.5 bg-[#F5EFEB] border border-[#183B56]/20 text-[#183B56] font-semibold text-[11px]">
                        {ps}
                      </span>
                    )) || <span className="text-[#5A7184] italic">None recorded</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Uploaded Media & Assets Section */}
          <div className="bg-white border border-[#183B56]/20 p-6 shadow-sm space-y-4">
            <div className="border-b border-[#183B56]/15 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-[#183B56]" />
                <h2 className="font-bold text-sm text-[#183B56]">Customer Uploaded Media ({uploads.length})</h2>
              </div>
              <span className="text-xs text-[#5A7184]">Recommendation images and profile avatars</span>
            </div>

            {uploads.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#5A7184]">
                Zero media assets uploaded by this customer.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {uploads.map((u) => (
                  <div key={u.id} className="border border-[#183B56]/20 p-2 bg-[#F5EFEB]/20 space-y-2 group relative">
                    <div className="aspect-square bg-gray-100 overflow-hidden relative border border-[#183B56]/10">
                      <img
                        src={u.imageUrl}
                        alt="Upload preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24'%3E%3Ctext x='4' y='14' font-size='8' fill='%235A7184'%3EPreview%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>

                    <div className="text-[10px] space-y-0.5">
                      <span className="font-mono font-bold block truncate">{u.type}</span>
                      <span className="text-[#5A7184] block font-mono text-[9px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {can("uploads.delete") && (
                      <button
                        onClick={() => handleDeleteUpload(u.id)}
                        className="w-full py-1 text-[10px] font-bold uppercase bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={10} />
                        <span>Delete Asset</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#183B56] w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#183B56]">Edit Customer Identity</h3>
            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">First Name</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Last Name</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#183B56]/10">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-1.5 border border-[#183B56]/20 bg-white text-[#5A7184]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#183B56] text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#183B56] w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-amber-900 flex items-center gap-2">
              <ShieldAlert size={18} />
              <span>Suspend Customer Account</span>
            </h3>
            <p className="text-xs text-[#5A7184]">
              Suspending this customer immediately revokes all active login sessions and blocks authentication.
            </p>
            <form onSubmit={handleSuspend} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Reason for Suspension (Required)</label>
                <textarea
                  rows={3}
                  placeholder="Policy violation, chargeback dispute, suspicious login..."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full p-2 border border-[#183B56]/30 bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#183B56]/10">
                <button
                  type="button"
                  onClick={() => setShowSuspendModal(false)}
                  className="px-4 py-1.5 border border-[#183B56]/20 bg-white text-[#5A7184]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-700 text-white font-bold"
                >
                  Confirm Suspension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Soft Deactivation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#183B56] w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
              <AlertTriangle size={18} />
              <span>Deactivate Customer Account</span>
            </h3>
            <p className="text-xs text-[#5A7184]">
              This action will deactivate the customer account and terminate all active sessions. The user will be marked as deactivated and will no longer be able to sign in.
            </p>
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold">
              Historical commerce records and orders are preserved for compliance and financial integrity.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#183B56]/10 text-xs">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-1.5 border border-[#183B56]/20 bg-white text-[#5A7184]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-1.5 bg-rose-800 text-white font-bold"
              >
                Confirm Deactivation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
