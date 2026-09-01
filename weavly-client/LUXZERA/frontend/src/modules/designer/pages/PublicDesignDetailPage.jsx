"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  Scissors,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  ChevronLeft,
  Heart,
  Eye,
} from "lucide-react";
import { getPublicDesignById, submitCustomizationRequest, recordDesignView, recordDesignLike } from "../services/designerService";
import { useAuth } from "@/modules/auth/store/useAuth";

const NEUTRAL_FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800' fill='none'%3E%3Crect width='600' height='800' fill='%23DFE7ED'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='16' font-weight='700' fill='%23183B56' text-anchor='middle' letter-spacing='2'%3EWEAVLY CREATION%3C/text%3E%3C/svg%3E";

export default function PublicDesignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const designId = params?.id;

  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Customization Modal State
  const [modalOpen, setModalOpen] = useState(false);
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
    if (!designId) return;
    setLoading(true);
    recordDesignView(designId);
    getPublicDesignById(designId)
      .then((data) => {
        setDesign(data);
        setActiveImage(data.primaryImageUrl);
        setLikeCount(data.likesCount || 0);
      })
      .catch((err) => {
        console.warn("Failed to load design details:", err);
        setError("Design not found.");
      })
      .finally(() => setLoading(false));
  }, [designId]);

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

  const handleLike = async () => {
    if (liked || !designId) return;
    try {
      await recordDesignLike(designId);
      setLiked(true);
      setLikeCount((prev) => prev + 1);
    } catch (e) {
      console.warn("Failed to like:", e);
    }
  };

  const handleCustomizationSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.description.trim()) {
      setFormError("Please describe your custom adjustments or sizing requirements.");
      return;
    }
    if (!formData.customerEmail.trim()) {
      setFormError("Please enter your contact email.");
      return;
    }

    setFormSubmitting(true);

    try {
      const payload = {
        ...formData,
        designerId: design.designerId,
        designId: design.designId,
        referenceImage: activeImage || design.primaryImageUrl,
        budget: formData.budget ? Number(formData.budget) : design.estimatedPrice || null,
        bust: formData.bust ? Number(formData.bust) : null,
        waist: formData.waist ? Number(formData.waist) : null,
        hips: formData.hips ? Number(formData.hips) : null,
        height: formData.height ? Number(formData.height) : null,
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
      <div className="min-h-screen bg-[#F5EFEB] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#183B56] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="min-h-screen bg-[#F5EFEB] flex items-center justify-center p-6">
        <div className="border border-[#183B56] bg-[#F5EFEB] p-8 text-center max-w-md shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-[#183B56]">Design Silhouette Not Found</h2>
          <p className="text-xs text-[#5A7184]">{error || "This creation is currently unavailable."}</p>
          <button
            onClick={() => router.push("/designs")}
            className="py-2.5 px-6 bg-[#183B56] text-white text-xs font-bold uppercase tracking-wider border-none cursor-pointer"
          >
            Browse Lookbook
          </button>
        </div>
      </div>
    );
  }

  const allImages = [design.primaryImageUrl, ...(design.galleryImageUrls || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white py-10 pb-28">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24">
        {/* Breadcrumb / Back */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#183B56] hover:underline mb-8 cursor-pointer border-none bg-transparent p-0"
        >
          <ChevronLeft size={16} /> Back to Lookbook
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Image Gallery (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[3/3.8] bg-[#DFE7ED] border border-[#183B56] relative overflow-hidden flex items-center justify-center p-6 shadow-xs">
              <img
                src={activeImage || design.primaryImageUrl || NEUTRAL_FALLBACK_IMAGE}
                alt={design.title}
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>

            {allImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square border p-1 bg-[#DFE7ED] cursor-pointer transition-all ${
                      activeImage === img
                        ? "border-[#183B56] shadow-xs"
                        : "border-[#183B56]/30 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Design Specs & Commission CTA (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#183B56]">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white border border-[#183B56] text-[#183B56] px-2.5 py-1">
                {design.category}
              </span>
              <span className="text-[10px] text-[#5A7184] font-mono font-bold">{design.designId}</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#183B56]">
                {design.title}
              </h1>
              <p className="text-xs text-[#5A7184] leading-relaxed">
                {design.description || "Original handcrafted atelier silhouette."}
              </p>
            </div>

            {/* Designer Atelier Card */}
            <div
              onClick={() => router.push(`/designer-studio`)}
              className="p-4 border border-[#183B56] bg-white hover:bg-[#183B56]/5 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full border border-[#183B56] bg-[#DFE7ED] overflow-hidden flex items-center justify-center font-bold text-sm text-[#183B56]">
                  {design.designerProfileImage ? (
                    <img src={design.designerProfileImage} alt={design.designerName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(design.designerName || "D")[0]}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-xs text-[#183B56] group-hover:underline">
                      {design.designerName || "Weavly Couturier"}
                    </h4>
                    <ShieldCheck size={12} className="text-[#183B56]" />
                  </div>
                  <p className="text-[10px] text-[#5A7184]">Verified Master Creator</p>
                </div>
              </div>
              <span className="text-xs text-[#183B56] font-bold">Visit Atelier →</span>
            </div>

            {/* Price & Specs Table */}
            <div className="border border-[#183B56] bg-white divide-y divide-[#183B56]/30 text-xs">
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-[#5A7184] font-bold uppercase text-[10px]">Estimated Price</span>
                <span className="font-bold text-base text-[#183B56]">
                  {design.estimatedPrice ? `₹${Number(design.estimatedPrice).toLocaleString("en-IN")}` : "Price on request"}
                </span>
              </div>
              {design.style && (
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-[#5A7184] font-bold uppercase text-[10px]">Aesthetic Style</span>
                  <span className="font-bold text-[#183B56]">{design.style}</span>
                </div>
              )}
              {design.materials && (
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-[#5A7184] font-bold uppercase text-[10px]">Materials & Fabric</span>
                  <span className="font-bold text-[#183B56]">{design.materials}</span>
                </div>
              )}
              {design.targetAudience && (
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-[#5A7184] font-bold uppercase text-[10px]">Target Audience</span>
                  <span className="font-bold text-[#183B56]">{design.targetAudience}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setModalOpen(true)}
                className="w-full py-3.5 px-6 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.18em] border-none cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <Scissors size={14} />
                <span>Commission Custom Piece</span>
                <ArrowRight size={13} />
              </button>

              <button
                onClick={handleLike}
                className={`w-full py-2.5 px-4 bg-white border border-[#183B56] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  liked ? "text-[#183B56]" : "text-[#5A7184] hover:text-[#183B56]"
                }`}
              >
                <Heart size={13} className={liked ? "fill-[#183B56] text-[#183B56]" : ""} />
                <span>{liked ? "Saved to Moodboard" : "Save to Moodboard"} ({likeCount})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── CUSTOMIZATION MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183B56]/50 backdrop-blur-xs">
          <div className="bg-[#F5EFEB] border border-[#183B56] w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => { setModalOpen(false); setRequestSuccess(null); }}
              className="absolute top-4 right-4 text-[#183B56] hover:opacity-75 cursor-pointer border-none bg-transparent"
            >
              <X size={18} />
            </button>

            {requestSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 size={36} className="text-[#2E7D32] mx-auto" />
                <h3 className="text-xl font-bold text-[#183B56]">Commission Dispatched</h3>
                <p className="text-xs text-[#5A7184] max-w-sm mx-auto">
                  Your customization inquiry for &ldquo;{design.title}&rdquo; has been sent to the atelier.
                </p>
                <div className="font-mono text-xs font-bold bg-white border border-[#183B56] py-2 px-4 inline-block text-[#183B56] mt-2">
                  Reference: {requestSuccess.requestId || "OK"}
                </div>
              </div>
            ) : (
              <form onSubmit={handleCustomizationSubmit} className="space-y-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184]">
                    Custom Atelier Request
                  </div>
                  <h3 className="text-xl font-bold text-[#183B56]">
                    Customize: {design.title}
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
                      Customization Notes & Alterations *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Specify your sizing, color preference, neckline changes, or specific alterations..."
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
                    <span>{formSubmitting ? "Submitting..." : "Send Request to Atelier"}</span>
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
