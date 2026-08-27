"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, CheckCircle2, Clock, Search, RefreshCw, Eye, Sparkles } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminBreadcrumbHeader from "@/components/AdminBreadcrumbHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { getPendingApplications, approveApplication, rejectApplication } from "@/services/adminService";
import { formatErrorMessage } from "@/utils/errorUtils";
import { getToken } from "@/utils/token";

export default function AdminDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await getPendingApplications();
      const list = Array.isArray(data) ? data : data?.data || [];
      setApplications(list);
    } catch (err) {
      console.warn("Backend API fetch notice:", err.message || err);
      setErrorMsg(formatErrorMessage(err, "Failed to load pending onboarding applications from API."));
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    fetchApplications();
  }, [router]);

  const handleApprove = async (candidateId) => {
    setActionLoadingId(candidateId);
    setErrorMsg("");
    setActionSuccess("");

    try {
      await approveApplication(candidateId);
      setActionSuccess(`Application ${candidateId} approved via API! Admin credentials issued.`);
      setApplications((prev) => prev.filter((app) => (app.id || app.email) !== candidateId));
      setSelectedCandidate(null);
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, "Failed to approve application via API."));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (candidateId) => {
    setActionLoadingId(candidateId);
    setErrorMsg("");
    setActionSuccess("");

    try {
      await rejectApplication(candidateId, "Application requirements not met.");
      setActionSuccess(`Application ${candidateId} rejected via API.`);
      setApplications((prev) => prev.filter((app) => (app.id || app.email) !== candidateId));
      setSelectedCandidate(null);
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, "Failed to reject application via API."));
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredApps = applications.filter(
    (app) =>
      app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(app.id || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] text-[#1D1D1F]">
      <AdminSidebar activeTab={activeTab} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminBreadcrumbHeader
          category="Overview"
          title={activeTab === "applications" ? "Pending Onboarding Applications" : "Dashboard"}
          onRefresh={fetchApplications}
          refreshLoading={loading}
        />

        <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-7xl w-full mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECECEC] pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">
                {activeTab === "applications" ? "Pending Onboarding Applications" : "Executive Admin Studio"}
              </h1>
              <p className="text-[13px] text-[#71717A] mt-1">
                Live backend queue for GET /api/admin/onboarding/pending
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={fetchApplications}>
                <RefreshCw size={14} className={`mr-1.5 ${loading ? "animate-spin text-[#F07020]" : ""}`} />
                <span>Fetch API Queue</span>
              </Button>
              <Button variant="default" size="sm" onClick={() => router.push("/products")}>
                <Sparkles size={14} className="mr-1.5" />
                <span>Product Studio</span>
              </Button>
            </div>
          </div>

          {actionSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-[13px] font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>{actionSuccess}</span>
              </div>
              <button onClick={() => setActionSuccess("")} className="text-xs text-emerald-600 font-bold border-none bg-transparent cursor-pointer">Dismiss</button>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-[13px] font-semibold flex items-center justify-between">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg("")} className="text-xs text-red-600 font-bold border-none bg-transparent cursor-pointer">Dismiss</button>
            </div>
          )}

          {/* API Metrics Cards (Shadcn Card Component) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between text-[#71717A] mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Pending API Requests</span>
                  <Clock size={18} className="text-[#F07020]" />
                </div>
                <div className="text-3xl font-extrabold text-[#1D1D1F]">{applications.length}</div>
                <p className="text-[12px] text-[#71717A] mt-1">Live applications fetched from GET /api/admin/onboarding/pending</p>
              </CardContent>
            </Card>

            <Card className="bg-[#18181B] text-white border-[#18181B]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between text-white/70 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider">API Authentication</span>
                  <Users size={18} className="text-[#F07020]" />
                </div>
                <div className="text-xl font-bold text-white">chokkapusaketh@gmail.com</div>
                <p className="text-[12px] text-white/60 mt-1">Bearer Token Authorized</p>
              </CardContent>
            </Card>
          </div>

          {/* Candidates Queue Table (Shadcn Table Component) */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECECEC]">
              <div>
                <CardTitle>Pending Onboarding Queue</CardTitle>
                <p className="text-[12.5px] text-[#71717A] mt-0.5">GET /api/admin/onboarding/pending</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search queue by name/email..."
                    className="w-full h-9 pl-10 pr-4 rounded-full bg-[#FAFAF9] border border-[#ECECEC] text-[13px] text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="py-16 text-center text-[#71717A] text-[13px]">
                  <RefreshCw size={24} className="animate-spin text-[#F07020] mx-auto mb-3" />
                  <span>Fetching pending applications from API...</span>
                </div>
              ) : filteredApps.length === 0 ? (
                <div className="py-16 text-center bg-[#FAFAF9] rounded-b-2xl">
                  <Clock size={32} className="text-[#71717A] mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-[#1D1D1F]">No Pending Applications</h3>
                  <p className="text-[12px] text-[#71717A] mt-1 max-w-sm mx-auto">
                    No candidate onboarding applications were returned by the API server.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate Profile</TableHead>
                      <TableHead>Contact Details</TableHead>
                      <TableHead>Application Reason</TableHead>
                      <TableHead className="text-right">API Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApps.map((candidate) => (
                      <TableRow key={candidate.id || candidate.email}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={candidate.photoUrl || candidate.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"}
                              alt={candidate.name || candidate.firstName || "Candidate"}
                              className="w-10 h-10 rounded-full object-cover border border-[#ECECEC]"
                            />
                            <div>
                              <div className="font-bold text-[#1D1D1F]">{candidate.name || `${candidate.firstName || ''} ${candidate.lastName || ''}`}</div>
                              <div className="text-[11px] font-mono text-[#71717A]">ID: {String(candidate.id || "N/A").slice(0, 8)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-[#1D1D1F]">{candidate.email}</div>
                          <div className="text-[12px] text-[#71717A]">{candidate.phoneNumber || "No phone provided"}</div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-[12.5px] text-[#1D1D1F] line-clamp-2">
                            "{candidate.reason || candidate.bio || "Candidate application submitted for admin approval."}"
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedCandidate(candidate)}
                              className="p-2 rounded-xl text-[#1D1D1F] hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer"
                              title="Inspect Details"
                            >
                              <Eye size={16} />
                            </button>
                            <Button
                              variant="success"
                              size="sm"
                              disabled={actionLoadingId === (candidate.id || candidate.email)}
                              onClick={() => handleApprove(candidate.id || candidate.email)}
                            >
                              Approve API
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={actionLoadingId === (candidate.id || candidate.email)}
                              onClick={() => handleReject(candidate.id || candidate.email)}
                            >
                              Reject API
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Inspection Modal */}
          {selectedCandidate && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 border border-[#ECECEC]">
                <div className="flex items-center justify-between pb-4 border-b border-[#ECECEC]">
                  <h3 className="text-xl font-bold text-[#1D1D1F]">Candidate Inspection</h3>
                  <button onClick={() => setSelectedCandidate(null)} className="p-1 rounded-full hover:bg-gray-100 border-none bg-transparent cursor-pointer">
                    ✕
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src={selectedCandidate.photoUrl || selectedCandidate.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"}
                    alt={selectedCandidate.name || "Candidate"}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#1D1D1F]"
                  />
                  <div>
                    <h4 className="text-lg font-bold text-[#1D1D1F]">{selectedCandidate.name || `${selectedCandidate.firstName || ''} ${selectedCandidate.lastName || ''}`}</h4>
                    <p className="text-[13px] text-[#71717A]">{selectedCandidate.email}</p>
                    <Badge variant="brand" className="mt-1">{selectedCandidate.phoneNumber || "No Phone"}</Badge>
                  </div>
                </div>

                <div className="bg-[#FAFAF9] p-4 rounded-2xl border border-[#ECECEC] space-y-2">
                  <span className="text-[11px] font-extrabold uppercase text-[#71717A] tracking-wider">Application Reason & Bio</span>
                  <p className="text-[13.5px] text-[#1D1D1F] leading-relaxed">{selectedCandidate.reason || selectedCandidate.bio || "No description provided."}</p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleReject(selectedCandidate.id || selectedCandidate.email)}
                  >
                    Reject API
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleApprove(selectedCandidate.id || selectedCandidate.email)}
                  >
                    Approve API
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
