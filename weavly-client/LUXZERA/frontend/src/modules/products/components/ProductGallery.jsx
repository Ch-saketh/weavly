// src/components/ProductGallery.jsx

import { useState } from "react";
import ImageModal from "@/shared/components/ui/ImageModal";

export default function ProductGallery({ images = [] }) {

  // SAFE FALLBACK
  const safeImages =
    images.length > 0
      ? images
      : [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80"
        ];

  const [activeImage, setActiveImage] = useState(
    safeImages[0]
  );

  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-[90px_1fr] gap-4">

        {/* Thumbnails */}
        <div className="flex flex-col gap-3">

          {safeImages.map((img, index) => (

            <button
              key={index}
              onClick={() => setActiveImage(img)}
              className={`border overflow-hidden transition-all
                ${
                  activeImage === img
                    ? "border-[#0b2240]"
                    : "border-slate-200"
                }`}
            >
              <img
                src={img}
                alt=""
                className="w-full h-24 object-cover"
              />
            </button>

          ))}

        </div>

        {/* Main Image */}
        <div
          onClick={() => setOpen(true)}
          className="cursor-zoom-in bg-slate-50 overflow-hidden flex items-center justify-center"
        >

          <img
            src={activeImage}
            alt=""
            className="w-full max-h-[700px] object-contain hover:scale-105 transition-transform duration-500"
          />

        </div>

      </div>

      {/* Modal */}
      {open && (
        <ImageModal
          image={activeImage}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}