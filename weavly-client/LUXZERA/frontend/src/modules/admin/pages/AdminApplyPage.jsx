"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, User, Mail, Phone, FileText, CheckCircle2, ShieldCheck, ArrowLeft, Image as ImageIcon } from "lucide-react";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import { submitAdminOnboarding } from "@/modules/admin/services/adminService";
import { formatErrorMessage } from "@/shared/utils/errorUtils";

export default function AdminApplyPage() {
  const router = useRouter();

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reason, setReason] = useState("");

  // File Upload State
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedData, setSubmittedData] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phoneNumber || !reason) {
      setErrorMsg("Please complete all required application fields.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim().toLowerCase());
      formData.append("phoneNumber", phoneNumber.trim());
      formData.append("reason", reason.trim());
      if (photoFile) {
        formData.append("photo", photoFile);
        formData.append("profilePhoto", photoFile);
      }

      const response = await submitAdminOnboarding(formData);

      const newApp = {
        id: response?.id || response?.data?.id || `APP-${Math.floor(100000 + Math.random() * 900000)}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        reason: reason.trim(),
        photoUrl: photoPreview || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
        status: "PENDING",
        createdAt: new Date().toISOString().split("T")[0],
      };

      if (typeof window !== "undefined") {
        try {
          const existing = JSON.parse(localStorage.getItem("Weavly_pending_applications") || "[]");
          localStorage.setItem("Weavly_pending_applications", JSON.stringify([newApp, ...existing]));
        } catch (e) {
          console.warn("Could not sync local pending app", e);
        }
      }

      setSubmittedData({
        id: newApp.id,
        name: newApp.name,
        email: newApp.email,
        createdAt: newApp.createdAt,
      });
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, "Failed to submit candidate onboarding application. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1D1D1F] font-sans py-12 px-4 sm:px-6 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#ECECEC]">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="border-none bg-transparent p-0 cursor-pointer select-none">
              <WeavlyLogo />
            </button>
            <span className="hidden sm:inline-block bg-[#1D1D1F] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
              Executive Onboarding
            </span>
          </div>
          <button
            onClick={() => router.push("/admin/login")}
            className="flex items-center gap-2 text-[13px] font-semibold text-[#1D1D1F] hover:text-[#F07020] transition-colors border-none bg-transparent cursor-pointer"
          >
            <span>Existing Admin Login</span>
            <ArrowLeft size={14} className="rotate-180" />
          </button>
        </div>

        {/* Successful Submission Card */}
        {submittedData ? (
          <div className="bg-white border border-[#ECECEC] rounded-3xl p-8 sm:p-12 shadow-sm text-center max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Application Received
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] mt-3">
                Application Submitted!
              </h2>
              <p className="text-[14px] text-[#71717A] mt-2 leading-relaxed">
                Thank you <strong className="text-[#1D1D1F]">{submittedData.name}</strong>. Your executive admin application has been submitted to the Super Admin curation committee.
              </p>
            </div>

            <div className="bg-[#FAFAF9] p-4 rounded-2xl border border-[#ECECEC] text-left space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#71717A]">Application Ref ID:</span>
                <span className="font-mono font-bold text-[#1D1D1F]">{submittedData.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Applicant Email:</span>
                <span className="font-semibold text-[#1D1D1F]">{submittedData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Submission Date:</span>
                <span className="text-[#1D1D1F]">{submittedData.createdAt}</span>
              </div>
            </div>

            <p className="text-[12px] text-[#71717A]">
              Upon review by Super Admin, an invitation and 2FA authorization token will be sent to your email.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => router.push("/admin/login")}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#1D1D1F] text-white font-bold text-[13px] hover:bg-[#F07020] transition-colors border-none cursor-pointer"
              >
                Go to Admin Login
              </button>
              <button
                onClick={() => setSubmittedData(null)}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#EBE9E4] text-[#1D1D1F] font-bold text-[13px] hover:bg-[#E0DDD7] transition-colors border-none cursor-pointer"
              >
                Submit Another Candidate
              </button>
            </div>
          </div>
        ) : (
          /* Application Form */
          <div className="bg-white border border-[#ECECEC] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F07020]/10 text-[#F07020] text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck size={12} />
                Curation Board Candidate Portal
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">
                Apply for Executive Admin Role
              </h1>
              <p className="text-[14px] text-[#71717A] max-w-xl">
                Submit your profile and curation experience statement to join the Super Admin management board.
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-[13px] font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo Upload */}
              <div className="space-y-2">
                <label className="block text-[12px] font-extrabold uppercase tracking-wider text-[#1D1D1F]">
                  Profile / Identity Photo
                </label>
                <div className="flex items-center gap-6">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#ECECEC] bg-[#FAFAF9] hover:bg-[#F4F4F5] transition-colors flex items-center justify-center cursor-pointer overflow-hidden relative shrink-0"
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-[#71717A]">
                        <ImageIcon size={22} />
                        <span className="text-[10px] font-bold">Upload</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-full bg-[#1D1D1F] text-white text-[12px] font-semibold hover:bg-[#F07020] transition-colors border-none cursor-pointer"
                    >
                      Choose Image File
                    </button>
                    <p className="text-[11px] text-[#71717A]">PNG, JPG or WEBP up to 5MB.</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-extrabold uppercase tracking-wider text-[#1D1D1F] mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none" />
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Meera Sharma"
                      className="w-full h-12 rounded-xl bg-[#FAFAF9] border border-[#ECECEC] text-[14px] text-[#1D1D1F] pl-11 pr-4 outline-none focus:border-[#1D1D1F] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-extrabold uppercase tracking-wider text-[#1D1D1F] mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="candidate@Weavly.com"
                      className="w-full h-12 rounded-xl bg-[#FAFAF9] border border-[#ECECEC] text-[14px] text-[#1D1D1F] pl-11 pr-4 outline-none focus:border-[#1D1D1F] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-extrabold uppercase tracking-wider text-[#1D1D1F] mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none" />
                  <input
                    required
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full h-12 rounded-xl bg-[#FAFAF9] border border-[#ECECEC] text-[14px] text-[#1D1D1F] pl-11 pr-4 outline-none focus:border-[#1D1D1F] transition-all"
                  />
                </div>
              </div>

              {/* Statement / Reason */}
              <div>
                <label className="block text-[12px] font-extrabold uppercase tracking-wider text-[#1D1D1F] mb-1.5">
                  Application Statement / Curation Experience <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText size={16} className="absolute left-4 top-4 text-[#71717A] pointer-events-none" />
                  <textarea
                    required
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe your background in luxury fashion curation, catalog moderation, or platform governance..."
                    className="w-full p-4 pl-11 rounded-xl bg-[#FAFAF9] border border-[#ECECEC] text-[14px] text-[#1D1D1F] outline-none focus:border-[#1D1D1F] transition-all resize-none"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-[#1D1D1F] text-white font-bold text-[14px] hover:bg-[#F07020] transition-colors cursor-pointer border-none shadow-md flex items-center justify-center gap-2 touch-manipulation disabled:opacity-50"
              >
                {loading ? "Submitting Application..." : "Submit Candidate Application"}
                {!loading && <Upload size={16} />}
              </button>
            </form>
          </div>
        )}
      </div>

      <footer className="text-center text-[12px] text-[#71717A] mt-12 pt-6 border-t border-[#ECECEC]">
        Weavly Executive Curation Portal • Protected by Resend 2FA Authorization
      </footer>
    </div>
  );
}
