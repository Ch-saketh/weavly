import React, { useState, useEffect } from "react";
import { Package, ChevronDown, ChevronUp, Download, HelpCircle } from "lucide-react";

const OrdersView = ({ userId, onNavigateToTab }) => {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const storageKey = `Weavly_orders_${userId || "guest"}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setOrders(JSON.parse(saved));
    } else {
      const defaultOrders = [
        {
          id: "LZ-98374",
          date: "June 28, 2026",
          status: "Delivered",
          statusStep: 4,
          total: 289.00,
          shippingAddress: "Saketh Chokkapu, 123 Luxury Avenue, Apt 4B, New York, NY 10001",
          paymentMethod: "Visa ending in 4242",
          items: [
            {
              id: "item-1",
              name: "Signature Slim-Fit Linen Blazer",
              price: 189.00,
              quantity: 1,
              size: "M",
              color: "Classic Beige",
              image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=150&h=150&q=80"
            },
            {
              id: "item-2",
              name: "Premium Pima Cotton Tee",
              price: 50.00,
              quantity: 2,
              size: "M",
              color: "Optic White",
              image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=150&h=150&q=80"
            }
          ]
        },
        {
          id: "LZ-84729",
          date: "July 02, 2026",
          status: "Shipped",
          statusStep: 2,
          total: 145.00,
          shippingAddress: "Saketh Chokkapu, 123 Luxury Avenue, Apt 4B, New York, NY 10001",
          paymentMethod: "Mastercard ending in 9876",
          items: [
            {
              id: "item-3",
              name: "Tailored Pleated Trouser",
              price: 145.00,
              quantity: 1,
              size: "32",
              color: "Midnight Black",
              image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=150&h=150&q=80"
            }
          ]
        }
      ];
      localStorage.setItem(storageKey, JSON.stringify(defaultOrders));
      setOrders(defaultOrders);
    }
  }, [userId]);

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-white text-[#183B56] border-[#183B56]";
      case "shipped":
        return "bg-white text-[#183B56] border-[#183B56]";
      case "processing":
      case "placed":
        return "bg-white text-[#183B56] border-[#183B56]";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-300";
      default:
        return "bg-white text-[#183B56] border-[#183B56]";
    }
  };

  const renderStatusTracker = (currentStep = 0) => {
    const steps = ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"];
    return (
      <div className="py-4 px-2">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#183B56]/20 z-0" />
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStep;
            return (
              <div key={step} className="flex flex-col items-center z-10">
                <div 
                  className={`w-6 h-6 border flex items-center justify-center text-[10px] font-bold transition-all ${
                    isCompleted 
                      ? "bg-[#183B56] border-[#183B56] text-white" 
                      : "bg-[#F5EFEB] border-[#183B56]/40 text-[#5A7184]"
                  }`}
                >
                  {idx + 1}
                </div>
                <span className={`text-[9px] font-bold mt-1.5 uppercase tracking-wider text-center ${isCompleted ? "text-[#183B56]" : "text-[#5A7184]"}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="border border-[#183B56] bg-[#F5EFEB] p-6 sm:p-8 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="pb-4 border-b border-[#183B56] flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#183B56]">Order History</h2>
          <p className="text-xs text-[#5A7184] mt-0.5">Track shipments and review past purchases.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#183B56] text-[10px] font-bold uppercase tracking-wider text-[#183B56] shadow-xs">
          <Package size={12} />
          <span>{orders.length} orders</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="py-14 border border-dashed border-[#183B56] p-8 text-center bg-[#DFE7ED]/20 shadow-xs">
          <Package size={28} className="text-[#183B56] mx-auto mb-3" />
          <p className="text-sm font-bold text-[#183B56]">No orders placed yet</p>
          <p className="text-xs text-[#5A7184] mt-1.5 max-w-[220px] mx-auto leading-relaxed">Browse our collections to start adding atelier pieces to your wardrobe.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <div 
                key={order.id} 
                className="border border-[#183B56] bg-[#F5EFEB] shadow-xs transition-all overflow-hidden"
              >
                {/* Header Row */}
                <div 
                  onClick={() => toggleExpand(order.id)}
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#183B56]/[0.02] transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div>
                      <span className="text-sm font-bold text-[#183B56]">{order.id}</span>
                      <p className="text-[11px] text-[#5A7184] mt-0.5">{order.date}</p>
                    </div>
                    <div className="h-6 w-[1px] bg-[#183B56]/20 hidden sm:block" />
                    <div>
                      <span className="text-[9px] font-bold text-[#5A7184] uppercase tracking-[0.12em]">Total</span>
                      <p className="text-sm font-bold text-[#183B56] mt-0.5">₹{Math.round(order.total * 85).toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 border text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                    {isExpanded ? <ChevronUp size={15} className="text-[#183B56]" /> : <ChevronDown size={15} className="text-[#183B56]" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-[#183B56] bg-[#DFE7ED]/20 space-y-6">
                    {/* Status Tracker */}
                    <div className="bg-white border border-[#183B56] p-4 shadow-xs">
                      {renderStatusTracker(order.statusStep ?? 4)}
                    </div>

                    {/* Items List */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[#183B56]">Items in this order</h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-[#183B56] shadow-xs">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="w-12 h-14 object-cover border border-[#183B56]" />
                              <div>
                                <h5 className="text-xs font-bold text-[#183B56]">{item.name}</h5>
                                <p className="text-[10px] text-[#5A7184] mt-0.5">Size: {item.size} • Color: {item.color} • Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-[#183B56]">₹{Math.round(item.price * 85).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping and Payment info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#183B56]/20 text-xs">
                      <div>
                        <span className="font-bold uppercase tracking-wider text-[10px] text-[#5A7184] block mb-1">Delivery Address</span>
                        <p className="text-[#183B56] leading-relaxed">{order.shippingAddress}</p>
                      </div>
                      <div>
                        <span className="font-bold uppercase tracking-wider text-[10px] text-[#5A7184] block mb-1">Payment Method</span>
                        <p className="text-[#183B56]">{order.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersView;
