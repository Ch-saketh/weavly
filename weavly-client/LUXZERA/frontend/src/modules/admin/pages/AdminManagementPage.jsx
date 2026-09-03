"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Shield, UserCheck, Key, AlertTriangle, CheckCircle2, 
  XCircle, RefreshCw, UserPlus, ShieldAlert, LogOut, Trash2
} from "lucide-react";
import AdminSidebar from "@/modules/admin/components/AdminSidebar";
import AdminBreadcrumbHeader from "@/modules/admin/components/AdminBreadcrumbHeader";
import { 
  listAdmins, getAdminPermissions, updateAdminPermissions, 
  updateAdminRole, updateAdminStatus, revokeAdminSessions, 
  deleteAdmin, inviteAdmin, getCurrentAdmin 
} from "@/modules/admin/services/adminService";
import { formatErrorMessage } from "@/shared/utils/errorUtils";

const ALL_PERMISSION_DOMAINS = {
  "Users": [
    { key: "users.read", label: "View User Profiles & Fits" },
    { key: "users.update", label: "Edit User Account Details" },
    { key: "users.suspend", label: "Suspend / Freeze Accounts" },
    { key: "users.restore", label: "Reactivate Suspended Users" },
    { key: "users.delete", label: "Permanently Delete Users" },
    { key: "users.sessions.revoke", label: "Revoke Customer Sessions" }
  ],
  "Products & Catalog": [
    { key: "products.read", label: "View Catalog & Stock" },
    { key: "products.create", label: "Create New Products" },
    { key: "products.update", label: "Edit Product Information" },
    { key: "products.delete", label: "Delete Garments & Lookbooks" },
    { key: "products.publish", label: "Publish Garments Live" },
    { key: "products.archive", label: "Archive Discontinued Items" },
    { key: "products.inventory", label: "Adjust SKU Size Quantities" },
    { key: "products.media", label: "Manage Cloudflare R2 Photos" }
  ],
  "Orders & Commerce": [
    { key: "orders.read", label: "View Orders & Invoices" },
    { key: "orders.update", label: "Update Order Milestones" },
    { key: "orders.cancel", label: "Cancel Unfulfilled Orders" },
    { key: "orders.refund", label: "Issue Financial Refunds" },
    { key: "orders.tracking", label: "Attach Courier Tracking" }
  ],
  "Designer Studio": [
    { key: "designers.read", label: "Inspect Atelier Profiles" },
    { key: "designers.verify", label: "Issue Verified Designer Badges" },
    { key: "designers.suspend", label: "Freeze Atelier Studio" },
    { key: "designers.moderate", label: "Moderate Lookbook Garments" }
  ],
  "Promotions & Coupons": [
    { key: "coupons.read", label: "Inspect Active Codes" },
    { key: "coupons.create", label: "Issue Discount Coupons" },
    { key: "coupons.update", label: "Modify Coupon Thresholds" },
    { key: "coupons.delete", label: "Revoke Promotional Codes" }
  ],
  "Uploads & Assets": [
    { key: "uploads.read", label: "Audit Uploaded Customer Media" },
    { key: "uploads.delete", label: "Delete Infringing Files" }
  ],
  "Executive & Analytics": [
    { key: "analytics.read", label: "View Platform Financial KPIs" },
    { key: "audit_logs.read", label: "Inspect Append-Only Audit Logs" },
    { key: "security.read", label: "Inspect Threat Telemetry Events" }
  ],
  "System Administration": [
    { key: "admins.read", label: "List Administrator Registry" },
    { key: "admins.create", label: "Issue Staff Invitations" },
    { key: "admins.update", label: "Modify Staff Roles & Status" },
    { key: "admins.permissions", label: "Edit Custom Capability Matrix" },
    { key: "admins.sessions.revoke", label: "Remotely Terminate Sessions" },
    { key: "admins.delete", label: "Deactivate Staff Accounts" }
  ]
};

const ROLE_OPTIONS = [
  "PLATFORM_ADMIN",
  "CATALOG_ADMIN",
  "USER_ADMIN",
  "ORDER_ADMIN",
  "DESIGNER_ADMIN",
  "SUPPORT_ADMIN",
  "ANALYTICS_ADMIN",
  "SUPER_ADMIN"
];

export default function AdminManagementPage() {
  const router = useRouter();

  const [currentAdminUser, setCurrentAdminUser] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Notifications
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Modals
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("PLATFORM_ADMIN");
  const [inviteLoading, setInviteLoading] = useState(false);

  // Permission Editor Modal
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [permissionData, setPermissionData] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [permLoading, setPermLoading] = useState(false);

  // Role Edit Modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const me = await getCurrentAdmin();
      setCurrentAdminUser(me);
      await refreshAdminList();
    } catch (err) {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const refreshAdminList = async () => {
    try {
      const data = await listAdmins();
      setAdmins(data || []);
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to load administrator registry.") });
    }
  };

  const handleOpenPermissions = async (admin) => {
    setSelectedAdmin(admin);
    setPermLoading(true);
    setPermModalOpen(true);
    try {
      const data = await getAdminPermissions(admin.id);
      setPermissionData(data);
      setSelectedPermissions(new Set(data.effectivePermissions || []));
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to load permissions.") });
      setPermModalOpen(false);
    } finally {
      setPermLoading(false);
    }
  };

  const togglePermission = (key) => {
    if (selectedAdmin?.role === "SUPER_ADMIN") return;
    const updated = new Set(selectedPermissions);
    if (updated.has(key)) {
      updated.delete(key);
    } else {
      updated.add(key);
    }
    setSelectedPermissions(updated);
  };

  const handleSavePermissions = async () => {
    if (!selectedAdmin || !permissionData) return;
    setPermLoading(true);
    try {
      const defaultSet = new Set(permissionData.defaultPermissions || []);
      const granted = [];
      const revoked = [];

      selectedPermissions.forEach((key) => {
        if (!defaultSet.has(key)) {
          granted.push(key);
        }
      });

      defaultSet.forEach((key) => {
        if (!selectedPermissions.has(key)) {
          revoked.push(key);
        }
      });

      await updateAdminPermissions(selectedAdmin.id, {
        grantedPermissions: granted,
        revokedPermissions: revoked
      });

      setFeedback({ type: "success", message: `Capability matrix updated for ${selectedAdmin.username}.` });
      setPermModalOpen(false);
      refreshAdminList();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to update permissions.") });
    } finally {
      setPermLoading(false);
    }
  };

  const handleOpenRoleModal = (admin) => {
    setSelectedAdmin(admin);
    setNewRole(admin.role);
    setRoleModalOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedAdmin || !newRole) return;
    setRoleLoading(true);
    try {
      await updateAdminRole(selectedAdmin.id, newRole);
      setFeedback({ type: "success", message: `Role updated to ${newRole} for ${selectedAdmin.username}.` });
      setRoleModalOpen(false);
      refreshAdminList();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Role update rejected.") });
    } finally {
      setRoleLoading(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    const nextStatus = admin.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const confirmPrompt = nextStatus === "SUSPENDED" 
      ? `Are you sure you want to SUSPEND ${admin.username}? All active sessions will be terminated immediately.`
      : `Reactivate ${admin.username}?`;

    if (!window.confirm(confirmPrompt)) return;

    try {
      await updateAdminStatus(admin.id, nextStatus);
      setFeedback({ type: "success", message: `${admin.username} transitioned to ${nextStatus}.` });
      refreshAdminList();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Status transition rejected.") });
    }
  };

  const handleRevokeSessions = async (admin) => {
    if (!window.confirm(`Terminate all active sessions for ${admin.username}? They will be forced to log in again with 2FA.`)) return;
    try {
      await revokeAdminSessions(admin.id);
      setFeedback({ type: "success", message: `Active sessions terminated for ${admin.username}.` });
      refreshAdminList();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to revoke sessions.") });
    }
  };

  const handleDeleteAdmin = async (admin) => {
    if (!window.confirm(`DEACTIVATE administrator ${admin.username}? The account will be disabled and session access revoked.`)) return;
    try {
      await deleteAdmin(admin.id);
      setFeedback({ type: "success", message: `${admin.username} has been deactivated.` });
      refreshAdminList();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Deactivation rejected.") });
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteLoading(true);
    try {
      await inviteAdmin(inviteEmail.trim().toLowerCase(), inviteRole);
      setFeedback({ type: "success", message: `Cryptographic invitation link dispatched to ${inviteEmail}.` });
      setInviteModalOpen(false);
      setInviteEmail("");
      refreshAdminList();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Invitation failed.") });
    } finally {
      setInviteLoading(false);
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const matchesSearch = 
      a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-[#F5EFEB] font-sans antialiased text-[#183B56] overflow-hidden">
      <AdminSidebar activeTab="admins" />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminBreadcrumbHeader 
          breadcrumbs={[{ label: "Control Plane", href: "/admin/dashboard" }, { label: "Administrators & Access" }]}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#183B56]/20 bg-white p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono tracking-widest uppercase bg-[#183B56] text-white px-2 py-0.5 font-bold">
                  SECURITY DOMAIN: RBAC
                </span>
                <span className="text-xs font-semibold text-[#5A7184]">Super Admin Authority</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#183B56]">
                Administrator Governance & RBAC
              </h1>
              <p className="text-xs text-[#5A7184] mt-1 max-w-2xl">
                Oversee privileged administrator accounts, issue cryptographic invitations, assign role matrices, and configure granular operational permissions.
              </p>
            </div>

            <button
              onClick={() => setInviteModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#183B56] text-white text-xs font-semibold hover:bg-[#102A43] transition-all border border-[#183B56] shadow-sm cursor-pointer"
            >
              <UserPlus size={14} />
              <span>Issue Staff Invitation</span>
            </button>
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

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-[#183B56]/20 shadow-sm">
            <div className="w-full sm:w-80">
              <input
                type="text"
                placeholder="Search username, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#183B56]/20 bg-[#F5EFEB]/30 text-[#183B56] placeholder-[#5A7184] focus:outline-none focus:border-[#183B56]"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-semibold text-[#5A7184]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-[#183B56]/20 bg-white text-[#183B56] focus:outline-none focus:border-[#183B56]"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INVITED">Invited</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="DISABLED">Disabled</option>
              </select>

              <button
                onClick={refreshAdminList}
                className="p-2 text-[#5A7184] hover:text-[#183B56] hover:bg-[#F5EFEB] transition-all border border-[#183B56]/20 cursor-pointer"
                title="Refresh Table"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Admin Table */}
          <div className="bg-white border border-[#183B56]/20 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#183B56]/20 bg-[#F5EFEB]/50 text-[11px] font-semibold text-[#5A7184] uppercase tracking-wider">
                    <th className="py-3 px-4">Administrator Identity</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Active Sessions</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4 text-right">Governance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#183B56]/10 text-xs">
                  {filteredAdmins.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#5A7184]">
                        {loading ? "Loading administrator directory..." : "No administrator accounts match your criteria."}
                      </td>
                    </tr>
                  ) : (
                    filteredAdmins.map((admin) => {
                      const isSuper = admin.role === "SUPER_ADMIN";
                      return (
                        <tr key={admin.id} className="hover:bg-[#F5EFEB]/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {isSuper ? (
                                <Shield className="text-amber-600 shrink-0" size={14} />
                              ) : (
                                <UserCheck className="text-[#5A7184] shrink-0" size={14} />
                              )}
                              <div>
                                <span className="font-mono font-bold text-[#183B56] block">
                                  {admin.username}
                                </span>
                                <span className="text-[11px] text-[#5A7184]">{admin.email}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-0.5 text-[10px] font-mono font-bold border ${
                              isSuper 
                                ? "bg-amber-50 border-amber-300 text-amber-900" 
                                : "bg-[#183B56]/5 border-[#183B56]/20 text-[#183B56]"
                            }`}>
                              {admin.role}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              admin.status === "ACTIVE" 
                                ? "text-emerald-700 bg-emerald-50 border border-emerald-200" 
                                : admin.status === "SUSPENDED"
                                ? "text-rose-700 bg-rose-50 border border-rose-200"
                                : "text-amber-700 bg-amber-50 border border-amber-200"
                            }`}>
                              {admin.status}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-mono text-xs font-semibold">
                              {admin.activeSessionCount} active
                            </span>
                          </td>

                          <td className="py-3 px-4 text-[#5A7184] font-mono text-[11px]">
                            {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : "Never"}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenPermissions(admin)}
                                className="px-2.5 py-1 text-[11px] font-semibold border border-[#183B56]/30 bg-white hover:bg-[#F5EFEB] text-[#183B56] transition-all cursor-pointer"
                                title="Edit Capability Matrix"
                              >
                                Capabilities
                              </button>

                              {!isSuper && (
                                <>
                                  <button
                                    onClick={() => handleOpenRoleModal(admin)}
                                    className="px-2.5 py-1 text-[11px] font-semibold border border-[#183B56]/30 bg-white hover:bg-[#F5EFEB] text-[#183B56] transition-all cursor-pointer"
                                    title="Change Assigned Role"
                                  >
                                    Role
                                  </button>

                                  <button
                                    onClick={() => handleToggleStatus(admin)}
                                    className={`px-2.5 py-1 text-[11px] font-semibold border transition-all cursor-pointer ${
                                      admin.status === "ACTIVE"
                                        ? "border-rose-300 text-rose-700 hover:bg-rose-50"
                                        : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                    }`}
                                  >
                                    {admin.status === "ACTIVE" ? "Suspend" : "Activate"}
                                  </button>
                                </>
                              )}

                              {admin.activeSessionCount > 0 && (
                                <button
                                  onClick={() => handleRevokeSessions(admin)}
                                  className="p-1 text-[#5A7184] hover:text-rose-700 border border-[#183B56]/20 hover:bg-rose-50 transition-all cursor-pointer"
                                  title="Terminate Active Sessions"
                                >
                                  <LogOut size={12} />
                                </button>
                              )}

                              {!isSuper && (
                                <button
                                  onClick={() => handleDeleteAdmin(admin)}
                                  className="p-1 text-[#5A7184] hover:text-rose-700 border border-[#183B56]/20 hover:bg-rose-50 transition-all cursor-pointer"
                                  title="Deactivate Administrator"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ── Issue Staff Invitation Modal ── */}
      {inviteModalOpen && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#183B56] w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#183B56]/20 pb-3">
              <h3 className="text-base font-bold text-[#183B56]">Issue Staff Invitation</h3>
              <button onClick={() => setInviteModalOpen(false)} className="text-[#5A7184] hover:text-[#183B56] font-bold">✕</button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#183B56] mb-1">Invitee Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@organization.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#183B56]/30 bg-white text-[#183B56] focus:outline-none focus:border-[#183B56]"
                />
                <p className="text-[11px] text-[#5A7184] mt-1">
                  A single-use 48-hour cryptographic activation link will be dispatched to this address.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#183B56] mb-1">Administrative Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-[#183B56]/30 bg-white text-[#183B56] focus:outline-none focus:border-[#183B56]"
                >
                  {ROLE_OPTIONS.filter(r => r !== "SUPER_ADMIN").map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 border border-[#183B56]/30 bg-white text-[#5A7184] hover:bg-[#F5EFEB] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="px-5 py-2 bg-[#183B56] text-white font-semibold hover:bg-[#102A43] transition-all cursor-pointer border border-[#183B56] disabled:opacity-50"
                >
                  {inviteLoading ? "Generating Token..." : "Dispatch Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Capability Matrix & Permission Editor Modal ── */}
      {permModalOpen && selectedAdmin && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#183B56] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-[#183B56]/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase bg-[#183B56] text-white px-2 py-0.5 font-bold">
                  CAPABILITY MATRIX
                </span>
                <h3 className="text-lg font-bold text-[#183B56] mt-1">
                  Permissions: {selectedAdmin.username}
                </h3>
                <p className="text-xs text-[#5A7184]">
                  Base Role: <span className="font-mono font-bold text-[#183B56]">{selectedAdmin.role}</span>
                </p>
              </div>
              <button onClick={() => setPermModalOpen(false)} className="text-[#5A7184] hover:text-[#183B56] font-bold text-lg">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedAdmin.role === "SUPER_ADMIN" ? (
                <div className="p-6 bg-amber-50 border border-amber-300 text-amber-900 text-xs leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-sm mb-2 text-amber-950">
                    <ShieldAlert size={18} />
                    <span>SUPER ADMIN — BREAK-GLASS PROTECTED</span>
                  </div>
                  <p>
                    The Super Admin identity holds permanent wildcard platform authority (<code>*</code>). In accordance with platform governance security rules, individual capability toggles cannot be overridden or revoked on this account.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-[#5A7184]">
                    Items marked with an asterisk (<span className="text-emerald-600 font-bold">*</span>) are provided by default by the assigned <strong>{selectedAdmin.role}</strong> bundle. Additional selections act as custom explicit grants, while unchecked defaults act as explicit revocations.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(ALL_PERMISSION_DOMAINS).map(([domain, perms]) => (
                      <div key={domain} className="border border-[#183B56]/20 p-4 bg-[#F5EFEB]/20">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-[#183B56] border-b border-[#183B56]/20 pb-2 mb-3">
                          {domain}
                        </h4>
                        <div className="space-y-2">
                          {perms.map((p) => {
                            const isChecked = selectedPermissions.has(p.key);
                            const isDefault = permissionData?.defaultPermissions?.includes(p.key);
                            return (
                              <label
                                key={p.key}
                                className="flex items-start gap-2.5 text-xs text-[#183B56] cursor-pointer select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermission(p.key)}
                                  className="mt-0.5 rounded-none border-[#183B56] text-[#183B56] focus:ring-0 cursor-pointer"
                                />
                                <div>
                                  <span className="font-medium">{p.label}</span>
                                  <span className="block font-mono text-[10px] text-[#5A7184]">
                                    {p.key} {isDefault && <span className="text-emerald-700 font-bold">*</span>}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-[#183B56]/20 bg-[#F5EFEB]/40 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5A7184]">
                {selectedPermissions.size} capabilities active
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPermModalOpen(false)}
                  className="px-4 py-2 border border-[#183B56]/30 bg-white text-[#5A7184] hover:bg-[#F5EFEB] text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                {selectedAdmin.role !== "SUPER_ADMIN" && (
                  <button
                    type="button"
                    onClick={handleSavePermissions}
                    disabled={permLoading}
                    className="px-5 py-2 bg-[#183B56] text-white text-xs font-semibold hover:bg-[#102A43] transition-all cursor-pointer border border-[#183B56] disabled:opacity-50"
                  >
                    {permLoading ? "Persisting Overrides..." : "Save Capability Matrix"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Role Edit Modal ── */}
      {roleModalOpen && selectedAdmin && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#183B56] w-full max-w-sm p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#183B56]/20 pb-3">
              <h3 className="text-sm font-bold text-[#183B56]">Change Role: {selectedAdmin.username}</h3>
              <button onClick={() => setRoleModalOpen(false)} className="text-[#5A7184] hover:text-[#183B56] font-bold">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#183B56] mb-1">Select New Administrative Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 border border-[#183B56]/30 bg-white text-[#183B56] focus:outline-none focus:border-[#183B56]"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <p className="text-[11px] text-[#5A7184] mt-2">
                  Assigning a new role will reset the base capability bundle to match the new role profile.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRoleModalOpen(false)}
                  className="px-4 py-2 border border-[#183B56]/30 bg-white text-[#5A7184] hover:bg-[#F5EFEB] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRole}
                  disabled={roleLoading}
                  className="px-5 py-2 bg-[#183B56] text-white font-semibold hover:bg-[#102A43] transition-all cursor-pointer border border-[#183B56] disabled:opacity-50"
                >
                  {roleLoading ? "Updating..." : "Update Role"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
