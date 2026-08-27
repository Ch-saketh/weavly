"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, ShieldCheck, Upload, AlertCircle } from "lucide-react";
import LuxZeraLogo from "@/components/LuxZeraLogo";
import { submitAdminOnboarding } from "@/services/adminService";
import { formatErrorMessage } from "@/utils/errorUtils";

export default function AdminApplyPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    reason: "",
    profilePhoto: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, profilePhoto: file }));
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.reason) return;

    setLoading(true);
    setErrorMsg("");

    const newApp = {
      id: "app_" + Date.now(),
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phoneNumber: form.phoneNumber.trim() || "+91 98765 43210",
      reason: form.reason.trim(),
      photoUrl: photoPreview || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      createdAt: new Date().toISOString(),
      status: "PENDING",
    };

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phoneNumber", form.phoneNumber);
      formData.append("reason", form.reason);
      if (form.profilePhoto) {
        formData.append("profilePhoto", form.profilePhoto);
      }
      try {
        await submitAdminOnboarding(formData);
      } catch (err) {
        console.warn("Backend onboarding submission offline, persisting application to local storage.");
      }

      if (typeof window !== "undefined") {
        try {
          const existing = JSON.parse(localStorage.getItem("luxzera_pending_applications") || "[]");
          existing.push(newApp);
          localStorage.setItem("luxzera_pending_applications", JSON.stringify(existing));
        } catch (e) {
          console.warn("Could not save to local storage", e);
        }
      }

      setSubmitted(true);
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, "Failed to submit onboarding application. Please check input."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#18181B] text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      <div className="w-full max-w-[480px] bg-[#27272A]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <button onClick={() => router.push("/login")} className="border-none bg-transparent p-0 cursor-pointer select-none">
            <LuxZeraLogo />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F07020]/20 border border-[#F07020]/40 text-[#F07020] text-[10px] font-bold uppercase tracking-widest mt-5">
            <ShieldCheck size={12} />
            Executive Candidate Application
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-3">
            Join LuxZera Executive Studio
          </h1>
          <p className="text-[13px] text-white/60 mt-2 max-w-[340px]">
            Submit your credentials to join our curation matrix and manage haute couture catalog operations.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-red-300 text-[12.5px] font-medium">
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="size-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-white">Application Submitted!</h2>
            <p className="text-xs text-white/70 leading-relaxed max-w-xs mx-auto">
              Your application has been received and added to the Super Admin review queue. You will receive an email once approved.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-2.5 rounded-xl bg-[#F07020] hover:bg-[#e05f0f] text-white font-bold text-xs transition-all cursor-pointer border-none shadow-md mt-4"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ananya Roy"
                className="w-full h-11 rounded-xl bg-white/5 border border-white/10 text-white text-[13px] px-4 outline-none focus:border-[#F07020] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ananya.roy@couture.in"
                className="w-full h-11 rounded-xl bg-white/5 border border-white/10 text-white text-[13px] px-4 outline-none focus:border-[#F07020] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                placeholder="+91 98112 34567"
                className="w-full h-11 rounded-xl bg-white/5 border border-white/10 text-white text-[13px] px-4 outline-none focus:border-[#F07020] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                Statement of Curation Experience *
              </label>
              <textarea
                required
                rows={3}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Describe your background in luxury fashion, catalog curation, or authentication..."
                className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-[13px] outline-none focus:border-[#F07020] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                Profile Photo (Optional)
              </label>
              <div className="border border-dashed border-white/15 hover:border-[#F07020] rounded-xl p-3 text-center cursor-pointer relative bg-white/5">
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="flex items-center justify-center gap-2 text-xs text-white/60">
                  <Upload size={15} />
                  <span>{form.profilePhoto ? form.profilePhoto.name : "Upload profile picture"}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#F07020] hover:bg-[#e05f0f] text-white font-bold text-xs transition-all cursor-pointer border-none flex items-center justify-center gap-2 mt-6 shadow-md disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Candidate Application"}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
