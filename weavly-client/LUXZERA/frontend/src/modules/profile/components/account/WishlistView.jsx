import React from "react";
import { Heart, Trash2 } from "lucide-react";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";

const WishlistView = ({ onProductClick }) => {
  const { wardrobeItems, toggleWardrobe } = useWardrobe();

  const handleRemove = (e, item) => {
    e.stopPropagation();
    toggleWardrobe(item);
  };

  return (
    <div>
      <div className="pb-6 border-b border-slate-100 mb-6">
        <h2 className="text-xl font-bold text-[#2D3436] tracking-tight">My Wishlist</h2>
        <p className="text-xs text-slate-400 mt-1">Keep track of your favorite designer items and saved matches.</p>
      </div>

      {wardrobeItems.length === 0 ? (
        <div className="py-16 text-center bg-[#F9F9F9] rounded-2xl border border-dashed border-slate-200">
          <Heart size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#2D3436]">Your wishlist is empty</p>
          <p className="text-xs text-slate-400 mt-1">Bookmark designer products you love to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {wardrobeItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onProductClick?.(item.id)}
              className="group border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] hover:border-slate-200 transition-all duration-300 cursor-pointer flex flex-col h-full"
            >
              {/* Product Image */}
              <div className="aspect-[3/4] bg-slate-50 relative overflow-hidden shrink-0">
                <img
                  src={item.image || "/placeholder.jpg"}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500"; }}
                />
                
                {/* Remove Overlay Button */}
                <button
                  onClick={(e) => handleRemove(e, item)}
                  className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/90 hover:bg-red-50 text-slate-400 hover:text-red-600 transition shadow-sm"
                  title="Remove from wishlist"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <h4 className="text-[12.5px] font-semibold text-[#2D3436] line-clamp-1 group-hover:text-[#FF8C33] transition-colors leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1 leading-none">
                    {item.brand || "Weavly Exclusive"}
                  </p>
                </div>
                
                <div className="mt-3.5 flex items-baseline gap-1.5 leading-none">
                  {item.originalPrice ? (
                    <>
                      <span className="text-[13px] font-bold text-[#FF8C33]">${Number(item.price).toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 line-through">${Number(item.originalPrice).toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-[13px] font-bold text-[#2D3436]">${Number(item.price).toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistView;
