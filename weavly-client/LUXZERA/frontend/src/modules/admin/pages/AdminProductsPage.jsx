"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart3, Search, Download, Filter, Plus, ChevronLeft, ChevronRight,
  Eye, UploadCloud, Tag, Layers, CheckCircle2, AlertCircle, XCircle
} from "lucide-react";
import AdminSidebar from "@/modules/admin/components/AdminSidebar";
import AdminBreadcrumbHeader from "@/modules/admin/components/AdminBreadcrumbHeader";
import {
  getProducts, createProduct, importProducts,
  exportProducts, getCurrentAdmin
} from "@/modules/admin/services/adminService";
import { formatErrorMessage } from "@/shared/utils/errorUtils";

export default function AdminProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(25);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [audience, setAudience] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [adminProfile, setAdminProfile] = useState(null);

  // Create Product Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    salePrice: "",
    audience: "UNISEX",
    brandName: "",
    categoryName: "",
    initialStock: 10,
    initialSku: "",
    imageUrl: ""
  });

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const admin = await getCurrentAdmin();
      setAdminProfile(admin);

      const params = {
        page: currentPage,
        size: pageSize,
        search: search || undefined,
        status: status || undefined,
        audience: audience || undefined,
        category: category || undefined,
        brand: brand || undefined
      };
      const res = await getProducts(params);
      setProducts(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push("/admin/login");
      } else {
        setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to load product catalog.") });
      }
    } finally {
      setLoading(false);
    }
  };

  const isSuper = adminProfile?.role === "SUPER_ADMIN";
  const permissions = new Set(adminProfile?.permissions || []);
  const can = (perm) => isSuper || permissions.has(perm);

  const handleApplyFilters = () => {
    setCurrentPage(0);
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setAudience("");
    setCategory("");
    setBrand("");
    setCurrentPage(0);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...createForm,
        basePrice: parseFloat(createForm.basePrice),
        salePrice: createForm.salePrice ? parseFloat(createForm.salePrice) : null,
        initialStock: parseInt(createForm.initialStock, 10)
      };
      await createProduct(payload);
      setShowCreateModal(false);
      setFeedback({ type: "success", message: "Draft product created successfully." });
      setCreateForm({
        name: "",
        description: "",
        basePrice: "",
        salePrice: "",
        audience: "UNISEX",
        brandName: "",
        categoryName: "",
        initialStock: 10,
        initialSku: "",
        imageUrl: ""
      });
      fetchProducts();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to create product.") });
    }
  };

  const handleImport = async () => {
    if (!confirm("Run catalog import from product_metadata.csv? This will safely update or add products.")) return;
    setImporting(true);
    try {
      const res = await importProducts();
      setFeedback({ type: "success", message: res.message || "Import completed successfully." });
      fetchProducts();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Import failed.") });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        search: search || undefined,
        status: status || undefined,
        audience: audience || undefined,
        category: category || undefined,
        brand: brand || undefined
      };
      const blob = await exportProducts(params);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `weavly-products-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setFeedback({ type: "success", message: "Catalog exported successfully." });
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Export failed.") });
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (prodStatus) => {
    switch (prodStatus) {
      case "ACTIVE":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-emerald-50 text-emerald-800 border-emerald-300">ACTIVE</span>;
      case "DRAFT":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-amber-50 text-amber-900 border-amber-300">DRAFT</span>;
      case "ARCHIVED":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-gray-100 text-gray-700 border-gray-300">ARCHIVED</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-slate-50 text-slate-700 border-slate-300">{prodStatus}</span>;
    }
  };

  return (
    <div className="flex h-screen bg-[#F5EFEB] font-sans antialiased text-[#183B56] overflow-hidden">
      <AdminSidebar activeTab="products" />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminBreadcrumbHeader
          breadcrumbs={[{ label: "Control Plane", href: "/admin/dashboard" }, { label: "Product Catalog" }]}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#183B56]/20 bg-white p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono tracking-widest uppercase bg-[#183B56] text-white px-2 py-0.5 font-bold">
                  CATALOG COMMAND CENTER
                </span>
                <span className="text-xs font-semibold text-[#5A7184]">Products & Inventory Command</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#183B56]">
                Product Administration
              </h1>
              <p className="text-xs text-[#5A7184] mt-1 max-w-2xl">
                Direct title editing, SKU size matrices, R2 photo galleries, pricing controls, inventory adjustments, and draft-to-active lifecycle publishing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {can("products.create") && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-[#183B56] text-white text-xs font-semibold hover:bg-[#102A43] flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus size={14} />
                  <span>Create Product</span>
                </button>
              )}

              {can("products.create") && (
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="px-4 py-2 border border-[#183B56]/30 bg-white text-[#183B56] text-xs font-semibold hover:bg-[#F5EFEB] flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <UploadCloud size={14} className={importing ? "animate-spin" : ""} />
                  <span>{importing ? "Importing..." : "Import CSV"}</span>
                </button>
              )}

              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 border border-[#183B56]/30 bg-white text-[#183B56] text-xs font-semibold hover:bg-[#F5EFEB] flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Download size={14} className={exporting ? "animate-bounce" : ""} />
                <span>{exporting ? "Exporting..." : "Export CSV"}</span>
              </button>
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
              <button
                onClick={() => setFeedback({ type: "", message: "" })}
                className="text-gray-500 hover:text-black font-bold ml-4"
              >
                ✕
              </button>
            </div>
          )}

          {/* Filters Toolbar */}
          <div className="bg-white border border-[#183B56]/20 p-4 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Search Keywords</label>
                <input
                  type="text"
                  placeholder="Title, brand, SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-[#F5EFEB]/30 text-[#183B56] focus:outline-none focus:border-[#183B56]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Lifecycle Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-white text-[#183B56] focus:outline-none focus:border-[#183B56]"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-white text-[#183B56] focus:outline-none focus:border-[#183B56]"
                >
                  <option value="">All Audiences</option>
                  <option value="MEN">MEN</option>
                  <option value="WOMEN">WOMEN</option>
                  <option value="UNISEX">UNISEX</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Dresses, Outerwear..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#183B56]/20 bg-white text-[#183B56] focus:outline-none focus:border-[#183B56]"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 py-1.5 text-xs bg-[#183B56] text-white font-semibold hover:bg-[#102A43] border border-[#183B56] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Filter size={12} />
                  <span>Filter</span>
                </button>
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 text-xs border border-[#183B56]/20 bg-white hover:bg-[#F5EFEB] text-[#5A7184] cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Product Registry Table */}
          <div className="bg-white border border-[#183B56]/20 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#183B56]/20 bg-[#F5EFEB]/50 text-[11px] font-semibold text-[#5A7184] uppercase">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Audience</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#183B56]/10">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#5A7184]">
                        Querying product catalog...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#5A7184]">
                        No products matched your search filters.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F5EFEB]/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-10 bg-gray-100 border border-[#183B56]/15 overflow-hidden shrink-0">
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[9px] text-[#5A7184]">
                                  No Img
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-[#183B56] block">{p.name}</span>
                              <span className="text-[10px] font-mono text-[#5A7184]">ID: {p.productId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#5A7184]">
                          {p.brandName || "—"}
                        </td>
                        <td className="py-3 px-4 text-[#5A7184]">
                          {p.categoryName || "—"}
                        </td>
                        <td className="py-3 px-4 font-mono text-[10px] text-[#5A7184]">
                          {p.audience}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#183B56]">
                          {p.salePrice ? (
                            <div>
                              <span className="text-emerald-700">${Number(p.salePrice).toFixed(2)}</span>
                              <span className="line-through text-gray-400 text-[10px] ml-1">
                                ${Number(p.basePrice).toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span>${Number(p.basePrice).toFixed(2)}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className={p.totalStock <= 5 ? "text-rose-700 font-bold" : "text-[#183B56]"}>
                            {p.totalStock} units
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(p.status)}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#5A7184]">
                          {new Date(p.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 border border-[#183B56]/30 bg-white hover:bg-[#F5EFEB] text-[#183B56] text-[11px] font-semibold cursor-pointer shadow-2xs"
                          >
                            <Eye size={12} />
                            <span>Manage</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-3 border-t border-[#183B56]/15 bg-[#F5EFEB]/40 flex items-center justify-between text-xs">
              <span className="text-[#5A7184] font-medium">
                Page {currentPage + 1} of {Math.max(totalPages, 1)} ({totalElements} items)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  className="px-2.5 py-1 border border-[#183B56]/20 bg-white text-[#183B56] disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-2.5 py-1 border border-[#183B56]/20 bg-white text-[#183B56] disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#183B56] w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#183B56]/20 pb-2">
              <h3 className="text-base font-bold text-[#183B56]">Create New Product (Draft)</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#5A7184] hover:text-[#183B56] font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Cashmere Knit Sweater"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Material, fit, luxury silhouette details..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="250.00"
                    value={createForm.basePrice}
                    onChange={(e) => setCreateForm({ ...createForm, basePrice: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Sale Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional"
                    value={createForm.salePrice}
                    onChange={(e) => setCreateForm({ ...createForm, salePrice: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Audience</label>
                  <select
                    value={createForm.audience}
                    onChange={(e) => setCreateForm({ ...createForm, audience: e.target.value })}
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
                    placeholder="Weavly Bespoke"
                    value={createForm.brandName}
                    onChange={(e) => setCreateForm({ ...createForm, brandName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#183B56]/30 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="Dresses, Knitwear..."
                    value={createForm.categoryName}
                    onChange={(e) => setCreateForm({ ...createForm, categoryName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#183B56]/30 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={createForm.initialStock}
                    onChange={(e) => setCreateForm({ ...createForm, initialStock: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Initial SKU</label>
                  <input
                    type="text"
                    placeholder="e.g. LUX-KNT-01"
                    value={createForm.initialSku}
                    onChange={(e) => setCreateForm({ ...createForm, initialSku: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Primary Image URL</label>
                <input
                  type="url"
                  placeholder="https://media.weavly.store/..."
                  value={createForm.imageUrl}
                  onChange={(e) => setCreateForm({ ...createForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#183B56]/15">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#183B56]/20 bg-white text-[#5A7184]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#183B56] text-white font-bold"
                >
                  Create Draft Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
