"use client";

// src/pages/DesignerStudioPage.jsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home, Folder, Tag, ShoppingBag, Users, BarChart2, DollarSign,
  Star, Bell, MessageSquare, BookOpen, Settings,
  Plus, ExternalLink, Award, CheckCircle2,
  Lock, Search, LogOut, X, UploadCloud, ChevronRight
} from "lucide-react";

export default function DesignerStudioPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Profile setup (persisted in component state, ready for backend binding)
  const [profile, setProfile] = useState({
    brandName: "Saketh Studio",
    tagline: "",
    story: "",
    profilePhoto: null,
    brandLogo: null,
    coverBanner: null,
    email: "saketh@Weavly.com",
    instagram: "instagram.com/sakethstudio",
    website: "sakethstudio.com",
    verified: true,
  });

  // Dynamic creations state (collections, products)
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);

  // Modals state
  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  
  // Modal forms
  const [newCollection, setNewCollection] = useState({ name: "", desc: "", category: "Luxury", cover: null });
  const [newProduct, setNewProduct] = useState({ name: "", price: "", desc: "", category: "Men", sizes: "M, L, XL", image: null });

  // Onboarding checklist items (computed dynamically)
  const checklist = [
    { id: "photo", label: "Upload Profile Picture", done: !!profile.profilePhoto },
    { id: "logo", label: "Upload Brand Logo", done: !!profile.brandLogo },
    { id: "story", label: "Add Brand Story", done: profile.story.trim().length > 0 },
    { id: "verify", label: "Verify Identity", done: profile.verified },
    { id: "product", label: "Upload First Product", done: products.length > 0 },
    { id: "collection", label: "Publish First Collection", done: collections.length > 0 },
  ];

  const completedCount = checklist.filter(item => item.done).length;
  const completionPercentage = Math.round((completedCount / checklist.length) * 100);

  // Onboarding notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Welcome to Designer Studio", desc: "Manage your brand space, set up collections, and launch your store.", time: "10m ago", read: false },
    { id: 2, title: "Complete your profile", desc: "Upload brand logo, banner, and tagline to complete configuration.", time: "30m ago", read: false },
    { id: 3, title: "Upload your first collection", desc: "Add products and create a collection lookbook to go live.", time: "1h ago", read: false },
    { id: 4, title: "Verify your account", desc: "Curation committee review is pending identity proof uploads.", time: "2h ago", read: false }
  ]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Profile Upload simulations
  const [uploadProgress, setUploadProgress] = useState({});
  const simulateUpload = (field, fileList) => {
    const file = fileList[0];
    if (!file) return;

    setUploadProgress(prev => ({ ...prev, [field]: 10 }));
    let progress = 10;
    const interval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        clearInterval(interval);
        setProfile(prev => ({
          ...prev,
          [field]: { name: file.name, url: URL.createObjectURL(file) }
        }));
        setTimeout(() => {
          setUploadProgress(prev => {
            const next = { ...prev };
            delete next[field];
            return next;
          });
        }, 500);
      }
      setUploadProgress(prev => ({ ...prev, [field]: progress }));
    }, 100);
  };

  // Add mock collection handler
  const handleCreateCollection = (e) => {
    e.preventDefault();
    if (!newCollection.name) return;
    setCollections(prev => [...prev, { ...newCollection, id: Date.now() }]);
    setNewCollection({ name: "", desc: "", category: "Luxury", cover: null });
    setIsAddCollectionOpen(false);
  };

  // Add mock product handler
  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    setProducts(prev => [...prev, { ...newProduct, id: Date.now() }]);
    setNewProduct({ name: "", price: "", desc: "", category: "Men", sizes: "M, L, XL", image: null });
    setIsAddProductOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1D1D1F] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-[260px] shrink-0 border-r border-[#ECECEC] bg-white flex flex-col justify-between p-6">
        <div className="flex flex-col gap-7">
          {/* Logo brand */}
          <div onClick={() => router.push("/")} className="cursor-pointer flex items-center gap-1 font-serif text-[22px] tracking-tight">
            <span className="font-extrabold text-[#1D1D1F]">Lux</span>
            <span className="font-black text-[#F07020]">Zera</span>
          </div>

          {/* Designer Profile setup Card in Sidebar */}
          <div className="flex flex-col gap-3 p-4 bg-[#1D1D1F] text-white rounded-2xl relative overflow-hidden shadow-xs">
            <div className="absolute top-[-10px] right-[-10px] w-20 h-20 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center border border-white/20 shrink-0">
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto.url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[12px] font-black text-white/80">SS</span>
                )}
              </div>
              <div className="flex flex-col truncate text-left">
                <span className="text-[13px] font-bold tracking-tight truncate text-white">{profile.brandName}</span>
                <span className="text-[10px] text-[#C6A15B] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Award size={11} /> Verified Atelier
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-1">
            {[
              { id: "Dashboard", label: "Dashboard", icon: <Home size={16} /> },
              { id: "Collections", label: "Collections", icon: <Folder size={16} />, badge: collections.length || null },
              { id: "Products", label: "Products", icon: <Tag size={16} />, badge: products.length || null },
              { id: "Orders", label: "Orders", icon: <ShoppingBag size={16} /> },
              { id: "Customers", label: "Customers", icon: <Users size={16} /> },
              { id: "Analytics", label: "Analytics", icon: <BarChart2 size={16} /> },
              { id: "Earnings", label: "Earnings", icon: <DollarSign size={16} /> },
              { id: "Reviews", label: "Reviews", icon: <Star size={16} /> },
              { id: "Settings", label: "Settings", icon: <Settings size={16} /> }
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all border-none text-left cursor-pointer ${
                    active 
                      ? "bg-[#F07020]/10 text-[#F07020] font-bold" 
                      : "bg-transparent text-[#37352F] hover:bg-[#FAFAF9] font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3 text-[13px]">
                    <span className={active ? "text-[#F07020]" : "text-[#9B9B9B]"}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge ? (
                    <span className="text-[10px] font-bold bg-[#F07020] text-white px-2 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Upgrade to Pro Card */}
        <div className="flex flex-col gap-4">
          <div className="bg-gradient-to-br from-[#1D1D1F] to-[#2F293A] rounded-2xl p-4 text-white text-left relative overflow-hidden shadow-xs">
            <span className="absolute top-2 right-2 text-white/10 rotate-12"><Award size={64} /></span>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C6A15B] mb-1">Studio Pro Pass</p>
            <p className="text-[12px] text-white/80 leading-relaxed font-normal mb-3">Automate campaigns & gain real-time customer analytics.</p>
            <button className="w-full py-2.5 rounded-xl bg-[#F07020] text-white text-[12px] font-semibold border-none hover:bg-black transition-all cursor-pointer">
              Upgrade to Pro
            </button>
          </div>

          {/* Logout */}
          <button onClick={() => router.push("/")} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-[#9B9B9B] hover:text-[#D9381E] bg-transparent border-none text-left cursor-pointer transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP STATUS BAR */}
        <header className="h-[72px] bg-white border-b border-[#E7E3DD] px-8 flex items-center justify-between shrink-0">
          {/* Search bar */}
          <div className="flex items-center gap-2.5 bg-white border border-[#E7E3DD] rounded-full px-4 py-2 w-full max-w-[320px]">
            <Search size={14} className="text-[#86868B]" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="bg-transparent border-none outline-none text-[12.5px] text-[#0D1B2A] placeholder-[#86868B] w-full"
            />
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-5 relative">
            {/* Notifications Bell */}
            <button 
              onClick={() => setNotificationOpen(!notificationOpen)} 
              className="relative p-2 rounded-full hover:bg-white bg-transparent border-none cursor-pointer"
            >
              <Bell size={18} className="text-[#0D1B2A]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF6A00] ring-2 ring-white" />
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {notificationOpen && (
              <div className="absolute right-0 top-12 w-[340px] bg-white border border-[#E7E3DD] rounded-2xl shadow-xl z-50 p-4 animate-fade-in flex flex-col gap-3 text-left">
                <div className="flex items-center justify-between border-b border-[#FAF9F7] pb-2">
                  <span className="text-[12.5px] font-black text-[#0D1B2A] uppercase tracking-wider">System Alerts</span>
                  <button onClick={markAllNotificationsRead} className="text-[11px] font-bold text-[#FF6A00] hover:underline bg-transparent border-none cursor-pointer">
                    Mark Read
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl hover:bg-white border border-[#E7E3DD]/40 text-left">
                      <p className="text-[12px] font-bold text-[#0D1B2A]">{n.title}</p>
                      <p className="text-[11px] text-[#86868B] leading-relaxed mt-0.5">{n.desc}</p>
                      <span className="text-[9px] text-[#86868B] mt-1 inline-block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message/Chat icon */}
            <button className="p-2 rounded-full hover:bg-white bg-transparent border-none cursor-pointer">
              <MessageSquare size={18} className="text-[#0D1B2A]" />
            </button>

            {/* Avatar display */}
            <div className="flex items-center gap-3.5 pl-4 border-l border-[#E7E3DD]">
              <div className="text-right flex flex-col justify-center">
                <p className="text-[12.5px] font-extrabold text-[#0D1B2A] leading-tight">{profile.brandName}</p>
                <p className="text-[10px] text-[#86868B] font-semibold mt-0.5">Designer</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#E7E3DD] overflow-hidden flex items-center justify-center border border-[#EBE8E2]">
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto.url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px] font-black text-[#86868B]">SS</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* TAB WORKSPACE */}
        <main className="flex-1 overflow-y-auto p-8 bg-white">
          
          {/* TAB 1: DASHBOARD (HIGH FIDELITY MOCKUP MATCH) */}
          {activeTab === "Dashboard" && (
            <div className="max-w-[1200px] mx-auto animate-fade-in flex flex-col gap-6">
              
              {/* TWO COLUMN FLEX SYSTEM */}
              <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
                
                {/* LEFT MAIN WORKSPACE COLUMN (3/4 width) */}
                <div className="w-full lg:w-[73%] shrink-0 flex flex-col gap-6">
                  
                  {/* Title & Action Strip */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                    <div>
                      <p className="text-[13px] text-[#86868B] font-semibold">Welcome back, {profile.brandName.split(" ")[0]}! 👋</p>
                      <h1 className="text-[28px] sm:text-[34px] font-black tracking-tight text-[#0D1B2A] leading-tight font-serif flex items-center gap-2">
                        Designer Studio <span className="text-[#5B6EF5]"><CheckCircle2 size={24} fill="#5B6EF5" className="text-white" /></span>
                      </h1>
                      <p className="text-[12px] text-[#86868B] font-semibold mt-0.5">
                        Manage your brand, collections, and grow your fashion business.
                      </p>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-3">
                      <button onClick={() => setIsAddProductOpen(true)} className="px-4.5 py-3 rounded-xl bg-[#0D1B2A] hover:bg-[#FF6A00] text-white text-[11.5px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 border-none transition-all cursor-pointer">
                        <Plus size={14} /> Add New Product
                      </button>
                      <button onClick={() => setIsAddCollectionOpen(true)} className="px-4.5 py-3 rounded-xl border border-[#E2DFD8] hover:border-[#0D1B2A] text-[#0D1B2A] text-[11.5px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 bg-white transition-all cursor-pointer">
                        <Plus size={14} /> Create Collection
                      </button>
                      <button onClick={() => router.push("/")} className="px-4.5 py-3 rounded-xl border border-[#E2DFD8] hover:border-[#0D1B2A] text-[#0D1B2A] text-[11.5px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 bg-white transition-all cursor-pointer">
                        View Store <ExternalLink size={13} />
                      </button>
                    </div>
                  </div>

                  {/* DESIGNER PROFILE SETUP CARD (Allows simulated uploads) */}
                  <div className="bg-white rounded-3xl border border-[#E7E3DD] overflow-hidden shadow-sm relative flex flex-col">
                    {/* Cover Banner Area */}
                    <div className="w-full h-36 bg-white relative border-b border-[#E7E3DD] overflow-hidden flex items-center justify-center">
                      {profile.coverBanner ? (
                        <>
                          <img src={profile.coverBanner.url} alt="Cover Banner" className="w-full h-full object-cover" />
                          <button onClick={() => setProfile(prev => ({ ...prev, coverBanner: null }))} className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white p-1.5 rounded-full border-none cursor-pointer"><X size={14} /></button>
                        </>
                      ) : uploadProgress.coverBanner ? (
                        <span className="text-[11px] font-extrabold text-[#FF6A00] animate-pulse">Uploading cover banner ({uploadProgress.coverBanner}%)</span>
                      ) : (
                        <label className="cursor-pointer hover:underline text-[11px] font-extrabold text-[#86868B] uppercase tracking-wider flex items-center gap-1.5">
                          ➕ Upload Cover Banner
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => simulateUpload("coverBanner", e.target.files)} />
                        </label>
                      )}
                    </div>

                    {/* Logo & Photo fields */}
                    <div className="p-5 pt-11 relative flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                      
                      {/* Floating Profile Photo Avatar */}
                      <div className="absolute top-[-34px] left-5 w-18 h-18 rounded-full bg-white border border-[#E7E3DD] shadow-md p-1 overflow-hidden flex items-center justify-center">
                        <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center relative">
                          {profile.profilePhoto ? (
                            <>
                              <img src={profile.profilePhoto.url} alt="Avatar" className="w-full h-full object-cover" />
                              <button onClick={() => setProfile(prev => ({ ...prev, profilePhoto: null }))} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity border-none cursor-pointer"><X size={14} /></button>
                            </>
                          ) : uploadProgress.profilePhoto ? (
                            <span className="text-[8px] font-bold text-[#FF6A00] animate-pulse">Loading</span>
                          ) : (
                            <label className="cursor-pointer text-[10px] font-black text-center text-[#86868B] leading-none uppercase p-1">
                              ➕ Photo
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => simulateUpload("profilePhoto", e.target.files)} />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Brand Info fields */}
                      <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                        <h3 className="text-[17px] font-black text-[#0D1B2A] tracking-tight">{profile.brandName}</h3>
                        <p className="text-[12px] text-[#86868B] font-semibold mt-0.5">
                          {profile.tagline || (
                            <span onClick={() => setActiveTab("Settings")} className="text-[#FF6A00] hover:underline cursor-pointer">
                              Add brand story & tagline
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Brand Logo uploader */}
                      <div className="w-32 h-14 bg-white border border-dashed border-[#E7E3DD] rounded-xl flex items-center justify-center overflow-hidden relative shrink-0">
                        {profile.brandLogo ? (
                          <>
                            <img src={profile.brandLogo.url} alt="Brand Logo" className="w-full h-full object-contain p-2" />
                            <button onClick={() => setProfile(prev => ({ ...prev, brandLogo: null }))} className="absolute top-1 right-1 bg-black/60 text-white p-0.5 rounded-full border-none cursor-pointer"><X size={10} /></button>
                          </>
                        ) : uploadProgress.brandLogo ? (
                          <span className="text-[8px] font-bold text-[#FF6A00] animate-pulse">Loading</span>
                        ) : (
                          <label className="cursor-pointer hover:underline text-[9.5px] font-black text-[#86868B] uppercase tracking-wider text-center p-1 leading-tight">
                            ➕ Upload Logo
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => simulateUpload("brandLogo", e.target.files)} />
                          </label>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* 5 HORIZONTAL METRIC CARDS GRID (₹ -- empty state default) */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {[
                      { label: "Total Revenue", val: "₹ --", sub: "No data yet", icon: <DollarSign size={18} />, bg: "bg-orange-50 text-[#FF6A00]" },
                      { label: "Orders", val: "--", sub: "Connect backend", icon: <ShoppingBag size={18} />, bg: "bg-slate-50 text-[#0D1B2A]" },
                      { label: "Products Sold", val: "--", sub: "No sales yet", icon: <Folder size={18} />, bg: "bg-indigo-50 text-indigo-600" },
                      { label: "Total Views", val: "--", sub: "0 views registered", icon: <BarChart2 size={18} />, bg: "bg-teal-50 text-teal-600" },
                      { label: "Followers", val: "--", sub: "0 followers gained", icon: <Users size={18} />, bg: "bg-amber-50 text-amber-600" }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white border border-[#E7E3DD] rounded-2xl p-4 text-left flex justify-between shadow-sm relative overflow-hidden">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-extrabold text-[#86868B] uppercase tracking-wider mb-1.5">{stat.label}</span>
                          <span className="text-[20px] font-black text-[#0D1B2A] tracking-tight">{stat.val}</span>
                          <span className="text-[10px] text-[#86868B] font-semibold mt-1">{stat.sub}</span>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${stat.bg}`}>
                          {stat.icon}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ROW 2: REVENUE SPLINE CHART & TOP COLLECTIONS */}
                  <div className="flex flex-col md:flex-row gap-6 w-full">
                    
                    {/* Spline Chart Area (2/3 width) */}
                    <div className="w-full md:w-[67%] shrink-0 bg-white border border-[#E7E3DD] rounded-3xl p-5 shadow-sm flex flex-col gap-4 relative">
                      <div className="flex items-center justify-between border-b border-[#FAF9F7] pb-3 text-left">
                        <div>
                          <h3 className="text-[14px] font-black text-[#0D1B2A]">Revenue Overview</h3>
                          <p className="text-[11px] text-[#86868B] font-semibold mt-0.5">Real-time designer sales and collection returns.</p>
                        </div>
                        <span className="text-[10px] font-extrabold text-[#86868B] border border-[#E7E3DD] px-2.5 py-1.5 rounded-xl uppercase tracking-wider bg-white">This Month</span>
                      </div>

                      {/* Graph Placeholder Grid */}
                      <div className="h-48 relative border border-[#FAF9F7] bg-white/30 rounded-xl overflow-hidden flex flex-col justify-between p-3.5">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between py-5 px-8 pointer-events-none opacity-20">
                          {[1, 2, 3].map(i => <div key={i} className="w-full h-[1px] bg-[#86868B]" />)}
                        </div>

                        {/* Empty state overlay message */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white/70 backdrop-blur-[1px]">
                          <p className="text-[12.5px] font-black text-[#0D1B2A]">No analytics available yet.</p>
                          <p className="text-[11px] text-[#86868B] font-semibold mt-0.5 max-w-xs leading-relaxed">
                            Upload your first collection to start tracking insights.
                          </p>
                        </div>

                        {/* Dummy X-axis */}
                        <div className="flex justify-between text-[9px] font-extrabold text-[#86868B]/40 uppercase tracking-widest mt-auto border-t border-[#E7E3DD]/40 pt-1.5">
                          <span>May 1</span>
                          <span>May 15</span>
                          <span>Jun 5</span>
                        </div>
                      </div>
                    </div>

                    {/* Top Performing Collections Card */}
                    <div className="bg-white border border-[#E7E3DD] rounded-3xl p-5 shadow-sm flex flex-col text-left">
                      <div className="flex items-center justify-between border-b border-[#FAF9F7] pb-3 mb-3">
                        <h3 className="text-[14px] font-black text-[#0D1B2A]">Top Collections</h3>
                        <span onClick={() => setActiveTab("Collections")} className="text-[10.5px] font-black text-[#FF6A00] hover:underline cursor-pointer">View All</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                        <Folder size={24} className="text-[#86868B] mb-2 opacity-50" />
                        <p className="text-[11.5px] font-extrabold text-[#0D1B2A]">No collections created.</p>
                        <button onClick={() => setIsAddCollectionOpen(true)} className="text-[11px] font-black text-[#FF6A00] hover:underline bg-transparent border-none cursor-pointer mt-1">
                          ➕ Create Collection
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* ROW 3: RECENT ORDERS, DONUT CHANNEL, RECENT REVIEWS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Recent Orders table */}
                    <div className="bg-white border border-[#E7E3DD] rounded-3xl p-5 shadow-sm flex flex-col text-left">
                      <div className="flex items-center justify-between border-b border-[#FAF9F7] pb-3 mb-3">
                        <h3 className="text-[14px] font-black text-[#0D1B2A]">Recent Orders</h3>
                        <span onClick={() => setActiveTab("Orders")} className="text-[10.5px] font-black text-[#FF6A00] hover:underline cursor-pointer">View All</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-5">
                        <ShoppingBag size={24} className="text-[#86868B] mb-2 opacity-50" />
                        <p className="text-[11.5px] font-extrabold text-[#0D1B2A]">No orders yet.</p>
                      </div>
                    </div>

                    {/* Donut Sales Channel */}
                    <div className="bg-white border border-[#E7E3DD] rounded-3xl p-5 shadow-sm flex flex-col text-left">
                      <h3 className="text-[14px] font-black text-[#0D1B2A] border-b border-[#FAF9F7] pb-3 mb-3">Sales by Channel</h3>
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                        <div className="w-16 h-16 rounded-full border-[6px] border-slate-100 flex items-center justify-center relative">
                          <span className="text-[8px] font-black text-[#86868B]">0%</span>
                        </div>
                        <p className="text-[11px] text-[#86868B] font-semibold mt-3">No channel data available</p>
                      </div>
                    </div>

                    {/* Recent Reviews */}
                    <div className="bg-white border border-[#E7E3DD] rounded-3xl p-5 shadow-sm flex flex-col text-left">
                      <div className="flex items-center justify-between border-b border-[#FAF9F7] pb-3 mb-3">
                        <h3 className="text-[14px] font-black text-[#0D1B2A]">Recent Reviews</h3>
                        <span onClick={() => setActiveTab("Reviews")} className="text-[10.5px] font-black text-[#FF6A00] hover:underline cursor-pointer">View All</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-5">
                        <Star size={24} className="text-[#86868B] mb-2 opacity-50" />
                        <p className="text-[11.5px] font-extrabold text-[#0D1B2A]">No reviews available yet.</p>
                      </div>
                    </div>

                  </div>

                  {/* ROW 4: QUICK ACTIONS */}
                  <div className="bg-white border border-[#E7E3DD] rounded-3xl p-5 shadow-sm text-left">
                    <h3 className="text-[14px] font-black text-[#0D1B2A] mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {[
                        { label: "Add Product", icon: <Tag size={15} />, click: () => setIsAddProductOpen(true) },
                        { label: "Create Collection", icon: <Folder size={15} />, click: () => setIsAddCollectionOpen(true) },
                        { label: "Upload Lookbook", icon: <BookOpen size={15} />, click: () => setActiveTab("Collections") },
                        { label: "Edit Profile", icon: <Settings size={15} />, click: () => setActiveTab("Settings") },
                        { label: "Store Preview", icon: <ExternalLink size={15} />, click: () => router.push("/") },
                        { label: "Settings", icon: <Settings size={15} />, click: () => setActiveTab("Settings") }
                      ].map((act, i) => (
                        <button
                          key={i}
                          onClick={act.click}
                          className="flex flex-col items-center justify-center p-3 bg-white hover:bg-[#FF6A00]/5 border border-[#E7E3DD] hover:border-[#FF6A00]/30 rounded-xl transition-all cursor-pointer"
                        >
                          <span className="text-[#FF6A00] mb-1.5">{act.icon}</span>
                          <span className="text-[10px] font-extrabold text-[#0D1B2A] tracking-tight">{act.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* RIGHT SIDEBAR PANEL COLUMN (1/4 width) */}
                <div className="w-full lg:w-[27%] shrink-0 flex flex-col gap-6">
                  
                  {/* Dynamic Profile Completion checklist */}
                  <div className="bg-white border border-[#E7E3DD] rounded-3xl p-5 shadow-sm text-left relative overflow-hidden">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-[9.5px] font-extrabold text-[#86868B] uppercase tracking-widest mb-1">Setup Progress</p>
                        <h3 className="text-[15px] font-black text-[#0D1B2A]">Complete Your Profile</h3>
                        {/* Progress line */}
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="w-full bg-white h-1.5 rounded-full overflow-hidden border border-[#E7E3DD]/30">
                            <div className="h-full bg-[#FF6A00] transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
                          </div>
                          <span className="text-[11.5px] font-black text-[#FF6A00]">{completionPercentage}%</span>
                        </div>
                      </div>
                      
                      {/* Side Dress Mockup display inside card */}
                      <div className="w-11 h-14 bg-white border border-[#E7E3DD] rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                        {profile.profilePhoto ? (
                          <img src={profile.profilePhoto.url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <Tag size={16} className="text-[#86868B]/40" />
                        )}
                      </div>
                    </div>

                    {/* Finish setup CTA */}
                    <button 
                      onClick={() => setActiveTab("Settings")}
                      className="w-full py-2.5 mt-4 rounded-xl bg-[#0D1B2A] hover:bg-[#FF6A00] text-white text-[11px] font-extrabold uppercase tracking-widest border-none transition-all cursor-pointer text-center"
                    >
                      Finish Setup
                    </button>
                  </div>

                  {/* System notifications feed panel */}
                  <div className="bg-white border border-[#E7E3DD] rounded-3xl p-5 shadow-sm text-left">
                    <div className="flex items-center justify-between border-b border-[#FAF9F7] pb-2.5 mb-3">
                      <h3 className="text-[14px] font-black text-[#0D1B2A]">Notifications</h3>
                      <span className="text-[10px] font-black text-[#FF6A00] hover:underline cursor-pointer">View All</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {notifications.map((n) => (
                        <div key={n.id} className="flex gap-2 text-left relative group">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] shrink-0 mt-1.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11.5px] font-bold text-[#0D1B2A] truncate">{n.title}</p>
                            <p className="text-[10.5px] text-[#86868B] truncate mt-0.5">{n.desc}</p>
                          </div>
                          <span className="text-[9px] text-[#86868B] shrink-0 mt-0.5">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips to grow your brand checklist */}
                  <div className="bg-white border border-[#E7E3DD] rounded-3xl p-5 shadow-sm text-left">
                    <h3 className="text-[14px] font-black text-[#0D1B2A] mb-3">Tips to Grow Your Brand</h3>
                    <div className="flex flex-col gap-3">
                      {[
                        { label: "Add more products to your collection", checked: products.length > 0 },
                        { label: "Share your store on Instagram", checked: !!profile.instagram },
                        { label: "Offer a discount on your collection", checked: false },
                        { label: "Complete your profile", checked: completionPercentage === 100 }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <input 
                            readOnly
                            type="checkbox" 
                            checked={item.checked}
                            className="mt-0.5 accent-[#FF6A00] w-3.5 h-3.5"
                          />
                          <span className="text-[11.5px] font-semibold text-[#515154] leading-tight">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <span onClick={() => alert("Tips & Resources dashboard coming soon after integration.")} className="text-[10.5px] font-black text-[#FF6A00] hover:underline cursor-pointer mt-4.5 inline-block">
                      View all tips →
                    </span>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: COLLECTIONS */}
          {activeTab === "Collections" && (
            <div className="max-w-[1000px] mx-auto animate-fade-in flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-[#E7E3DD] pb-4">
                <div className="text-left">
                  <h2 className="text-[24px] font-black text-[#0D1B2A] font-serif">Brand Collections</h2>
                  <p className="text-[12.5px] text-[#86868B] font-semibold mt-0.5">Group your products into digital collection lookbooks.</p>
                </div>
                <button onClick={() => setIsAddCollectionOpen(true)} className="px-5 py-3 rounded-full bg-[#FF6A00] hover:bg-[#0D1B2A] text-white text-[11.5px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 border-none transition-all cursor-pointer">
                  <Plus size={14} /> Create Collection
                </button>
              </div>

              {collections.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#E7E3DD] p-12 text-center flex flex-col items-center justify-center shadow-sm min-h-[360px]">
                  <div className="w-16 h-16 rounded-full bg-[#FF6A00]/10 text-[#FF6A00] flex items-center justify-center mb-4">
                    <Folder size={28} />
                  </div>
                  <h3 className="text-[16px] font-black text-[#0D1B2A]">No collections created.</h3>
                  <p className="text-[12.5px] text-[#86868B] font-semibold mt-1 mb-8 max-w-sm leading-relaxed text-center">
                    Create your first digital collection catalog to start organizing your seasonal or style catalogs.
                  </p>
                  <button onClick={() => setIsAddCollectionOpen(true)} className="px-8 py-3.5 rounded-full bg-[#FF6A00] hover:bg-[#0D1B2A] text-white text-[11.5px] font-extrabold uppercase tracking-widest transition-all border-none cursor-pointer">
                    ➕ Create Your First Collection
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {collections.map((col) => (
                    <div key={col.id} className="bg-white rounded-2xl border border-[#E7E3DD] overflow-hidden shadow-sm flex flex-col">
                      <div className="h-40 bg-white border-b border-[#E7E3DD] flex items-center justify-center relative">
                        {col.cover ? (
                          <img src={col.cover.url} alt={col.name} className="w-full h-full object-cover" />
                        ) : (
                          <Folder size={32} className="text-[#86868B]/40" />
                        )}
                        <span className="absolute top-3 right-3 text-[10px] font-black bg-white/95 text-[#0D1B2A] px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider">{col.category}</span>
                      </div>
                      <div className="p-4 text-left">
                        <p className="text-[14px] font-black text-[#0D1B2A] truncate">{col.name}</p>
                        <p className="text-[11.5px] text-[#86868B] font-semibold truncate mt-0.5">{col.desc || "No description provided."}</p>
                        <div className="border-t border-[#FAF9F7] pt-3 mt-3 flex items-center justify-between text-[11px]">
                          <span className="text-[#86868B] font-semibold">0 Products Linked</span>
                          <span className="text-[#FF6A00] hover:underline font-bold cursor-pointer">Manage Products →</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRODUCTS */}
          {activeTab === "Products" && (
            <div className="max-w-[1000px] mx-auto animate-fade-in flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-[#E7E3DD] pb-4">
                <div className="text-left">
                  <h2 className="text-[24px] font-black text-[#0D1B2A] font-serif">Brand Products</h2>
                  <p className="text-[12.5px] text-[#86868B] font-semibold mt-0.5">Manage your digital garment catalog and listings.</p>
                </div>
                <button onClick={() => setIsAddProductOpen(true)} className="px-5 py-3 rounded-full bg-[#FF6A00] hover:bg-[#0D1B2A] text-white text-[11.5px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 border-none transition-all cursor-pointer">
                  <Plus size={14} /> Upload Product
                </button>
              </div>

              {products.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#E7E3DD] p-12 text-center flex flex-col items-center justify-center shadow-sm min-h-[360px]">
                  <div className="w-16 h-16 rounded-full bg-[#FF6A00]/10 text-[#FF6A00] flex items-center justify-center mb-4">
                    <Tag size={28} />
                  </div>
                  <h3 className="text-[16px] font-black text-[#0D1B2A]">No products uploaded.</h3>
                  <p className="text-[12.5px] text-[#86868B] font-semibold mt-1 mb-8 max-w-sm leading-relaxed text-center">
                    Upload your first product item. Set pricing, size availability, and add images to show customers.
                  </p>
                  <button onClick={() => setIsAddProductOpen(true)} className="px-8 py-3.5 rounded-full bg-[#FF6A00] hover:bg-[#0D1B2A] text-white text-[11.5px] font-extrabold uppercase tracking-widest transition-all border-none cursor-pointer">
                    ➕ Upload Your First Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((prod) => (
                    <div key={prod.id} className="bg-white rounded-2xl border border-[#E7E3DD] overflow-hidden shadow-sm flex flex-col">
                      <div className="h-44 bg-white border-b border-[#E7E3DD] flex items-center justify-center relative">
                        {prod.image ? (
                          <img src={prod.image.url} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <Tag size={32} className="text-[#86868B]/40" />
                        )}
                        <span className="absolute top-3 right-3 text-[10px] font-black bg-white/95 text-[#0D1B2A] px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider">{prod.category}</span>
                      </div>
                      <div className="p-4 text-left flex flex-col gap-1.5">
                        <p className="text-[14px] font-black text-[#0D1B2A] truncate">{prod.name}</p>
                        <p className="text-[13px] text-[#FF6A00] font-black">₹ {Number(prod.price).toLocaleString()}</p>
                        <p className="text-[11.5px] text-[#86868B] font-semibold">Sizes: <strong className="text-[#0D1B2A]">{prod.sizes}</strong></p>
                        <div className="border-t border-[#FAF9F7] pt-2.5 mt-2 flex items-center justify-between text-[11px]">
                          <span className="text-[#86868B] font-semibold">In Stock</span>
                          <span className="text-[#0D1B2A] hover:underline font-bold cursor-pointer">Edit Listing →</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === "Orders" && (
            <div className="max-w-[800px] mx-auto animate-fade-in text-center flex flex-col items-center justify-center p-12 bg-white border border-[#E7E3DD] rounded-3xl min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-[#0D1B2A]/5 text-[#0D1B2A] flex items-center justify-center mb-4">
                <ShoppingBag size={28} />
              </div>
              <h3 className="text-[16px] font-black text-[#0D1B2A]">No orders yet.</h3>
              <p className="text-[12.5px] text-[#86868B] font-semibold mt-1 max-w-sm leading-relaxed text-center">
                When a customer purchases a garment from your published collection, the order status and shipment logs will show here.
              </p>
            </div>
          )}

          {/* TAB 5: CUSTOMERS */}
          {activeTab === "Customers" && (
            <div className="max-w-[800px] mx-auto animate-fade-in text-center flex flex-col items-center justify-center p-12 bg-white border border-[#E7E3DD] rounded-3xl min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-[#0D1B2A]/5 text-[#0D1B2A] flex items-center justify-center mb-4">
                <Users size={28} />
              </div>
              <h3 className="text-[16px] font-black text-[#0D1B2A]">No customers yet.</h3>
              <p className="text-[12.5px] text-[#86868B] font-semibold mt-1 max-w-sm leading-relaxed text-center">
                A customer directory will compile automatically here to keep you connected with your fashion buyers.
              </p>
            </div>
          )}

          {/* TAB 6: ANALYTICS */}
          {activeTab === "Analytics" && (
            <div className="max-w-[1000px] mx-auto animate-fade-in flex flex-col gap-8">
              <div className="border-b border-[#E7E3DD] pb-4 text-left">
                <h2 className="text-[24px] font-black text-[#0D1B2A] font-serif">Brand Analytics</h2>
                <p className="text-[12.5px] text-[#86868B] font-semibold mt-0.5">Detailed insights about view logs, sales, and wardrobe saves.</p>
              </div>

              {/* Grid of empty graphs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Graph 1 */}
                <div className="bg-white border border-[#E7E3DD] rounded-3xl p-6 shadow-sm flex flex-col gap-4 relative">
                  <h3 className="text-[14.5px] font-black text-[#0D1B2A] text-left">Collection Views</h3>
                  <div className="h-56 bg-white/40 border border-[#FAF9F7] rounded-xl relative flex items-center justify-center">
                    <div className="absolute inset-0 flex flex-col justify-between py-6 px-10 pointer-events-none opacity-20">
                      {[1, 2, 3].map(i => <div key={i} className="w-full h-[1px] bg-[#86868B]" />)}
                    </div>
                    <span className="text-[12px] font-black text-[#86868B] z-10 bg-white/90 px-4 py-2 rounded-xl shadow-sm border border-[#E7E3DD]/40">No views registered yet</span>
                  </div>
                </div>

                {/* Graph 2 */}
                <div className="bg-white border border-[#E7E3DD] rounded-3xl p-6 shadow-sm flex flex-col gap-4 relative">
                  <h3 className="text-[14.5px] font-black text-[#0D1B2A] text-left">Wardrobe Saves</h3>
                  <div className="h-56 bg-white/40 border border-[#FAF9F7] rounded-xl relative flex items-center justify-center">
                    <div className="absolute inset-0 flex flex-col justify-between py-6 px-10 pointer-events-none opacity-20">
                      {[1, 2, 3].map(i => <div key={i} className="w-full h-[1px] bg-[#86868B]" />)}
                    </div>
                    <span className="text-[12px] font-black text-[#86868B] z-10 bg-white/90 px-4 py-2 rounded-xl shadow-sm border border-[#E7E3DD]/40">No wardrobe saves yet</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 7: EARNINGS */}
          {activeTab === "Earnings" && (
            <div className="max-w-[800px] mx-auto animate-fade-in text-center flex flex-col items-center justify-center p-12 bg-white border border-[#E7E3DD] rounded-3xl min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-[#FF6A00]/10 text-[#FF6A00] flex items-center justify-center mb-4">
                <DollarSign size={28} />
              </div>
              <h3 className="text-[28px] font-black text-[#0D1B2A] tracking-tight">₹ --</h3>
              <p className="text-[14px] font-black text-[#FF6A00] uppercase tracking-wider mt-1.5">No earnings yet.</p>
              <p className="text-[12.5px] text-[#86868B] font-semibold mt-2 max-w-sm leading-relaxed text-center">
                Connect your banking account using stripe inside Settings to automatically receive weekly direct bank payouts.
              </p>
            </div>
          )}

          {/* TAB 8: REVIEWS */}
          {activeTab === "Reviews" && (
            <div className="max-w-[800px] mx-auto animate-fade-in text-center flex flex-col items-center justify-center p-12 bg-white border border-[#E7E3DD] rounded-3xl min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-[#FF6A00]/10 text-[#FF6A00] flex items-center justify-center mb-4">
                <Star size={28} />
              </div>
              <h3 className="text-[16px] font-black text-[#0D1B2A]">No reviews available yet.</h3>
              <p className="text-[12.5px] text-[#86868B] font-semibold mt-1 max-w-sm leading-relaxed text-center">
                Reviews and star ratings submitted by customers on your collections will compile here.
              </p>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === "Settings" && (
            <div className="max-w-[800px] mx-auto animate-fade-in bg-white border border-[#E7E3DD] rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col gap-6 text-left">
              <div className="border-b border-[#FAF9F7] pb-4">
                <h2 className="text-[20px] font-black text-[#0D1B2A] font-serif">Brand & Profile Settings</h2>
                <p className="text-[12.5px] text-[#86868B] font-semibold mt-0.5">Manage your designer bio, location, and social linkages.</p>
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Designer / Brand Name</label>
                  <input 
                    type="text" 
                    value={profile.brandName}
                    onChange={(e) => setProfile(prev => ({ ...prev, brandName: e.target.value }))}
                    className="w-full bg-white border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Brand Tagline</label>
                  <input 
                    type="text" 
                    value={profile.tagline}
                    onChange={(e) => setProfile(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="e.g. Modern streetwear with a classic touch"
                    className="w-full bg-white border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Brand Story / Bio</label>
                  <textarea 
                    rows={4} 
                    value={profile.story}
                    onChange={(e) => setProfile(prev => ({ ...prev, story: e.target.value }))}
                    placeholder="Tell customers about your brand story, design philosophy, and materials..."
                    className="w-full bg-white border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-white border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Website</label>
                    <input 
                      type="url" 
                      value={profile.website}
                      onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full bg-white border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-2">Instagram Handle</label>
                  <input 
                    type="text" 
                    value={profile.instagram}
                    onChange={(e) => setProfile(prev => ({ ...prev, instagram: e.target.value }))}
                    className="w-full bg-white border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] focus:bg-white transition-all"
                  />
                </div>

                <button 
                  onClick={() => {
                    alert("Profile settings saved successfully (Frontend simulation)");
                    setActiveTab("Dashboard");
                  }} 
                  className="w-full py-4 mt-4 rounded-full bg-[#0D1B2A] hover:bg-[#FF6A00] text-white text-[12px] font-extrabold uppercase tracking-widest transition-all shadow-md border-none cursor-pointer"
                >
                  Save Settings & Update Studio
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── MODAL: CREATE COLLECTION ── */}
      {isAddCollectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[480px] rounded-3xl overflow-hidden shadow-2xl border border-[#E7E3DD] animate-fade-in-up text-left">
            <div className="bg-white px-6 py-4.5 border-b border-[#E7E3DD] flex items-center justify-between">
              <span className="text-[12.5px] font-black text-[#0D1B2A] uppercase tracking-wider">Create Brand Collection</span>
              <button onClick={() => setIsAddCollectionOpen(false)} className="text-[#86868B] hover:text-[#0D1B2A] bg-transparent border-none cursor-pointer"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleCreateCollection} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-[10.5px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-1.5">Collection Name <span className="text-[#FF6A00]">*</span></label>
                <input 
                  required 
                  type="text" 
                  value={newCollection.name}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Summer Breeze 2026"
                  className="w-full bg-white border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-1.5">Description</label>
                <textarea 
                  rows={2}
                  value={newCollection.desc}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, desc: e.target.value }))}
                  placeholder="Describe the aesthetic and materials used..."
                  className="w-full bg-white border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] resize-none"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={newCollection.category}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-white border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] cursor-pointer"
                >
                  <option value="Luxury">Luxury</option>
                  <option value="Streetwear">Streetwear</option>
                  <option value="Women">Women</option>
                  <option value="Men">Men</option>
                </select>
              </div>

              {/* Cover photo mock uploader */}
              <div>
                <label className="block text-[10.5px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-1.5">Cover Image</label>
                <div className="border border-dashed border-[#E2DFD8] rounded-xl p-4 bg-white text-center flex flex-col items-center justify-center hover:bg-white hover:border-[#FF6A00] transition-all group">
                  {newCollection.cover ? (
                    <span className="text-[11.5px] text-[#0D1B2A] font-semibold truncate w-full">{newCollection.cover.name}</span>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center">
                      <UploadCloud size={20} className="text-[#86868B] group-hover:text-[#FF6A00] mb-1 transition-colors" />
                      <span className="text-[10px] font-extrabold text-[#0D1B2A]">Select Lookbook Cover</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) setNewCollection(prev => ({ ...prev, cover: { name: file.name, url: URL.createObjectURL(file) } }));
                      }} />
                    </label>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 mt-2 rounded-full bg-[#FF6A00] hover:bg-[#0D1B2A] text-white text-[11px] font-extrabold uppercase tracking-widest transition-all border-none cursor-pointer"
              >
                Create Collection
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: UPLOAD PRODUCT ── */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[480px] rounded-3xl overflow-hidden shadow-2xl border border-[#E7E3DD] animate-fade-in-up text-left">
            <div className="bg-white px-6 py-4.5 border-b border-[#E7E3DD] flex items-center justify-between">
              <span className="text-[12.5px] font-black text-[#0D1B2A] uppercase tracking-wider">Upload New Product</span>
              <button onClick={() => setIsAddProductOpen(false)} className="text-[#86868B] hover:text-[#0D1B2A] bg-transparent border-none cursor-pointer"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleCreateProduct} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-[10.5px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-1.5">Garment Name <span className="text-[#FF6A00]">*</span></label>
                <input 
                  required 
                  type="text" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Silk Drape Dress"
                  className="w-full bg-white border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10.5px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-1.5">Price (₹) <span className="text-[#FF6A00]">*</span></label>
                  <input 
                    required 
                    type="number" 
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="e.g. 12500"
                    className="w-full bg-white border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00]"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-white border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] cursor-pointer"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-1.5">Size Availability</label>
                <input 
                  type="text" 
                  value={newProduct.sizes}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, sizes: e.target.value }))}
                  placeholder="e.g. S, M, L, XL"
                  className="w-full bg-white border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-1.5">Description</label>
                <textarea 
                  rows={2}
                  value={newProduct.desc}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, desc: e.target.value }))}
                  placeholder="Tell customers about the fabric, cut, and fit details..."
                  className="w-full bg-white border border-[#E2DFD8] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#0D1B2A] outline-none focus:border-[#FF6A00] resize-none"
                />
              </div>

              {/* Product photo mock uploader */}
              <div>
                <label className="block text-[10.5px] font-extrabold text-[#0D1B2A] uppercase tracking-wider mb-1.5">Product Image</label>
                <div className="border border-dashed border-[#E2DFD8] rounded-xl p-4 bg-white text-center flex flex-col items-center justify-center hover:bg-white hover:border-[#FF6A00] transition-all group">
                  {newProduct.image ? (
                    <span className="text-[11.5px] text-[#0D1B2A] font-semibold truncate w-full">{newProduct.image.name}</span>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center">
                      <UploadCloud size={20} className="text-[#86868B] group-hover:text-[#FF6A00] mb-1 transition-colors" />
                      <span className="text-[10px] font-extrabold text-[#0D1B2A]">Select Garment Image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) setNewProduct(prev => ({ ...prev, image: { name: file.name, url: URL.createObjectURL(file) } }));
                      }} />
                    </label>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 mt-2 rounded-full bg-[#FF6A00] hover:bg-[#0D1B2A] text-white text-[11px] font-extrabold uppercase tracking-widest transition-all border-none cursor-pointer"
              >
                Upload Product listing
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
