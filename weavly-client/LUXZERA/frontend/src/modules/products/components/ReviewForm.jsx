// src/components/ProductReviews.jsx
export default function ProductReviews({ reviews = [] }) {
  if (reviews.length === 0) {
    return (
      <div className="p-10 text-center text-xs font-bold uppercase tracking-widest text-slate-400 border border-dashed border-slate-200 rounded-2xl">
        No feedback records copped yet.
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {reviews.map((r, index) => (
        <div key={index} className="border border-slate-100 p-6 bg-white rounded-2xl shadow-sm hover:border-slate-200 transition-colors">
          
          {/* Top Meta Data Bar Row */}
          <div className="flex items-center justify-between mb-3">
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

          {/* Core Content Box Field */}
          <p className="text-slate-600 text-sm leading-relaxed font-medium">
            {r.review}
          </p>

          {/* SPACE OPTIMIZED USER IMAGE FRAME */}
          {r.image && (
            <div className="mt-4 max-w-xl max-h-72 aspect-video overflow-hidden bg-slate-50 border border-slate-100 rounded-xl">
              <img
                src={r.image}
                alt="User submission review asset"
                className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-500"
                loading="lazy"
              />
            </div>
          )}

          {/* SPACE OPTIMIZED USER VIDEO FRAME */}
          {r.video && (
            <div className="mt-4 max-w-xl max-h-72 aspect-video overflow-hidden bg-slate-50 border border-slate-100 rounded-xl">
              <video controls className="w-full h-full object-cover">
                <source src={r.video} type="video/mp4" />
                Your browser does not support integrated streaming playback.
              </video>
            </div>
          )}
          
        </div>
      ))}
    </div>
  );
}