"use client";

// src/modules/system/pages/NotFoundPage.jsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function NotFoundPage({ isErrorFallback = false }) {
  const router = useRouter();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    let idleTimer = null;

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
      
      setIsMoving(true);
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsMoving(false);
      }, 1000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F5EFEB] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-[#183B56] selection:text-white px-6 select-none">
      
      {/* Main Content Container */}
      <div className="z-10 flex flex-col items-center text-center max-w-md mx-auto py-12">
        
        {/* Animated 404 Mascot Canvas */}
        <div className="relative w-72 h-56 flex items-center justify-center mb-6">
          {/* Subtle Background 404 Text */}
          <div 
            className="absolute inset-0 flex items-center justify-center text-[140px] font-bold text-[#183B56]/[0.05] tracking-tighter select-none transition-transform duration-300 ease-out pointer-events-none"
            style={{ transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)` }}
          >
            404
          </div>

          {/* Seamless Floating Zyra Mascot */}
          <div 
            className="relative flex flex-col items-center justify-center transition-transform duration-150 ease-out"
            style={{ transform: `translate(${mousePos.x * 24}px, ${mousePos.y * 24}px)` }}
          >
            {/* Authentic Logo */}
            <img 
              src="/logo.png" 
              alt="Weavly Symbol" 
              className="w-28 h-28 object-contain relative z-10"
            />

            {/* Facial Expressions */}
            <div 
              className="absolute z-20 flex flex-col items-center justify-center top-[30%] transition-transform duration-300 ease-out"
              style={{ transform: `translate(${isMoving ? mousePos.x * 6 : 0}px, ${isMoving ? mousePos.y * 6 : 0}px)` }}
            >
              {/* Eyebrows */}
              <div className="flex items-center gap-6 mb-1 opacity-90 transition-all duration-300">
                <div className={`w-3.5 h-[2.5px] bg-[#183B56] rounded-full transform transition-transform duration-300 ${isMoving ? '-rotate-12' : '-rotate-3'}`} />
                <div className={`w-3.5 h-[2.5px] bg-[#183B56] rounded-full transform transition-transform duration-300 ${isMoving ? 'rotate-12' : 'rotate-3'}`} />
              </div>

              {/* Wide Open Eyes Container */}
              <div className="relative flex items-center justify-center gap-3">
                {/* Soft Blush Cheeks */}
                <div className="absolute -left-3 top-2 w-3 h-1.5 rounded-full bg-[#183B56]/20 blur-[0.5px]" />
                <div className="absolute -right-3 top-2 w-3 h-1.5 rounded-full bg-[#183B56]/20 blur-[0.5px]" />

                {isErrorFallback ? (
                  <>
                    <div className="w-5.5 h-5.5 rounded-full bg-[#183B56] flex items-center justify-center text-white text-[10px] font-bold">✕</div>
                    <div className="w-5.5 h-5.5 rounded-full bg-[#183B56] flex items-center justify-center text-white text-[10px] font-bold">✕</div>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded-full bg-[#183B56] relative shadow-xs">
                      <div className="w-[5px] h-[5px] rounded-full bg-white absolute top-0.5 left-0.5" />
                      <div className="w-[2px] h-[2px] rounded-full bg-white/90 absolute bottom-0.5 right-0.5" />
                    </div>
                    <div className="w-4 h-4 rounded-full bg-[#183B56] relative shadow-xs">
                      <div className="w-[5px] h-[5px] rounded-full bg-white absolute top-0.5 left-0.5" />
                      <div className="w-[2px] h-[2px] rounded-full bg-white/90 absolute bottom-0.5 right-0.5" />
                    </div>
                  </>
                )}
              </div>

              {/* Dynamic Mouth Expression */}
              <div className="mt-1.5 opacity-95 transition-all duration-200">
                {isMoving ? (
                  <svg width="20" height="10" viewBox="0 0 20 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="5" r="3.5" fill="#183B56" />
                  </svg>
                ) : (
                  <svg width="20" height="9" viewBox="0 0 20 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 4 2 Q 10 7.5 16 2" stroke="#183B56" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Heading & Subtitle */}
        <h1 className="text-[28px] font-bold text-[#183B56] tracking-tight mb-2 uppercase">
          {isErrorFallback ? "Oops! Something went wrong." : "You look a little lost."}
        </h1>
        <p className="text-[14px] text-[#5A7184] font-medium leading-relaxed mb-8 max-w-[340px] mx-auto">
          {isErrorFallback 
            ? "Our servers encountered an issue. Let's get you back to safety."
            : "The page you're looking for doesn't exist or has been moved. Let's get you back to the latest drops."}
        </p>

        {/* CTA Button */}
        <button 
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.href = "/";
            } else {
              router.push("/");
            }
          }}
          className="h-12 px-8 py-3 flex items-center justify-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white bg-[#183B56] hover:bg-[#102A43] transition-all duration-200 active:scale-[0.98] shadow-xs cursor-pointer border border-[#183B56] relative z-20"
        >
          <ArrowLeft size={16} />
          <span>Return Home</span>
        </button>

      </div>
    </div>
  );
}
