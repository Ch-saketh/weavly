"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ShoppingBag, Truck, CheckCircle2, Clock, XCircle, RotateCcw,
  DollarSign, User, Package, Calendar, AlertTriangle, ShieldCheck, History
} from "lucide-react";
import AdminSidebar from "@/modules/admin/components/AdminSidebar";
import AdminBreadcrumbHeader from "@/modules/admin/components/AdminBreadcrumbHeader";
import {
  getOrderDetail, updateOrderStatus, cancelOrder,
  updateOrderTracking, requestOrderRefund, getOrderTimeline,
  getCurrentAdmin
} from "@/modules/admin/services/adminService";
import { formatErrorMessage } from "@/shared/utils/errorUtils";

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [order, setOrder] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [adminProfile, setAdminProfile] = useState(null);

  // Modals
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState(null);
  const [statusReason, setStatusReason] = useState("");

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingForm, setTrackingForm] = useState({ carrier: "", trackingNumber: "", trackingUrl: "" });

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundForm, setRefundForm] = useState({ amount: "", reason: "" });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [admin, ord, time] = await Promise.all([
        getCurrentAdmin(),
        getOrderDetail(id),
        getOrderTimeline(id)
      ]);
      setAdminProfile(admin);
      setOrder(ord);
      setTimeline(time || []);
      setTrackingForm({
        carrier: ord.shipping?.carrier || "Standard Courier",
        trackingNumber: ord.shipping?.trackingNumber || "",
        trackingUrl: ord.shipping?.trackingUrl || ""
      });
      setRefundForm({
        amount: ord.total?.toString() || "",
        reason: ""
      });
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push("/admin/login");
      } else {
        setFeedback({ type: "error", message: formatErrorMessage(err, "Failed to load order dossier.") });
      }
    } finally {
      setLoading(false);
    }
  };

  const isSuper = adminProfile?.role === "SUPER_ADMIN";
  const permissions = new Set(adminProfile?.permissions || []);
  const can = (perm) => isSuper || permissions.has(perm);

  // Controlled legal next state calculation
  const getLegalTransitions = (status) => {
    switch (status) {
      case "PENDING":
        return [
          { status: "PROCESSING", label: "Advance to PROCESSING", style: "bg-blue-800 text-white" }
        ];
      case "PROCESSING":
        return [
          { status: "SHIPPED", label: "Mark as SHIPPED", style: "bg-emerald-800 text-white" }
        ];
      case "SHIPPED":
        return [
          { status: "DELIVERED", label: "Confirm DELIVERED", style: "bg-emerald-900 text-white" },
          { status: "RETURNED", label: "Mark RETURNED", style: "bg-purple-800 text-white" }
        ];
      case "DELIVERED":
        return [
          { status: "RETURNED", label: "Process RETURN", style: "bg-purple-800 text-white" }
        ];
      default:
        return [];
    }
  };

  const handleOpenStatusModal = (nextStatus) => {
    setTargetStatus(nextStatus);
    setStatusReason("");
    setShowStatusModal(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!targetStatus) return;
    try {
      const payload = {
        status: targetStatus,
        reason: statusReason,
        version: order.version
      };
      const updated = await updateOrderStatus(id, payload);
      setOrder(updated);
      setShowStatusModal(false);
      setFeedback({ type: "success", message: `Order transitioned to ${targetStatus}.` });
      loadData();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Transition rejected.") });
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        reason: cancelReason,
        version: order.version
      };
      const updated = await cancelOrder(id, payload);
      setOrder(updated);
      setShowCancelModal(false);
      setFeedback({ type: "success", message: "Order cancelled successfully." });
      loadData();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Cancellation rejected.") });
    }
  };

  const handleTrackingSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        carrier: trackingForm.carrier,
        trackingNumber: trackingForm.trackingNumber,
        trackingUrl: trackingForm.trackingUrl,
        version: order.version
      };
      await updateOrderTracking(id, payload);
      setShowTrackingModal(false);
      setFeedback({ type: "success", message: "Tracking and carrier information updated." });
      loadData();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Tracking update rejected.") });
    }
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        amount: parseFloat(refundForm.amount),
        reason: refundForm.reason,
        version: order.version
      };
      await requestOrderRefund(id, payload);
      setShowRefundModal(false);
      setFeedback({ type: "success", message: "Refund requested administratively (pending live gateway integration)." });
      loadData();
    } catch (err) {
      setFeedback({ type: "error", message: formatErrorMessage(err, "Refund request rejected.") });
    }
  };

  const getStatusBadge = (orderStatus) => {
    switch (orderStatus) {
      case "DELIVERED":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-emerald-50 text-emerald-800 border-emerald-300">DELIVERED</span>;
      case "SHIPPED":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-blue-50 text-blue-800 border-blue-300">SHIPPED</span>;
      case "PROCESSING":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-amber-50 text-amber-900 border-amber-300">PROCESSING</span>;
      case "PENDING":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-slate-50 text-slate-700 border-slate-300">PENDING</span>;
      case "CANCELLED":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-rose-50 text-rose-800 border-rose-300">CANCELLED</span>;
      case "RETURNED":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-purple-50 text-purple-800 border-purple-300">RETURNED</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-gray-50 text-gray-700 border-gray-300">{orderStatus}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F5EFEB] text-[#183B56] items-center justify-center font-sans">
        <span className="text-xs font-bold uppercase tracking-widest">Loading Order Ledger Dossier...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-screen bg-[#F5EFEB] text-[#183B56] items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <p className="text-sm font-bold">Order not found.</p>
          <Link href="/admin/orders" className="text-xs text-blue-600 underline">Return to Orders</Link>
        </div>
      </div>
    );
  }

  const legalTransitions = getLegalTransitions(order.status);
  const isCancellable = order.status === "PENDING" || order.status === "PROCESSING";

  return (
    <div className="flex h-screen bg-[#F5EFEB] font-sans antialiased text-[#183B56] overflow-hidden">
      <AdminSidebar activeTab="orders" />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminBreadcrumbHeader
          breadcrumbs={[
            { label: "Control Plane", href: "/admin/dashboard" },
            { label: "Order Operations", href: "/admin/orders" },
            { label: order.orderNumber || order.id }
          ]}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#183B56]/20 bg-white p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/admin/orders"
                  className="text-xs font-semibold text-[#5A7184] hover:text-[#183B56] flex items-center gap-1"
                >
                  <ArrowLeft size={12} />
                  <span>Orders Ledger</span>
                </Link>
                <span className="text-[#5A7184]">/</span>
                {getStatusBadge(order.status)}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#183B56]">
                Order {order.orderNumber}
              </h1>
              <p className="text-xs text-[#5A7184] font-mono mt-0.5">
                Database UUID: {order.id} • Concurrency Version: v{order.version || 1}
              </p>
            </div>

            {/* Controlled Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Gated Legal Transitions */}
              {can("orders.update") && legalTransitions.map((t) => (
                <button
                  key={t.status}
                  onClick={() => handleOpenStatusModal(t.status)}
                  className={`px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs ${t.style}`}
                >
                  <span>{t.label}</span>
                </button>
              ))}

              {/* Cancellation */}
              {can("orders.cancel") && isCancellable && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-3.5 py-1.5 border border-rose-300 bg-rose-50 text-rose-800 text-xs font-semibold hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <XCircle size={13} />
                  <span>Cancel Order</span>
                </button>
              )}

              {/* Tracking */}
              {can("orders.tracking") && (
                <button
                  onClick={() => setShowTrackingModal(true)}
                  className="px-3.5 py-1.5 border border-[#183B56]/30 bg-white text-[#183B56] text-xs font-semibold hover:bg-[#F5EFEB] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Truck size={13} />
                  <span>Logistics / Tracking</span>
                </button>
              )}

              {/* Refund */}
              {can("orders.refund") && order.status !== "CANCELLED" && (
                <button
                  onClick={() => setShowRefundModal(true)}
                  className="px-3.5 py-1.5 border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RotateCcw size={13} />
                  <span>Request Refund</span>
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

          {/* Main Grid: Overview, Items, Shipping & Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Line items & Customer Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer & Order Metadata */}
              <div className="bg-white border border-[#183B56]/20 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#183B56]/15 pb-3">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-[#183B56]" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#183B56]">Customer & Order Overview</h2>
                  </div>
                  <span className="text-[10px] font-mono text-[#5A7184]">Placed: {new Date(order.createdAt).toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="block font-bold text-[#5A7184] text-[10px] uppercase">Customer Name</span>
                    <span className="font-semibold text-[#183B56]">{order.customer?.name}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-[#5A7184] text-[10px] uppercase">Customer Email</span>
                    <span className="font-semibold text-[#183B56]">{order.customer?.email}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-[#5A7184] text-[10px] uppercase">Fulfillment Status</span>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>
                  <div>
                    <span className="block font-bold text-[#5A7184] text-[10px] uppercase">Currency</span>
                    <span className="font-mono font-bold text-[#183B56]">{order.currency}</span>
                  </div>
                </div>

                {order.cancellation?.cancelledAt && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                    <span className="font-bold block uppercase text-[10px]">Cancellation Notice</span>
                    <p>Order cancelled on {new Date(order.cancellation.cancelledAt).toLocaleString()}. Reason: {order.cancellation.cancellationReason}</p>
                  </div>
                )}
              </div>

              {/* Line Items (Historical Prices Protected) */}
              <div className="bg-white border border-[#183B56]/20 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#183B56]/15 pb-3">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-[#183B56]" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#183B56]">
                      Purchased Items ({order.items?.length || 0})
                    </h2>
                  </div>
                  <span className="text-[10px] text-[#5A7184] font-medium">Historical Purchase Prices Protected</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#183B56]/15 bg-[#F5EFEB]/30 text-[10px] font-bold text-[#5A7184] uppercase">
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#183B56]/10">
                      {order.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-[#F5EFEB]/20">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="size-8 bg-gray-100 border border-[#183B56]/15 overflow-hidden shrink-0">
                                {item.productImageUrl ? (
                                  <img src={item.productImageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[8px] text-[#5A7184]">No Img</div>
                                )}
                              </div>
                              <span className="font-bold text-[#183B56]">{item.productName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-[10px] text-[#5A7184]">
                            {item.sku || "DEF-SKU"}
                          </td>
                          <td className="py-3 px-3 font-mono text-center font-bold">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-3 font-mono text-right text-[#5A7184]">
                            ${Number(item.unitPrice).toFixed(2)}
                          </td>
                          <td className="py-3 px-3 font-mono text-right font-bold text-[#183B56]">
                            ${Number(item.lineTotal).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Timeline & Audit Trail */}
              <div className="bg-white border border-[#183B56]/20 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-[#183B56]/15 pb-3">
                  <History size={16} className="text-[#183B56]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#183B56]">Order History & Audit Timeline</h2>
                </div>

                <div className="space-y-3">
                  {timeline.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      <div className="size-2 rounded-full bg-[#183B56] mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#183B56]">{item.action}</span>
                          <span className="font-mono text-[10px] text-[#5A7184]">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[#5A7184] text-[11px] mt-0.5">{item.details}</p>
                        <span className="text-[9px] font-mono text-gray-400">Actor: {item.actor} • {item.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Financials & Logistics */}
            <div className="space-y-6">
              {/* Financial Breakdown */}
              <div className="bg-white border border-[#183B56]/20 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-[#183B56]/15 pb-3">
                  <DollarSign size={16} className="text-[#183B56]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#183B56]">Financial Summary</h2>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#5A7184]">Subtotal</span>
                    <span className="font-mono font-bold">${Number(order.subtotal).toFixed(2)}</span>
                  </div>

                  {order.discountTotal && Number(order.discountTotal) > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount</span>
                      <span className="font-mono font-bold">-${Number(order.discountTotal).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-[#183B56]/10 pt-2 flex justify-between text-sm">
                    <span className="font-bold text-[#183B56]">Total Charged</span>
                    <span className="font-mono font-bold text-base text-[#183B56]">
                      ${Number(order.total).toFixed(2)} {order.currency}
                    </span>
                  </div>
                </div>

                {order.refund?.refundStatus !== "NONE" && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                    <span className="font-bold block uppercase text-[10px]">Refund Dossier</span>
                    <p>Status: {order.refund.refundStatus}</p>
                    {order.refund.refundRequestedAmount && (
                      <p className="font-mono font-bold">Requested: ${Number(order.refund.refundRequestedAmount).toFixed(2)}</p>
                    )}
                    <p className="text-[10px] text-amber-800">{order.refund.message}</p>
                  </div>
                )}
              </div>

              {/* Shipping & Logistics */}
              <div className="bg-white border border-[#183B56]/20 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#183B56]/15 pb-3">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-[#183B56]" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#183B56]">Logistics & Tracking</h2>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="block font-bold text-[#5A7184] text-[10px] uppercase">Carrier</span>
                    <span className="font-semibold text-[#183B56]">{order.shipping?.carrier || "Standard Courier"}</span>
                  </div>

                  <div>
                    <span className="block font-bold text-[#5A7184] text-[10px] uppercase">Tracking Number</span>
                    {order.shipping?.trackingNumber ? (
                      <span className="font-mono font-bold text-blue-800">{order.shipping.trackingNumber}</span>
                    ) : (
                      <span className="text-gray-400 italic">No tracking number assigned</span>
                    )}
                  </div>

                  {order.shipping?.trackingUrl && (
                    <div>
                      <span className="block font-bold text-[#5A7184] text-[10px] uppercase">Tracking URL</span>
                      <a
                        href={order.shipping.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline text-[11px] truncate block"
                      >
                        {order.shipping.trackingUrl}
                      </a>
                    </div>
                  )}

                  <div className="border-t border-[#183B56]/10 pt-2 grid grid-cols-2 gap-2 text-[10px] text-[#5A7184]">
                    <div>
                      <span className="block font-bold uppercase">Shipped Date</span>
                      <span>{order.shipping?.shippedAt ? new Date(order.shipping.shippedAt).toLocaleString() : "Not Shipped"}</span>
                    </div>
                    <div>
                      <span className="block font-bold uppercase">Delivered Date</span>
                      <span>{order.shipping?.deliveredAt ? new Date(order.shipping.deliveredAt).toLocaleString() : "Pending"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* State Transition Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#183B56] w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#183B56]">Confirm Fulfillment Transition</h3>
            <p className="text-xs text-[#5A7184]">
              Transition order <span className="font-bold text-[#183B56]">{order.orderNumber}</span> from{" "}
              <span className="font-bold">{order.status}</span> to <span className="font-bold text-emerald-800">{targetStatus}</span>.
            </p>

            <form onSubmit={handleStatusSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">
                  Operational Reason (Mandatory Audit Requirement)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Carrier pickup verified, dispatch completed..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#183B56]/15">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border border-[#183B56]/20 bg-white text-[#5A7184]"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#183B56] text-white font-bold">
                  Confirm Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#183B56] w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#183B56]">Cancel Order</h3>
            <p className="text-xs text-rose-800 bg-rose-50 p-2.5 border border-rose-200">
              Cancellation is terminal. Once cancelled, this order cannot be reopened or fulfilled.
            </p>

            <form onSubmit={handleCancelSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">
                  Cancellation Reason (Mandatory Audit Requirement)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Customer change of mind, inventory shortfall..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#183B56]/15">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-[#183B56]/20 bg-white text-[#5A7184]"
                >
                  Close
                </button>
                <button type="submit" className="px-4 py-2 bg-rose-700 text-white font-bold">
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#183B56] w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#183B56]">Logistics & Tracking Details</h3>

            <form onSubmit={handleTrackingSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Carrier</label>
                <input
                  type="text"
                  placeholder="e.g. DHL Express, FedEx, Blue Dart"
                  value={trackingForm.carrier}
                  onChange={(e) => setTrackingForm({ ...trackingForm, carrier: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Tracking Number</label>
                <input
                  type="text"
                  placeholder="e.g. DHL-984719283"
                  value={trackingForm.trackingNumber}
                  onChange={(e) => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Tracking URL</label>
                <input
                  type="url"
                  placeholder="https://track.dhl.com/..."
                  value={trackingForm.trackingUrl}
                  onChange={(e) => setTrackingForm({ ...trackingForm, trackingUrl: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#183B56]/15">
                <button
                  type="button"
                  onClick={() => setShowTrackingModal(false)}
                  className="px-4 py-2 border border-[#183B56]/20 bg-white text-[#5A7184]"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#183B56] text-white font-bold">
                  Save Logistics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-[#183B56]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#183B56] w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#183B56]">Request Order Refund</h3>
            <p className="text-xs text-[#5A7184]">
              Note: This action records the refund request in the Control Plane. External payment gateway settlement requires live gateway integration.
            </p>

            <form onSubmit={handleRefundSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Refund Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  max={order.total}
                  value={refundForm.amount}
                  onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white font-mono"
                  required
                />
                <span className="text-[10px] text-[#5A7184] mt-0.5 block">Max refundable: ${Number(order.total).toFixed(2)}</span>
              </div>

              <div>
                <label className="block font-bold text-[#5A7184] text-[10px] uppercase mb-1">Refund Reason</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Customer return, defective product..."
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#183B56]/30 bg-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#183B56]/15">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 border border-[#183B56]/20 bg-white text-[#5A7184]"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-900 text-white font-bold">
                  Submit Refund Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
