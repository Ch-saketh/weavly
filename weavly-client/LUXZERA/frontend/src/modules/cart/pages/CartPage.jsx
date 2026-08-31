"use client";

// src/modules/cart/pages/CartPage.jsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Tag, ChevronRight, Lock } from "lucide-react";
import { useCart } from "@/modules/cart/store/CartContext";
import BetaNoticeModal from "@/shared/components/common/BetaNoticeModal";

const FREE_SHIPPING_THRESHOLD = 150;

export default function CartPage({ onCheckout }) {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQty } = useCart();
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [removingKey, setRemovingKey] = useState(null);
  const [checkoutNoticeOpen, setCheckoutNoticeOpen] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const shipping = subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : 9.99;
  const total = subtotal - discount + shipping;
  const toFreeShip = Math.max(0, FREE_SHIPPING_THRESHOLD - (subtotal - discount));

  const handleUpdateQty = (item, delta) => updateQty(item.id, item.size, delta);

  const removeItem = (item) => {
    const key = `${item.id}-${item.size}`;
    setRemovingKey(key);
    setTimeout(() => { removeFromCart(item.id, item.size); setRemovingKey(null); }, 300);
  };

  const applyPromo = () => {
    if (promoInput.toUpperCase() === "DROP10") {
      setPromoApplied("DROP10"); setPromoError("");
    } else {
      setPromoError("Invalid promo code.");
      setTimeout(() => setPromoError(""), 2500);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5EFEB] flex flex-col items-center justify-center gap-6 px-6 font-sans select-none">
        <div className="w-20 h-20 bg-white border border-[#183B56]/30 flex items-center justify-center shadow-xs">
          <ShoppingBag size={28} className="text-[#183B56]" />
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold uppercase tracking-tight text-[#183B56]">Your bag<br />is empty.</p>
          <p className="text-[13px] text-[#5A7184] mt-2 font-medium">You haven't added any luxury pieces yet.</p>
        </div>
        <button
          onClick={() => router.push("/market")}
          className="flex items-center gap-2 bg-[#183B56] hover:bg-[#102A43] text-white font-bold uppercase text-[11px] tracking-[0.25em] px-8 py-4 border border-[#183B56] transition-all cursor-pointer shadow-xs"
        >
          <ShoppingBag size={14} />
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EFEB] font-sans text-[#183B56] select-none">

      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-[#F5EFEB] border-b border-[#183B56]/20 px-6 py-10">
        <div className="mx-auto max-w-7xl relative z-10">
          <button
            onClick={() => router.push("/market")}
            className="group mb-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#5A7184] hover:text-[#183B56] transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5 text-[#183B56]" />
            Continue Shopping
          </button>
          <div className="flex items-end gap-4">
            <h1 className="font-bold uppercase leading-[0.9] tracking-tight text-[#183B56] text-4xl md:text-6xl">
              Your<br />
              <span className="text-[#183B56]">Bag.</span>
            </h1>
            <span className="mb-1 text-[13px] font-bold text-[#5A7184] uppercase tracking-wider">
              {cartItems.reduce((a, i) => a + i.qty, 0)} item{cartItems.reduce((a, i) => a + i.qty, 0) !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* ── Free shipping progress ── */}
      {toFreeShip > 0 && (
        <div className="border-b border-[#183B56]/20 bg-[#E2EAEF]/60 px-6 py-3">
          <div className="mx-auto flex max-w-7xl items-center gap-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#183B56]">
              Add <span className="text-[#183B56] font-extrabold">₹{Math.round(toFreeShip).toLocaleString('en-IN')}</span> more for complimentary shipping
            </p>
            <div className="h-1.5 flex-1 bg-[#183B56]/15 overflow-hidden border border-[#183B56]/20">
              <div
                className="h-full bg-[#183B56] transition-all duration-500"
                style={{ width: `${Math.min(100, ((subtotal - discount) / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-10 items-start px-6 py-10">
        {/* ── Cart Items ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 w-full">
          <div className="hidden md:grid grid-cols-[1fr_auto_auto] gap-6 pb-2 border-b border-[#183B56]/20">
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#5A7184]">Item</span>
            <span className="w-24 text-center text-[9px] font-bold uppercase tracking-[0.25em] text-[#5A7184]">Qty</span>
            <span className="w-20 text-right text-[9px] font-bold uppercase tracking-[0.25em] text-[#5A7184]">Price</span>
          </div>

          {cartItems.map((item) => (
            <div
              key={`${item.id}-${item.size}`}
              className={`grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_auto_auto] gap-4 md:gap-6 items-center border border-[#183B56]/30 p-4 bg-white shadow-xs transition-all duration-300 ${
                removingKey === `${item.id}-${item.size}` ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
            >
              <button
                onClick={() => router.push(`/product/${item.id}`)}
                className="group w-20 h-24 md:w-24 md:h-28 overflow-hidden bg-[#E2EAEF] flex-shrink-0 text-left border border-[#183B56]/20 cursor-pointer p-0"
                title={`View ${item.name}`}
              >
                <img
                  src={item.images?.[0] || item.image || item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                />
              </button>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#183B56]">
                  {item.brand || "Weavly Atelier"}
                </span>
                <button
                  onClick={() => router.push(`/product/${item.id}`)}
                  className="text-left font-bold uppercase tracking-tight text-[#183B56] leading-tight text-sm hover:opacity-75 transition-opacity cursor-pointer bg-transparent border-none p-0"
                >
                  {item.name}
                </button>
                <p className="text-[11px] font-medium text-[#5A7184] uppercase tracking-wider mt-0.5">
                  Size: <span className="text-[#183B56] font-bold">{item.size}</span>
                </p>

                {/* Mobile price + qty */}
                <p className="text-sm font-bold text-[#183B56] mt-2 md:hidden">₹{Math.round(item.price * item.qty).toLocaleString('en-IN')}</p>
                <div className="flex items-center gap-3 mt-2 md:hidden">
                  <div className="flex items-center border border-[#183B56]/30 bg-[#F5EFEB]">
                    <button onClick={() => handleUpdateQty(item, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-[#E2EAEF] transition-colors border-none bg-transparent cursor-pointer text-[#183B56]">
                      <Minus size={11} strokeWidth={2.5} />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-[#183B56]">{item.qty}</span>
                    <button onClick={() => handleUpdateQty(item, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-[#E2EAEF] transition-colors border-none bg-transparent cursor-pointer text-[#183B56]">
                      <Plus size={11} strokeWidth={2.5} />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item)} className="text-[#5A7184] hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer p-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Desktop qty */}
              <div className="hidden md:flex items-center border border-[#183B56]/30 w-24 bg-[#F5EFEB]">
                <button onClick={() => handleUpdateQty(item, -1)} className="w-8 h-9 flex items-center justify-center hover:bg-[#E2EAEF] transition-colors border-none bg-transparent cursor-pointer text-[#183B56]">
                  <Minus size={11} strokeWidth={2.5} />
                </button>
                <span className="flex-1 text-center text-xs font-bold text-[#183B56]">{item.qty}</span>
                <button onClick={() => handleUpdateQty(item, 1)} className="w-8 h-9 flex items-center justify-center hover:bg-[#E2EAEF] transition-colors border-none bg-transparent cursor-pointer text-[#183B56]">
                  <Plus size={11} strokeWidth={2.5} />
                </button>
              </div>

              {/* Desktop price */}
              <div className="hidden md:flex flex-col items-end gap-2 w-20">
                <span className="text-sm font-bold text-[#183B56]">₹{Math.round(item.price * item.qty).toLocaleString('en-IN')}</span>
                <button onClick={() => removeItem(item)} className="text-[#5A7184] hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer p-0">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order Summary ── */}
        <div className="w-full lg:w-[340px] flex-shrink-0 lg:sticky lg:top-24">
          <div className="border border-[#183B56]/30 bg-white shadow-xs">
            <div className="bg-[#183B56] px-5 py-4 border-b border-[#183B56]">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white">
                Order Summary
              </h2>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-[#5A7184] font-bold uppercase tracking-wider">Subtotal</span>
                  <span className="text-sm font-bold text-[#183B56]">₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
                </div>

                {promoApplied && (
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-[#183B56] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Tag size={10} />{promoApplied} (10% off)
                    </span>
                    <span className="text-sm font-bold text-[#183B56]">-₹{Math.round(discount).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-[#5A7184] font-bold uppercase tracking-wider">Shipping</span>
                  <span className={`text-sm font-bold ${shipping === 0 ? "text-emerald-700 font-extrabold" : "text-[#183B56]"}`}>
                    {shipping === 0 ? "FREE" : `₹${Math.round(shipping).toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-[#5A7184]/70 font-medium uppercase tracking-wider">Est. Tax</span>
                  <span className="text-[11px] text-[#5A7184]/70 font-medium">Calculated at checkout</span>
                </div>
              </div>

              <div className="h-px bg-[#183B56]/15" />

              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">Total</span>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#183B56]">₹{Math.round(total).toLocaleString('en-IN')}</p>
                  <p className="text-[9px] text-[#5A7184] uppercase tracking-wider font-medium">INR · incl. all duties</p>
                </div>
              </div>

              {!promoApplied ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                    placeholder="Promo code"
                    className={`flex-1 border text-[11px] font-bold uppercase px-3 py-2.5 outline-none placeholder:normal-case placeholder:font-normal transition-colors bg-white ${
                      promoError ? "border-red-500" : "border-[#183B56]/30 focus:border-[#183B56]"
                    }`}
                  />
                  <button
                    onClick={applyPromo}
                    className="px-4 bg-[#183B56] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#102A43] transition-colors border border-[#183B56] cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-[#E2EAEF] border border-[#183B56]/30 px-3 py-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#183B56] flex items-center gap-1.5">
                    <Tag size={10} />{promoApplied} applied
                  </span>
                  <button
                    onClick={() => { setPromoApplied(null); setPromoInput(""); }}
                    className="text-[9px] font-bold uppercase text-[#5A7184] hover:text-[#183B56] transition-colors border-none bg-transparent cursor-pointer p-0"
                  >
                    Remove
                  </button>
                </div>
              )}

              {promoError && (
                <p className="text-[10px] font-bold text-red-600 -mt-2">{promoError}</p>
              )}

              <button
                onClick={() => {
                  setCheckoutNoticeOpen(true);
                  if (onCheckout) onCheckout({ items: cartItems, total });
                }}
                className="w-full flex items-center justify-center gap-3 py-4 bg-[#183B56] hover:bg-[#102A43] text-white text-[11px] font-bold uppercase tracking-[0.2em] transition-colors group border border-[#183B56] shadow-sm cursor-pointer"
              >
                <Lock size={13} strokeWidth={2.5} />
                Proceed to Checkout
                <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <BetaNoticeModal
        isOpen={checkoutNoticeOpen}
        onClose={() => setCheckoutNoticeOpen(false)}
        title="Checkout & Payment Notice"
        message="Weavly live payment gateway and atelier checkout are currently in Beta preview testing. Server responses may take a moment to process. If an action delays, feel free to try refreshing or checking back shortly."
      />
    </div>
  );
}