"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert, ShieldCheck, AlertOctagon, History, Download, 
  Search, RefreshCw, Eye, User, Calendar, CheckCircle2, XCircle,
  FileText, ArrowRight, Activity, Filter, ChevronLeft, ChevronRight
} from "lucide-react";
import AdminSidebar from "@/modules/admin/components/AdminSidebar";
import AdminBreadcrumbHeader from "@/modules/admin/components/AdminBreadcrumbHeader";
import {
  getAuditSummary, getAuditLogs, getSecurityEvents, 
  getAdminActivity, exportAuditLogs, listAdmins, getCurrentAdmin
} from "@/modules/admin/services/adminService";
import { formatErrorMessage } from "@/shared/utils/errorUtils";

export default function AdminAuditPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "logs" | "security" | "activity"
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Audit Logs Tab State
  const [logs, setLogs] = useState([]);
  const [logsTotalPages, setLogsTotalPages] = useState(0);
  const [logsCurrentPage, setLogsCurrentPage] = useState(0);
  const [logsSearch, setLogsSearch] = useState("");
  const [logsAction, setLogsAction] = useState("");
  const [logsResult, setLogsResult] = useState("");
  const [logsFrom, setLogsFrom] = useState("");
  const [logsTo, setLogsTo] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Security Events Tab State
  const [secEvents, setSecEvents] = useState([]);
  const [secTotalPages, setSecTotalPages] = useState(0);
  const [secCurrentPage, setSecCurrentPage] = useState(0);
  const [secSeverity, setSecSeverity] = useState("");
  const [secSearch, setSecSearch] = useState("");
  const [secLoading, setSecLoading] = useState(false);
  const [selectedSecEvent, setSelectedSecEvent] = useState(null);

  // Activity Timeline Tab State
  const [adminList, setAdminList] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // CSV Export State
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await getCurrentAdmin();
      const [sumData, adminsData] = await Promise.all([
        getAuditSummary(),
        listAdmins().catch(() => [])
      ]);
      setSummary(sumData);
      setAdminList(adminsData || []);
      if (adminsData && adminsData.length > 0) {
        setSelectedAdminId(adminsData[0].id);
      }
    } catch (err) {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "logs") {
      fetchLogs();
    } else if (activeTab === "security") {
      fetchSecurityEvents();
    } else if (activeTab === "activity" && selectedAdminId) {
      fetchAdminActivity(selectedAdminId);
    }
  }, [activeTab, logsCurrentPage, secCurrentPage]);

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const params = {
        page: logsCurrentPage,
        size: 25,
        search: logsSearch || undefined,
        action: logsAction || undefined,
        result: logsResult || undefined,
        from: logsFrom ? new Date(logsFrom).toISOString() : undefined,
        to: logsTo ? new Date(logsTo).toISOString() : undefined
      };
      const res = await getAuditLogs(params);
      setLogs(res.content || []);
      setLogsTotalPages(res.totalPages || 0);
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to load audit logs.") });
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchSecurityEvents = async () => {
    setSecLoading(true);
    try {
      const params = {
        page: secCurrentPage,
        size: 25,
        severity: secSeverity || undefined,
        search: secSearch || undefined
      };
      const res = await getSecurityEvents(params);
      setSecEvents(res.content || []);
      setSecTotalPages(res.totalPages || 0);
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to load security telemetry.") });
    } finally {
      setSecLoading(false);
    }
  };

  const fetchAdminActivity = async (adminId) => {
    setActivityLoading(true);
    try {
      const res = await getAdminActivity(adminId, { page: 0, size: 50 });
      setActivityLogs(res.content || []);
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to load activity timeline.") });
    } finally {
      setActivityLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params = {
        action: logsAction || undefined,
        result: logsResult || undefined,
        search: logsSearch || undefined,
        from: logsFrom ? new Date(logsFrom).toISOString() : undefined,
        to: logsTo ? new Date(logsTo).toISOString() : undefined
      };
      const blob = await exportAuditLogs(params);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `weavly-audit-export-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setFeedback({ type: "success", message: "Audit logs exported successfully." });
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Export failed.") });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F5EFEB] font-sans antialiased text-[#183B56] overflow-hidden">
      <AdminSidebar activeTab="audit" />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminBreadcrumbHeader 
          breadcrumbs={[{ label: "Control Plane", href: "/admin/dashboard" }, { label: "Audit & Security Operations" }]}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#183B56]/20 bg-white p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono tracking-widest uppercase bg-[#183B56] text-white px-2 py-0.5 font-bold">
                  SECURITY OPERATIONS CENTER
                </span>
                <span className="text-xs font-semibold text-[#5A7184]">Immutable Append-Only Records</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#183B56]">
                Audit Logs & Threat Telemetry
              </h1>
              <p className="text-xs text-[#5A7184] mt-1 max-w-2xl">
                Continuous operational surveillance, administrative mutation diffs, threat event detection, and chronological staff activity audit trails.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                disabled={exporting}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#183B56]/30 bg-white text-[#183B56] text-xs font-semibold hover:bg-[#F5EFEB] transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Download size={14} className={exporting ? "animate-bounce" : ""} />
                <span>{exporting ? "Exporting CSV..." : "Export Audit CSV"}</span>
              </button>
            </div>
          </div>

          {/* Feedback alert */}
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

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-[#183B56]/20 space-x-6 text-xs font-bold uppercase tracking-wider">
            {[
              { id: "overview", label: "Overview & Intelligence" },
              { id: "logs", label: "Administrative Audit Logs" },
              { id: "security", label: "Security Threat Events" },
              { id: "activity", label: "Staff Activity Timeline" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 transition-colors cursor-pointer border-b-2 -mb-[2px] ${
                  activeTab === tab.id
                    ? "border-[#183B56] text-[#183B56]"
                    : "border-transparent text-[#5A7184] hover:text-[#183B56]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW & INTELLIGENCE */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white p-4 border border-[#183B56]/20 shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5A7184] block mb-1">
                    Total Audit Events
                  </span>
                  <span className="text-2xl font-bold font-mono text-[#183B56]">
                    {summary?.totalAuditEvents ?? "—"}
                  </span>
                </div>

                <div className="bg-white p-4 border border-[#183B56]/20 shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5A7184] block mb-1">
                    Events Today
                  </span>
                  <span className="text-2xl font-bold font-mono text-[#183B56]">
                    {summary?.eventsToday ?? "—"}
                  </span>
                </div>

                <div className="bg-white p-4 border border-[#183B56]/20 shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5A7184] block mb-1">
                    Failed Mutations
                  </span>
                  <span className="text-2xl font-bold font-mono text-rose-700">
                    {summary?.failedActions ?? "—"}
                  </span>
                </div>

                <div className="bg-white p-4 border border-[#183B56]/20 shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5A7184] block mb-1">
                    Critical Threats
                  </span>
                  <span className="text-2xl font-bold font-mono text-rose-700">
                    {summary?.criticalSecurityEvents ?? "—"}
                  </span>
                </div>

                <div className="bg-white p-4 border border-[#183B56]/20 shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5A7184] block mb-1">
                    Permission Denials
                  </span>
                  <span className="text-2xl font-bold font-mono text-amber-700">
                    {summary?.permissionDeniedEvents ?? "—"}
                  </span>
                </div>

                <div className="bg-white p-4 border border-[#183B56]/20 shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5A7184] block mb-1">
                    Active Staff
                  </span>
                  <span className="text-2xl font-bold font-mono text-emerald-700">
                    {summary?.activeAdministrators ?? "—"}
                  </span>
                </div>
              </div>

              {/* Critical Threat Events Panel */}
              <div className="bg-white border border-[#183B56]/20 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#183B56]/15 pb-3">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="text-rose-700" size={18} />
                    <h3 className="font-bold text-sm text-[#183B56]">Recent Critical Threat Detections</h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab("security")}
                    className="text-xs font-semibold text-[#183B56] hover:underline flex items-center gap-1"
                  >
                    <span>View All Telemetry</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                {(!summary?.recentCriticalEvents || summary.recentCriticalEvents.length === 0) ? (
                  <p className="text-xs text-[#5A7184] py-4 text-center">
                    Zero critical security threats detected in recent operations.
                  </p>
                ) : (
                  <div className="divide-y divide-[#183B56]/10 text-xs">
                    {summary.recentCriticalEvents.map((evt) => (
                      <div key={evt.id} className="py-3 flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-900 font-mono font-bold text-[10px] border border-rose-300">
                              CRITICAL
                            </span>
                            <span className="font-mono font-bold text-[#183B56]">
                              {evt.eventType}
                            </span>
                          </div>
                          <p className="text-[#5A7184] text-xs font-mono">{evt.details}</p>
                          <span className="text-[10px] text-[#5A7184] mt-1 block">
                            Target: <span className="font-bold">{evt.identifier}</span> | IP: {evt.ipAddress}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#5A7184] shrink-0">
                          {new Date(evt.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Audit Mutations Table */}
              <div className="bg-white border border-[#183B56]/20 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#183B56]/15 pb-3">
                  <div className="flex items-center gap-2">
                    <History className="text-[#183B56]" size={18} />
                    <h3 className="font-bold text-sm text-[#183B56]">Recent Administrative Mutations</h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab("logs")}
                    className="text-xs font-semibold text-[#183B56] hover:underline flex items-center gap-1"
                  >
                    <span>Inspect Complete Log</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#183B56]/20 bg-[#F5EFEB]/50 text-[11px] font-semibold text-[#5A7184] uppercase">
                        <th className="py-2.5 px-3">Timestamp</th>
                        <th className="py-2.5 px-3">Administrator</th>
                        <th className="py-2.5 px-3">Action</th>
                        <th className="py-2.5 px-3">Target</th>
                        <th className="py-2.5 px-3">Result</th>
                        <th className="py-2.5 px-3">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#183B56]/10">
                      {summary?.recentAuditLogs?.map((entry) => (
                        <tr key={entry.id} className="hover:bg-[#F5EFEB]/20">
                          <td className="py-2.5 px-3 font-mono text-[11px] text-[#5A7184]">
                            {new Date(entry.createdAt).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#183B56]">
                            {entry.actor?.username || "SYSTEM"}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold">
                            {entry.action}
                          </td>
                          <td className="py-2.5 px-3 text-[#5A7184]">
                            {entry.target?.type ? `${entry.target.type} #${entry.target.id}` : "—"}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase border ${
                              entry.result === "SUCCESS"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-rose-50 text-rose-800 border-rose-300"
                            }`}>
                              {entry.result}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-[#5A7184]">
                            {entry.ipAddress || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT LOGS TABLE & DIFF DRAWER */}
          {activeTab === "logs" && (
            <div className="space-y-4">
              {/* Filter Toolbar */}
              <div className="bg-white border border-[#183B56]/20 p-4 shadow-xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Search Keywords</label>
                    <input
                      type="text"
                      placeholder="Username, action, target..."
                      value={logsSearch}
                      onChange={(e) => setLogsSearch(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-[#F5EFEB]/30 text-[#183B56] focus:outline-none focus:border-[#183B56]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Action Type</label>
                    <input
                      type="text"
                      placeholder="e.g. ADMIN_ROLE_CHANGED"
                      value={logsAction}
                      onChange={(e) => setLogsAction(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-[#F5EFEB]/30 text-[#183B56] focus:outline-none focus:border-[#183B56]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Result</label>
                    <select
                      value={logsResult}
                      onChange={(e) => setLogsResult(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-white text-[#183B56] focus:outline-none focus:border-[#183B56]"
                    >
                      <option value="">All Results</option>
                      <option value="SUCCESS">SUCCESS</option>
                      <option value="FAILURE">FAILURE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">From Date</label>
                    <input
                      type="date"
                      value={logsFrom}
                      onChange={(e) => setLogsFrom(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-white text-[#183B56] focus:outline-none focus:border-[#183B56]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">To Date</label>
                    <input
                      type="date"
                      value={logsTo}
                      onChange={(e) => setLogsTo(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-white text-[#183B56] focus:outline-none focus:border-[#183B56]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#183B56]/10">
                  <button
                    onClick={() => {
                      setLogsSearch("");
                      setLogsAction("");
                      setLogsResult("");
                      setLogsFrom("");
                      setLogsTo("");
                      setLogsCurrentPage(0);
                    }}
                    className="px-3 py-1 text-xs border border-[#183B56]/20 bg-white hover:bg-[#F5EFEB] text-[#5A7184] cursor-pointer"
                  >
                    Reset Filters
                  </button>

                  <button
                    onClick={() => { setLogsCurrentPage(0); fetchLogs(); }}
                    className="px-4 py-1 text-xs bg-[#183B56] text-white font-semibold hover:bg-[#102A43] border border-[#183B56] cursor-pointer flex items-center gap-1.5"
                  >
                    <Filter size={12} />
                    <span>Apply Filter</span>
                  </button>
                </div>
              </div>

              {/* Logs Table */}
              <div className="bg-white border border-[#183B56]/20 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#183B56]/20 bg-[#F5EFEB]/50 text-[11px] font-semibold text-[#5A7184] uppercase">
                        <th className="py-3 px-4">Time (UTC)</th>
                        <th className="py-3 px-4">Administrator</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Target</th>
                        <th className="py-3 px-4">Result</th>
                        <th className="py-3 px-4">IP Address</th>
                        <th className="py-3 px-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#183B56]/10">
                      {logsLoading ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-[#5A7184]">
                            Querying append-only audit database...
                          </td>
                        </tr>
                      ) : logs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-[#5A7184]">
                            No audit records found matching your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        logs.map((entry) => (
                          <tr key={entry.id} className="hover:bg-[#F5EFEB]/20 transition-colors">
                            <td className="py-3 px-4 font-mono text-[11px] text-[#5A7184]">
                              {new Date(entry.createdAt).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-[#183B56]">
                              {entry.actor?.username || "SYSTEM"}
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold">
                              {entry.action}
                            </td>
                            <td className="py-3 px-4 text-[#5A7184]">
                              {entry.target?.type ? `${entry.target.type} #${entry.target.id}` : "—"}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase border ${
                                entry.result === "SUCCESS"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : "bg-rose-50 text-rose-800 border-rose-300"
                              }`}>
                                {entry.result}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-[#5A7184]">
                              {entry.ipAddress || "—"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setSelectedLog(entry)}
                                className="px-2.5 py-1 text-[11px] font-semibold border border-[#183B56]/30 bg-white hover:bg-[#F5EFEB] text-[#183B56] cursor-pointer inline-flex items-center gap-1"
                              >
                                <Eye size={12} />
                                <span>Inspect</span>
                              </button>
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
                    Page {logsCurrentPage + 1} of {Math.max(logsTotalPages, 1)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={logsCurrentPage === 0}
                      onClick={() => setLogsCurrentPage((p) => Math.max(0, p - 1))}
                      className="px-2.5 py-1 border border-[#183B56]/20 bg-white text-[#183B56] disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      disabled={logsCurrentPage >= logsTotalPages - 1}
                      onClick={() => setLogsCurrentPage((p) => p + 1)}
                      className="px-2.5 py-1 border border-[#183B56]/20 bg-white text-[#183B56] disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY EVENTS */}
          {activeTab === "security" && (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="bg-white border border-[#183B56]/20 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#5A7184] text-[10px] uppercase">Severity:</span>
                  <select
                    value={secSeverity}
                    onChange={(e) => { setSecSeverity(e.target.value); setSecCurrentPage(0); }}
                    className="px-3 py-1.5 border border-[#183B56]/20 bg-white text-[#183B56] focus:outline-none focus:border-[#183B56]"
                  >
                    <option value="">All Severities</option>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="WARN">WARN</option>
                    <option value="INFO">INFO</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <input
                    type="text"
                    placeholder="Search identifier or telemetry details..."
                    value={secSearch}
                    onChange={(e) => setSecSearch(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#183B56]/20 bg-[#F5EFEB]/30 text-[#183B56] focus:outline-none focus:border-[#183B56]"
                  />
                  <button
                    onClick={() => { setSecCurrentPage(0); fetchSecurityEvents(); }}
                    className="px-3 py-1.5 bg-[#183B56] text-white font-semibold hover:bg-[#102A43] border border-[#183B56] cursor-pointer"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Security Telemetry Table */}
              <div className="bg-white border border-[#183B56]/20 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#183B56]/20 bg-[#F5EFEB]/50 text-[11px] font-semibold text-[#5A7184] uppercase">
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4">Severity</th>
                        <th className="py-3 px-4">Event Classification</th>
                        <th className="py-3 px-4">Target Identifier</th>
                        <th className="py-3 px-4">Source IP</th>
                        <th className="py-3 px-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#183B56]/10">
                      {secLoading ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-[#5A7184]">
                            Querying security telemetry stream...
                          </td>
                        </tr>
                      ) : secEvents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-[#5A7184]">
                            Zero telemetry events matching your query.
                          </td>
                        </tr>
                      ) : (
                        secEvents.map((evt) => (
                          <tr key={evt.id} className="hover:bg-[#F5EFEB]/20 transition-colors">
                            <td className="py-3 px-4 font-mono text-[11px] text-[#5A7184]">
                              {new Date(evt.createdAt).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                                evt.severity === "CRITICAL"
                                  ? "bg-rose-100 text-rose-900 border-rose-300"
                                  : evt.severity === "WARN"
                                  ? "bg-amber-50 text-amber-900 border-amber-300"
                                  : "bg-[#183B56]/5 text-[#183B56] border-[#183B56]/20"
                              }`}>
                                {evt.severity}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold">
                              {evt.eventType}
                            </td>
                            <td className="py-3 px-4 font-mono text-[#5A7184]">
                              {evt.identifier}
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-[#5A7184]">
                              {evt.ipAddress || "—"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setSelectedSecEvent(evt)}
                                className="px-2.5 py-1 text-[11px] font-semibold border border-[#183B56]/30 bg-white hover:bg-[#F5EFEB] text-[#183B56] cursor-pointer"
                              >
                                Telemetry
                              </button>
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
                    Page {secCurrentPage + 1} of {Math.max(secTotalPages, 1)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={secCurrentPage === 0}
                      onClick={() => setSecCurrentPage((p) => Math.max(0, p - 1))}
                      className="px-2.5 py-1 border border-[#183B56]/20 bg-white text-[#183B56] disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      disabled={secCurrentPage >= secTotalPages - 1}
                      onClick={() => setSecCurrentPage((p) => p + 1)}
                      className="px-2.5 py-1 border border-[#183B56]/20 bg-white text-[#183B56] disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STAFF ACTIVITY TIMELINE */}
          {activeTab === "activity" && (
            <div className="space-y-6">
              {/* Staff Selector */}
              <div className="bg-white border border-[#183B56]/20 p-4 shadow-xs flex items-center gap-4 text-xs">
                <span className="font-bold text-[#5A7184] uppercase text-[10px]">Select Staff Administrator:</span>
                <select
                  value={selectedAdminId}
                  onChange={(e) => {
                    setSelectedAdminId(e.target.value);
                    fetchAdminActivity(e.target.value);
                  }}
                  className="px-3 py-1.5 border border-[#183B56]/20 bg-white text-[#183B56] font-mono focus:outline-none focus:border-[#183B56]"
                >
                  {adminList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.username} ({a.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Timeline Container */}
              <div className="bg-white border border-[#183B56]/20 shadow-sm p-6 space-y-4">
                <div className="border-b border-[#183B56]/15 pb-3 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#183B56] flex items-center gap-2">
                    <Activity size={16} />
                    <span>Chronological Audit Trail</span>
                  </h3>
                  <span className="text-xs text-[#5A7184] font-mono">
                    Showing latest 50 recorded operations
                  </span>
                </div>

                {activityLoading ? (
                  <p className="py-8 text-center text-xs text-[#5A7184]">
                    Loading activity timeline...
                  </p>
                ) : activityLogs.length === 0 ? (
                  <p className="py-8 text-center text-xs text-[#5A7184]">
                    No recorded operational actions for this administrator.
                  </p>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#183B56]/20">
                    {activityLogs.map((item) => (
                      <div key={item.id} className="relative">
                        <div className="absolute -left-6 top-1 size-2.5 bg-[#183B56] border-2 border-white shadow-xs" />
                        <div className="border border-[#183B56]/15 p-4 bg-[#F5EFEB]/20 space-y-2">
                          <div className="flex items-center justify-between gap-4">
                            <span className="font-mono font-bold text-xs text-[#183B56]">
                              {item.action}
                            </span>
                            <span className="text-[11px] font-mono text-[#5A7184]">
                              {new Date(item.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <div className="text-xs text-[#5A7184]">
                            Target: <span className="font-semibold text-[#183B56]">{item.target?.type} #{item.target?.id}</span> | Result: <span className="font-bold">{item.result}</span> | IP: <span className="font-mono">{item.ipAddress}</span>
                          </div>

                          {item.changes && item.changes !== "{}" && (
                            <pre className="p-2 bg-white border border-[#183B56]/10 text-[11px] font-mono overflow-x-auto text-[#183B56]">
                              {item.changes}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Detail Drawer / Modal for Audit Log ── */}
      {selectedLog && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#183B56] w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#183B56]/20 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase bg-[#183B56] text-white px-2 py-0.5 font-bold">
                  AUDIT LOG INSPECTION
                </span>
                <h3 className="text-base font-bold text-[#183B56] mt-1">{selectedLog.action}</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-[#5A7184] hover:text-[#183B56] font-bold text-lg">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 border border-[#183B56]/15 p-3 bg-[#F5EFEB]/30">
                <div>
                  <span className="text-[#5A7184] block text-[10px] uppercase font-bold">Actor</span>
                  <span className="font-mono font-bold text-[#183B56]">{selectedLog.actor?.username}</span>
                  <span className="text-[10px] text-[#5A7184] block">ID: {selectedLog.actor?.id}</span>
                </div>
                <div>
                  <span className="text-[#5A7184] block text-[10px] uppercase font-bold">Timestamp</span>
                  <span className="font-mono text-[#183B56]">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#5A7184] block text-[10px] uppercase font-bold">Target</span>
                  <span className="text-[#183B56] font-semibold">{selectedLog.target?.type} #{selectedLog.target?.id}</span>
                </div>
                <div>
                  <span className="text-[#5A7184] block text-[10px] uppercase font-bold">Result</span>
                  <span className="font-bold text-[#183B56]">{selectedLog.result}</span>
                </div>
                <div>
                  <span className="text-[#5A7184] block text-[10px] uppercase font-bold">Source IP</span>
                  <span className="font-mono text-[#183B56]">{selectedLog.ipAddress}</span>
                </div>
                <div>
                  <span className="text-[#5A7184] block text-[10px] uppercase font-bold">User Agent</span>
                  <span className="text-[11px] text-[#5A7184] truncate block" title={selectedLog.userAgent}>{selectedLog.userAgent}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-xs text-[#183B56] block mb-1">Before / After Mutation Diff (Secrets Redacted)</span>
                <pre className="p-3 bg-[#F5EFEB]/50 border border-[#183B56]/20 font-mono text-[11px] overflow-x-auto text-[#183B56] whitespace-pre-wrap">
                  {selectedLog.changes}
                </pre>
              </div>

              {selectedLog.failureReason && (
                <div>
                  <span className="font-bold text-xs text-rose-800 block mb-1">Failure Reason</span>
                  <p className="p-3 bg-rose-50 border border-rose-200 text-rose-900 font-mono text-xs">
                    {selectedLog.failureReason}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#183B56]/15 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 border border-[#183B56]/30 bg-white text-[#183B56] font-semibold text-xs hover:bg-[#F5EFEB] cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Drawer / Modal for Security Event ── */}
      {selectedSecEvent && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#183B56] w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#183B56]/20 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase bg-rose-900 text-white px-2 py-0.5 font-bold">
                  SECURITY TELEMETRY EVENT
                </span>
                <h3 className="text-base font-bold text-[#183B56] mt-1">{selectedSecEvent.eventType}</h3>
              </div>
              <button onClick={() => setSelectedSecEvent(null)} className="text-[#5A7184] hover:text-[#183B56] font-bold text-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 border border-[#183B56]/15 p-3 bg-[#F5EFEB]/30">
                <div>
                  <span className="text-[#5A7184] text-[10px] uppercase font-bold block">Severity</span>
                  <span className="font-bold text-rose-800 font-mono">{selectedSecEvent.severity}</span>
                </div>
                <div>
                  <span className="text-[#5A7184] text-[10px] uppercase font-bold block">Timestamp</span>
                  <span className="font-mono text-[#183B56]">{new Date(selectedSecEvent.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#5A7184] text-[10px] uppercase font-bold block">Identifier</span>
                  <span className="font-mono font-bold text-[#183B56]">{selectedSecEvent.identifier}</span>
                </div>
                <div>
                  <span className="text-[#5A7184] text-[10px] uppercase font-bold block">Source IP</span>
                  <span className="font-mono text-[#183B56]">{selectedSecEvent.ipAddress}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-xs text-[#183B56] block mb-1">Telemetry Payload</span>
                <pre className="p-3 bg-[#F5EFEB]/50 border border-[#183B56]/20 font-mono text-[11px] text-[#183B56] whitespace-pre-wrap">
                  {selectedSecEvent.details}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-[#183B56]/15 flex justify-end">
              <button
                onClick={() => setSelectedSecEvent(null)}
                className="px-4 py-2 border border-[#183B56]/30 bg-white text-[#183B56] font-semibold text-xs hover:bg-[#F5EFEB] cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
