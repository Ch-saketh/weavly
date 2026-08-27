// src/components/ImageModal.jsx


import { X } from "lucide-react";
import { useEffect } from "react";

export default function ImageModal({ image, onClose }) {
  // Prevent body scrolling when zoom modal views are active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10 backdrop-blur-sm animate-fade-in">
      {/* Top Controls Bar */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 text-white/70 hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-full"
        aria-label="Close modal zoom screen"
      >
        <X size={24} strokeWidth={2.5} />
      </button>

      {/* Frame container */}
      <div 
        className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center"
        onClick={onClose}
      >
        <img
          src={image}
          alt=""
          className="max-w-full max-h-full object-contain shadow-2xl select-none"
          onClick={(e) => e.stopPropagation()} 
        />
      </div>
    </div>
  );
}