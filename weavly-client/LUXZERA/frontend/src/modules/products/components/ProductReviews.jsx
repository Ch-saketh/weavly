// src/components/ProductReviews.jsx
import { useState } from "react";
import { X, Maximize2, ChevronDown, ChevronUp } from "lucide-react";

export default function ProductReviews({ reviews = [] }) {
  const [activeMediaModal, setActiveMediaModal] = useState(null);
  const [expandedTextIndex, setExpandedTextIndex] = useState({});

  const toggleTextExpand = (index) => {
    setExpandedTextIndex((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (reviews.length === 0) {
    return (
      <div className="p-10 text-center text-xs font-bold uppercase tracking-widest text-slate-400 border border-dashed border-slate-200 rounded-2xl">
        No feedback records copped yet.
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {reviews.map((r, index) => {
        const isLongText = r.review.length > 180;
        const isExpanded = expandedTextIndex[index];
        const displayedText = isLongText && !isExpanded 
          ? `${r.review.substring(0, 180)}...` 
          : r.review;

        return (
          <div 
            key={index} 
            className="border border-slate-100 p-6 bg-white rounded-2xl shadow-sm hover:border-slate-200 transition-all duration-300"
          >
            {/* Top Meta Data Bar Row */}
            <div className="flex items-center justify-between mb-3 select-none">
              <div>
                <p className="font-black uppercase text-xs tracking-wider text-[#0b2240]">
                  {r.name}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Verified Capsule Buyer
                </p>
              </div>
              <div className="text-[#ff5700] text-xs tracking-tighter select-none bg-slate-50 px-2 py-1 rounded-full border border-slate-100 font-bold">
                {"★".repeat(r.rating)}
              </div>
            </div>

            {/* Interactive Expandable Review Content Box */}
            <div 
              onClick={() => isLongText && toggleTextExpand(index)}
              className={`group relative ${isLongText ? "cursor-pointer" : ""}`}
            >
              <p className="text-slate-600 text-sm leading-relaxed font-medium transition-colors group-hover:text-[#0b2240]">
                {displayedText}
              </p>
              
              {isLongText && (
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#3b82f6] mt-1 group-hover:text-[#ff5700] transition-colors">
                  {isExpanded ? (
                    <>Show Less <ChevronUp size={12} /></>
                  ) : (
                    <>Read Full Feedback <ChevronDown size={12} /></>
                  )}
                </div>
              )}
            </div>

            {/* SPACE OPTIMIZED CLICK-TO-ENLARGE USER IMAGE */}
            {r.image && (
              <div 
                onClick={() => setActiveMediaModal({ type: "image", src: r.image })}
                className="mt-4 max-w-xl max-h-48 aspect-video overflow-hidden bg-slate-50 border border-slate-100 rounded-xl cursor-zoom-in group relative shadow-sm"
              >
                <img
                  src={r.image}
                  alt="User submission review asset"
                  className="w-full h-full object-cover object-center grayscale group-hover:grayscale-0 group-hover:scale-[1.02] transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Maximize2 size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                </div>
              </div>
            )}

            {/* SPACE OPTIMIZED CLICK-TO-ENLARGE USER VIDEO */}
            {r.video && (
              <div className="mt-4 max-w-xl max-h-48 aspect-video overflow-hidden bg-slate-50 border border-slate-100 rounded-xl relative group shadow-sm">
                <video className="w-full h-full object-cover">
                  <source src={r.video} type="video/mp4" />
                </video>
                {/* Visual Intercept Trigger Overlay to Enlarge Video instead of playing embedded miniature */}
                <div 
                  onClick={() => setActiveMediaModal({ type: "video", src: r.video })}
                  className="absolute inset-0 bg-black/10 hover:bg-black/30 cursor-zoom-in transition-colors flex items-center justify-center text-white font-black text-[10px] tracking-widest uppercase gap-1.5"
                >
                  <Maximize2 size={16} className="drop-shadow-md" />
                  Expand Media
                </div>
              </div>
            )}
            
          </div>
        );
      })}

      {/* ─── ISOLATED INTERNAL FULLSCALE MEDIA LIGHTBOX BACKDROP ─── */}
      {activeMediaModal && (
        <div 
          onClick={() => setActiveMediaModal(null)}
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-fade-in"
        >
          {/* Close Trigger Button */}
          <button 
            onClick={() => setActiveMediaModal(null)}
            className="absolute top-6 right-6 z-[130] w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>

          {/* Interactive Zoom Window Box */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative w-full h-full max-w-4xl max-h-[80vh] flex items-center justify-center animate-scale-up"
          >
            {activeMediaModal.type === "image" ? (
              <img 
                src={activeMediaModal.src} 
                alt="Enlarged review detail" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none" 
              />
            ) : (
              <video 
                controls 
                autoPlay
                className="max-w-full max-h-full rounded-lg shadow-2xl"
              >
                <source src={activeMediaModal.src} type="video/mp4" />
                Your browser does not support integrated playback.
              </video>
            )}
          </div>
        </div>
      )}
    </div>
  );
}