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
    if (dn.contains("iphone") || dn.contains("android") || dn.contains("phone")) {
      return <Smartphone size={18} className="text-[#A66A2C]" />;
    }
    if (dn.contains("macbook") || dn.contains("laptop") || dn.contains("mac os") || dn.contains("windows")) {
      return <Laptop size={18} className="text-[#A66A2C]" />;
    }
    return <Monitor size={18} className="text-[#A66A2C]" />;
  };

  const inputClasses =
    "w-full h-[46px] px-4 rounded-xl border border-[#E8E5E0] bg-[#FAFAF9] text-[13.5px] font-medium text-[#1A1A1A] placeholder-[#BFBFBF] outline-none transition-all duration-200 hover:border-[#D0CCC6] hover:bg-white focus:border-[#A66A2C] focus:bg-white focus:ring-1 focus:ring-[#A66A2C]/20";

  return (
    <div className="relative font-['Plus_Jakarta_Sans',sans-serif] space-y-12">
      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 backdrop-blur-[1px] rounded-2xl">
          <Loader />
        </div>
      )}

      {/* ── Section 1: Password Change ──────────────────────── */}
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#F5EDE4] flex items-center justify-center">
              <Shield size={16} className="text-[#A66A2C]" />
            </div>
            <h2 className="text-[20px] font-bold text-[#1A1A1A] tracking-[-0.02em]">Password & Credential Security</h2>
          </div>
          <p className="text-[13px] text-[#8C8C8C] mt-1 ml-11">
            Update your account password. Changing your password will automatically sign out all other devices for your security.
          </p>
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div className="px-5 py-3 mb-6 bg-red-50 border border-red-100 rounded-xl text-[12.5px] font-medium text-red-600 flex items-center gap-2">
            <AlertCircle size={15} />
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="px-5 py-3 mb-6 bg-emerald-50 border border-emerald-100 rounded-xl text-[12.5px] font-semibold text-emerald-700 flex items-center gap-2">
            <Check size={15} strokeWidth={2.5} />
            {successMsg}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#6B7280] mb-1.5">
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
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#6B7280] mb-1.5">
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
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#6B7280] mb-1.5">
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
              className="h-[46px] px-7 rounded-xl bg-[#111111] text-white text-[13px] font-bold tracking-[0.04em] uppercase hover:bg-black transition-all flex items-center gap-2 shadow-sm active:scale-[0.99]"
            >
              <KeyRound size={15} />
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Section 2: Active Sessions & Device Control ────────── */}
      <div className="pt-8 border-t border-[#ECEBE8]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#F5EDE4] flex items-center justify-center">
                <Laptop size={16} className="text-[#A66A2C]" />
              </div>
              <h3 className="text-[18px] font-bold text-[#1A1A1A] tracking-[-0.02em]">Active Devices & Sessions</h3>
            </div>
            <p className="text-[13px] text-[#8C8C8C] mt-1 ml-11">
              These devices are currently signed in to your Weavly account. You can revoke individual sessions or sign out everywhere.
            </p>
          </div>

          {sessions.filter(s => !s.current).length > 0 && (
            <button
              type="button"
              onClick={handleRevokeAllOtherSessions}
              className="self-start sm:self-auto h-[38px] px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[12px] font-bold tracking-[0.02em] transition-all flex items-center gap-2"
            >
              <LogOut size={14} />
              Sign Out Other Devices
            </button>
          )}
        </div>

        {sessionMsg && (
          <div className="px-5 py-3 mb-6 bg-emerald-50 border border-emerald-100 rounded-xl text-[12.5px] font-semibold text-emerald-700 flex items-center gap-2">
            <Check size={15} strokeWidth={2.5} />
            {sessionMsg}
          </div>
        )}

        {sessionsLoading && sessions.length === 0 ? (
          <div className="py-8 flex items-center justify-center text-[#8C8C8C] text-[13px] gap-2">
            <RefreshCw size={16} className="animate-spin text-[#A66A2C]" />
            Loading active sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-[#E5E5E0] bg-[#FAFAF9] text-center text-[13px] text-[#8C8C8C]">
            No other active sessions detected.
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  sess.current
                    ? "bg-[#FAFAF9] border-[#E8E5E0] shadow-sm"
                    : "bg-white border-[#ECEBE8] hover:border-[#D0CCC6]"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#F5EDE4] flex items-center justify-center flex-shrink-0">
                    {getDeviceIcon(sess.deviceName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-[#1A1A1A] truncate">
                        {sess.deviceName || "Web Browser"}
                      </span>
                      {sess.current && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold uppercase tracking-wider">
                          Current Device
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-[#8C8C8C] flex items-center gap-2 mt-0.5">
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
                    className="px-3.5 py-1.5 rounded-lg border border-[#E5E5E0] bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-[#4B5563] text-[12px] font-semibold transition-all flex-shrink-0"
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
