"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Tag, Plus, Search, Download, Filter, ChevronLeft, ChevronRight,
  Eye, CheckCircle2, XCircle, AlertCircle, Clock, Percent, DollarSign,
  ToggleLeft, ToggleRight, Sparkles
} from "lucide-react";
import AdminSidebar from "@/modules/admin/components/AdminSidebar";
import AdminBreadcrumbHeader from "@/modules/admin/components/AdminBreadcrumbHeader";
import {
  getCoupons, createCoupon, activateCoupon, deactivateCoupon,
  exportCoupons, getCurrentAdmin
} from "@/modules/admin/services/adminService";
import { formatErrorMessage } from "@/shared/utils/errorUtils";

export default function AdminCouponsPage() {
  const router = useRouter();

  const [coupons, setCoupons] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(25);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [adminProfile, setAdminProfile] = useState(null);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    maxDiscountAmount: "",
    minimumOrderValue: "0.00",
    startsAt: "",
    expiresAt: "",
    usageLimit: "",
    perUserLimit: "1",
    active: true
  });

  useEffect(() => {
    fetchCoupons();
  }, [currentPage]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const admin = await getCurrentAdmin();
      setAdminProfile(admin);

      const params = {
        page: currentPage,
        size: pageSize,
        search: search || undefined,
        status: statusFilter || undefined,
        discountType: discountType || undefined,
        dateFrom: dateFrom ? `${dateFrom}T00:00:00` : undefined,
        dateTo: dateTo ? `${dateTo}T23:59:59` : undefined
      };
      const res = await getCoupons(params);
      setCoupons(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push("/admin/login");
      } else {
        setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to load coupon registry.") });
      }
    } finally {
      setLoading(false);
    }
  };

  const isSuper = adminProfile?.role === "SUPER_ADMIN";
  const permissions = new Set(adminProfile?.permissions || []);
  const can = (perm) => isSuper || permissions.has(perm);

  const handleApplyFilters = () => {
    setCurrentPage(0);
    fetchCoupons();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setDiscountType("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(0);
  };

  const handleToggleActive = async (coupon) => {
    try {
      if (coupon.active) {
        await deactivateCoupon(coupon.id);
        setFeedback({ type: "success", message: `Coupon '${coupon.code}' deactivated.` });
      } else {
        await activateCoupon(coupon.id);
        setFeedback({ type: "success", message: `Coupon '${coupon.code}' activated.` });
      }
      fetchCoupons();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to update status.") });
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateSubmitting(true);
    try {
      const payload = {
        code: createForm.code.trim().toUpperCase(),
        description: createForm.description.trim() || undefined,
        discountType: createForm.discountType,
        discountValue: parseFloat(createForm.discountValue),
        maxDiscountAmount: createForm.maxDiscountAmount ? parseFloat(createForm.maxDiscountAmount) : undefined,
        minimumOrderValue: createForm.minimumOrderValue ? parseFloat(createForm.minimumOrderValue) : undefined,
        startsAt: createForm.startsAt ? `${createForm.startsAt}:00` : undefined,
        expiresAt: createForm.expiresAt ? `${createForm.expiresAt}:00` : undefined,
        usageLimit: createForm.usageLimit ? parseInt(createForm.usageLimit, 10) : undefined,
        perUserLimit: createForm.perUserLimit ? parseInt(createForm.perUserLimit, 10) : undefined,
        active: createForm.active
      };

      await createCoupon(payload);
      setShowCreateModal(false);
      setFeedback({ type: "success", message: `Promotion code '${payload.code}' issued successfully.` });
      setCreateForm({
        code: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        maxDiscountAmount: "",
        minimumOrderValue: "0.00",
        startsAt: "",
        expiresAt: "",
        usageLimit: "",
        perUserLimit: "1",
        active: true
      });
      fetchCoupons();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to issue promotion code.") });
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        search: search || undefined,
        status: statusFilter || undefined,
        discountType: discountType || undefined,
        dateFrom: dateFrom ? `${dateFrom}T00:00:00` : undefined,
        dateTo: dateTo ? `${dateTo}T23:59:59` : undefined
      };
      const blob = await exportCoupons(params);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `weavly-coupons-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setFeedback({ type: "success", message: "Coupons exported successfully." });
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Export failed.") });
    } finally {
      setExporting(false);
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

  return (
    <div className="flex h-screen bg-[#F5EFEB] font-sans antialiased text-[#183B56] overflow-hidden">
      <AdminSidebar activeTab="coupons" />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminBreadcrumbHeader
          breadcrumbs={[{ label: "Control Plane", href: "/admin/dashboard" }, { label: "Commercial Coupons" }]}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#183B56]/20 bg-white p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono tracking-widest uppercase bg-[#183B56] text-white px-2 py-0.5 font-bold">
                  COMMERCIAL PROMOTIONS DESK
                </span>
                <span className="text-xs font-semibold text-[#5A7184]">Pricing Rules & Discount Governance</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#183B56]">
                Commercial Coupons & Promotions
              </h1>
              <p className="text-xs text-[#5A7184] mt-1 max-w-2xl">
                Server-authoritative promotion engine: configure percentage or flat incentives, enforce usage ceilings, maintain immutable accounting integrity, and govern promotional lifecycle.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 border border-[#183B56]/30 bg-white text-[#183B56] text-xs font-semibold hover:bg-[#F5EFEB] flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Download size={14} className={exporting ? "animate-bounce" : ""} />
                <span>{exporting ? "Exporting..." : "Export CSV"}</span>
              </button>

              {can("coupons.create") && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-[#183B56] text-white text-xs font-semibold hover:bg-[#102A43] flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus size={14} />
                  <span>Issue Promotion Code</span>
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

          {/* Filters Toolbar */}
          <div className="bg-white border border-[#183B56]/20 p-4 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
              <div className="lg:col-span-2">
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Search Codes / Names</label>
                <input
                  type="text"
                  placeholder="Code (e.g. SAVE20, WELCOME50), description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-[#F5EFEB]/30 text-[#183B56] focus:outline-none focus:border-[#183B56]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Promotion Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-white text-[#183B56] focus:outline-none focus:border-[#183B56]"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="DEPLETED">DEPLETED</option>
                  <option value="DISABLED">DISABLED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-white text-[#183B56] focus:outline-none focus:border-[#183B56]"
                >
                  <option value="">All Types</option>
                  <option value="PERCENTAGE">PERCENTAGE (%)</option>
                  <option value="FLAT">FLAT AMOUNT ($)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Date Created</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-white text-[#183B56]"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 py-1.5 text-xs bg-[#183B56] text-white font-semibold hover:bg-[#102A43] border border-[#183B56] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Filter size={12} />
                  <span>Filter</span>
                </button>
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 text-xs border border-[#183B56]/20 bg-white hover:bg-[#F5EFEB] text-[#5A7184] cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Coupons Registry Table */}
          <div className="bg-white border border-[#183B56]/20 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#183B56]/20 bg-[#F5EFEB]/50 text-[11px] font-semibold text-[#5A7184] uppercase">
                    <th className="py-3 px-4">Coupon Code</th>
                    <th className="py-3 px-4">Incentive</th>
                    <th className="py-3 px-4">Min. Order</th>
                    <th className="py-3 px-4">Redemptions</th>
                    <th className="py-3 px-4">Validity Period</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#183B56]/10">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#5A7184]">
                        Querying commercial promotions ledger...
                      </td>
                    </tr>
                  ) : coupons.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#5A7184]">
                        No coupons found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    coupons.map((c) => {
                      const usagePercent = c.usageLimit ? Math.min(100, Math.round((c.usedCount / c.usageLimit) * 100)) : null;
                      return (
                        <tr key={c.id} className="hover:bg-[#F5EFEB]/20 transition-colors">
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-mono font-bold text-sm tracking-wider text-[#183B56] block">
                                {c.code}
                              </span>
                              {c.description && (
                                <span className="text-[10px] text-[#5A7184] truncate block max-w-xs">{c.description}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#183B56]">
                              {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `$${Number(c.discountValue).toFixed(2)}`}
                            </span>
                            {c.maxDiscountAmount && (
                              <span className="text-[10px] text-[#5A7184] block font-mono">
                                Cap: ${Number(c.maxDiscountAmount).toFixed(2)}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-[#5A7184]">
                            {Number(c.minimumOrderValue) > 0 ? `$${Number(c.minimumOrderValue).toFixed(2)}` : "None"}
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <span className="font-mono font-bold text-xs text-[#183B56]">
                                {c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : "used"}
                              </span>
                              {usagePercent !== null && (
                                <div className="w-24 bg-gray-200 h-1 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${usagePercent >= 100 ? "bg-rose-500" : "bg-[#183B56]"}`}
                                    style={{ width: `${usagePercent}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[10px] text-[#5A7184]">
                            <div>
                              <span>From: {c.startsAt ? new Date(c.startsAt).toLocaleDateString() : "Immediate"}</span>
                            </div>
                            <div>
                              <span>Exp: {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(c.status)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {can("coupons.update") && (
                                <button
                                  onClick={() => handleToggleActive(c)}
                                  title={c.active ? "Deactivate code" : "Activate code"}
                                  className="text-[#5A7184] hover:text-[#183B56] cursor-pointer"
                                >
                                  {c.active ? (
                                    <ToggleRight size={18} className="text-emerald-700" />
                                  ) : (
                                    <ToggleLeft size={18} className="text-gray-400" />
                                  )}
                                </button>
                              )}
                              <Link
                                href={`/admin/coupons/${c.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 border border-[#183B56]/30 bg-white hover:bg-[#F5EFEB] text-[#183B56] text-[11px] font-semibold cursor-pointer shadow-2xs"
                              >
                                <Eye size={12} />
                                <span>Inspect</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-3 border-t border-[#183B56]/15 bg-[#F5EFEB]/40 flex items-center justify-between text-xs">
              <span className="text-[#5A7184] font-medium">
                Page {currentPage + 1} of {Math.max(totalPages, 1)} ({totalElements} promotional codes)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  className="px-2.5 py-1 border border-[#183B56]/20 bg-white text-[#183B56] disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-2.5 py-1 border border-[#183B56]/20 bg-white text-[#183B56] disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Create Promotion Code Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#183B56] w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#183B56]/15 pb-3">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-[#183B56]" />
                <h3 className="text-base font-bold text-[#183B56]">Issue Promotion Code</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-black font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">
                  Coupon Code (Normalized Uppercase) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER2026, LUXE20, WELCOME50"
                  value={createForm.code}
                  onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white font-mono font-bold tracking-wider uppercase"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">
                  Commercial Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Summer luxury collection 20% discount"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={createForm.discountType}
                    onChange={(e) => setCreateForm({ ...createForm, discountType: e.target.value })}
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
                    max={createForm.discountType === "PERCENTAGE" ? "100" : undefined}
                    placeholder={createForm.discountType === "PERCENTAGE" ? "20" : "50.00"}
                    value={createForm.discountValue}
                    onChange={(e) => setCreateForm({ ...createForm, discountValue: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">
                    Max Discount Cap ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.00"
                    placeholder="e.g. 100.00 (optional cap)"
                    value={createForm.maxDiscountAmount}
                    onChange={(e) => setCreateForm({ ...createForm, maxDiscountAmount: e.target.value })}
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
                    placeholder="e.g. 150.00"
                    value={createForm.minimumOrderValue}
                    onChange={(e) => setCreateForm({ ...createForm, minimumOrderValue: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">
                    Valid From (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={createForm.startsAt}
                    onChange={(e) => setCreateForm({ ...createForm, startsAt: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">
                    Expires At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={createForm.expiresAt}
                    onChange={(e) => setCreateForm({ ...createForm, expiresAt: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">
                    Global Usage Limit (Ceiling)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 500 (unlimited if blank)"
                    value={createForm.usageLimit}
                    onChange={(e) => setCreateForm({ ...createForm, usageLimit: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">
                    Per-User Redemption Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={createForm.perUserLimit}
                    onChange={(e) => setCreateForm({ ...createForm, perUserLimit: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="createActive"
                  checked={createForm.active}
                  onChange={(e) => setCreateForm({ ...createForm, active: e.target.checked })}
                  className="rounded text-[#183B56]"
                />
                <label htmlFor="createActive" className="text-xs font-semibold text-[#183B56]">
                  Activate code immediately upon issuance
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#183B56]/15">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#183B56]/20 bg-white text-[#5A7184]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-4 py-2 bg-[#183B56] text-white font-bold disabled:opacity-50"
                >
                  {createSubmitting ? "Issuing..." : "Issue Promotion Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
