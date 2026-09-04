"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Tag, ArrowLeft, Edit, Trash2, CheckCircle2, XCircle, AlertCircle,
  Clock, DollarSign, Users, Calendar, Percent, Sparkles, ShieldAlert,
  ToggleLeft, ToggleRight, History
} from "lucide-react";
import AdminSidebar from "@/modules/admin/components/AdminSidebar";
import AdminBreadcrumbHeader from "@/modules/admin/components/AdminBreadcrumbHeader";
import {
  getCouponDetail, updateCoupon, activateCoupon, deactivateCoupon,
  deleteCoupon, getCurrentAdmin
} from "@/modules/admin/services/adminService";
import { formatErrorMessage } from "@/shared/utils/errorUtils";

export default function AdminCouponDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [adminProfile, setAdminProfile] = useState(null);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    maxDiscountAmount: "",
    minimumOrderValue: "",
    startsAt: "",
    expiresAt: "",
    usageLimit: "",
    perUserLimit: "",
    active: true
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [admin, cpn] = await Promise.all([
        getCurrentAdmin(),
        getCouponDetail(id)
      ]);
      setAdminProfile(admin);
      setCoupon(cpn);
      setEditForm({
        description: cpn.description || "",
        discountType: cpn.discountType,
        discountValue: cpn.discountValue?.toString() || "",
        maxDiscountAmount: cpn.maxDiscountAmount?.toString() || "",
        minimumOrderValue: cpn.minimumOrderValue?.toString() || "",
        startsAt: cpn.startsAt ? cpn.startsAt.substring(0, 16) : "",
        expiresAt: cpn.expiresAt ? cpn.expiresAt.substring(0, 16) : "",
        usageLimit: cpn.usageLimit?.toString() || "",
        perUserLimit: cpn.perUserLimit?.toString() || "",
        active: cpn.active
      });
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push("/admin/login");
      } else {
        setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to load coupon dossier.") });
      }
    } finally {
      setLoading(false);
    }
  };

  const isSuper = adminProfile?.role === "SUPER_ADMIN";
  const permissions = new Set(adminProfile?.permissions || []);
  const can = (perm) => isSuper || permissions.has(perm);

  const handleToggleActive = async () => {
    try {
      if (coupon.active) {
        await deactivateCoupon(coupon.id);
        setFeedback({ type: "success", message: `Coupon '${coupon.code}' deactivated.` });
      } else {
        await activateCoupon(coupon.id);
        setFeedback({ type: "success", message: `Coupon '${coupon.code}' activated.` });
      }
      loadData();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to update status.") });
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm(
      `Are you sure you want to decommission or delete coupon '${coupon.code}'? If redemptions exist, it will be safely deactivated to preserve accounting history.`
    );
    if (!confirm) return;

    try {
      const res = await deleteCoupon(coupon.id);
      if (res.action === "DELETED") {
        router.push("/admin/coupons");
      } else {
        setFeedback({ type: "success", message: res.message });
        loadData();
      }
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Delete operation failed.") });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      const payload = {
        description: editForm.description.trim() || undefined,
        discountType: editForm.discountType,
        discountValue: editForm.discountValue ? parseFloat(editForm.discountValue) : undefined,
        maxDiscountAmount: editForm.maxDiscountAmount ? parseFloat(editForm.maxDiscountAmount) : undefined,
        minimumOrderValue: editForm.minimumOrderValue ? parseFloat(editForm.minimumOrderValue) : undefined,
        startsAt: editForm.startsAt ? `${editForm.startsAt}:00` : undefined,
        expiresAt: editForm.expiresAt ? `${editForm.expiresAt}:00` : undefined,
        usageLimit: editForm.usageLimit ? parseInt(editForm.usageLimit, 10) : undefined,
        perUserLimit: editForm.perUserLimit ? parseInt(editForm.perUserLimit, 10) : undefined,
        active: editForm.active,
        version: coupon.version
      };

      const updated = await updateCoupon(id, payload);
      setCoupon(updated);
      setShowEditModal(false);
      setFeedback({ type: "success", message: "Coupon configuration updated." });
      loadData();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Update rejected.") });
    } finally {
      setEditSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-emerald-50 text-emerald-800 border-emerald-300 flex items-center gap-1"><CheckCircle2 size={10} /> ACTIVE</span>;
      case "EXPIRED":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-slate-100 text-slate-700 border-slate-300 flex items-center gap-1"><Clock size={10} /> EXPIRED</span>;
      case "DISABLED":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-rose-50 text-rose-800 border-rose-300 flex items-center gap-1"><XCircle size={10} /> DISABLED</span>;
      case "SCHEDULED":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-blue-50 text-blue-800 border-blue-300 flex items-center gap-1"><Sparkles size={10} /> SCHEDULED</span>;
      case "DEPLETED":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-amber-50 text-amber-900 border-amber-300 flex items-center gap-1"><AlertCircle size={10} /> DEPLETED</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-gray-50 text-gray-700 border-gray-300">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F5EFEB] text-[#183B56] items-center justify-center font-sans">
        <span className="text-xs font-bold uppercase tracking-widest">Loading Commercial Dossier...</span>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="flex h-screen bg-[#F5EFEB] text-[#183B56] items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <p className="text-sm font-bold">Coupon not found.</p>
          <Link href="/admin/coupons" className="text-xs text-blue-600 underline">Return to Coupons</Link>
        </div>
      </div>
    );
  }

  const usageStats = coupon.usage || {};

  return (
    <div className="flex h-screen bg-[#F5EFEB] font-sans antialiased text-[#183B56] overflow-hidden">
      <AdminSidebar activeTab="coupons" />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminBreadcrumbHeader
          breadcrumbs={[
            { label: "Control Plane", href: "/admin/dashboard" },
            { label: "Commercial Coupons", href: "/admin/coupons" },
            { label: coupon.code }
          ]}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#183B56]/20 bg-white p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/admin/coupons"
                  className="text-xs font-semibold text-[#5A7184] hover:text-[#183B56] flex items-center gap-1"
                >
                  <ArrowLeft size={12} />
                  <span>Coupons Registry</span>
                </Link>
                <span className="text-[#5A7184]">/</span>
                {getStatusBadge(coupon.status)}
              </div>
              <h1 className="text-2xl font-mono font-bold tracking-wider text-[#183B56]">
                {coupon.code}
              </h1>
              <p className="text-xs text-[#5A7184] mt-0.5">
                {coupon.description || "Commercial Promotional Incentive"} • Concurrency Version: v{coupon.version || 1}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {can("coupons.update") && (
                <button
                  onClick={handleToggleActive}
                  className={`px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                    coupon.active
                      ? "border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                      : "border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                  }`}
                >
                  {coupon.active ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                  <span>{coupon.active ? "Deactivate Code" : "Activate Code"}</span>
                </button>
              )}

              {can("coupons.update") && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-3.5 py-1.5 border border-[#183B56]/30 bg-white text-[#183B56] text-xs font-semibold hover:bg-[#F5EFEB] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Edit size={13} />
                  <span>Edit Configuration</span>
                </button>
              )}

              {can("coupons.delete") && (
                <button
                  onClick={handleDelete}
                  className="px-3.5 py-1.5 border border-rose-300 bg-rose-50 text-rose-800 text-xs font-semibold hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Trash2 size={13} />
                  <span>Decommission / Delete</span>
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
              <button onClick={() => setFeedback({ type: "", message: "" })} className="text-gray-500 hover:text-black font-bold ml-4">✕</button>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Rules Dossier & Redemptions Ledger */}
            <div className="lg:col-span-2 space-y-6">
              {/* Commercial Rules */}
              <div className="bg-white border border-[#183B56]/20 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#183B56]/15 pb-3">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-[#183B56]" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#183B56]">Commercial Incentive Configuration</h2>
                  </div>
                  <span className="text-[10px] font-mono text-[#5A7184]">Created: {new Date(coupon.createdAt).toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="block font-bold text-[#5A7184] text-[10px] uppercase">Discount Model</span>
                    <span className="font-semibold text-[#183B56]">{coupon.discountType}</span>
                  </div>

                  <div>
                    <span className="block font-bold text-[#5A7184] text-[10px] uppercase">Discount Value</span>
                    <span className="font-mono font-bold text-[#183B56] text-base">
                      {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `$${Number(coupon.discountValue).toFixed(2)}`}
                    </span>
                  </div>

                  <div>
                    <span className="block font-bold text-[#5A7184] text-[10px] uppercase">Max Discount Cap</span>
                    <span className="font-mono font-semibold text-[#183B56]">
                      {coupon.maxDiscountAmount ? `$${Number(coupon.maxDiscountAmount).toFixed(2)}` : "No Cap"}
                    </span>
                  </div>

                  <div>
                    <span className="block font-bold text-[#5A7184] text-[10px] uppercase">Min Order Subtotal</span>
                    <span className="font-mono font-semibold text-[#183B56]">
                      {Number(coupon.minimumOrderValue) > 0 ? `$${Number(coupon.minimumOrderValue).toFixed(2)}` : "No Minimum"}
                    </span>
                  </div>

                  <div>
                    <span className="block font-bold text-[#5A7184] text-[10px] uppercase">Valid From</span>
                    <span className="font-mono text-[11px] text-[#5A7184]">
                      {coupon.startsAt ? new Date(coupon.startsAt).toLocaleString() : "Immediate"}
                    </span>
                  </div>

                  <div>
                    <span className="block font-bold text-[#5A7184] text-[10px] uppercase">Valid Until (Expiry)</span>
                    <span className="font-mono text-[11px] text-[#5A7184]">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleString() : "No Expiration"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Redemptions Ledger */}
              <div className="bg-white border border-[#183B56]/20 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#183B56]/15 pb-3">
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-[#183B56]" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#183B56]">
                      Recent Redemptions ({usageStats.recentRedemptions?.length || 0})
                    </h2>
                  </div>
                  <span className="text-[10px] text-[#5A7184] font-mono">Top 10 Recent Checkouts</span>
                </div>

                {usageStats.recentRedemptions?.length === 0 ? (
                  <p className="text-xs text-[#5A7184] py-6 text-center italic">
                    No customer has redeemed this promotion code yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#183B56]/15 bg-[#F5EFEB]/30 text-[10px] font-bold text-[#5A7184] uppercase">
                          <th className="py-2.5 px-3">Customer Email</th>
                          <th className="py-2.5 px-3">Order ID</th>
                          <th className="py-2.5 px-3 text-right">Discount Applied</th>
                          <th className="py-2.5 px-3 text-right">Redeemed At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#183B56]/10 font-mono text-[11px]">
                        {usageStats.recentRedemptions?.map((r) => (
                          <tr key={r.id} className="hover:bg-[#F5EFEB]/20">
                            <td className="py-2.5 px-3 text-[#183B56] font-sans font-medium">
                              {r.customerEmail}
                            </td>
                            <td className="py-2.5 px-3 text-[#5A7184]">
                              {r.orderId ? (
                                <Link href={`/admin/orders/${r.orderId}`} className="text-blue-600 underline">
                                  {r.orderId.substring(0, 8)}...
                                </Link>
                              ) : (
                                "Checkout"
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                              -${Number(r.discountAmount).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-[#5A7184]">
                              {new Date(r.redeemedAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Usage Analytics Card */}
            <div className="space-y-6">
              <div className="bg-white border border-[#183B56]/20 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-[#183B56]/15 pb-3">
                  <DollarSign size={16} className="text-[#183B56]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#183B56]">Commercial Performance</h2>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#5A7184]">Total Redemptions</span>
                    <span className="font-mono font-bold text-base text-[#183B56]">{usageStats.totalRedemptions || 0}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#5A7184]">Unique Customers</span>
                    <span className="font-mono font-bold text-[#183B56]">{usageStats.uniqueUsers || 0}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#5A7184]">Total Discount Given</span>
                    <span className="font-mono font-bold text-emerald-800">
                      ${Number(usageStats.totalDiscountGiven || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t border-[#183B56]/10 pt-3 space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#5A7184]">Usage Allowance Progress</span>
                      <span className="font-mono font-bold text-[#183B56]">
                        {coupon.usageLimit ? `${coupon.usedCount} / ${coupon.usageLimit}` : `${coupon.usedCount} (Unlimited)`}
                      </span>
                    </div>

                    {coupon.usageLimit && (
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            usageStats.usagePercentage >= 100 ? "bg-rose-500" : "bg-[#183B56]"
                          }`}
                          style={{ width: `${Math.min(100, usageStats.usagePercentage || 0)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#183B56]/10 pt-2 text-[10px] text-[#5A7184] space-y-1">
                    <div className="flex justify-between">
                      <span>Per-User Limit:</span>
                      <span className="font-bold">{coupon.perUserLimit || "Unlimited"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Allowance:</span>
                      <span className="font-bold">{usageStats.remainingUsage !== null ? usageStats.remainingUsage : "Unlimited"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#183B56] w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#183B56]/15 pb-3">
              <h3 className="text-base font-bold text-[#183B56]">Edit Promotion Code: {coupon.code}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-black font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">
                    Discount Type
                  </label>
                  <select
                    value={editForm.discountType}
                    onChange={(e) => setEditForm({ ...editForm, discountType: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                  >
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    <option value="FLAT">FLAT FIXED AMOUNT ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={editForm.discountValue}
                    onChange={(e) => setEditForm({ ...editForm, discountValue: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">
                    Max Cap ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.00"
                    value={editForm.maxDiscountAmount}
                    onChange={(e) => setEditForm({ ...editForm, maxDiscountAmount: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">
                    Min Order Subtotal ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.00"
                    value={editForm.minimumOrderValue}
                    onChange={(e) => setEditForm({ ...editForm, minimumOrderValue: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">
                    Valid From
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.startsAt}
                    onChange={(e) => setEditForm({ ...editForm, startsAt: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">
                    Expires At
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.expiresAt}
                    onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">
                    Global Usage Limit
                  </label>
                  <input
                    type="number"
                    min={coupon.usedCount || 1}
                    value={editForm.usageLimit}
                    onChange={(e) => setEditForm({ ...editForm, usageLimit: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white font-mono"
                  />
                  <span className="text-[10px] text-[#5A7184] block mt-0.5">Current used: {coupon.usedCount}</span>
                </div>

                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">
                    Per-User Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.perUserLimit}
                    onChange={(e) => setEditForm({ ...editForm, perUserLimit: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editActive"
                  checked={editForm.active}
                  onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                  className="rounded text-[#183B56]"
                />
                <label htmlFor="editActive" className="text-xs font-semibold text-[#183B56]">
                  Active promotion status
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#183B56]/15">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-[#183B56]/20 bg-white text-[#5A7184]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-4 py-2 bg-[#183B56] text-white font-bold disabled:opacity-50"
                >
                  {editSubmitting ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
