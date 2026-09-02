"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
  Map,
  Navigation,
  Check
} from "lucide-react";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/modules/profile/services/userService";
import Loader from "@/shared/components/ui/Loader";
import AddressMapPicker from "./AddressMapPicker";

export default function AddressManagementView({ userId }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [selectedId, setSelectedId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);

  const loadAddresses = async () => {
    if (!userId || String(userId).startsWith("customer_dev_")) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await getAddresses(userId);
      const list = Array.isArray(data) ? data : data?.addresses || [];
      const normalized = list.map((a) => ({
        id: String(a.id || a.addressId || Date.now()),
        name: a.fullName || a.name || "",
        street: a.addressLine1 ? `${a.addressLine1}${a.addressLine2 ? ', ' + a.addressLine2 : ''}` : (a.street || ""),
        city: a.city || "",
        state: a.state || "",
        zip: a.postalCode || a.zip || "",
        country: a.country || "India",
        phone: a.phoneNumber || a.phone || "",
        isDefault: Boolean(a.isDefault || a.default),
        type: a.type || "home",
      }));
      setAddresses(normalized);
      const defaultAddr = normalized.find((a) => a.isDefault);
      if (defaultAddr) setSelectedId(defaultAddr.id);
      else if (normalized.length > 0) setSelectedId(normalized[0].id);
    } catch (err) {
      console.warn("Addresses load notice:", err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [userId]);

  const startEditing = (address) => {
    setEditingId(address.id);
    setEditForm({ ...address });
    setMenuOpenId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const startAddingNew = () => {
    setIsAddingNew(true);
    setEditingId(null);
    setEditForm({
      name: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "India",
      phone: "",
      type: "home",
      isDefault: addresses.length === 0,
    });
  };

  const cancelAddingNew = () => {
    setIsAddingNew(false);
    setEditForm({});
  };

  // When location is selected on the interactive map
  const handleMapLocationSelected = (locationData) => {
    setEditForm((prev) => ({
      ...prev,
      street: locationData.street || prev.street || "",
      city: locationData.city || prev.city || "",
      state: locationData.state || prev.state || "",
      zip: locationData.zip || prev.zip || "",
      country: locationData.country || prev.country || "India",
    }));

    if (!isAddingNew && !editingId) {
      setIsAddingNew(true);
    }

    setShowMapModal(false);
    setSuccessMsg("Precise location & postal details applied from map!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const saveEdit = async (addressId) => {
    if (
      !editForm.name ||
      !editForm.street ||
      !editForm.city ||
      !editForm.state ||
      !editForm.zip ||
      !editForm.phone
    ) {
      setErrorMsg("Please fill in all required address fields.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    try {
      const payload = {
        id: addressId,
        fullName: editForm.name,
        addressLine1: editForm.street,
        addressLine2: "",
        city: editForm.city,
        state: editForm.state,
        postalCode: editForm.zip,
        country: editForm.country || "India",
        phoneNumber: editForm.phone,
        type: editForm.type || "home",
        isDefault: editForm.isDefault || false,
      };
      if (userId) {
        await updateAddress(userId, payload);
      }
      setAddresses((prev) =>
        prev.map((addr) => (addr.id === addressId ? { ...addr, ...editForm } : addr))
      );
      setEditingId(null);
      setEditForm({});
      setSuccessMsg("Address updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to update address.");
    }
  };

  const saveNewAddress = async () => {
    if (
      !editForm.name ||
      !editForm.street ||
      !editForm.city ||
      !editForm.state ||
      !editForm.zip ||
      !editForm.phone
    ) {
      setErrorMsg("Please fill in all required address fields.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");

    const newPayload = {
      fullName: editForm.name,
      addressLine1: editForm.street,
      addressLine2: "",
      city: editForm.city,
      state: editForm.state,
      postalCode: editForm.zip,
      country: editForm.country || "India",
      phoneNumber: editForm.phone,
      type: editForm.type || "home",
      isDefault: addresses.length === 0,
    };

    try {
      let created = null;
      if (userId) {
        created = await createAddress(userId, newPayload);
      }
      const newAddress = {
        id: String(created?.id || created?.addressId || Date.now()),
        name: editForm.name,
        street: editForm.street,
        city: editForm.city,
        state: editForm.state,
        zip: editForm.zip,
        country: editForm.country || "India",
        phone: editForm.phone,
        type: editForm.type || "home",
        isDefault: addresses.length === 0,
      };

      setAddresses((prev) => [...prev, newAddress]);
      setSelectedId(newAddress.id);
      setIsAddingNew(false);
      setEditForm({});
      setSuccessMsg("New address saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save new address.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    setErrorMsg("");
    try {
      if (userId) {
        await deleteAddress(userId, id);
      }
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      if (selectedId === id && addresses.length > 1) {
        const remaining = addresses.filter((a) => a.id !== id);
        setSelectedId(remaining[0]?.id || "");
      }
      if (editingId === id) {
        setEditingId(null);
        setEditForm({});
      }
      setSuccessMsg("Address removed.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete address.");
    }
  };

  const handleSelectDefault = async (id) => {
    setSelectedId(id);
    try {
      if (userId) {
        await setDefaultAddress(userId, id);
      }
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          isDefault: addr.id === id,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center">
        <Loader size="w-8 h-8" className="mb-4" />
        <p className="text-xs font-semibold text-[#5A7184]">Loading your address book...</p>
      </div>
    );
  }

  const inputClasses =
    "w-full h-11 border border-[#183B56] bg-white px-3 text-xs font-semibold text-[#183B56] placeholder-[#5A7184]/50 outline-none focus:ring-1 focus:ring-[#183B56]";

  return (
    <div className="space-y-6 text-[#183B56] font-sans">
      {/* ── Main Header Card ── */}
      <div className="border border-[#183B56] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#183B56]/20">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-[#DFE7ED] border border-[#183B56] flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-[#183B56]" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5A7184] block">
                Shipping &amp; Logistics
              </span>
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#183B56]">
                Delivery Address Book
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Pick On Map Action */}
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              className="px-4 py-2.5 bg-[#F5EFEB] hover:bg-[#183B56] hover:text-white text-[#183B56] border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Map size={13} />
              <span>Pin on Map</span>
            </button>

            {!isAddingNew && (
              <button
                type="button"
                onClick={startAddingNew}
                className="px-5 py-2.5 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                <span>Add New</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-[#5A7184] font-medium leading-relaxed">
          Manage your verified delivery locations. Use our precision interactive map to drop a pin at your exact doorstep for guaranteed bespoke courier delivery.
        </p>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-300 text-xs font-bold text-red-700">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mt-4 p-3.5 bg-[#F5EFEB] border border-[#183B56] text-xs font-bold text-[#183B56] flex items-center gap-2">
            <Check size={14} strokeWidth={2.5} />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* ── INTERACTIVE MAP MODAL / EMBEDDED PICKER ── */}
      {showMapModal && (
        <div className="animate-fadeIn">
          <AddressMapPicker
            initialAddress={editForm.street || ""}
            onLocationSelect={handleMapLocationSelected}
            onClose={() => setShowMapModal(false)}
          />
        </div>
      )}

      {/* ── ADDRESS CARDS LIST ── */}
      <div className="space-y-4">
        {addresses.map((address) => {
          const isSelected = selectedId === address.id;
          const isEditing = editingId === address.id;

          return (
            <div
              key={address.id}
              onClick={() => !isEditing && handleSelectDefault(address.id)}
              className={`border p-6 transition-all relative ${
                isSelected
                  ? "border-[#183B56] bg-[#F5EFEB] shadow-xs"
                  : "border-[#183B56]/30 bg-white hover:border-[#183B56]"
              } ${!isEditing ? "cursor-pointer" : ""}`}
            >
              {isEditing ? (
                /* EDIT FORM */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#183B56]/20">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold uppercase text-[#183B56]">
                        Edit Address Details
                      </h3>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMapModal(true);
                        }}
                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white border border-[#183B56] text-[#183B56] hover:bg-[#183B56] hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Map size={11} />
                        <span>Update Pin on Map</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEditing();
                        }}
                        className="p-2 bg-white border border-[#183B56] text-[#5A7184] hover:bg-red-50 hover:text-red-700 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          saveEdit(address.id);
                        }}
                        className="px-4 py-2 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Save size={13} />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7184] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={editForm.name || ""}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7184] mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="text"
                        value={editForm.phone || ""}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className={inputClasses}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7184] mb-1.5">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={editForm.street || ""}
                        onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7184] mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        value={editForm.city || ""}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7184] mb-1.5">
                        State *
                      </label>
                      <input
                        type="text"
                        value={editForm.state || ""}
                        onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7184] mb-1.5">
                        Postal / ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={editForm.zip || ""}
                        onChange={(e) => setEditForm({ ...editForm, zip: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7184] mb-1.5">
                        Country *
                      </label>
                      <input
                        type="text"
                        value={editForm.country || "India"}
                        onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className={inputClasses}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7184] mb-1.5">
                        Address Tag
                      </label>
                      <select
                        value={editForm.type || "home"}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className={inputClasses}
                      >
                        <option value="home">Home (Primary Residence)</option>
                        <option value="work">Office / Studio</option>
                        <option value="other">Bespoke Fitting Location</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                /* DISPLAY VIEW */
                <div className="flex gap-4 items-start">
                  {/* Radio Selection Indicator */}
                  <div
                    className={`mt-1 w-4 h-4 border flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? "border-[#183B56] bg-[#183B56]"
                        : "border-[#183B56]/40 bg-white"
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 bg-white" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-sm uppercase text-[#183B56] tracking-tight">
                          {address.name}
                        </span>
                        {address.isDefault && (
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-[#183B56] text-white px-2 py-0.5">
                            Default Address
                          </span>
                        )}
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-white text-[#5A7184] border border-[#183B56]/30 px-2 py-0.5">
                          {address.type}
                        </span>
                      </div>

                      {/* Dropdown / Actions */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === address.id ? null : address.id);
                          }}
                          className="w-8 h-8 border border-transparent hover:border-[#183B56] hover:bg-white flex items-center justify-center text-[#5A7184] transition-colors cursor-pointer bg-transparent"
                        >
                          <MoreVertical size={14} />
                        </button>

                        {menuOpenId === address.id && (
                          <div className="absolute right-0 top-9 w-32 bg-white border border-[#183B56] shadow-md py-1 z-20">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(address);
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-bold uppercase text-[#183B56] hover:bg-[#F5EFEB] flex items-center gap-2 cursor-pointer border-none bg-transparent"
                            >
                              <Pencil size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(address.id);
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-bold uppercase text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer border-none bg-transparent"
                            >
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 text-xs text-[#5A7184] space-y-1 font-medium leading-relaxed">
                      <p className="font-semibold text-[#183B56]">{address.street}</p>
                      <p>
                        {address.city}, {address.state} — <span className="font-mono font-bold text-[#183B56]">{address.zip}</span>
                      </p>
                      <p className="uppercase text-[11px]">{address.country}</p>
                      <p className="pt-1 text-[11px] font-mono text-[#183B56]">
                        Phone: {address.phone}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ── ADD NEW ADDRESS FORM CARD ── */}
        {isAddingNew && (
          <div className="border border-[#183B56] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#183B56]/20">
              <div className="flex items-center gap-3">
                <h3 className="text-xs font-bold uppercase text-[#183B56]">
                  Add New Delivery Location
                </h3>
                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#F5EFEB] hover:bg-[#183B56] hover:text-white border border-[#183B56] text-[#183B56] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Map size={11} />
                  <span>Select on Map</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={cancelAddingNew}
                  className="p-2 bg-white border border-[#183B56] text-[#5A7184] hover:bg-red-50 hover:text-red-700 cursor-pointer"
                >
                  <X size={14} />
                </button>
                <button
                  type="button"
                  onClick={saveNewAddress}
                  className="px-4 py-2 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save size={13} />
                  <span>Save</span>
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7184] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className={inputClasses}
                  placeholder="Saketh Chokkapu"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7184] mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={editForm.phone || ""}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className={inputClasses}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7184]">
                    Street Address / Doorstep *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMapModal(true)}
                    className="text-[10px] font-bold uppercase text-[#183B56] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation size={10} />
                    <span>Autofill from Pin Drop</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={editForm.street || ""}
                  onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                  className={inputClasses}
                  placeholder="123 Jubilee Hills, Road No. 36"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7184] mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  value={editForm.city || ""}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className={inputClasses}
                  placeholder="Hyderabad"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7184] mb-1.5">
                  State *
                </label>
                <input
                  type="text"
                  value={editForm.state || ""}
                  onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                  className={inputClasses}
                  placeholder="Telangana"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7184] mb-1.5">
                  Postal / ZIP Code *
                </label>
                <input
                  type="text"
                  value={editForm.zip || ""}
                  onChange={(e) => setEditForm({ ...editForm, zip: e.target.value })}
                  className={inputClasses}
                  placeholder="500033"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7184] mb-1.5">
                  Country *
                </label>
                <input
                  type="text"
                  value={editForm.country || "India"}
                  onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  className={inputClasses}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7184] mb-1.5">
                  Location Type
                </label>
                <select
                  value={editForm.type || "home"}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className={inputClasses}
                >
                  <option value="home">Home (Primary Residence)</option>
                  <option value="work">Office / Studio</option>
                  <option value="other">Bespoke Fitting Location</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Empty State ── */}
      {addresses.length === 0 && !isAddingNew && (
        <div className="border border-dashed border-[#183B56] bg-white p-10 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 bg-[#DFE7ED] border border-[#183B56] flex items-center justify-center">
            <MapPin size={22} className="text-[#183B56]" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase text-[#183B56]">No Delivery Addresses Saved</h3>
            <p className="mt-1 text-xs text-[#5A7184] max-w-sm">
              Add your delivery address or drop a pin on our interactive map to receive made-to-measure garments.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              className="px-5 py-2.5 bg-[#F5EFEB] hover:bg-[#183B56] hover:text-white text-[#183B56] border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Map size={13} />
              <span>Pin on Map</span>
            </button>
            <button
              type="button"
              onClick={startAddingNew}
              className="px-5 py-2.5 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Add Address Manually</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}