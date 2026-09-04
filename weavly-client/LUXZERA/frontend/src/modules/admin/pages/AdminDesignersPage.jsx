"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Palette, Search, Download, Filter, ChevronLeft, ChevronRight,
  Eye, ShieldAlert, CheckCircle2, XCircle, AlertCircle, Sparkles,
  RefreshCw, Layers, ShieldCheck, MapPin, Tag
} from "lucide-react";
import AdminSidebar from "@/modules/admin/components/AdminSidebar";
import AdminBreadcrumbHeader from "@/modules/admin/components/AdminBreadcrumbHeader";
import {
  getDesigners,
  getDesignerSummary,
  exportDesigners,
  approveDesigner,
  suspendDesigner,
  getCurrentAdmin
} from "@/modules/admin/services/adminService";
import { formatErrorMessage } from "@/shared/utils/errorUtils";

export default function AdminDesignersPage() {
  const router = useRouter();

  // State
  const [designers, setDesigners] = useState([]);
  const [summary, setSummary] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(25);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");
  const [specialization, setSpecialization] = useState("");

  // Loading & Feedback
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [adminProfile, setAdminProfile] = useState(null);

  // Quick Action Modals
  const [actionTarget, setActionTarget] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadAdminProfile();
    loadSummary();
  }, []);

  useEffect(() => {
    fetchDesigners();
  }, [currentPage]);

  const loadAdminProfile = async () => {
    try {
      const profile = await getCurrentAdmin();
      setAdminProfile(profile);
    } catch {
      router.push("/admin/login");
    }
  };

  const loadSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await getDesignerSummary();
      setSummary(res);
    } catch (err) {
      console.warn("Could not load designer summary metrics:", err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchDesigners = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        search: search.trim() || undefined,
        status: status || undefined,
        location: location.trim() || undefined,
        specialization: specialization.trim() || undefined,
      };
      const res = await getDesigners(params);
      setDesigners(res?.content || []);
      setTotalPages(res?.totalPages || 0);
      setTotalElements(res?.totalElements || 0);
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push("/admin/login");
      } else {
        setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to load designer records.") });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setCurrentPage(0);
    fetchDesigners();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setLocation("");
    setSpecialization("");
    setCurrentPage(0);
    // Reload default
    setTimeout(() => fetchDesigners(), 0);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        search: search.trim() || undefined,
        status: status || undefined,
        location: location.trim() || undefined,
        specialization: specialization.trim() || undefined,
      };
      const blob = await exportDesigners(params);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `weavly-designers-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setFeedback({ type: "success", message: "Designer catalog registry exported successfully." });
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to export designer records.") });
    } finally {
      setExporting(false);
    }
  };

  const isSuper = adminProfile?.role === "SUPER_ADMIN";
  const permissions = new Set(adminProfile?.permissions || []);
  const can = (perm) => isSuper || permissions.has(perm);

  const handleConfirmApprove = async () => {
    if (!actionTarget) return;
    setActionLoading(true);
    try {
      await approveDesigner(actionTarget.id);
      setFeedback({ type: "success", message: `Designer ${actionTarget.designerId} (${actionTarget.displayName}) approved successfully.` });
      setShowApproveModal(false);
      setActionTarget(null);
      fetchDesigners();
      loadSummary();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Approval failed.") });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmSuspend = async (e) => {
    e.preventDefault();
    if (!actionTarget || !suspendReason.trim()) return;
    setActionLoading(true);
    try {
      await suspendDesigner(actionTarget.id, suspendReason);
      setFeedback({ type: "success", message: `Designer ${actionTarget.designerId} has been suspended and sessions revoked.` });
      setShowSuspendModal(false);
      setSuspendReason("");
      setActionTarget(null);
      fetchDesigners();
      loadSummary();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Suspension failed.") });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case "ACTIVE":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
            ACTIVE
          </span>
        );
      case "APPROVED":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-300">
            APPROVED
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-300">
            PENDING
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-300">
            SUSPENDED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-300">
            {st || "UNKNOWN"}
          </span>
        );
    }
  };

  return (
    <div className="flex bg-[#F5EFEB] min-h-screen text-[#183B56] font-sans antialiased">
      <AdminSidebar activeTab="designers" />

      <main className="flex-1 flex flex-col min-w-0 bg-[#F5EFEB]">
        <AdminBreadcrumbHeader
          items={[
            { label: "Control Plane", href: "/admin/dashboard" },
            { label: "Designer Governance", href: "/admin/designers" },
          ]}
        />

        <div className="p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
          {/* Header Title Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#183B56]/15 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Palette size={24} className="text-[#183B56]" />
                <h1 className="text-2xl font-bold tracking-tight text-[#183B56]">Designer Governance & Studio Control</h1>
              </div>
              <p className="text-xs text-[#5A7184] mt-1">
                Supervise registered ateliers, approve applications, monitor studio collections, and manage compliance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  fetchDesigners();
                  loadSummary();
                }}
                disabled={loading}
                className="px-3 py-1.5 border border-[#183B56]/30 hover:border-[#183B56] bg-white text-xs font-semibold text-[#183B56] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>

              {can("designers.read") && (
                <button
                  onClick={handleExport}
                  disabled={exporting || loading || totalElements === 0}
                  className="px-3.5 py-1.5 bg-[#183B56] hover:bg-[#183B56]/90 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download size={13} className={exporting ? "animate-bounce" : ""} />
                  {exporting ? "Exporting..." : "Export CSV"}
                </button>
              )}
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

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#183B56]/15 p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-[#5A7184] uppercase tracking-wider">Total Ateliers</span>
              <div className="text-2xl font-extrabold text-[#183B56] mt-2">
                {summaryLoading ? "..." : summary?.totalDesigners ?? 0}
              </div>
              <span className="text-[10px] text-[#5A7184] mt-1">
                {summaryLoading ? "..." : `${summary?.recentDesigners ?? 0} joined in last 30d`}
              </span>
            </div>

            <div className="bg-white border border-[#183B56]/15 p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Pending Review
              </span>
              <div className="text-2xl font-extrabold text-amber-900 mt-2">
                {summaryLoading ? "..." : summary?.pendingDesigners ?? 0}
              </div>
              <span className="text-[10px] text-amber-700 mt-1">Awaiting administrative approval</span>
            </div>

            <div className="bg-white border border-[#183B56]/15 p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Active & Approved
              </span>
              <div className="text-2xl font-extrabold text-emerald-900 mt-2">
                {summaryLoading ? "..." : (summary?.activeDesigners ?? 0) + (summary?.approvedDesigners ?? 0)}
              </div>
              <span className="text-[10px] text-emerald-700 mt-1">
                {summaryLoading ? "..." : `${summary?.totalPublishedDesigns ?? 0} published creations`}
              </span>
            </div>

            <div className="bg-white border border-[#183B56]/15 p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                Suspended Ateliers
              </span>
              <div className="text-2xl font-extrabold text-rose-900 mt-2">
                {summaryLoading ? "..." : summary?.suspendedDesigners ?? 0}
              </div>
              <span className="text-[10px] text-rose-700 mt-1">Compliance & policy holds</span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white border border-[#183B56]/15 p-4 flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-[#5A7184]" />
                <input
                  type="text"
                  placeholder="Search name, brand, email, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#F5EFEB]/50 border border-[#183B56]/20 text-xs text-[#183B56] placeholder-[#5A7184] focus:outline-none focus:border-[#183B56]"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#F5EFEB]/50 border border-[#183B56]/20 text-xs text-[#183B56] focus:outline-none focus:border-[#183B56]"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">PENDING (Review Queue)</option>
                <option value="APPROVED">APPROVED (Awaiting Studio)</option>
                <option value="ACTIVE">ACTIVE (Storefront)</option>
                <option value="SUSPENDED">SUSPENDED (Policy Holds)</option>
              </select>

              <input
                type="text"
                placeholder="Filter by location (e.g. Paris)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                className="w-full px-3 py-1.5 bg-[#F5EFEB]/50 border border-[#183B56]/20 text-xs text-[#183B56] placeholder-[#5A7184] focus:outline-none focus:border-[#183B56]"
              />

              <input
                type="text"
                placeholder="Specialization (e.g. Couture)"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                className="w-full px-3 py-1.5 bg-[#F5EFEB]/50 border border-[#183B56]/20 text-xs text-[#183B56] placeholder-[#5A7184] focus:outline-none focus:border-[#183B56]"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#183B56]/10 text-xs">
              <span className="text-[#5A7184]">
                Showing {designers.length} of {totalElements} designer accounts
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-1 text-[#5A7184] hover:text-[#183B56] border border-[#183B56]/20 hover:border-[#183B56] bg-transparent text-xs cursor-pointer"
                >
                  Reset Filters
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-1 bg-[#183B56] hover:bg-[#183B56]/90 text-white text-xs font-semibold cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Designer Records Table */}
          <div className="bg-white border border-[#183B56]/15 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#183B56] text-white uppercase text-[10px] tracking-wider border-b border-[#183B56]">
                    <th className="py-3 px-4 font-semibold">Designer / Atelier</th>
                    <th className="py-3 px-4 font-semibold">Contact & Verification</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Catalog Footprint</th>
                    <th className="py-3 px-4 font-semibold">Created Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#183B56]/10">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#5A7184]">
                        <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-[#183B56]" />
                        Loading designer registries...
                      </td>
                    </tr>
                  ) : designers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#5A7184]">
                        No designer records found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    designers.map((d) => (
                      <tr key={d.id} className="hover:bg-[#F5EFEB]/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {d.profileImageUrl ? (
                              <img
                                src={d.profileImageUrl}
                                alt={d.displayName}
                                className="w-8 h-8 rounded-none object-cover border border-[#183B56]/20 shrink-0 bg-stone-100"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-none bg-[#183B56]/10 border border-[#183B56]/20 flex items-center justify-center font-bold text-[#183B56] text-xs shrink-0">
                                {d.displayName ? d.displayName.charAt(0).toUpperCase() : "D"}
                              </div>
                            )}
                            <div>
                              <Link
                                href={`/admin/designers/${d.id}`}
                                className="font-bold text-[#183B56] hover:underline"
                              >
                                {d.displayName || "Untitled Designer"}
                              </Link>
                              <div className="text-[11px] text-[#5A7184] flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[10px] text-[#183B56] bg-[#F5EFEB] px-1 border border-[#183B56]/15">
                                  {d.designerId}
                                </span>
                                {d.brandName && <span>• {d.brandName}</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#5A7184]">
                          <div className="font-mono text-[11px] text-[#183B56]">{d.email}</div>
                          {d.location && (
                            <div className="text-[10px] text-[#5A7184] flex items-center gap-1 mt-0.5">
                              <MapPin size={10} />
                              {d.location}
                            </div>
                          )}
                          {d.phone && <div className="text-[10px] text-[#5A7184] mt-0.5">{d.phone}</div>}
                        </td>

                        <td className="py-3.5 px-4">
                          {getStatusBadge(d.status)}
                          {d.status === "SUSPENDED" && (
                            <div className="text-[10px] text-rose-700 font-semibold mt-1">Restricted</div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-[#5A7184]">
                          <div className="flex items-center gap-1.5 font-semibold text-[#183B56]">
                            <Layers size={12} className="text-[#183B56]/70" />
                            <span>{d.publishedDesignsCount || 0} published</span>
                          </div>
                          <div className="text-[10px] text-[#5A7184] mt-0.5">
                            {d.totalDesignsCount || 0} total designs • {d.profileViews || 0} views
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#5A7184] text-[11px]">
                          <div>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}</div>
                          {d.approvedAt && (
                            <div className="text-[10px] text-emerald-800 flex items-center gap-1 mt-0.5">
                              <CheckCircle2 size={10} />
                              Appr. {new Date(d.approvedAt).toLocaleDateString()}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/designers/${d.id}`}
                              className="px-2.5 py-1 text-xs border border-[#183B56]/30 hover:border-[#183B56] bg-white text-[#183B56] font-semibold flex items-center gap-1"
                            >
                              <Eye size={12} />
                              Dossier
                            </Link>

                            {d.status === "PENDING" && can("designers.verify") && (
                              <button
                                onClick={() => {
                                  setActionTarget(d);
                                  setShowApproveModal(true);
                                }}
                                className="px-2.5 py-1 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer flex items-center gap-1"
                              >
                                <CheckCircle2 size={12} />
                                Approve
                              </button>
                            )}

                            {d.status !== "SUSPENDED" && can("designers.suspend") && (
                              <button
                                onClick={() => {
                                  setActionTarget(d);
                                  setShowSuspendModal(true);
                                }}
                                className="px-2.5 py-1 text-xs border border-rose-300 text-rose-800 hover:bg-rose-50 font-semibold cursor-pointer"
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 border-t border-[#183B56]/15 flex items-center justify-between text-xs text-[#5A7184] bg-[#F5EFEB]/30">
              <div>
                Page {currentPage + 1} of {Math.max(1, totalPages)}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0 || loading}
                  className="px-2.5 py-1 border border-[#183B56]/20 bg-white hover:bg-[#F5EFEB] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-[#183B56] flex items-center gap-1"
                >
                  <ChevronLeft size={13} />
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1 || loading}
                  className="px-2.5 py-1 border border-[#183B56]/20 bg-white hover:bg-[#F5EFEB] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-[#183B56] flex items-center gap-1"
                >
                  Next
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Quick Approve Confirmation Modal */}
      {showApproveModal && actionTarget && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#183B56] p-6 max-w-md w-full flex flex-col gap-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-[#183B56]/15 pb-3">
              <CheckCircle2 size={18} className="text-emerald-700" />
              <h2 className="text-base font-bold text-[#183B56]">Approve Atelier Application</h2>
            </div>

            <p className="text-xs text-[#5A7184] leading-relaxed">
              Are you sure you want to approve designer{" "}
              <strong className="text-[#183B56]">{actionTarget.displayName}</strong> ({actionTarget.designerId})?
              This will transition their status to <strong className="text-emerald-700">APPROVED</strong>, permitting
              studio activation, catalog creation, and publishing privileges.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#183B56]/15">
              <button
                type="button"
                onClick={() => {
                  setShowApproveModal(false);
                  setActionTarget(null);
                }}
                disabled={actionLoading}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#5A7184] hover:text-[#183B56] border border-[#183B56]/20 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                disabled={actionLoading}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
              >
                {actionLoading ? "Approving..." : "Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Suspend Modal */}
      {showSuspendModal && actionTarget && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleConfirmSuspend}
            className="bg-white border border-rose-400 p-6 max-w-md w-full flex flex-col gap-4 shadow-xl"
          >
            <div className="flex items-center gap-2 border-b border-rose-200 pb-3">
              <ShieldAlert size={18} className="text-rose-700" />
              <h2 className="text-base font-bold text-[#183B56]">Suspend Atelier Account</h2>
            </div>

            <p className="text-xs text-[#5A7184] leading-relaxed">
              Suspending <strong className="text-[#183B56]">{actionTarget.displayName}</strong> will immediately revoke
              all active designer sessions, prevent studio logins, and hide their published catalog creations.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#183B56] mb-1">Suspension Reason *</label>
              <textarea
                required
                rows={3}
                placeholder="Specify the compliance, copyright, or quality violation..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="w-full p-2.5 bg-[#F5EFEB]/50 border border-[#183B56]/20 text-xs text-[#183B56] focus:outline-none focus:border-[#183B56]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#183B56]/15">
              <button
                type="button"
                onClick={() => {
                  setShowSuspendModal(false);
                  setActionTarget(null);
                  setSuspendReason("");
                }}
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
                {actionLoading ? "Suspending..." : "Execute Suspension"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
