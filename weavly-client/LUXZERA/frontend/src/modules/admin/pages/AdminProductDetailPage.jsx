"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit3, Send, Archive, Trash2, Plus, Image as ImageIcon,
  CheckCircle2, AlertTriangle, ShieldAlert, Package, DollarSign, Layers
} from "lucide-react";
import AdminSidebar from "@/modules/admin/components/AdminSidebar";
import AdminBreadcrumbHeader from "@/modules/admin/components/AdminBreadcrumbHeader";
import {
  getProductDetail, updateProduct, publishProduct, archiveProduct,
  deleteProduct, updateProductInventory, addProductMedia,
  deleteProductMedia, getCurrentAdmin
} from "@/modules/admin/services/adminService";
import { formatErrorMessage } from "@/shared/utils/errorUtils";

export default function AdminProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [adminProfile, setAdminProfile] = useState(null);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    salePrice: "",
    audience: "",
    brandName: "",
    categoryName: ""
  });

  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [stockForm, setStockForm] = useState({ quantity: 0, reason: "" });

  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [admin, prod] = await Promise.all([
        getCurrentAdmin(),
        getProductDetail(id)
      ]);
      setAdminProfile(admin);
      setProduct(prod);
      setEditForm({
        name: prod.name || "",
        description: prod.description || "",
        basePrice: prod.basePrice || "",
        salePrice: prod.salePrice || "",
        audience: prod.audience || "UNISEX",
        brandName: prod.brandName || "",
        categoryName: prod.categoryName || ""
      });
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push("/admin/login");
      } else {
        setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to load product details.") });
      }
    } finally {
      setLoading(false);
    }
  };

  const isSuper = adminProfile?.role === "SUPER_ADMIN";
  const permissions = new Set(adminProfile?.permissions || []);
  const can = (perm) => isSuper || permissions.has(perm);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editForm.name,
        description: editForm.description,
        basePrice: parseFloat(editForm.basePrice),
        salePrice: editForm.salePrice ? parseFloat(editForm.salePrice) : null,
        audience: editForm.audience,
        brandName: editForm.brandName,
        categoryName: editForm.categoryName
      };
      const updated = await updateProduct(id, payload);
      setProduct(updated);
      setShowEditModal(false);
      setFeedback({ type: "success", message: "Product updated successfully." });
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Update failed.") });
    }
  };

  const handlePublish = async () => {
    if (!confirm(`Publish "${product?.name}" to active storefront and Zyra recommendations?`)) return;
    try {
      const updated = await publishProduct(id);
      setProduct(updated);
      setFeedback({ type: "success", message: "Product published to ACTIVE catalog." });
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Publishing failed.") });
    }
  };

  const handleArchive = async () => {
    if (!confirm(`Archive "${product?.name}"? It will be hidden from customer storefront but historical records remain intact.`)) return;
    try {
      const updated = await archiveProduct(id);
      setProduct(updated);
      setFeedback({ type: "success", message: "Product moved to ARCHIVED status." });
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Archival failed.") });
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Safely deactivate "${product?.name}"? Historical orders and audit history are permanently preserved.`)) return;
    try {
      await deleteProduct(id);
      setFeedback({ type: "success", message: "Product deactivated safely." });
      setTimeout(() => router.push("/admin/products"), 1200);
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Deletion failed.") });
    }
  };

  const handleOpenStockModal = (variant) => {
    setSelectedVariant(variant);
    setStockForm({ quantity: variant.stockQuantity || 0, reason: "" });
    setShowStockModal(true);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVariant) return;
    try {
      const payload = {
        variantId: selectedVariant.id,
        quantity: parseInt(stockForm.quantity, 10),
        reason: stockForm.reason,
        version: selectedVariant.version
      };
      await updateProductInventory(id, payload);
      setShowStockModal(false);
      setFeedback({ type: "success", message: "Inventory updated with concurrency verification." });
      loadData();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Stock update failed.") });
    }
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    try {
      await addProductMedia(id, file, false);
      setFeedback({ type: "success", message: "Product photo uploaded to R2 gallery." });
      loadData();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Image upload failed.") });
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async (mediaUrl) => {
    if (!confirm("Remove this image from product gallery?")) return;
    try {
      await deleteProductMedia(id, mediaUrl);
      setFeedback({ type: "success", message: "Media asset deleted." });
      loadData();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Delete failed.") });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F5EFEB] text-[#183B56] items-center justify-center font-sans">
        <span className="text-xs font-bold uppercase tracking-widest">Loading Catalog Dossier...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen bg-[#F5EFEB] text-[#183B56] items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <p className="text-sm font-bold">Product not found.</p>
          <Link href="/admin/products" className="text-xs text-blue-600 underline">Return to Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5EFEB] font-sans antialiased text-[#183B56] overflow-hidden">
      <AdminSidebar activeTab="products" />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminBreadcrumbHeader
          breadcrumbs={[
            { label: "Control Plane", href: "/admin/dashboard" },
            { label: "Product Catalog", href: "/admin/products" },
            { label: product.name }
          ]}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#183B56]/20 bg-white p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/admin/products"
                  className="text-xs font-semibold text-[#5A7184] hover:text-[#183B56] flex items-center gap-1"
                >
                  <ArrowLeft size={12} />
                  <span>Catalog Registry</span>
                </Link>
                <span className="text-[#5A7184]">/</span>
                <span className="text-[10px] font-mono uppercase bg-[#183B56] text-white px-2 py-0.5 font-bold">
                  {product.status}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#183B56]">
                {product.name}
              </h1>
              <p className="text-xs text-[#5A7184] font-mono mt-0.5">
                ID: {product.productId} • Database UUID: {product.id}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {can("products.update") && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-3.5 py-1.5 border border-[#183B56]/30 bg-white text-[#183B56] text-xs font-semibold hover:bg-[#F5EFEB] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Edit3 size={13} />
                  <span>Edit Details</span>
                </button>
              )}

              {can("products.publish") && product.status !== "ACTIVE" && (
                <button
                  onClick={handlePublish}
                  className="px-3.5 py-1.5 bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Send size={13} />
                  <span>Publish to Store</span>
                </button>
              )}

              {can("products.archive") && product.status === "ACTIVE" && (
                <button
                  onClick={handleArchive}
                  className="px-3.5 py-1.5 border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Archive size={13} />
                  <span>Archive</span>
                </button>
              )}

              {can("products.delete") && (
                <button
                  onClick={handleDelete}
                  className="px-3.5 py-1.5 border border-rose-300 bg-rose-50 text-rose-800 text-xs font-semibold hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Trash2 size={13} />
                  <span>Safe Deactivate</span>
                </button>
              )}
            </div>
          </div>

          {/* Feedback banner */}
          {feedback.message && (
            <div className={`p-4 border flex items-center justify-between text-xs font-medium ${
              feedback.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}>
              <span>{feedback.message}</span>
              <button onClick={() => setFeedback({ type: "", message: "" })} className="text-gray-500 hover:text-black font-bold ml-4">✕</button>
            </div>
          )}

          {/* Main Grid: Overview & Pricing */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Classification & Inventory */}
            <div className="lg:col-span-2 space-y-6">
              {/* Classification Dossier */}
              <div className="bg-white border border-[#183B56]/20 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#183B56]/15 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-[#183B56]" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#183B56]">Classification & Identity</h2>
                  </div>
                  <span className="text-[10px] font-mono text-[#5A7184]">Audience: {product.audience}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="block font-bold text-[#5A7184] text-[10px] uppercase">Brand</span>
                    <span className="font-semibold text-[#183B56]">{product.brandName || "Weavly Bespoke"}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-[#5A7184] text-[10px] uppercase">Category</span>
                    <span className="font-semibold text-[#183B56]">{product.categoryName || "Uncategorized"}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-[#5A7184] text-[10px] uppercase">Target Audience</span>
                    <span className="font-semibold text-[#183B56]">{product.audience}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-[#5A7184] text-[10px] uppercase">Total Stock</span>
                    <span className="font-semibold font-mono text-[#183B56]">{product.totalStock} units</span>
                  </div>
                </div>

                {product.description && (
                  <div className="pt-2 border-t border-[#183B56]/10">
                    <span className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Description</span>
                    <p className="text-xs text-[#5A7184] leading-relaxed whitespace-pre-wrap">{product.description}</p>
                  </div>
                )}
              </div>

              {/* SKU & Variant Matrix */}
              <div className="bg-white border border-[#183B56]/20 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#183B56]/15 pb-3">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-[#183B56]" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#183B56]">Inventory & Variant Matrix</h2>
                  </div>
                  <span className="text-[10px] font-mono text-[#5A7184]">{product.variants?.length || 0} variant(s) registered</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#183B56]/15 bg-[#F5EFEB]/30 text-[10px] font-bold text-[#5A7184] uppercase">
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">Attributes</th>
                        <th className="py-2.5 px-3">Quantity</th>
                        <th className="py-2.5 px-3">Version</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#183B56]/10">
                      {product.variants?.map((v) => (
                        <tr key={v.id} className="hover:bg-[#F5EFEB]/20">
                          <td className="py-2.5 px-3 font-mono font-bold text-[#183B56]">{v.sku}</td>
                          <td className="py-2.5 px-3 text-[#5A7184]">
                            {v.attributes ? Object.entries(v.attributes).map(([k, val]) => `${k}: ${val}`).join(", ") : "Standard"}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold">
                            <span className={v.stockQuantity <= 5 ? "text-rose-700" : "text-[#183B56]"}>
                              {v.stockQuantity}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-[#5A7184]">v{v.version || 1}</td>
                          <td className="py-2.5 px-3 text-right">
                            {can("products.inventory") && (
                              <button
                                onClick={() => handleOpenStockModal(v)}
                                className="px-2.5 py-1 border border-[#183B56]/30 bg-white hover:bg-[#F5EFEB] text-[10px] font-bold uppercase cursor-pointer"
                              >
                                Adjust Stock
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Col: Pricing & Photo Gallery */}
            <div className="space-y-6">
              {/* Pricing Dossier */}
              <div className="bg-white border border-[#183B56]/20 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-[#183B56]/15 pb-3">
                  <DollarSign size={16} className="text-[#183B56]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#183B56]">Financial & Pricing</h2>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#5A7184]">Base Price</span>
                    <span className="font-mono font-bold text-base text-[#183B56]">
                      ${Number(product.basePrice).toFixed(2)}
                    </span>
                  </div>

                  {product.salePrice && (
                    <div className="flex items-center justify-between border-t border-[#183B56]/10 pt-2">
                      <span className="text-emerald-700 font-bold">Sale Price</span>
                      <span className="font-mono font-bold text-base text-emerald-700">
                        ${Number(product.salePrice).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-[#183B56]/10 pt-2 text-[10px] text-[#5A7184]">
                    <span>Currency</span>
                    <span className="font-mono font-bold">USD ($)</span>
                  </div>
                </div>
              </div>

              {/* Media Gallery */}
              <div className="bg-white border border-[#183B56]/20 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#183B56]/15 pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-[#183B56]" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#183B56]">R2 Photography</h2>
                  </div>
                  {can("products.media") && (
                    <label className="text-[10px] font-bold uppercase bg-[#183B56] text-white px-2 py-1 cursor-pointer hover:bg-[#102A43]">
                      <span>{uploadingMedia ? "Uploading..." : "+ Upload"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleMediaUpload}
                        disabled={uploadingMedia}
                      />
                    </label>
                  )}
                </div>

                {/* Primary Photo */}
                <div>
                  <span className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Primary Thumbnail</span>
                  <div className="aspect-square bg-gray-100 border border-[#183B56]/20 overflow-hidden flex items-center justify-center">
                    {product.primaryImageUrl ? (
                      <img src={product.primaryImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-[#5A7184]">No Primary Photo Set</span>
                    )}
                  </div>
                </div>

                {/* Gallery Images */}
                {product.galleryImages && product.galleryImages.length > 0 && (
                  <div className="space-y-1">
                    <span className="block font-bold text-[#5A7184] text-[10px] uppercase">Additional Gallery Assets</span>
                    <div className="grid grid-cols-3 gap-2">
                      {product.galleryImages.map((imgUrl) => (
                        <div key={imgUrl} className="relative group aspect-square border border-[#183B56]/20 overflow-hidden">
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                          {can("products.media") && (
                            <button
                              onClick={() => handleDeleteMedia(imgUrl)}
                              className="absolute top-1 right-1 size-5 bg-rose-700 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer shadow-xs"
                              title="Delete Photo"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#183B56] w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#183B56]/20 pb-2">
              <h3 className="text-base font-bold text-[#183B56]">Edit Product Metadata</h3>
              <button onClick={() => setShowEditModal(false)} className="text-[#5A7184] hover:text-[#183B56] font-bold">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Product Title</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.basePrice}
                    onChange={(e) => setEditForm({ ...editForm, basePrice: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Sale Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.salePrice}
                    onChange={(e) => setEditForm({ ...editForm, salePrice: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Audience</label>
                  <select
                    value={editForm.audience}
                    onChange={(e) => setEditForm({ ...editForm, audience: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#183B56]/30 bg-white"
                  >
                    <option value="MEN">MEN</option>
                    <option value="WOMEN">WOMEN</option>
                    <option value="UNISEX">UNISEX</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Brand</label>
                  <input
                    type="text"
                    value={editForm.brandName}
                    onChange={(e) => setEditForm({ ...editForm, brandName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#183B56]/30 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Category</label>
                  <input
                    type="text"
                    value={editForm.categoryName}
                    onChange={(e) => setEditForm({ ...editForm, categoryName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#183B56]/30 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#183B56]/15">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-[#183B56]/20 bg-white text-[#5A7184]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#183B56] text-white font-bold"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#183B56] w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#183B56]/20 pb-2">
              <h3 className="text-base font-bold text-[#183B56]">Adjust Inventory Level</h3>
              <button onClick={() => setShowStockModal(false)} className="text-[#5A7184] hover:text-[#183B56] font-bold">✕</button>
            </div>

            <form onSubmit={handleStockSubmit} className="space-y-3 text-xs">
              <div>
                <span className="block font-bold text-[#5A7184] text-[10px] uppercase">SKU</span>
                <span className="font-mono font-bold text-sm text-[#183B56]">{selectedVariant?.sku}</span>
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">New Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Adjustment Reason (Mandatory Audit Requirement)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Physical inventory reconciliation, inbound supplier shipment..."
                  value={stockForm.reason}
                  onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#183B56]/15">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 border border-[#183B56]/20 bg-white text-[#5A7184]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#183B56] text-white font-bold"
                >
                  Confirm Stock Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
