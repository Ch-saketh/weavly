"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Shield, Check, Laptop, Smartphone, Monitor, AlertCircle, LogOut, RefreshCw, KeyRound } from "lucide-react";
import { changePassword, getActiveSessions, revokeSession, revokeOtherSessions } from "@/modules/auth/services/authService";
import Loader from "@/shared/components/ui/Loader";

const PasswordView = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [sessionMsg, setSessionMsg] = useState("");

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const data = await getActiveSessions();
      if (Array.isArray(data)) {
        setSessions(data);
      }
    } catch (err) {
      console.warn("Failed to load active sessions:", err.message);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setErrorMsg("Please fill in all password fields.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccessMsg(res?.message || "Password changed successfully! All other active sessions have been signed out.");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      fetchSessions();
      setTimeout(() => setSuccessMsg(""), 6000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update password. Please check your current password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await revokeSession(sessionId);
      setSessionMsg("Session revoked successfully.");
      fetchSessions();
      setTimeout(() => setSessionMsg(""), 4000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to revoke session.");
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    if (!confirm("Are you sure you want to sign out of all other devices?")) return;
    try {
      await revokeOtherSessions();
      setSessionMsg("All other active sessions have been signed out.");
      fetchSessions();
      setTimeout(() => setSessionMsg(""), 4000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to sign out of other devices.");
    }
  };

  const formatActivityTime = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 2) return "Just now";
      if (diffMins < 60) return `${diffMins} mins ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  const getDeviceIcon = (deviceName = "") => {
    const dn = deviceName.toLowerCase();
    if (dn.includes("iphone") || dn.includes("android") || dn.includes("phone")) {
      return <Smartphone size={18} className="text-[#183B56]" />;
    }
    if (dn.includes("macbook") || dn.includes("laptop") || dn.includes("mac os") || dn.includes("windows")) {
      return <Laptop size={18} className="text-[#183B56]" />;
    }
    return <Monitor size={18} className="text-[#183B56]" />;
  };

  const inputClasses =
    "w-full h-[44px] px-4 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] placeholder-[#5A7184]/50 outline-none transition-all focus:ring-1 focus:ring-[#183B56]";

  return (
    <div className="relative space-y-8">
      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-[1px]">
          <Loader />
        </div>
      )}

      {/* ── Section 1: Password Change ──────────────────────── */}
      <div className="border border-[#183B56] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3.5 pb-4 mb-6 border-b border-[#183B56]/20">
          <div className="w-10 h-10 bg-[#DFE7ED] border border-[#183B56] flex items-center justify-center shrink-0">
            <Shield size={18} className="text-[#183B56]" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5A7184] block">
              Security Credentials
            </span>
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#183B56]">
              Password &amp; Credential Security
            </h2>
          </div>
        </div>

        <p className="text-xs text-[#5A7184] font-medium mb-6 leading-relaxed">
          Update your account password. Changing your password will automatically sign out all other devices for your security.
        </p>

        {/* Status Messages */}
        {errorMsg && (
          <div className="px-4 py-3 mb-6 bg-red-50 border border-red-300 text-xs font-bold text-red-700 flex items-center gap-2">
            <AlertCircle size={15} />
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="px-4 py-3 mb-6 bg-[#F5EFEB] border border-[#183B56] text-xs font-bold text-[#183B56] flex items-center gap-2">
            <Check size={15} strokeWidth={2.5} />
            {successMsg}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#5A7184] mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handleChange}
              placeholder="••••••••••••"
              className={inputClasses}
              autoComplete="current-password"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#5A7184] mb-1.5">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleChange}
                placeholder="Min 8 characters"
                className={inputClasses}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#5A7184] mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat new password"
                className={inputClasses}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-[0.99]"
            >
              <KeyRound size={14} />
              <span>{loading ? "Updating..." : "Update Password"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── Section 2: Active Sessions & Device Control ────────── */}
      <div className="border border-[#183B56] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-[#183B56]/20">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-[#DFE7ED] border border-[#183B56] flex items-center justify-center shrink-0">
              <Laptop size={18} className="text-[#183B56]" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5A7184] block">
                Session Control
              </span>
              <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#183B56]">
                Active Devices &amp; Sessions
              </h3>
            </div>
          </div>

          {sessions.filter(s => !s.current).length > 0 && (
            <button
              type="button"
              onClick={handleRevokeAllOtherSessions}
              className="self-start sm:self-auto px-4 py-2 border border-red-500 bg-red-50 hover:bg-red-600 hover:text-white text-red-700 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <LogOut size={13} />
              <span>Sign Out Other Devices</span>
            </button>
          )}
        </div>

        <p className="text-xs text-[#5A7184] font-medium mb-6 leading-relaxed">
          These devices are currently signed in to your Weavly account. You can revoke individual sessions or sign out everywhere.
        </p>

        {sessionMsg && (
          <div className="px-4 py-3 mb-6 bg-[#F5EFEB] border border-[#183B56] text-xs font-bold text-[#183B56] flex items-center gap-2">
            <Check size={15} strokeWidth={2.5} />
            {sessionMsg}
          </div>
        )}

        {sessionsLoading && sessions.length === 0 ? (
          <div className="py-8 flex items-center justify-center text-[#5A7184] text-xs gap-2">
            <RefreshCw size={15} className="animate-spin text-[#183B56]" />
            <span>Loading active sessions...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-6 border border-[#183B56]/30 bg-[#F5EFEB] text-center text-xs font-medium text-[#5A7184]">
            No other active sessions detected.
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className={`p-4 border border-[#183B56] transition-all flex items-center justify-between gap-4 ${
                  sess.current
                    ? "bg-[#F5EFEB] shadow-xs"
                    : "bg-white hover:bg-[#F5EFEB]/50"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 bg-[#DFE7ED] border border-[#183B56] flex items-center justify-center shrink-0">
                    {getDeviceIcon(sess.deviceName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold uppercase text-[#183B56] truncate">
                        {sess.deviceName || "Web Browser"}
                      </span>
                      {sess.current && (
                        <span className="px-2 py-0.5 bg-[#183B56] text-white text-[9px] font-mono font-bold uppercase tracking-wider">
                          Current Device
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-[#5A7184] flex items-center gap-2 mt-0.5">
                      <span>IP: {sess.ipAddress}</span>
                      <span>•</span>
                      <span>Last active {formatActivityTime(sess.lastActivityAt)}</span>
                    </div>
                  </div>
                </div>

                {!sess.current && (
                  <button
                    type="button"
                    onClick={() => handleRevokeSession(sess.id)}
                    className="px-3.5 py-1.5 border border-[#183B56] bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] text-xs font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordView;
