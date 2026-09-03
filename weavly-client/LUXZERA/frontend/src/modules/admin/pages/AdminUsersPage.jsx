"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, Search, Download, Filter, ChevronLeft, ChevronRight,
  Eye, ShieldAlert, CheckCircle2, XCircle, AlertCircle, Sparkles,
  ShoppingBag, Image as ImageIcon
} from "lucide-react";
import AdminSidebar from "@/modules/admin/components/AdminSidebar";
import AdminBreadcrumbHeader from "@/modules/admin/components/AdminBreadcrumbHeader";
import { getUsers, exportUsers, getCurrentAdmin } from "@/modules/admin/services/adminService";
import { formatErrorMessage } from "@/shared/utils/errorUtils";

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(25);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      await getCurrentAdmin();
      const params = {
        page: currentPage,
        size: pageSize,
        search: search || undefined,
        status: status || undefined,
        role: role || undefined,
        createdFrom: createdFrom ? new Date(createdFrom).toISOString() : undefined,
        createdTo: createdTo ? new Date(createdTo).toISOString() : undefined
      };
      const res = await getUsers(params);
      setUsers(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push("/admin/login");
      } else {
        setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to load customer records.") });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setCurrentPage(0);
    fetchUsers();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setRole("");
    setCreatedFrom("");
    setCreatedTo("");
    setCurrentPage(0);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        search: search || undefined,
        status: status || undefined,
        role: role || undefined,
        createdFrom: createdFrom ? new Date(createdFrom).toISOString() : undefined,
        createdTo: createdTo ? new Date(createdTo).toISOString() : undefined
      };
      const blob = await exportUsers(params);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `weavly-customers-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setFeedback({ type: "success", message: "Customer registry exported successfully." });
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to export customer records.") });
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (userStatus) => {
    switch (userStatus) {
      case "ACTIVE":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-emerald-50 text-emerald-800 border-emerald-300">ACTIVE</span>;
      case "SUSPENDED":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-amber-50 text-amber-900 border-amber-300">SUSPENDED</span>;
      case "DELETED":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-rose-50 text-rose-800 border-rose-300">DEACTIVATED</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-gray-50 text-gray-700 border-gray-300">{userStatus}</span>;
    }
  };

  return (
    <div className="flex h-screen bg-[#F5EFEB] font-sans antialiased text-[#183B56] overflow-hidden">
      <AdminSidebar activeTab="users" />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminBreadcrumbHeader
          breadcrumbs={[{ label: "Control Plane", href: "/admin/dashboard" }, { label: "Customer Governance" }]}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Top Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#183B56]/20 bg-white p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono tracking-widest uppercase bg-[#183B56] text-white px-2 py-0.5 font-bold">
                  CUSTOMER REGISTRY
                </span>
                <span className="text-xs font-semibold text-[#5A7184]">Governance & Account Operations</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#183B56]">
                Customer Administration
              </h1>
              <p className="text-xs text-[#5A7184] mt-1 max-w-2xl">
                Search, inspect account dossiers, monitor fit questionnaires, manage uploaded media, and perform compliance suspensions or safe deactivations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#183B56]/30 bg-white text-[#183B56] text-xs font-semibold hover:bg-[#F5EFEB] transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Download size={14} className={exporting ? "animate-bounce" : ""} />
                <span>{exporting ? "Exporting CSV..." : "Export Customer CSV"}</span>
              </button>
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

          {/* Filter Bar */}
          <div className="bg-white border border-[#183B56]/20 p-4 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Search Keyword</label>
                <input
                  type="text"
                  placeholder="Name, email, username..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-[#F5EFEB]/30 text-[#183B56] focus:outline-none focus:border-[#183B56]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Account Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-white text-[#183B56] focus:outline-none focus:border-[#183B56]"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="DELETED">DEACTIVATED</option>
                  <option value="INACTIVE">INACTIVE (Unverified)</option>
                  <option value="BLOCKED">BLOCKED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">From Date</label>
                <input
                  type="date"
                  value={createdFrom}
                  onChange={(e) => setCreatedFrom(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-white text-[#183B56] focus:outline-none focus:border-[#183B56]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">To Date</label>
                <input
                  type="date"
                  value={createdTo}
                  onChange={(e) => setCreatedTo(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-white text-[#183B56] focus:outline-none focus:border-[#183B56]"
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

          {/* Customers Table */}
          <div className="bg-white border border-[#183B56]/20 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#183B56]/20 bg-[#F5EFEB]/50 text-[11px] font-semibold text-[#5A7184] uppercase">
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Orders</th>
                    <th className="py-3 px-4">Fit Dossier</th>
                    <th className="py-3 px-4">Uploads</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#183B56]/10">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#5A7184]">
                        Querying customer directory...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#5A7184]">
                        No customer accounts matched your search criteria.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#F5EFEB]/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#183B56]">{u.name}</div>
                          {u.username && (
                            <span className="text-[10px] font-mono text-[#5A7184]">@{u.username}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#5A7184]">
                          {u.email}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(u.status)}
                        </td>
                        <td className="py-3 px-4 font-mono text-[10px] font-bold text-[#5A7184]">
                          {u.role}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#183B56]">
                          {u.orderCount}
                        </td>
                        <td className="py-3 px-4">
                          {u.hasProfileData ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                              <CheckCircle2 size={10} />
                              <span>Complete</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#5A7184] italic">Incomplete</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#5A7184]">
                          {u.uploadedImageCount}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#5A7184]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 border border-[#183B56]/30 bg-white hover:bg-[#F5EFEB] text-[#183B56] text-[11px] font-semibold cursor-pointer shadow-2xs"
                          >
                            <Eye size={12} />
                            <span>Inspect</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-[#183B56]/15 bg-[#F5EFEB]/40 flex items-center justify-between text-xs">
              <span className="text-[#5A7184] font-medium">
                Page {currentPage + 1} of {Math.max(totalPages, 1)} ({totalElements} customers total)
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
    </div>
  );
}
