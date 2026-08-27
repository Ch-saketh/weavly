import { useState } from "react";
import { ArrowLeft, ChevronDown, ShoppingBag, Star, Truck } from "lucide-react";
import BetaNoticeModal from "@/shared/components/common/BetaNoticeModal";

export default function MobileProductDetail({
  product,
  selectedSize,
  setSelectedSize,
  addToCart,
  navigate,
  descOpen,
  setDescOpen,
  detailsOpen,
  setDetailsOpen,
  commitmentOpen,
  setCommitmentOpen,
}) {
  const [betaModalOpen, setBetaModalOpen] = useState(false);
  const images = product.images?.length ? product.images : [product.image];

  return (
    <div className="min-h-screen bg-white font-sans lg:hidden">
      <div className="sticky top-14 z-30 bg-white/92 backdrop-blur border-b border-[#E7E3DD] px-4 py-3">
        <button onClick={() => { if (typeof window !== "undefined") window.history.back(); }} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#2B2B2B]/60">
          <ArrowLeft size={14} />
          Back
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 py-4 snap-x snap-mandatory scrollbar-none">
        {images.map((image, index) => (
          <div key={`${image}-${index}`} className="snap-center shrink-0 w-[84vw] aspect-[4/5] overflow-hidden rounded-[2rem] border border-[#E7E3DD] bg-[#F2EFEA]">
            <img src={image} alt={`${product.name} view ${index + 1}`} className="h-full w-full object-cover object-top" />
          </div>
        ))}
      </div>

      <section className="px-5 pb-28">
        <div className="rounded-[2rem] border border-[#E7E3DD] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C6A15B]">
                {product.brand}
              </p>
              <h1 className="mt-2 text-3xl font-black uppercase leading-[0.95] tracking-[-0.04em] text-[#2B2B2B]">
                {product.name}
              </h1>
            </div>
            <span className="shrink-0 text-2xl font-black text-[#C97A5A]">
              ${product.price.toFixed(0)}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#2B2B2B]/55">
            <Star size={13} className="fill-[#C6A15B] text-[#C6A15B]" />
            4.9 rated · express delivery
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#2B2B2B]/50">Size</span>
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#5B6EF5]">Guide</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.sizes?.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`h-12 rounded-full border text-[11px] font-black uppercase ${
                    selectedSize === size
                      ? "bg-[#2B2B2B] text-[#FAF9F7] border-[#2B2B2B]"
                      : "bg-white text-[#2B2B2B]/65 border-[#E7E3DD]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-[#F2EFEA] p-4 flex items-start gap-3">
            <Truck size={17} className="mt-0.5 text-[#5B6EF5]" />
            <p className="text-[12px] leading-5 font-semibold text-[#2B2B2B]/60">
              Complimentary express delivery and easy returns on eligible products.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-[2rem] border border-[#E7E3DD] bg-white overflow-hidden">
          {[
            ["Description", descOpen, setDescOpen, "Premium heavyweight silhouette with structural high-fashion geometry and refined everyday movement."],
            ["Product Details", detailsOpen, setDetailsOpen, "Organic cotton blends, reinforced construction, premium trims, and curated seasonal finishing."],
            ["Commitment", commitmentOpen, setCommitmentOpen, "Responsible sourcing, limited-run inventory, and transparent customer support."],
          ].map(([label, open, setOpen, text]) => (
            <div key={label} className="border-b border-[#E7E3DD] last:border-0">
              <button onClick={() => setOpen(!open)} className="w-full px-5 py-4 flex items-center justify-between text-left text-[11px] font-black uppercase tracking-[0.22em] text-[#2B2B2B]">
                {label}
                <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
              {open && <p className="px-5 pb-5 text-[13px] leading-6 text-[#2B2B2B]/58 font-medium">{text}</p>}
            </div>
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E7E3DD] bg-white/95 backdrop-blur px-4 py-3">
        <button
          onClick={() => {
            addToCart({ ...product, size: selectedSize });
            setBetaModalOpen(true);
          }}
          className="h-14 w-full rounded-full bg-[#F07020] text-white text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-[0_12px_30px_rgba(240,112,32,0.22)] border-none cursor-pointer active:scale-[0.98] transition-transform"
        >
          <ShoppingBag size={15} />
          Add To Bag
        </button>
      </div>

      <BetaNoticeModal
        isOpen={betaModalOpen}
        onClose={() => setBetaModalOpen(false)}
        title="Added to Bag · Beta Notice"
        message="Item added! Weavly live checkout & pre-order servers are currently in Beta preview testing. Feel free to view your Bag or refresh to proceed."
      />
    </div>
  );
}
