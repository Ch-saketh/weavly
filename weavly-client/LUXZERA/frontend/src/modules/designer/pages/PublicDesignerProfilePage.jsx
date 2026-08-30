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
} from "lucide-react";
import { getPublicDesignerProfile, submitCustomizationRequest, recordProfileView } from "../services/designerService";
import { useAuth } from "@/modules/auth/store/useAuth";

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
      }));
    }
  }, [user]);

  const handleOpenCommission = (design = null) => {
    setSelectedDesign(design);
    setCommissionModalOpen(true);
    setRequestSuccess(null);
    setFormError(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const measurements = {
        bust: formData.bust ? Number(formData.bust) : null,
        waist: formData.waist ? Number(formData.waist) : null,
        hips: formData.hips ? Number(formData.hips) : null,
        height: formData.height || null,
      };

      const payload = {
        designerId: data.profile.designerId,
        designId: selectedDesign?.designId || null,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone || null,
        description: formData.description,
        preferredColor: formData.preferredColor || null,
        preferredFabric: formData.preferredFabric || null,
        measurementsJson: JSON.stringify(measurements),
        budget: formData.budget ? Number(formData.budget) : null,
        requestedCompletionDate: formData.requestedDate || null,
      };

      const res = await submitCustomizationRequest(payload);
      setRequestSuccess(res);
    } catch (err) {
      setFormError(err.message || "Failed to submit custom request");
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#1D1D1F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#86868B]">Loading atelier portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.profile) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl border border-[#ECECEC] text-center max-w-md">
          <h2 className="text-lg font-bold text-[#1D1D1F] mb-2 font-serif">Designer Not Found</h2>
          <p className="text-xs text-[#86868B] mb-6">{error || "This designer profile is currently unavailable."}</p>
          <button
            onClick={() => router.push("/designers")}
            className="px-5 py-2 rounded-full bg-[#1D1D1F] text-white text-xs font-medium"
          >
            Back to Designers
          </button>
        </div>
      </div>
    );
  }

  const { profile, publishedDesigns } = data;

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] pb-28">
      {/* Cover Banner */}
      <div className="h-56 sm:h-72 w-full bg-gradient-to-r from-[#1D1D1F] via-[#2F2F32] to-[#1D1D1F] relative overflow-hidden">
        {profile.coverImageUrl && (
          <img src={profile.coverImageUrl} alt="Atelier Cover" className="w-full h-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Profile Header Card */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 -mt-24 relative z-10">
        <div className="bg-white rounded-3xl border border-[#ECECEC] p-6 sm:p-10 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-[#ECECEC]">
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#F4F1EC] border-2 border-white shadow-md overflow-hidden shrink-0 flex items-center justify-center text-3xl font-bold text-[#1D1D1F]">
                {profile.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{(profile.displayName || "D")[0]}</span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-[#1D1D1F]">
                    {profile.displayName}
                  </h1>
                  <ShieldCheck size={20} className="text-[#F07020]" />
                </div>
                <p className="text-sm font-medium text-[#86868B] mt-0.5">
                  {profile.brandName || "Independent Couture Studio"}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-1 bg-[#F4F1EC] text-[#8C827A] rounded-md">
                    {profile.designerId}
                  </span>
                  {profile.location && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#6E6E73]">
                      <MapPin size={12} className="text-[#F07020]" /> {profile.location}
                    </span>
                  )}
                  {profile.specialization && (
                    <span className="inline-flex items-center gap-1 text-xs bg-[#F07020]/10 text-[#F07020] px-2.5 py-0.5 rounded-full font-medium">
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
                className="flex-1 sm:flex-initial px-6 py-3 rounded-full bg-[#F07020] hover:bg-[#e06214] text-white font-medium text-xs transition-all shadow-lg shadow-[#F07020]/25 flex items-center justify-center gap-2"
              >
                <Sparkles size={14} /> Commission Custom Garment
              </button>

              {profile.externalWebsiteUrl && (
                <a
                  href={profile.externalWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-[#FAFAF9] border border-[#ECECEC] hover:bg-[#F0F0F0] text-[#1D1D1F] transition-all shrink-0"
                  title="Visit Designer's Website"
                >
                  <ExternalLink size={16} />
                </a>
              )}
              {profile.instagramHandle && (
                <a
                  href={`https://instagram.com/${profile.instagramHandle.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-[#FAFAF9] border border-[#ECECEC] hover:bg-[#F0F0F0] text-[#1D1D1F] transition-all shrink-0"
                  title="Instagram"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Biography & Philosophy Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#86868B]">Atelier Story</h3>
              <p className="text-sm text-[#3A3A3C] leading-relaxed font-normal whitespace-pre-line">
                {profile.bio || "Crafting original bespoke fashion tailored to the modern wardrobe."}
              </p>

              {profile.designPhilosophy && (
                <div className="mt-6 p-4 rounded-2xl bg-[#FAFAF9] border border-[#ECECEC]">
                  <h4 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#F07020]" /> Design Philosophy
                  </h4>
                  <p className="text-xs text-[#6E6E73] italic leading-relaxed">
                    "{profile.designPhilosophy}"
                  </p>
                </div>
              )}
            </div>

            {/* Atelier Specs */}
            <div className="space-y-4 border-t md:border-t-0 md:border-l border-[#ECECEC] pt-6 md:pt-0 md:pl-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#86868B]">Atelier Highlights</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#86868B] block">Experience</span>
                  <span className="font-semibold text-[#1D1D1F]">
                    {profile.experienceYears ? `${profile.experienceYears} Years of Practice` : "Established Atelier"}
                  </span>
                </div>
                {profile.qualifications && (
                  <div>
                    <span className="text-[#86868B] block">Qualifications</span>
                    <span className="font-semibold text-[#1D1D1F]">{profile.qualifications}</span>
                  </div>
                )}
                {profile.skills && (
                  <div>
                    <span className="text-[#86868B] block">Core Skills & Techniques</span>
                    <span className="font-medium text-[#1D1D1F]">{profile.skills}</span>
                  </div>
                )}
                <div>
                  <span className="text-[#86868B] block">Customization</span>
                  <span className="font-semibold text-[#1D1D1F]">
                    {profile.customizationAvailable ? "Bespoke Orders Welcomed" : "Limited Lookbooks Only"}
                  </span>
                </div>
                {profile.servicesOffered && (
                  <div>
                    <span className="text-[#86868B] block">Services</span>
                    <span className="font-semibold text-[#1D1D1F]">{profile.servicesOffered}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Published Creations Showcase */}
        <section className="pt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold font-serif text-[#1D1D1F]">
                Creations by {profile.displayName}
              </h2>
              <p className="text-xs text-[#86868B] mt-1">
                Original designs available for custom tailoring and purchase.
              </p>
            </div>
            <span className="text-xs font-medium text-[#86868B]">
              {publishedDesigns.length} {publishedDesigns.length === 1 ? "Design" : "Designs"}
            </span>
          </div>

          {publishedDesigns.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {publishedDesigns.map((design) => (
                <div
                  key={design.designId}
                  className="bg-white rounded-2xl border border-[#ECECEC] overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                >
                  <div
                    onClick={() => router.push(`/designs/${design.designId}`)}
                    className="cursor-pointer"
                  >
                    <div className="aspect-[3/4] bg-[#F4F1EC] relative overflow-hidden">
                      <img
                        src={design.primaryImageUrl}
                        alt={design.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 text-[10px] font-medium bg-black/60 text-white px-2.5 py-1 rounded-md backdrop-blur-md">
                        {design.category}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="font-semibold text-base text-[#1D1D1F] group-hover:text-[#F07020] transition-colors line-clamp-1">
                        {design.title}
                      </h3>
                      <p className="text-xs text-[#6E6E73] line-clamp-2 mt-1 leading-relaxed">
                        {design.description || "Original handcrafted creation."}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-bold text-[#1D1D1F]">
                          {design.estimatedPrice ? `₹${design.estimatedPrice.toLocaleString()}` : "Price upon request"}
                        </span>
                        <span className="text-[11px] text-[#86868B]">
                          {design.targetAudience}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      onClick={() => handleOpenCommission(design)}
                      className="w-full py-2.5 rounded-xl bg-[#1D1D1F] hover:bg-[#F07020] text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={13} /> Customize This Piece
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-[#ECECEC] p-8">
              <Scissors size={28} className="mx-auto text-[#8C827A] mb-3" />
              <h4 className="text-sm font-semibold text-[#1D1D1F]">No Published Designs Yet</h4>
              <p className="text-xs text-[#86868B] mt-1 mb-5">
                This atelier has not published public designs yet. You can still commission a bespoke piece directly.
              </p>
              <button
                onClick={() => handleOpenCommission(null)}
                className="px-5 py-2 rounded-full bg-[#F07020] text-white text-xs font-medium"
              >
                Request Custom Piece
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Commission Garment Modal */}
      {commissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#ECECEC] w-full max-w-xl p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setCommissionModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#F0F0F0] text-[#6E6E73] transition-colors"
            >
              <X size={18} />
            </button>

            {requestSuccess ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold font-serif text-[#1D1D1F]">
                  Customization Request Submitted!
                </h3>
                <p className="text-xs text-[#6E6E73] max-w-md mx-auto leading-relaxed">
                  Your request has been forwarded directly to <strong className="text-[#1D1D1F]">{profile.displayName}</strong> with Reference ID:
                </p>
                <div className="font-mono text-sm font-bold bg-[#FAFAF9] border border-[#ECECEC] py-2 px-4 rounded-xl inline-block text-[#1D1D1F]">
                  {requestSuccess.requestId}
                </div>
                <p className="text-xs text-[#86868B]">
                  The designer will review your specifications and reach out to {formData.customerEmail}.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setCommissionModalOpen(false)}
                    className="px-6 py-2.5 rounded-full bg-[#1D1D1F] text-white text-xs font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#F07020]">
                    Direct Atelier Commission
                  </span>
                  <h3 className="text-xl font-bold font-serif text-[#1D1D1F] mt-1">
                    {selectedDesign ? `Customize "${selectedDesign.title}"` : `Request Custom Design from ${profile.displayName}`}
                  </h3>
                  <p className="text-xs text-[#86868B] mt-1">
                    Provide your requirements and measurements to receive a tailored garment quote.
                  </p>
                </div>

                {formError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-[#1D1D1F] mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="e.g. Sophia Vance"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#1D1D1F] mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        placeholder="sophia@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-[#1D1D1F] mb-1">Description & Requirements *</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the silhouette, neckline, sleeve length, occasion, and any specific styling preferences..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-[#1D1D1F] mb-1">Preferred Color</label>
                      <input
                        type="text"
                        value={formData.preferredColor}
                        onChange={(e) => setFormData({ ...formData, preferredColor: e.target.value })}
                        placeholder="e.g. Emerald Green"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#1D1D1F] mb-1">Preferred Fabric</label>
                      <input
                        type="text"
                        value={formData.preferredFabric}
                        onChange={(e) => setFormData({ ...formData, preferredFabric: e.target.value })}
                        placeholder="e.g. Mulberry Silk"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Body Measurements (Optional) */}
                  <div className="pt-2 border-t border-[#ECECEC]">
                    <span className="block font-semibold text-[#1D1D1F] mb-2">Body Measurements (Inches, Optional)</span>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <input
                          type="number"
                          placeholder="Bust"
                          value={formData.bust}
                          onChange={(e) => setFormData({ ...formData, bust: e.target.value })}
                          className="w-full px-2.5 py-2 rounded-lg border border-[#ECECEC] bg-[#FAFAF9] text-center text-xs"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Waist"
                          value={formData.waist}
                          onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                          className="w-full px-2.5 py-2 rounded-lg border border-[#ECECEC] bg-[#FAFAF9] text-center text-xs"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Hips"
                          value={formData.hips}
                          onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                          className="w-full px-2.5 py-2 rounded-lg border border-[#ECECEC] bg-[#FAFAF9] text-center text-xs"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Height (5'7)"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                          className="w-full px-2.5 py-2 rounded-lg border border-[#ECECEC] bg-[#FAFAF9] text-center text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-medium text-[#1D1D1F] mb-1">Target Budget (₹)</label>
                      <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        placeholder="e.g. 15000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#1D1D1F] mb-1">Needed By</label>
                      <input
                        type="date"
                        value={formData.requestedDate}
                        onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setCommissionModalOpen(false)}
                      className="px-5 py-2.5 rounded-full hover:bg-[#F0F0F0] text-[#6E6E73] font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="px-6 py-2.5 rounded-full bg-[#F07020] hover:bg-[#e06214] text-white font-medium shadow-md flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {formSubmitting ? "Submitting..." : "Send Request to Designer"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
