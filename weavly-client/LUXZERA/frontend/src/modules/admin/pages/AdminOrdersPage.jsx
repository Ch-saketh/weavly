"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag, Search, Download, Filter, ChevronLeft, ChevronRight,
  Eye, Truck, CheckCircle2, AlertCircle, Clock, XCircle, RotateCcw
} from "lucide-react";
import AdminSidebar from "@/modules/admin/components/AdminSidebar";
import AdminBreadcrumbHeader from "@/modules/admin/components/AdminBreadcrumbHeader";
import {
  getOrders, exportOrders, getCurrentAdmin
} from "@/modules/admin/services/adminService";
import { formatErrorMessage } from "@/shared/utils/errorUtils";

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(25);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [adminProfile, setAdminProfile] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const admin = await getCurrentAdmin();
      setAdminProfile(admin);

      const params = {
        page: currentPage,
        size: pageSize,
        search: search || undefined,
        status: status || undefined,
        dateFrom: dateFrom ? `${dateFrom}T00:00:00` : undefined,
        dateTo: dateTo ? `${dateTo}T23:59:59` : undefined,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined
      };
      const res = await getOrders(params);
      setOrders(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push("/admin/login");
      } else {
        setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to load order registry.") });
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
    fetchOrders();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setMinAmount("");
    setMaxAmount("");
    setCurrentPage(0);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        search: search || undefined,
        status: status || undefined,
        dateFrom: dateFrom ? `${dateFrom}T00:00:00` : undefined,
        dateTo: dateTo ? `${dateTo}T23:59:59` : undefined,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined
      };
      const blob = await exportOrders(params);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `weavly-orders-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setFeedback({ type: "success", message: "Order records exported successfully." });
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Export failed.") });
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (orderStatus) => {
    switch (orderStatus) {
      case "DELIVERED":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-emerald-50 text-emerald-800 border-emerald-300 flex items-center gap-1"><CheckCircle2 size={10} /> DELIVERED</span>;
      case "SHIPPED":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-blue-50 text-blue-800 border-blue-300 flex items-center gap-1"><Truck size={10} /> SHIPPED</span>;
      case "PROCESSING":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-amber-50 text-amber-900 border-amber-300 flex items-center gap-1"><Clock size={10} /> PROCESSING</span>;
      case "PENDING":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-slate-50 text-slate-700 border-slate-300 flex items-center gap-1"><Clock size={10} /> PENDING</span>;
      case "CANCELLED":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-rose-50 text-rose-800 border-rose-300 flex items-center gap-1"><XCircle size={10} /> CANCELLED</span>;
      case "RETURNED":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-purple-50 text-purple-800 border-purple-300 flex items-center gap-1"><RotateCcw size={10} /> RETURNED</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-gray-50 text-gray-700 border-gray-300">{orderStatus}</span>;
    }
  };

  return (
    <div className="flex h-screen bg-[#F5EFEB] font-sans antialiased text-[#183B56] overflow-hidden">
      <AdminSidebar activeTab="orders" />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminBreadcrumbHeader
          breadcrumbs={[{ label: "Control Plane", href: "/admin/dashboard" }, { label: "Order Operations" }]}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#183B56]/20 bg-white p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono tracking-widest uppercase bg-[#183B56] text-white px-2 py-0.5 font-bold">
                  COMMERCE OPERATIONS CENTER
                </span>
                <span className="text-xs font-semibold text-[#5A7184]">Fulfillment & Logistics Command</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#183B56]">
                Order Operations
              </h1>
              <p className="text-xs text-[#5A7184] mt-1 max-w-2xl">
                Real-time commerce operations: state-machine fulfillment transitions, carrier tracking injection, historical commerce price protection, and safe cancellation management.
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
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Search Keywords</label>
                <input
                  type="text"
                  placeholder="Order # (e.g. WV-2026-...), Tracking #, Customer ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-[#F5EFEB]/30 text-[#183B56] focus:outline-none focus:border-[#183B56]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Fulfillment Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-white text-[#183B56] focus:outline-none focus:border-[#183B56]"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="RETURNED">RETURNED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-white text-[#183B56]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
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

          {/* Order Registry Table */}
          <div className="bg-white border border-[#183B56]/20 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#183B56]/20 bg-[#F5EFEB]/50 text-[11px] font-semibold text-[#5A7184] uppercase">
                    <th className="py-3 px-4">Order Number</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Logistics</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#183B56]/10">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#5A7184]">
                        Querying orders ledger...
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#5A7184]">
                        No orders matched your search criteria.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#F5EFEB]/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#183B56]">
                          {o.orderNumber || "WV-" + o.id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-semibold text-[#183B56] block">{o.customerName}</span>
                            <span className="text-[10px] text-[#5A7184]">{o.customerEmail}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#5A7184]">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-mono text-center">
                          {o.itemCount}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#183B56]">
                          ${Number(o.total).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(o.status)}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#5A7184]">
                          {o.trackingNumber ? (
                            <div>
                              <span className="font-bold text-[#183B56] block">{o.carrier || "Courier"}</span>
                              <span className="font-mono text-[10px] text-blue-800">{o.trackingNumber}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/admin/orders/${o.id}`}
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

            {/* Pagination */}
            <div className="p-3 border-t border-[#183B56]/15 bg-[#F5EFEB]/40 flex items-center justify-between text-xs">
              <span className="text-[#5A7184] font-medium">
                Page {currentPage + 1} of {Math.max(totalPages, 1)} ({totalElements} orders)
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
