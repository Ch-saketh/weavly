"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function DraggableFloatingCart({ cartCount, isNearBottom }) {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [btnPos, setBtnPos] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
    setHasMoved(false);
    const currentX = btnPos.x ?? (typeof window !== "undefined" ? window.innerWidth - 180 : 0);
    const currentY = btnPos.y ?? (typeof window !== "undefined" ? window.innerHeight - 90 : 0);
    setDragStart({
      x: e.clientX - currentX,
      y: e.clientY - currentY,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setHasMoved(true);
    const newX = Math.max(10, Math.min(window.innerWidth - 160, e.clientX - dragStart.x));
    const newY = Math.max(10, Math.min(window.innerHeight - 60, e.clientY - dragStart.y));
    setBtnPos({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setHasMoved(false);
    const currentX = btnPos.x ?? (typeof window !== "undefined" ? window.innerWidth - 180 : 0);
    const currentY = btnPos.y ?? (typeof window !== "undefined" ? window.innerHeight - 90 : 0);
    setDragStart({
      x: touch.clientX - currentX,
      y: touch.clientY - currentY,
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setHasMoved(true);
    const touch = e.touches[0];
    const newX = Math.max(10, Math.min(window.innerWidth - 160, touch.clientX - dragStart.x));
    const newY = Math.max(10, Math.min(window.innerHeight - 60, touch.clientY - dragStart.y));
    setBtnPos({ x: newX, y: newY });
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  if (!mounted || cartCount <= 0) return null;

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={() => {
        if (!hasMoved) router.push("/cart");
      }}
      style={
        btnPos.x !== null && btnPos.y !== null
          ? { left: `${btnPos.x}px`, top: `${btnPos.y}px`, right: "auto", bottom: "auto", willChange: isDragging ? "left, top" : "auto" }
          : {}
      }
      className={`fixed z-[150] cursor-grab active:cursor-grabbing select-none transition-opacity duration-300 transform-gpu ${
        btnPos.x === null ? "bottom-20 right-4 md:bottom-8 md:right-8" : ""
      } ${isNearBottom ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      title="Drag anywhere on page or click to View Bag"
    >
      <button
        type="button"
        className="h-11 px-5 bg-[#183B56] hover:bg-[#102A43] text-white text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 border border-[#183B56] shadow-[0_8px_24px_rgba(24,59,86,0.25)] active:scale-95 cursor-grab active:cursor-grabbing transform-gpu"
      >
        <span>View Bag ({cartCount})</span>
        <ArrowRight size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
