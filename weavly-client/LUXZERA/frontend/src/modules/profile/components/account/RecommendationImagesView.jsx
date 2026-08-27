import React, { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Plus, ImageIcon, Sparkles, AlertCircle, Check } from "lucide-react";
import {
  getRecommendationImages,
  uploadRecommendationImage,
  deleteRecommendationImage,
} from "@/modules/profile/services/recommendationImageService";
import Loader from "@/shared/components/ui/Loader";

const RecommendationImagesView = ({ userId }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef(null);

  const fetchImages = async () => {
    if (!userId || String(userId).startsWith("customer_dev_")) {
      setLoading(false);
      return;
    }
    try {
      const data = await getRecommendationImages(userId);
      if (Array.isArray(data)) {
        setImages(data);
      }
    } catch (err) {
      console.error("Failed to load recommendation images", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [userId]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      for (const file of files) {
        if (userId && !String(userId).startsWith("customer_dev_")) {
          const uploaded = await uploadRecommendationImage(userId, file);
          setImages((prev) => [uploaded, ...prev]);
        } else {
          // Dev local mock preview
          const mockObj = {
            id: "rec_" + Date.now() + "_" + Math.random().toString(36).substring(7),
            imageUrl: URL.createObjectURL(file),
            createdAt: new Date().toISOString(),
          };
          setImages((prev) => [mockObj, ...prev]);
        }
      }
      setSuccessMsg(`Successfully uploaded ${files.length} style inspiration image(s).`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteImage = async (imageId) => {
    setDeletingId(imageId);
    setErrorMsg("");
    try {
      if (userId && !String(userId).startsWith("customer_dev_")) {
        await deleteRecommendationImage(userId, imageId);
      }
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      setSuccessMsg("Image removed.");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to delete image.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 select-none">
        <Loader size="w-12 h-12" />
        <div className="text-[10px] tracking-[0.45em] font-semibold text-slate-400/80 mt-5 uppercase animate-pulse pl-[0.45em]">
          Weavly
        </div>
      </div>
    );
  }

  return (
    <div className="relative font-['Plus_Jakarta_Sans',sans-serif]">
      {uploading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-20">
          <Loader size="w-10 h-10" />
        </div>
      )}

      {/* Header */}
      <div className="pb-6 border-b border-slate-100 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#2D3436] tracking-tight">Style Inspiration Gallery</h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload outfits, aesthetics, or mood board images to help Zyra curate tailored recommendations.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2.5 bg-[#C8702A] hover:bg-[#A85E22] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>Upload Image</span>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        multiple
        className="hidden"
      />

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-700 flex items-center gap-2">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Images Grid */}
      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-[#C8702A] bg-slate-50/50 hover:bg-orange-50/20 rounded-2xl p-12 text-center transition-all cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload size={22} className="text-[#C8702A]" />
          </div>
          <h3 className="text-sm font-bold text-[#2D3436] mb-1">No style inspiration images yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4 leading-relaxed">
            Upload favorite outfit photos, fashion inspiration, or pieces you love. Zyra will use these visual cues to refine your personal feed.
          </p>
          <span className="inline-block px-4 py-2 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl shadow-2xs group-hover:border-[#C8702A] transition-colors">
            Browse files to upload
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-3/4 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-2xs"
            >
              <img
                src={img.imageUrl}
                alt="Style inspiration"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img.id)}
                  disabled={deletingId === img.id}
                  className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-transform hover:scale-110"
                  title="Delete image"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* Add more button tile */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-3/4 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#C8702A] bg-slate-50/50 hover:bg-orange-50/20 flex flex-col items-center justify-center text-slate-400 hover:text-[#C8702A] transition-all group"
          >
            <Plus size={24} className="group-hover:scale-110 transition-transform mb-1" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Add More</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendationImagesView;
