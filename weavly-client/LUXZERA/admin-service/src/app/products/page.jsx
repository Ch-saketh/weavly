"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminBreadcrumbHeader from "@/components/AdminBreadcrumbHeader";
import { getAdminProducts, createAdminProduct, deleteAdminProduct } from "@/services/adminService";
import { formatErrorMessage } from "@/utils/errorUtils";
import { getToken } from "@/utils/token";

export default function AdminProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    title: "",
    brand: "ATELIER ZERA",
    price: "",
    stock: "1",
    category: "Men",
    description: "",
    images: [],
  });

  const fetchProducts = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await getAdminProducts();
      const list = Array.isArray(data) ? data : data?.products || data?.content || [];
      setProducts(list);
    } catch (err) {
      console.warn("Backend product API fetch notice:", err.message || err);
      setErrorMsg(formatErrorMessage(err, "Failed to fetch product catalog from API."));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    fetchProducts();
  }, [router]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const urls = files.map((file) => URL.createObjectURL(file));
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...urls],
    }));
  };

  const handleRemoveImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price) {
      setErrorMsg("Please fill in all required product details.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const numericPrice = parseFloat(form.price) || 0;
      const payload = {
        name: form.title.trim(),
        title: form.title.trim(),
        description: form.description || form.title.trim(),
        brand: form.brand.trim(),
        brandNames: [form.brand.trim()],
        basePrice: numericPrice,
        price: numericPrice,
        salePrice: numericPrice,
        stock: parseInt(form.stock || "1", 10),
        stockQuantity: parseInt(form.stock || "1", 10),
        audience: form.category,
        categoryName: form.category,
        category: form.category,
        imageUrls: form.images.length > 0 ? form.images : ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80"],
        images: form.images.length > 0 ? form.images : ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80"],
      };

      const created = await createAdminProduct(payload);
      setSuccessMsg(`Product "${form.title}" created via API!`);
      setIsModalOpen(false);
      setForm({
        title: "",
        brand: "ATELIER ZERA",
        price: "",
        stock: "1",
        category: "Men",
        description: "",
        images: [],
      });
      await fetchProducts();
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, "Failed to create product via API."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product via API?")) return;
    setErrorMsg("");
    try {
      await deleteAdminProduct(id);
      setSuccessMsg(`Product ${id} deleted via API.`);
      await fetchProducts();
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, "Failed to delete product via API."));
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] text-[#1D1D1F]">
      <AdminSidebar activeTab="products" />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminBreadcrumbHeader title="Product Catalog Studio" category="Operations" onRefresh={fetchProducts} refreshLoading={loading} />

        <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECECEC] pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">Product Catalog Management</h1>
              <p className="text-[13px] text-[#71717A] mt-1">
                Live API Endpoint: GET /api/admin/products
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1D1D1F] text-white text-[12.5px] font-bold hover:bg-[#F07020] transition-colors cursor-pointer shadow-md border-none"
            >
              <Plus size={16} />
              <span>Add New Product (API)</span>
            </button>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-[13px] font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg("")} className="text-xs text-emerald-600 font-bold border-none bg-transparent cursor-pointer">Dismiss</button>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-[13px] font-semibold flex items-center justify-between">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg("")} className="text-xs text-red-600 font-bold border-none bg-transparent cursor-pointer">Dismiss</button>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="py-20 text-center text-[#71717A] text-[13px]">
              <RefreshCw size={24} className="animate-spin text-[#F07020] mx-auto mb-3" />
              <span>Fetching product catalog from backend API...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-[#ECECEC]">
              <Sparkles size={32} className="text-[#71717A] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#1D1D1F]">No Products Returned From API</h3>
              <p className="text-xs text-[#71717A] mt-1 max-w-sm mx-auto">
                No items exist in the product catalog database. Click "Add New Product" to create one via API.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div key={prod.id} className="bg-white rounded-3xl border border-[#ECECEC] overflow-hidden shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="h-56 w-full bg-gray-100 relative overflow-hidden">
                      <img src={prod.images?.[0] || prod.imageUrl || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80"} alt={prod.title || prod.name} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 bg-[#1D1D1F] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {prod.category || "General"}
                      </span>
                    </div>
                    <div className="p-5 space-y-2">
                      <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#F07020]">{prod.brand || "LUXZERA"}</div>
                      <h3 className="text-base font-bold text-[#1D1D1F] line-clamp-1">{prod.title || prod.name}</h3>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-lg font-extrabold text-[#1D1D1F]">₹{Number(prod.price || 0).toLocaleString("en-IN")}</span>
                        <span className="text-[12px] font-semibold text-[#71717A] bg-[#FAFAF9] px-2.5 py-1 rounded-lg border border-[#ECECEC]">
                          Stock: {prod.stock ?? 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-[#ECECEC] flex items-center justify-between text-xs text-[#71717A] bg-[#FAFAF9]">
                    <span className="font-mono text-[11px]">ID: {String(prod.id).slice(0, 8)}</span>
                    <button
                      onClick={() => handleDelete(prod.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
                      title="Delete Product via API"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* New Product Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl space-y-6 border border-[#ECECEC] my-8">
                <div className="flex items-center justify-between pb-4 border-b border-[#ECECEC]">
                  <h3 className="text-xl font-bold text-[#1D1D1F]">Create Product via API</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100 border-none bg-transparent cursor-pointer">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitProduct} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#71717A] mb-1">Product Title *</label>
                    <input
                      required
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Hand-Embroidered Velvet Sherwani"
                      className="w-full h-11 px-4 rounded-xl border border-[#ECECEC] text-[13px] text-[#1D1D1F] outline-none focus:border-[#F07020]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#71717A] mb-1">Price (INR ₹) *</label>
                      <input
                        required
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="145000"
                        className="w-full h-11 px-4 rounded-xl border border-[#ECECEC] text-[13px] text-[#1D1D1F] outline-none focus:border-[#F07020]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#71717A] mb-1">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-[#ECECEC] text-[13px] text-[#1D1D1F] outline-none focus:border-[#F07020] bg-white cursor-pointer"
                      >
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                        <option value="Kids">Kids</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#71717A] mb-1">Image Upload</label>
                    <div className="border-2 border-dashed border-[#ECECEC] hover:border-[#F07020] rounded-2xl p-4 text-center cursor-pointer relative bg-[#FAFAF9]">
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <ImageIcon size={24} className="text-[#71717A] mx-auto mb-1" />
                      <p className="text-xs text-[#71717A] font-semibold">Click or drag images to upload</p>
                    </div>

                    {form.images.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                        {form.images.map((img, i) => (
                          <div key={i} className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0 border border-[#ECECEC]">
                            <img src={img} alt="upload" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(i)}
                              className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 text-[9px] border-none cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#ECECEC]">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-full border border-[#ECECEC] text-xs font-bold text-[#1D1D1F] hover:bg-gray-100 border-none cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-full bg-[#1D1D1F] text-white text-xs font-bold hover:bg-[#F07020] transition-colors border-none cursor-pointer disabled:opacity-50">
                      {submitting ? "Publishing API..." : "Publish Product (API)"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
