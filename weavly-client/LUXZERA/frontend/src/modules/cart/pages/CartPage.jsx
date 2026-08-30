"use client";

// src/pages/CartPage.jsx
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
      <div className="min-h-screen bg-[#F5EFEB] flex flex-col items-center justify-center gap-6 px-6 font-sans">
        <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#183B56]/30 flex items-center justify-center">
          <ShoppingBag size={26} className="text-[#183B56]/30" />
        </div>
        <div className="text-center">
          <p className="text-3xl font-black uppercase tracking-tight text-[#183B56]">Your bag<br />is empty.</p>
          <p className="text-[13px] text-[#5A7184] mt-2 font-medium">You haven't added anything yet.</p>
        </div>
        <button
          onClick={() => router.push("/market")}
          className="flex items-center gap-2 bg-[#183B56] hover:bg-[#102A43] text-white font-extrabold uppercase text-[10px] tracking-[0.28em] px-8 py-4 rounded-full transition-colors"
        >
          <ShoppingBag size={13} />
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EFEB] font-sans text-[#183B56]">

      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-[#F5EFEB] border-b border-[#183B56]/15 px-6 py-10">
        <div className="absolute inset-0 bg-premium-grid opacity-[0.025] pointer-events-none" />
        <div className="mx-auto max-w-7xl relative z-10">
          <button
            onClick={() => router.push("/market")}
            className="group mb-4 flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.25em] text-[#2B2B2B]/40 hover:text-[#5B6EF5] transition-colors"
          >
            <ArrowLeft size={11} className="transition-transform group-hover:-translate-x-0.5" />
            Continue Shopping
          </button>
          <div className="flex items-end gap-4">
            <h1 className="font-black uppercase leading-[0.9] tracking-tight text-[#2B2B2B] text-4xl md:text-6xl">
              Your<br />
              <span style={{ color: "#5B6EF5" }}>Bag.</span>
            </h1>
            <span className="mb-1 text-[13px] font-extrabold text-[#2B2B2B]/35 uppercase tracking-wider">
              {cartItems.reduce((a, i) => a + i.qty, 0)} item{cartItems.reduce((a, i) => a + i.qty, 0) !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* ── Free shipping progress ── */}
      {toFreeShip > 0 && (
        <div className="border-b border-[#E7E3DD] bg-[#F2EFEA] px-6 py-3">
          <div className="mx-auto flex max-w-7xl items-center gap-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#2B2B2B]/70">
              Add <span style={{ color: "#F07020" }}>₹{Math.round(toFreeShip).toLocaleString('en-IN')}</span> more for free shipping
            </p>
            <div className="h-1.5 flex-1 rounded-full bg-[#E7E3DD] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#5B6EF5] transition-all duration-500"
                style={{ width: `${Math.min(100, ((subtotal - discount) / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-10 items-start px-6 py-10">
        {/* ── Cart Items ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 w-full">
          <div className="hidden md:grid grid-cols-[1fr_auto_auto] gap-6 pb-2 border-b border-[#E7E3DD]">
            <span className="text-[8.5px] font-extrabold uppercase tracking-[0.3em] text-[#2B2B2B]/35">Item</span>
            <span className="w-24 text-center text-[8.5px] font-extrabold uppercase tracking-[0.3em] text-[#2B2B2B]/35">Qty</span>
            <span className="w-20 text-right text-[8.5px] font-extrabold uppercase tracking-[0.3em] text-[#2B2B2B]/35">Price</span>
          </div>

          {cartItems.map((item) => (
            <div
              key={`${item.id}-${item.size}`}
              className={`grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_auto_auto] gap-4 md:gap-6 items-center border border-[#E7E3DD] p-4 bg-white rounded-2xl transition-all duration-300 ${
                removingKey === `${item.id}-${item.size}` ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
            >
              <button
                onClick={() => router.push(`/product/${item.id}`)}
                className="group w-20 h-24 md:w-24 md:h-28 overflow-hidden bg-[#F2EFEA] flex-shrink-0 text-left rounded-xl border border-[#E7E3DD]"
                title={`View ${item.name}`}
              >
                <img
                  src={item.images?.[0] || item.image}
                  alt={item.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </button>

              <div className="flex flex-col gap-1">
                <span className="text-[8.5px] font-extrabold uppercase tracking-[0.25em] text-[#C6A15B]">
                  {item.brand}
                </span>
                <button
                  onClick={() => router.push(`/product/${item.id}`)}
                  className="text-left font-extrabold uppercase tracking-tight text-[#2B2B2B] leading-tight text-sm hover:text-[#5B6EF5] transition-colors"
                >
                  {item.name}
                </button>
                <p className="text-[10px] font-bold text-[#2B2B2B]/40 uppercase tracking-wider mt-0.5">
                  Size: <span className="text-[#2B2B2B]/70">{item.size}</span>
                </p>

                {/* Mobile price + qty */}
                <p className="text-sm font-extrabold text-[#2B2B2B] mt-2 md:hidden">₹{Math.round(item.price * item.qty).toLocaleString('en-IN')}</p>
                <div className="flex items-center gap-3 mt-2 md:hidden">
                  <div className="flex items-center border border-[#E7E3DD] rounded-xl overflow-hidden bg-white">
                    <button onClick={() => handleUpdateQty(item, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-[#F2EFEA] transition-colors">
                      <Minus size={11} strokeWidth={3} />
                    </button>
                    <span className="w-8 text-center text-xs font-extrabold text-[#2B2B2B]">{item.qty}</span>
                    <button onClick={() => handleUpdateQty(item, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-[#F2EFEA] transition-colors">
                      <Plus size={11} strokeWidth={3} />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item)} className="text-[#2B2B2B]/25 hover:text-[#C97A5A] transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Desktop qty */}
              <div className="hidden md:flex items-center border border-[#E7E3DD] w-24 rounded-xl overflow-hidden bg-white">
                <button onClick={() => handleUpdateQty(item, -1)} className="w-8 h-9 flex items-center justify-center hover:bg-[#F2EFEA] transition-colors">
                  <Minus size={11} strokeWidth={3} className="text-[#2B2B2B]" />
                </button>
                <span className="flex-1 text-center text-xs font-extrabold text-[#2B2B2B]">{item.qty}</span>
                <button onClick={() => handleUpdateQty(item, 1)} className="w-8 h-9 flex items-center justify-center hover:bg-[#F2EFEA] transition-colors">
                  <Plus size={11} strokeWidth={3} className="text-[#2B2B2B]" />
                </button>
              </div>

              {/* Desktop price */}
              <div className="hidden md:flex flex-col items-end gap-2 w-20">
                <span className="text-sm font-extrabold text-[#2B2B2B]">₹{Math.round(item.price * item.qty).toLocaleString('en-IN')}</span>
                <button onClick={() => removeItem(item)} className="text-[#2B2B2B]/25 hover:text-[#C97A5A] transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order Summary ── */}
        <div className="w-full lg:w-[340px] flex-shrink-0 lg:sticky lg:top-24">
          <div className="border border-[#E7E3DD] rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="bg-[#1E2D4A] px-5 py-4">
              <h2 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#FAF9F7]">
                Order Summary
              </h2>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-[#2B2B2B]/50 font-bold uppercase tracking-wider">Subtotal</span>
                  <span className="text-sm font-extrabold text-[#2B2B2B]">₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
                </div>

                {promoApplied && (
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-[#5B6EF5] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Tag size={10} />{promoApplied} (10% off)
                    </span>
                    <span className="text-sm font-extrabold text-[#5B6EF5]">-₹{Math.round(discount).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-[#2B2B2B]/50 font-bold uppercase tracking-wider">Shipping</span>
                  <span className={`text-sm font-extrabold ${shipping === 0 ? "text-green-600" : "text-[#2B2B2B]"}`}>
                    {shipping === 0 ? "FREE" : `₹${Math.round(shipping).toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-[#2B2B2B]/35 font-bold uppercase tracking-wider">Est. Tax</span>
                  <span className="text-[11px] text-[#2B2B2B]/35 font-bold">Calculated at checkout</span>
                </div>
              </div>

              <div className="h-px bg-[#E7E3DD]" />

              <div className="flex justify-between items-end">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#2B2B2B]">Total</span>
                <div className="text-right">
                  <p className="text-2xl font-black text-[#2B2B2B]">₹{Math.round(total).toLocaleString('en-IN')}</p>
                  <p className="text-[9px] text-[#2B2B2B]/35 uppercase tracking-wider">INR · incl. taxes</p>
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
                    className={`flex-1 border text-[11px] font-bold uppercase px-3 py-2.5 outline-none rounded-xl placeholder:normal-case placeholder:font-normal transition-colors bg-white ${
                      promoError ? "border-[#C97A5A]" : "border-[#E7E3DD] focus:border-[#5B6EF5]"
                    }`}
                  />
                  <button
                    onClick={applyPromo}
                    className="px-4 bg-[#F2EFEA] text-[#2B2B2B] text-[10px] font-extrabold uppercase tracking-[0.2em] hover:bg-[#5B6EF5] hover:text-[#FAF9F7] transition-colors rounded-xl"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-[#F2EFEA] border border-[#E7E3DD] px-3 py-2.5 rounded-xl">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#5B6EF5] flex items-center gap-1.5">
                    <Tag size={10} />{promoApplied} applied
                  </span>
                  <button
                    onClick={() => { setPromoApplied(null); setPromoInput(""); }}
                    className="text-[9px] font-extrabold uppercase text-[#2B2B2B]/40 hover:text-[#C97A5A] transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}

              {promoError && (
                <p className="text-[10px] font-bold text-[#C97A5A] -mt-2">{promoError}</p>
              )}

              <button
                onClick={() => {
                  setCheckoutNoticeOpen(true);
                  if (onCheckout) onCheckout({ items: cartItems, total });
                }}
                className="w-full flex items-center justify-center gap-3 py-4 bg-[#F07020] hover:bg-[#D85C10] text-white text-[11px] font-extrabold uppercase tracking-[0.2em] transition-colors group rounded-xl shadow-md border-none cursor-pointer"
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