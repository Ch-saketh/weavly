"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  ExternalLink,
  Sparkles,
  Scissors,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Send,
  X,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import { getPublicDesignerProfile, submitCustomizationRequest, recordProfileView } from "../services/designerService";
import { useAuth } from "@/modules/auth/store/useAuth";

const NEUTRAL_FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800' fill='none'%3E%3Crect width='600' height='800' fill='%23DFE7ED'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='16' font-weight='700' fill='%23183B56' text-anchor='middle' letter-spacing='2'%3EWEAVLY CREATOR%3C/text%3E%3C/svg%3E";

export default function PublicDesignerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const designerId = params?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Commission Modal State
  const [commissionModalOpen, setCommissionModalOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(null);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    description: "",
    preferredColor: "",
    preferredFabric: "",
    budget: "",
    bust: "",
    waist: "",
    hips: "",
    height: "",
    requestedDate: "",
  });

  useEffect(() => {
    if (!designerId) return;
    setLoading(true);
    recordProfileView(designerId);
    getPublicDesignerProfile(designerId)
      .then((res) => setData(res))
      .catch((err) => setError(err.message || "Failed to load designer profile"))
      .finally(() => setLoading(false));
  }, [designerId]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.name || user.displayName || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
        customerPhone: user.phone || prev.customerPhone,
      }));
    }
  }, [user]);

  const handleOpenCommission = (designItem) => {
    setSelectedDesign(designItem || null);
    setCommissionModalOpen(true);
    setRequestSuccess(null);
    setFormError(null);
  };

  const handleCommissionSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.description.trim()) {
      setFormError("Please describe your custom design requirements.");
      return;
    }
    if (!formData.customerEmail.trim()) {
      setFormError("Please enter your email.");
      return;
    }

    setFormSubmitting(true);

    try {
      const payload = {
        ...formData,
        designerId: designerId,
        designId: selectedDesign?.designId || null,
        referenceImage: selectedDesign?.primaryImageUrl || null,
        budget: formData.budget ? Number(formData.budget) : selectedDesign?.estimatedPrice || null,
        bust: formData.bust ? Number(formData.bust) : null,
        waist: formData.waist ? Number(formData.waist) : null,
        hips: formData.hips ? Number(formData.hips) : null,
        height: formData.height ? Number(formData.height) : null,
      };

      const res = await submitCustomizationRequest(payload);
      setRequestSuccess(res);
    } catch (err) {
      setFormError(err.message || "Failed to submit request");
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5EFEB] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#183B56] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data?.profile) {
    return (
      <div className="min-h-screen bg-[#F5EFEB] flex items-center justify-center p-6">
        <div className="border border-[#183B56] bg-[#F5EFEB] p-8 text-center max-w-md shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-[#183B56]">Designer Not Found</h2>
          <p className="text-xs text-[#5A7184]">{error || "This designer profile is currently unavailable."}</p>
          <button
            onClick={() => router.push("/designers")}
            className="py-2.5 px-6 bg-[#183B56] text-white text-xs font-bold uppercase tracking-wider border-none cursor-pointer"
          >
            Back to Designers
          </button>
        </div>
      </div>
    );
  }

  const { profile, publishedDesigns } = data;

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-28">
      {/* Cover Banner */}
      <div className="h-56 sm:h-72 w-full bg-[#183B56] relative overflow-hidden border-b border-[#183B56]">
        {profile.coverImageUrl && (
          <img src={profile.coverImageUrl} alt="Atelier Cover" className="w-full h-full object-cover opacity-35" />
        )}
      </div>

      {/* Profile Header Card */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 -mt-24 relative z-10 space-y-10">
        <div className="border border-[#183B56] bg-[#F5EFEB] p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-[#183B56]">
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-[#183B56] bg-white overflow-hidden shrink-0 flex items-center justify-center text-3xl font-bold text-[#183B56]">
                {profile.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{(profile.displayName || "D")[0]}</span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#183B56]">
                    {profile.displayName}
                  </h1>
                  <ShieldCheck size={18} className="text-[#183B56]" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#5A7184] mt-0.5">
                  {profile.brandName || "Independent Couture Studio"}
                </p>

                <div className="flex flex-wrap items-center gap-2.5 mt-3">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-white border border-[#183B56] text-[#183B56]">
                    {profile.designerId}
                  </span>
                  {profile.location && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#5A7184] bg-white border border-[#183B56]/30 px-2 py-0.5">
                      <MapPin size={11} /> {profile.location}
                    </span>
                  )}
                  {profile.specialization && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white border border-[#183B56] text-[#183B56] px-2.5 py-0.5">
                      <Scissors size={11} /> {profile.specialization}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleOpenCommission(null)}
                className="py-3 px-6 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.16em] border-none cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles size={14} />
                <span>Commission Custom Garment</span>
              </button>

              {profile.externalWebsiteUrl && (
                <a
                  href={profile.externalWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white border border-[#183B56] hover:bg-[#183B56] hover:text-white text-[#183B56] transition-all shrink-0 flex items-center justify-center"
                  title="Visit Designer Website"
                >
                  <ExternalLink size={15} />
                </a>
              )}
            </div>
          </div>

          {/* Bio & Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-xs">
            <div className="md:col-span-2 space-y-4">
              {profile.bio && (
                <div>
                  <h4 className="font-bold text-[#183B56] uppercase tracking-wider text-[11px] mb-1">
                    Atelier Biography
                  </h4>
                  <p className="text-[#5A7184] leading-relaxed">{profile.bio}</p>
                </div>
              )}
              {profile.designPhilosophy && (
                <div>
                  <h4 className="font-bold text-[#183B56] uppercase tracking-wider text-[11px] mb-1">
                    Design Philosophy
                  </h4>
                  <p className="text-[#5A7184] leading-relaxed italic">&ldquo;{profile.designPhilosophy}&rdquo;</p>
                </div>
              )}
            </div>

            <div className="border-t md:border-t-0 md:border-l border-[#183B56]/30 md:pl-6 space-y-3">
              {profile.experienceYears && (
                <div>
                  <span className="text-[10px] font-bold text-[#5A7184] uppercase block">Experience</span>
                  <span className="font-bold text-[#183B56] text-sm">{profile.experienceYears} Years Atelier Practice</span>
                </div>
              )}
              {profile.servicesOffered && (
                <div>
                  <span className="text-[10px] font-bold text-[#5A7184] uppercase block">Services</span>
                  <span className="font-bold text-[#183B56]">{profile.servicesOffered}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── PUBLISHED CREATIONS / LOOKBOOK ── */}
        <section className="space-y-6">
          <div className="border-b border-[#183B56] pb-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#183B56] uppercase">
              Atelier Lookbook ({publishedDesigns?.length || 0})
            </h2>
          </div>

          {publishedDesigns && publishedDesigns.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedDesigns.map((design) => (
                <div
                  key={design.designId}
                  onClick={() => router.push(`/designs/${design.designId}`)}
                  className="border border-[#183B56] bg-[#F5EFEB] flex flex-col justify-between shadow-xs hover:bg-[#183B56]/[0.02] transition-colors cursor-pointer group"
                >
                  <div>
                    <div className="aspect-[3/3.8] bg-[#DFE7ED] border-b border-[#183B56] relative overflow-hidden flex items-center justify-center p-4">
                      <img
                        src={design.primaryImageUrl || NEUTRAL_FALLBACK_IMAGE}
                        alt={design.title}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 space-y-1">
                      <div className="text-[10px] font-bold uppercase text-[#5A7184]">{design.category}</div>
                      <h3 className="font-bold text-sm text-[#183B56] group-hover:underline line-clamp-1">{design.title}</h3>
                      <div className="font-bold text-xs text-[#183B56] pt-1">
                        {design.estimatedPrice ? `₹${Number(design.estimatedPrice).toLocaleString("en-IN")}` : "Price on request"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-[#183B56] bg-[#F5EFEB] p-12 text-center text-xs text-[#5A7184]">
              No published designs in this lookbook yet.
            </div>
          )}
        </section>
      </div>

      {/* ── COMMISSION MODAL ── */}
      {commissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183B56]/50 backdrop-blur-xs">
          <div className="bg-[#F5EFEB] border border-[#183B56] w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => { setCommissionModalOpen(false); setRequestSuccess(null); }}
              className="absolute top-4 right-4 text-[#183B56] hover:opacity-75 cursor-pointer border-none bg-transparent"
            >
              <X size={18} />
            </button>

            {requestSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 size={36} className="text-[#2E7D32] mx-auto" />
                <h3 className="text-xl font-bold text-[#183B56]">Commission Dispatched</h3>
                <p className="text-xs text-[#5A7184] max-w-sm mx-auto">
                  Your custom design brief has been sent to {profile.displayName}.
                </p>
                <div className="font-mono text-xs font-bold bg-white border border-[#183B56] py-2 px-4 inline-block text-[#183B56] mt-2">
                  Reference: {requestSuccess.requestId || "OK"}
                </div>
              </div>
            ) : (
              <form onSubmit={handleCommissionSubmit} className="space-y-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184]">
                    Atelier Commission
                  </div>
                  <h3 className="text-xl font-bold text-[#183B56]">
                    Commission with {profile.displayName}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full py-2 px-3 bg-white border border-[#183B56] text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full py-2 px-3 bg-white border border-[#183B56] text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                      Design Notes & Specific Requirements *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe the occasion, silhouette style, and any specific preferences..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full py-2 px-3 bg-white border border-[#183B56] text-xs outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-3 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.16em] border-none cursor-pointer flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <Scissors size={13} />
                    <span>{formSubmitting ? "Dispatching..." : "Send Commission to Atelier"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
