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
} from "lucide-react";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/modules/profile/services/userService";
import Loader from "@/shared/components/ui/Loader";

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

  const startAddingNew = () => {
    setIsAddingNew(true);
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
      setSuccessMsg("New address saved!");
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
        <p className="text-xs font-semibold text-[#8C8C8C]">Loading your address book...</p>
      </div>
    );
  }

  return (
    <section className="py-4 font-sans text-[#1A1A1A]">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A] sm:text-2xl">
              My Addresses
            </h1>
            <p className="mt-1 text-xs text-[#8C8C8C]">
              Manage your shipping addresses and set default delivery options
            </p>
          </div>
          {!isAddingNew && (
            <button
              onClick={startAddingNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#C8702A] text-white text-xs font-semibold transition-all shadow-sm cursor-pointer border-none"
            >
              <Plus className="size-4" />
              Add New
            </button>
          )}
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700">
            {successMsg}
          </div>
        )}

        {/* Address Cards List */}
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`rounded-2xl border bg-white p-5 transition-all cursor-pointer relative shadow-sm ${
                selectedId === address.id
                  ? "border-[#C8702A] ring-1 ring-[#C8702A]/20"
                  : "border-[#E4E4E7] hover:border-[#D4D4D8]"
              }`}
              onClick={() => editingId !== address.id && handleSelectDefault(address.id)}
            >
              {editingId === address.id ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E4E4E7]">
                    <h3 className="text-sm font-bold text-[#1A1A1A]">Edit Address</h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEditing();
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#E4E4E7] bg-white text-xs font-semibold text-[#8C8C8C] hover:bg-slate-50 cursor-pointer"
                      >
                        <X className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          saveEdit(address.id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#C8702A] hover:bg-[#e05f0f] text-white text-xs font-semibold cursor-pointer border-none shadow-sm"
                      >
                        <Save className="size-3.5" />
                        Save
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8C8C]">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={editForm.name || ""}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full h-10 rounded-lg border border-[#E4E4E7] bg-white px-3 text-xs outline-none focus:border-[#C8702A]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8C8C]">
                        Phone Number *
                      </label>
                      <input
                        type="text"
                        value={editForm.phone || ""}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full h-10 rounded-lg border border-[#E4E4E7] bg-white px-3 text-xs outline-none focus:border-[#C8702A]"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8C8C]">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={editForm.street || ""}
                        onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full h-10 rounded-lg border border-[#E4E4E7] bg-white px-3 text-xs outline-none focus:border-[#C8702A]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8C8C]">
                        City *
                      </label>
                      <input
                        type="text"
                        value={editForm.city || ""}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full h-10 rounded-lg border border-[#E4E4E7] bg-white px-3 text-xs outline-none focus:border-[#C8702A]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8C8C]">
                        State *
                      </label>
                      <input
                        type="text"
                        value={editForm.state || ""}
                        onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full h-10 rounded-lg border border-[#E4E4E7] bg-white px-3 text-xs outline-none focus:border-[#C8702A]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8C8C]">
                        Postal / ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={editForm.zip || ""}
                        onChange={(e) => setEditForm({ ...editForm, zip: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full h-10 rounded-lg border border-[#E4E4E7] bg-white px-3 text-xs outline-none focus:border-[#C8702A]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8C8C]">
                        Country *
                      </label>
                      <input
                        type="text"
                        value={editForm.country || "India"}
                        onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full h-10 rounded-lg border border-[#E4E4E7] bg-white px-3 text-xs outline-none focus:border-[#C8702A]"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8C8C]">
                        Address Tag / Type
                      </label>
                      <select
                        value={editForm.type || "home"}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full h-10 rounded-lg border border-[#E4E4E7] bg-white px-3 text-xs outline-none focus:border-[#C8702A] cursor-pointer"
                      >
                        <option value="home">Home</option>
                        <option value="work">Work</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 items-start">
                  {/* Radio Indicator */}
                  <div
                    className={`mt-1 size-4 rounded-full border flex items-center justify-center transition-all ${
                      selectedId === address.id
                        ? "border-[#C8702A] bg-[#C8702A]"
                        : "border-[#D4D4D8] bg-white"
                    }`}
                  >
                    {selectedId === address.id && (
                      <div className="size-1.5 rounded-full bg-white" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#1A1A1A]">{address.name}</span>
                        {address.isDefault && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#C8702A]/10 text-[#C8702A] border border-[#C8702A]/20 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-[#8C8C8C] px-2 py-0.5 rounded-full border border-slate-200">
                          {address.type}
                        </span>
                      </div>

                      {/* Options Dropdown / Actions */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === address.id ? null : address.id);
                          }}
                          className="size-8 rounded-lg border border-transparent hover:border-[#E4E4E7] hover:bg-slate-50 flex items-center justify-center text-[#8C8C8C] transition-colors cursor-pointer bg-transparent"
                        >
                          <MoreVertical className="size-4" />
                        </button>

                        {menuOpenId === address.id && (
                          <div className="absolute right-0 top-9 w-32 rounded-xl bg-white border border-[#E4E4E7] shadow-lg py-1 z-20">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(address);
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-slate-50 flex items-center gap-2 cursor-pointer border-none bg-transparent"
                            >
                              <Pencil className="size-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(address.id);
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer border-none bg-transparent"
                            >
                              <Trash2 className="size-3.5" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-[#8C8C8C] space-y-0.5 leading-relaxed">
                      <p>{address.street}</p>
                      <p>
                        {address.city}, {address.state} — <span className="font-semibold text-[#1A1A1A]">{address.zip}</span>
                      </p>
                      <p>{address.country}</p>
                      <p className="mt-2 text-[11px] font-semibold text-[#1A1A1A]">
                        Phone: {address.phone}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add New Address Form Card */}
          {isAddingNew && (
            <div className="rounded-2xl border border-[#C8702A] bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E4E7]">
                <h3 className="text-sm font-bold text-[#1A1A1A]">Add New Address</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={cancelAddingNew}
                    className="px-3 py-1.5 rounded-lg border border-[#E4E4E7] bg-white text-xs font-semibold text-[#8C8C8C] hover:bg-slate-50 cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={saveNewAddress}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#C8702A] hover:bg-[#e05f0f] text-white text-xs font-semibold cursor-pointer border-none shadow-sm"
                  >
                    <Save className="size-3.5" />
                    Save
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8C8C]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.name || ""}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full h-10 rounded-lg border border-[#E4E4E7] bg-white px-3 text-xs outline-none focus:border-[#C8702A]"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8C8C]">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    value={editForm.phone || ""}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full h-10 rounded-lg border border-[#E4E4E7] bg-white px-3 text-xs outline-none focus:border-[#C8702A]"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8C8C]">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={editForm.street || ""}
                    onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                    className="w-full h-10 rounded-lg border border-[#E4E4E7] bg-white px-3 text-xs outline-none focus:border-[#C8702A]"
                    placeholder="123 Main Street, Apt 4B"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8C8C]">
                    City *
                  </label>
                  <input
                    type="text"
                    value={editForm.city || ""}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full h-10 rounded-lg border border-[#E4E4E7] bg-white px-3 text-xs outline-none focus:border-[#C8702A]"
                    placeholder="Mumbai"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8C8C]">
                    State *
                  </label>
                  <input
                    type="text"
                    value={editForm.state || ""}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full h-10 rounded-lg border border-[#E4E4E7] bg-white px-3 text-xs outline-none focus:border-[#C8702A]"
                    placeholder="Maharashtra"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8C8C]">
                    Postal / ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={editForm.zip || ""}
                    onChange={(e) => setEditForm({ ...editForm, zip: e.target.value })}
                    className="w-full h-10 rounded-lg border border-[#E4E4E7] bg-white px-3 text-xs outline-none focus:border-[#C8702A]"
                    placeholder="400001"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8C8C]">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={editForm.country || "India"}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full h-10 rounded-lg border border-[#E4E4E7] bg-white px-3 text-xs outline-none focus:border-[#C8702A]"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8C8C]">
                    Type / Tag
                  </label>
                  <select
                    value={editForm.type || "home"}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full h-10 rounded-lg border border-[#E4E4E7] bg-white px-3 text-xs outline-none focus:border-[#C8702A] cursor-pointer"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {addresses.length === 0 && !isAddingNew && (
          <div className="rounded-2xl border border-dashed border-[#E4E4E7] bg-slate-50 p-10 text-center flex flex-col items-center justify-center">
            <MapPin className="mb-3 size-10 text-[#8C8C8C]" />
            <h2 className="text-base font-bold text-[#1A1A1A]">No addresses saved</h2>
            <p className="mt-1 text-xs text-[#8C8C8C]">
              Add a shipping address to enable fast checkout
            </p>
            <button
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C8702A] hover:bg-[#e05f0f] text-white text-xs font-semibold transition-all shadow-sm cursor-pointer border-none"
              onClick={startAddingNew}
            >
              <Plus className="size-4" />
              Add Address
            </button>
          </div>
        )}
      </div>
    </section>
  );
}