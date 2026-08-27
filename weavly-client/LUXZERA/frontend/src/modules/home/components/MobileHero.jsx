import { ArrowRight, Sparkles } from "lucide-react";

const IMG_1 = "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=85";
const IMG_2 = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80";
const IMG_3 = "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80";

export default function MobileHero({ onShopNow }) {
  return (
    <section className="bg-white border-b border-[#ECECEC] font-sans select-none overflow-hidden">
      <div className="px-6 pt-8 pb-6">
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#F07020]">
          — Personal Fashion Market
        </p>

        <h1 className="mt-4 text-4xl min-[390px]:text-[32px] font-black uppercase leading-[0.9] tracking-tight text-[#37352F]">
          <span className="text-[#F07020]">Explore</span><br />
          Designer<br />
          <span>Fashion.</span>
        </h1>

        <p className="mt-4 text-[14px] leading-[1.6] text-[#9B9B9B] font-medium">
          Direct access to 150+ independent luxury designers, verified sartorial craftsmanship, and express worldwide shipping.
        </p>

        <div className="mt-8 grid grid-cols-[1fr_auto] gap-4">
          <button
            onClick={onShopNow}
            className="h-14 rounded-xl bg-[#F07020] active:bg-[#D85C10] px-6 text-[12px] font-bold uppercase tracking-[0.15em] text-[#FAFAF9] flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform border-none cursor-pointer"
          >
            <Sparkles size={14} className="fill-[#FAFAF9]/20 text-white" />
            Start Explore
          </button>
          <button
            onClick={onShopNow}
            className="h-14 w-14 rounded-xl bg-[#37352F] text-[#FAFAF9] flex items-center justify-center active:scale-[0.98] transition-transform border-none cursor-pointer"
            aria-label="Browse collection"
          >
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="relative h-[31rem] px-6 pb-8">
        <div className="absolute left-6 top-0 h-[25rem] w-[68%] overflow-hidden rounded-2xl border border-[#ECECEC] bg-white shadow-sm">
          <img src={IMG_1} alt="Fashion campaign model" className="h-full w-full object-cover object-top" loading="eager" />
        </div>

        <div className="absolute right-6 top-10 h-44 w-[42%] overflow-hidden rounded-2xl border border-[#ECECEC] bg-white shadow-sm">
          <img src={IMG_2} alt="Designer fashion" className="h-full w-full object-cover object-top" loading="lazy" />
        </div>

        <div className="absolute right-6 bottom-8 h-48 w-[48%] overflow-hidden rounded-2xl border border-[#ECECEC] bg-white shadow-sm">
          <img src={IMG_3} alt="Denim jacket" className="h-full w-full object-cover object-center" loading="lazy" />
        </div>

        <button
          onClick={onShopNow}
          className="absolute left-8 bottom-10 h-16 w-16 rounded-full bg-[#F07020] text-[#FAFAF9] flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform border-none cursor-pointer"
          aria-label="Shop now"
        >
          <ArrowRight size={16} className="-rotate-45" strokeWidth={2.5} />
          <span className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.15em]">Shop</span>
        </button>
      </div>

      <div className="grid grid-cols-2">
        <button onClick={onShopNow} className="bg-[#F07020] px-6 py-6 text-left border-none cursor-pointer">
          <span className="block text-[12px] font-bold uppercase tracking-[0.15em] text-[#FAFAF9]/80">// Curated</span>
          <span className="mt-2 block text-2xl font-black uppercase leading-[0.9] text-[#FAFAF9]">
            Your<br />Edit.
          </span>
        </button>
        <button onClick={onShopNow} className="bg-[#37352F] px-6 py-6 text-left border-none cursor-pointer">
          <span className="block text-[12px] font-bold uppercase tracking-[0.15em] text-[#FAFAF9]/80">// Live</span>
          <span className="mt-2 block text-2xl font-black uppercase leading-[0.9] text-[#FAFAF9]">
            New<br />Drops.
          </span>
        </button>
      </div>
    </section>
  );
}
