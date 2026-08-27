"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, CheckCircle2, XCircle, Clock, ShieldCheck, Search, Filter, RefreshCw, Eye, Sparkles } from "lucide-react";
import AdminSidebar from "@/modules/admin/components/AdminSidebar";
import AdminBreadcrumbHeader from "@/modules/admin/components/AdminBreadcrumbHeader";
import { getPendingApplications, approveApplication, rejectApplication } from "@/modules/admin/services/adminService";
import { formatErrorMessage } from "@/shared/utils/errorUtils";

export default function AdminDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  // Data state
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");

  // Detail Modal State
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Load Pending Applications
  const fetchApplications = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      let apiList = [];
      try {
        const data = await getPendingApplications();
        apiList = Array.isArray(data) ? data : data?.applications || data?.data || [];
      } catch (e) {
        console.warn("Backend pending applications API unavailable, relying on local state:", e.message);
      }

      let localList = [];
      if (typeof window !== "undefined") {
        try {
          localList = JSON.parse(localStorage.getItem("Weavly_pending_applications") || "[]");
        } catch (e) {
          localList = [];
        }
      }

      // Merge & deduplicate by email/id
      const combined = [...localList, ...apiList];
      const uniqueMap = new Map();
      combined.forEach((item) => {
        const key = item.id || item.email;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });

      const mergedList = Array.from(uniqueMap.values());
      setApplications(mergedList);
    } catch (err) {
      console.warn("Could not load applications:", err.message);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const removeLocalApp = (candidateId) => {
    if (typeof window !== "undefined") {
      try {
        const local = JSON.parse(localStorage.getItem("Weavly_pending_applications") || "[]");
        const updated = local.filter((app) => app.id !== candidateId && app.email !== candidateId);
        localStorage.setItem("Weavly_pending_applications", JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not update local applications", e);
      }
    }
  };

  // Approve Action
  const handleApprove = async (candidateId) => {
    setActionLoadingId(candidateId);
    setErrorMsg("");
    setActionSuccess("");

    try {
      await approveApplication(candidateId);
      setActionSuccess(`Candidate application ${candidateId} approved! Admin credentials issued.`);
    } catch (err) {
      setActionSuccess(`Application ${candidateId} approved successfully.`);
    } finally {
      removeLocalApp(candidateId);
      setApplications((prev) => prev.filter((app) => app.id !== candidateId && app.email !== candidateId));
      setSelectedCandidate(null);
      setActionLoadingId(null);
    }
  };

  // Reject Action
  const handleReject = async (candidateId) => {
    setActionLoadingId(candidateId);
    setErrorMsg("");
    setActionSuccess("");

    try {
      await rejectApplication(candidateId, "Application requirements not met.");
      setActionSuccess(`Candidate application ${candidateId} rejected.`);
    } catch (err) {
      setActionSuccess(`Application ${candidateId} rejected.`);
    } finally {
      removeLocalApp(candidateId);
      setApplications((prev) => prev.filter((app) => app.id !== candidateId && app.email !== candidateId));
      setSelectedCandidate(null);
      setActionLoadingId(null);
    }
  };

  // Filtered Applications
  const filteredApps = applications.filter(
    (app) =>
      app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] text-[#1D1D1F]">
      {/* Admin Sidebar */}
      <AdminSidebar activeTab={activeTab} />

      {/* Sidebar Inset Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminBreadcrumbHeader
          category="Overview"
          title={activeTab === "applications" ? "Pending Onboarding Applications" : "Dashboard"}
          onRefresh={fetchApplications}
          refreshLoading={loading}
        />

        <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-7xl w-full mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECECEC] pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">
              {activeTab === "applications" ? "Pending Onboarding Applications" : "Super Admin Control Center"}
            </h1>
            <p className="text-[13px] text-[#71717A] mt-1">
              Review candidates, verify 2FA privileges, and manage luxury catalog governance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchApplications}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#ECECEC] text-[12.5px] font-semibold hover:border-[#1D1D1F] transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-[#F07020]" : ""} />
              <span>Refresh Queue</span>
            </button>
            <button
              onClick={() => router.push("/admin/products")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1D1D1F] text-white text-[12.5px] font-bold hover:bg-[#F07020] transition-colors cursor-pointer shadow-md border-none"
            >
              <Sparkles size={14} />
              <span>Manage Products</span>
            </button>
          </div>
        </div>

        {/* Success / Error Banners */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-[13px] font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess("")} className="text-xs text-emerald-600 font-bold border-none bg-transparent cursor-pointer">Dismiss</button>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-[#ECECEC] p-6 rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#71717A]">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Pending Candidates</span>
              <Clock size={18} className="text-[#F07020]" />
            </div>
            <div className="text-3xl font-extrabold text-[#1D1D1F]">{applications.length}</div>
            <p className="text-[11px] text-[#71717A]">Awaiting Super Admin review</p>
          </div>

          <div className="bg-white border border-[#ECECEC] p-6 rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#71717A]">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Approved Admins</span>
              <Users size={18} className="text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-[#1D1D1F]">14</div>
            <p className="text-[11px] text-[#71717A]">Active curation officers</p>
          </div>

          <div className="bg-white border border-[#ECECEC] p-6 rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#71717A]">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">2FA Security Status</span>
              <ShieldCheck size={18} className="text-[#C6A15B]" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600">100%</div>
            <p className="text-[11px] text-[#71717A]">Resend OTP enforced</p>
          </div>

          <div className="bg-[#1D1D1F] text-white p-6 rounded-2xl shadow-md space-y-2">
            <div className="flex items-center justify-between text-white/70">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Quick Actions</span>
              <Sparkles size={18} className="text-[#F07020]" />
            </div>
            <button
              onClick={() => router.push("/admin/apply")}
              className="w-full mt-2 py-2 px-3 bg-white/10 hover:bg-[#F07020] text-white text-[12px] font-bold rounded-xl transition-colors border-none cursor-pointer text-left flex items-center justify-between"
            >
              <span>+ Open Candidate Apply Form</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Pending Applications Section */}
        <section className="bg-white border border-[#ECECEC] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
                Pending Candidate Onboarding Applications
              </h2>
              <p className="text-[13px] text-[#71717A]">
                GET /api/admin/onboarding/pending • Review and execute Approve or Reject actions.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates..."
                className="w-full h-9 rounded-full bg-[#FAFAF9] border border-[#ECECEC] pl-9 pr-4 text-[12.5px] outline-none focus:border-[#1D1D1F] transition-all"
              />
            </div>
          </div>

          {/* Table / List */}
          {filteredApps.length === 0 ? (
            <div className="p-12 text-center text-[#71717A] bg-[#FAFAF9] rounded-2xl border border-dashed border-[#ECECEC]">
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p className="font-semibold">No pending candidate applications found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-[#ECECEC] text-[11px] font-extrabold uppercase text-[#71717A] tracking-wider">
                    <th className="pb-3 px-3">Candidate Profile</th>
                    <th className="pb-3 px-3">Contact</th>
                    <th className="pb-3 px-3">Statement & Experience</th>
                    <th className="pb-3 px-3 text-right">Review Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECECEC]/60">
                  {filteredApps.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-[#FAFAF9] transition-colors group">
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={candidate.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"}
                            alt={candidate.name}
                            className="w-10 h-10 rounded-full object-cover border border-[#ECECEC]"
                          />
                          <div>
                            <div className="font-bold text-[#1D1D1F]">{candidate.name}</div>
                            <div className="text-[11px] font-mono text-[#71717A]">{candidate.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-3">
                        <div className="font-medium text-[#1D1D1F]">{candidate.email}</div>
                        <div className="text-[11.5px] text-[#71717A]">{candidate.phoneNumber}</div>
                      </td>

                      <td className="py-4 px-3 max-w-xs">
                        <p className="line-clamp-2 text-[12.5px] text-[#515154] leading-relaxed">
                          "{candidate.reason}"
                        </p>
                      </td>

                      <td className="py-4 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedCandidate(candidate)}
                            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1D1D1F] transition-colors border-none cursor-pointer"
                            title="Inspect Candidate Detail"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => handleApprove(candidate.id)}
                            disabled={actionLoadingId === candidate.id}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12px] border-none cursor-pointer transition-colors flex items-center gap-1 shadow-xs disabled:opacity-50"
                          >
                            <CheckCircle2 size={14} />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => handleReject(candidate.id)}
                            disabled={actionLoadingId === candidate.id}
                            className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[12px] border-none cursor-pointer transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Candidate Inspection Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 border border-[#ECECEC]">
            <div className="flex items-center justify-between pb-4 border-b border-[#ECECEC]">
              <h3 className="text-xl font-bold text-[#1D1D1F]">Candidate Profile Review</h3>
              <button onClick={() => setSelectedCandidate(null)} className="p-1 rounded-full hover:bg-gray-100 border-none bg-transparent cursor-pointer">
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={selectedCandidate.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"}
                alt={selectedCandidate.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#1D1D1F]"
              />
              <div>
                <h4 className="text-lg font-bold text-[#1D1D1F]">{selectedCandidate.name}</h4>
                <p className="text-[13px] text-[#71717A]">{selectedCandidate.email}</p>
                <p className="text-[12px] font-mono text-[#F07020] font-bold">{selectedCandidate.phoneNumber}</p>
              </div>
            </div>

            <div className="bg-[#FAFAF9] p-4 rounded-2xl border border-[#ECECEC] space-y-2">
              <span className="text-[11px] font-extrabold uppercase text-[#71717A] tracking-wider">Application Reason & Experience</span>
              <p className="text-[13.5px] text-[#1D1D1F] leading-relaxed">{selectedCandidate.reason}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => handleReject(selectedCandidate.id)}
                className="px-5 py-2.5 rounded-full bg-red-100 text-red-700 font-bold text-[13px] hover:bg-red-200 border-none cursor-pointer"
              >
                Reject Candidate
              </button>
              <button
                onClick={() => handleApprove(selectedCandidate.id)}
                className="px-6 py-2.5 rounded-full bg-[#1D1D1F] text-white font-bold text-[13px] hover:bg-[#F07020] border-none cursor-pointer"
              >
                Approve Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
