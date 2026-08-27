import React, { useState, useEffect } from "react";
import { CreditCard, Plus, Trash2, Lock, X } from "lucide-react";
import Loader from "@/shared/components/ui/Loader";

const PaymentMethodsView = ({ userId }) => {
  const [cards, setCards] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [newCard, setNewCard] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: ""
  });

  // Load cards from localStorage on mount (with pre-loaded mock cards if empty)
  useEffect(() => {
    const storageKey = `Weavly_cards_${userId || "guest"}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setCards(JSON.parse(saved));
    } else {
      const defaultCards = [
        {
          id: "card-1",
          cardholderName: "Saketh Chokkapu",
          cardNumber: "4242424242424242",
          expiryDate: "12/28",
          cardType: "visa",
          isDefault: true
        },
        {
          id: "card-2",
          cardholderName: "Saketh Chokkapu",
          cardNumber: "5412751234569876",
          expiryDate: "08/29",
          cardType: "mastercard",
          isDefault: false
        }
      ];
      localStorage.setItem(storageKey, JSON.stringify(defaultCards));
      setCards(defaultCards);
    }
  }, [userId]);

  const saveToStorage = (updatedCards) => {
    const storageKey = `Weavly_cards_${userId || "guest"}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedCards));
    setCards(updatedCards);
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    if (name === "cardNumber") {
      value = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
      const matches = value.match(/\d{4,16}/g);
      const match = (matches && matches[0]) || "";
      const parts = [];

      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }

      if (parts.length > 0) {
        value = parts.join(" ");
      } else {
        const subParts = [];
        for (let i = 0; i < value.length; i += 4) {
          subParts.push(value.substring(i, Math.min(i + 4, value.length)));
        }
        value = subParts.join(" ");
      }
      value = value.substring(0, 19);
    }

    if (name === "expiryDate") {
      value = value.replace(/[^0-9]/g, "");
      if (value.length >= 2) {
        value = value.substring(0, 2) + "/" + value.substring(2, 4);
      }
      value = value.substring(0, 5);
    }

    if (name === "cvv") {
      value = value.replace(/[^0-9]/g, "").substring(0, 4);
    }

    setNewCard((prev) => ({ ...prev, [name]: value }));
  };

  const getCardType = (number) => {
    const raw = number.replace(/\s+/g, "");
    if (raw.startsWith("4")) return "visa";
    if (/^5[1-5]/.test(raw)) return "mastercard";
    if (/^3[47]/.test(raw)) return "amex";
    return "generic";
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    const rawNumber = newCard.cardNumber.replace(/\s+/g, "");
    if (rawNumber.length < 15) {
      setErrorMsg("Please enter a valid card number.");
      return;
    }
    if (newCard.expiryDate.length < 5) {
      setErrorMsg("Please enter expiry date in MM/YY format.");
      return;
    }
    if (newCard.cvv.length < 3) {
      setErrorMsg("Please enter a valid CVV.");
      return;
    }

    setSaving(true);
    setSuccess(false);
    setErrorMsg("");

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const cardType = getCardType(newCard.cardNumber);
    const brandNewCard = {
      id: `card-${Date.now()}`,
      cardholderName: newCard.cardholderName || "Cardholder",
      cardNumber: rawNumber,
      expiryDate: newCard.expiryDate,
      cardType,
      isDefault: cards.length === 0
    };

    const updated = [...cards, brandNewCard];
    saveToStorage(updated);

    setSuccess(true);
    setSaving(false);
    setTimeout(() => {
      setSuccess(false);
      setShowAddForm(false);
      setNewCard({
        cardholderName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: ""
      });
    }, 1500);
  };

  const handleDeleteCard = (cardId) => {
    const updated = cards.filter((c) => c.id !== cardId);
    if (updated.length > 0 && !updated.some((c) => c.isDefault)) {
      updated[0].isDefault = true;
    }
    saveToStorage(updated);
  };

  const handleSetDefault = (cardId) => {
    const updated = cards.map((c) => ({
      ...c,
      isDefault: c.id === cardId
    }));
    saveToStorage(updated);
  };

  const maskCardNumber = (num) => {
    if (!num) return "";
    return `•••• •••• •••• ${num.substring(num.length - 4)}`;
  };

  const getCardGradient = (type) => {
    switch (type) {
      case "visa":
        return "bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-[#334155] text-slate-100";
      case "mastercard":
        return "bg-gradient-to-br from-[#C8702A] to-[#A85E22] border-[#A85E22] text-white";
      case "amex":
        return "bg-gradient-to-br from-[#0F766E] to-[#115E59] border-[#115E59] text-teal-50";
      default:
        return "bg-gradient-to-br from-[#475569] to-[#334155] border-[#475569] text-slate-100";
    }
  };

  const inputClasses = "w-full h-[44px] px-4 rounded-xl border border-[#E8E5E0] bg-[#FAFAF9] text-[13.5px] font-medium text-[#1A1A1A] placeholder-[#BFBFBF] outline-none transition-all duration-200 hover:border-[#D0CCC6] hover:bg-white focus:border-[#C8702A] focus:bg-white focus:ring-1 focus:ring-[#C8702A]/20";

  return (
    <div className="relative font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Saving Overlay */}
      {saving && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-20">
          <Loader size="w-10 h-10" />
        </div>
      )}

      {/* Section Header */}
      <div className="pb-6 mb-6 border-b border-[#EDEBE8] flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#1A1A1A] tracking-[-0.02em]">Payment Methods</h2>
          <p className="text-[13px] text-[#8C8C8C] mt-1">Manage cards linked to your account.</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[11px] font-semibold text-[#1A1A1A] rounded-xl transition-all duration-200"
          >
            <Plus size={13} />
            <span>Add Card</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="mb-5 px-5 py-3 bg-red-50 border border-red-100 rounded-xl text-[12.5px] font-medium text-red-600 text-center">
          {errorMsg}
        </div>
      )}

      {/* Add Card Form */}
      {showAddForm ? (
        <div className="border border-[#E8E5E0] rounded-2xl p-6 bg-[#FAFAF9] mb-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#EDEBE8]">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8C8C8C]">Link New Card</h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setErrorMsg("");
              }}
              className="text-[#ABABAB] hover:text-[#1A1A1A] transition-colors duration-200"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleAddCard} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A9A9A] mb-2">Cardholder Name</label>
              <input
                type="text"
                name="cardholderName"
                value={newCard.cardholderName}
                onChange={handleInputChange}
                placeholder="Name on card"
                className={inputClasses}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A9A9A] mb-2">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  name="cardNumber"
                  value={newCard.cardNumber}
                  onChange={handleInputChange}
                  placeholder="4242 4242 4242 4242"
                  className={`${inputClasses} pr-10 font-mono tracking-wider`}
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ABABAB]">
                  <CreditCard size={15} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A9A9A] mb-2">Expiry</label>
                <input
                  type="text"
                  name="expiryDate"
                  value={newCard.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  className={`${inputClasses} text-center font-mono`}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A9A9A] mb-2">CVV</label>
                <input
                  type="password"
                  name="cvv"
                  value={newCard.cvv}
                  onChange={handleInputChange}
                  placeholder="•••"
                  className={`${inputClasses} text-center font-mono`}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#ABABAB]">
                <Lock size={11} className="text-[#C8702A]" />
                <span>Secured 256-bit connection</span>
              </div>
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2.5 text-[12px] font-semibold rounded-xl transition-all duration-200 ${
                  success 
                    ? "bg-emerald-600 text-white" 
                    : "bg-[#1A1A1A] hover:bg-[#000000] text-white disabled:opacity-50"
                }`}
              >
                {saving ? "Linking..." : success ? "✓ Linked" : "Link Card"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Cards Display */}
      {cards.length === 0 ? (
        <div className="py-14 border border-dashed border-[#E8E5E0] rounded-2xl text-center">
          <CreditCard size={28} className="text-[#D0CCC6] mx-auto mb-3" />
          <p className="text-[13px] font-semibold text-[#6B6B6B]">No payment methods saved</p>
          <p className="text-[12px] text-[#ABABAB] mt-1.5 max-w-[220px] mx-auto leading-relaxed">Add a card to enable 1-click ordering.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`border rounded-2xl p-5 flex flex-col justify-between h-[140px] transition-all shadow-sm hover:shadow-md ${getCardGradient(card.cardType)}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[8px] font-semibold tracking-[0.2em] uppercase opacity-60">{card.cardType}</p>
                  <p className="text-[14px] font-mono font-medium mt-1.5 tracking-widest">{maskCardNumber(card.cardNumber)}</p>
                </div>
                {card.isDefault ? (
                  <span className="bg-white/15 backdrop-blur-md border border-white/10 px-2.5 py-0.5 rounded-md text-[8px] font-bold tracking-[0.12em] uppercase">Default</span>
                ) : (
                  <button
                    onClick={() => handleSetDefault(card.id)}
                    className="bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded-md text-[8px] font-bold tracking-[0.12em] uppercase transition-all duration-200"
                  >
                    Set Default
                  </button>
                )}
              </div>

              <div className="flex items-end justify-between pt-3">
                <div>
                  <p className="text-[7px] uppercase tracking-[0.16em] opacity-50">Cardholder</p>
                  <p className="text-[11px] font-semibold tracking-tight mt-0.5 uppercase">{card.cardholderName}</p>
                </div>
                <div className="flex items-end gap-4">
                  <div className="text-right">
                    <p className="text-[7px] uppercase tracking-[0.16em] opacity-50">Expires</p>
                    <p className="text-[11px] font-mono font-semibold mt-0.5">{card.expiryDate}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-1.5 hover:bg-white/10 rounded-lg opacity-60 hover:opacity-100 transition-all duration-200"
                    title="Delete card"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsView;
