import React, { useState } from "react";
import { Shield, Check } from "lucide-react";
import { changePassword } from "@/modules/profile/services/userService";
import Loader from "@/shared/components/ui/Loader";

const PasswordView = ({ userId }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
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

    if (passwordData.newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await changePassword(userId, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccessMsg("Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg(err.message || "Our servers are busy right now. Please try a few minutes later.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full h-[44px] px-4 rounded-xl border border-[#E8E5E0] bg-[#FAFAF9] text-[13.5px] font-medium text-[#1A1A1A] placeholder-[#BFBFBF] outline-none transition-all duration-200 hover:border-[#D0CCC6] hover:bg-white focus:border-[#C8702A] focus:bg-white focus:ring-1 focus:ring-[#C8702A]/20";

  return (
    <div className="relative font-['Plus_Jakarta_Sans',sans-serif]">
      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 backdrop-blur-[1px] rounded-2xl">
          <Loader />
        </div>
      )}

      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#F5EDE4] flex items-center justify-center">
            <Shield size={15} className="text-[#C8702A]" />
          </div>
          <h2 className="text-[20px] font-bold text-[#1A1A1A] tracking-[-0.02em]">Password & Security</h2>
        </div>
        <p className="text-[13px] text-[#8C8C8C] mt-1 ml-11">Manage your password to keep your account secure.</p>
      </div>

      {/* Status Messages */}
      {errorMsg && (
        <div className="px-5 py-3 mb-6 bg-red-50 border border-red-100 rounded-xl text-[12.5px] font-medium text-red-600 text-center">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="px-5 py-3 mb-6 bg-emerald-50 border border-emerald-100 rounded-xl text-[12.5px] font-semibold text-emerald-700 text-center flex items-center justify-center gap-2">
          <Check size={14} strokeWidth={2.5} />
          {successMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
        
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A9A9A] mb-2">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className={inputClasses}
            required
          />
        </div>

        <div className="pt-2 border-t border-[#EDEBE8]">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A9A9A] mb-2 mt-5">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A9A9A] mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter new password"
            className={inputClasses}
            required
          />
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-7 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#000000] text-white text-[13px] font-semibold shadow-sm transition-all duration-200 active:scale-[0.985] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default PasswordView;
