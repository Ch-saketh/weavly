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
      } else if (data && Array.isArray(data.content)) {
        setImages(data.content);
      } else {
        setImages([]);
      }
    } catch (err) {
      console.warn("Recommendation images sync note:", err?.message || err);
      setImages([]);
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
    try {
      if (userId && !String(userId).startsWith("customer_dev_")) {
        await deleteRecommendationImage(userId, imageId);
      }
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      setSuccessMsg("Inspiration image removed.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to delete image.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="border border-[#183B56] bg-[#F5EFEB] p-12 flex items-center justify-center shadow-xs">
        <Loader />
      </div>
    );
  }

  return (
    <div className="border border-[#183B56] bg-[#F5EFEB] p-6 sm:p-8 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#183B56]">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={14} className="text-[#183B56]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184]">
              Visual Mood Board
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#183B56]">
            Style Inspiration Gallery
          </h2>
          <p className="text-xs text-[#5A7184] mt-0.5">
            Upload outfits, aesthetics, or mood board images to help Zyra curate bespoke recommendations.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-5 py-2.5 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.2em] border-none shadow-xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
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
        <div className="p-3 bg-red-50 border border-red-300 text-xs font-bold text-red-800 flex items-center gap-2 shadow-xs">
          <AlertCircle size={15} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-[#DFE7ED] border border-[#183B56] text-xs font-bold text-[#183B56] flex items-center gap-2 shadow-xs">
          <Check size={15} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Images Grid */}
      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-[#183B56] bg-[#DFE7ED]/20 hover:bg-[#DFE7ED]/40 p-12 text-center transition-all cursor-pointer group shadow-xs"
        >
          <div className="w-14 h-14 bg-white border border-[#183B56] shadow-xs flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
            <Upload size={20} className="text-[#183B56]" />
          </div>
          <h3 className="text-sm font-bold text-[#183B56] mb-1">No style inspiration images yet</h3>
          <p className="text-xs text-[#5A7184] max-w-sm mx-auto mb-4 leading-relaxed">
            Upload favorite outfit photos, fashion inspiration, or pieces you love. Zyra will use these visual cues to refine your personal feed.
          </p>
          <span className="inline-block px-4 py-2 bg-white border border-[#183B56] text-xs font-bold uppercase tracking-wider text-[#183B56] shadow-xs">
            Browse files to upload
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-[3/4] border border-[#183B56] bg-[#DFE7ED] overflow-hidden shadow-xs"
            >
              <img
                src={img.imageUrl}
                alt="Style inspiration"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-[#183B56]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img.id)}
                  disabled={deletingId === img.id}
                  className="p-2.5 bg-white text-[#183B56] border border-[#183B56] rounded-full shadow-xs transition-transform hover:scale-110 cursor-pointer"
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
            className="aspect-[3/4] border border-dashed border-[#183B56] bg-[#DFE7ED]/20 hover:bg-[#DFE7ED]/40 flex flex-col items-center justify-center text-[#183B56] transition-all cursor-pointer group shadow-xs"
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
