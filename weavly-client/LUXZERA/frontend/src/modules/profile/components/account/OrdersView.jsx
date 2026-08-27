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
          statusStep: 4, // 0: Placed, 1: Processing, 2: Shipped, 3: Out for Delivery, 4: Delivered
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
    setExpandedOrderId(prev => (prev === orderId ? null : orderId));
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case "processing":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      default:
        return "bg-[#F5F4F2] text-[#6B6B6B] border-[#E8E5E0]";
    }
  };

  // Premium step tracker
  const renderTracker = (currentStep) => {
    const steps = ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"];
    return (
      <div className="py-5 px-5 bg-[#FAFAF9] rounded-xl border border-[#E8E5E0] mt-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#ABABAB] mb-4">Shipment Progress</p>
        <div className="relative flex justify-between items-center w-full">
          {/* Track line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#E8E5E0] -z-10">
            <div 
              className="h-full bg-[#C8702A] transition-all duration-500" 
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
          
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStep;
            const isActive = idx === currentStep;
            return (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted 
                      ? "bg-[#C8702A] border-[#C8702A] text-white" 
                      : "bg-white border-[#D0CCC6] text-[#BFBFBF]"
                  } ${isActive ? "ring-4 ring-[#C8702A]/10 scale-110" : ""}`}
                >
                  <span className="text-[8px] font-bold">{idx + 1}</span>
                </div>
                <span className={`text-[8px] font-semibold mt-2 tracking-tight text-center ${isCompleted ? "text-[#1A1A1A]" : "text-[#BFBFBF]"}`}>
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
    <div className="font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Section Header */}
      <div className="pb-6 mb-6 border-b border-[#EDEBE8] flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#1A1A1A] tracking-[-0.02em]">Order History</h2>
          <p className="text-[13px] text-[#8C8C8C] mt-1">Track shipments and review past purchases.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F4F2] border border-[#E8E5E0] rounded-lg text-[10px] font-semibold text-[#8C8C8C] select-none">
          <Package size={12} className="text-[#ABABAB]" />
          <span>{orders.length} orders</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="py-14 border border-dashed border-[#E8E5E0] rounded-2xl text-center">
          <Package size={28} className="text-[#D0CCC6] mx-auto mb-3" />
          <p className="text-[13px] font-semibold text-[#6B6B6B]">No orders placed yet</p>
          <p className="text-[12px] text-[#ABABAB] mt-1.5 max-w-[220px] mx-auto leading-relaxed">Browse our collections to start adding luxury pieces to your wardrobe.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <div 
                key={order.id} 
                className="border border-[#E8E5E0] rounded-2xl bg-white transition-all overflow-hidden hover:border-[#D0CCC6]"
              >
                {/* Header Row */}
                <div 
                  onClick={() => toggleExpand(order.id)}
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#FAFAF9] transition-colors duration-150"
                >
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                    <div>
                      <span className="text-[13px] font-bold text-[#1A1A1A]">{order.id}</span>
                      <p className="text-[11px] text-[#ABABAB] mt-0.5">{order.date}</p>
                    </div>
                    <div className="h-5 w-[1px] bg-[#E8E5E0] hidden sm:block" />
                    <div>
                      <span className="text-[9px] font-semibold text-[#ABABAB] uppercase tracking-[0.12em]">Total</span>
                      <p className="text-[13px] font-bold text-[#1A1A1A] mt-0.5">${order.total.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 border rounded-lg text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                    {isExpanded ? <ChevronUp size={15} className="text-[#ABABAB]" /> : <ChevronDown size={15} className="text-[#ABABAB]" />}
                  </div>
                </div>

                {/* Expanded Panel */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-[#EDEBE8] space-y-4 pt-4">
                    {/* Items */}
                    <div className="space-y-2.5">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#ABABAB]">Items</p>
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4 items-center justify-between bg-[#FAFAF9] border border-[#E8E5E0] p-3.5 rounded-xl">
                          <div className="flex gap-3.5 items-center">
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-[#E8E5E0]" />
                            <div>
                              <p className="text-[12.5px] font-semibold text-[#1A1A1A] leading-tight">{item.name}</p>
                              <p className="text-[10.5px] text-[#8C8C8C] mt-1">
                                Size: <span className="font-semibold text-[#6B6B6B] mr-2">{item.size}</span>
                                Color: <span className="font-semibold text-[#6B6B6B]">{item.color}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[13px] font-bold text-[#1A1A1A]">${item.price.toFixed(2)}</p>
                            <p className="text-[10px] text-[#ABABAB] mt-0.5">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tracker */}
                    {renderTracker(order.statusStep)}

                    {/* Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 bg-[#FAFAF9] border border-[#E8E5E0] rounded-xl">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#ABABAB]">Shipping Address</p>
                        <p className="text-[12px] text-[#6B6B6B] mt-1.5 leading-relaxed">{order.shippingAddress}</p>
                      </div>
                      <div className="p-4 bg-[#FAFAF9] border border-[#E8E5E0] rounded-xl">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#ABABAB]">Payment</p>
                        <p className="text-[12px] text-[#6B6B6B] mt-1.5 leading-relaxed">{order.paymentMethod}</p>
                        <div className="flex gap-2 mt-3">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E8E5E0] hover:border-[#D0CCC6] rounded-lg text-[10px] font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] transition-all duration-200">
                            <Download size={11} />
                            <span>Invoice</span>
                          </button>
                          <button 
                            onClick={() => onNavigateToTab?.("support")}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E8E5E0] hover:border-[#D0CCC6] rounded-lg text-[10px] font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] transition-all duration-200"
                          >
                            <HelpCircle size={11} />
                            <span>Help</span>
                          </button>
                        </div>
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
