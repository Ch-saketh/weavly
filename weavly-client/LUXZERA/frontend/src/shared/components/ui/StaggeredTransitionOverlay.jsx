"use client";

import React, { useImperativeHandle, forwardRef, useRef } from "react";
import { gsap } from "gsap";

/**
 * StaggeredTransitionOverlay
 * Provides a GSAP staggered color curtain transition effect across the screen.
 * Colors: Weavly Brand Orange -> Dark Slate -> Off-White.
 */
const StaggeredTransitionOverlay = forwardRef(function StaggeredTransitionOverlay(
  { colors = ["#F07020", "#1D1D1F", "#FAF8F5"], duration = 0.5, onMidpoint },
  ref
) {
  const containerRef = useRef(null);
  const layersRef = useRef([]);

  useImperativeHandle(ref, () => ({
    trigger: (callback) => {
      const layers = layersRef.current;
      if (!layers.length) {
        if (callback) callback();
        return;
      }

      gsap.killTweensOf(layers);
      gsap.set(layers, { xPercent: -100, display: "block" });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(layers, { display: "none", xPercent: -100 });
        },
      });

      // Sweep in from left
      layers.forEach((layer, i) => {
        tl.to(
          layer,
          {
            xPercent: 0,
            duration: duration,
            ease: "power4.inOut",
          },
          i * 0.08
        );
      });

      // Midpoint trigger (when middle layer covers screen)
      const midTime = (duration + (layers.length - 1) * 0.08) * 0.5;
      tl.call(
        () => {
          if (callback) callback();
          if (onMidpoint) onMidpoint();
        },
        null,
        midTime
      );

      // Sweep out to right
      layers.forEach((layer, i) => {
        tl.to(
          layer,
          {
            xPercent: 100,
            duration: duration,
            ease: "power4.inOut",
          },
          midTime + 0.1 + i * 0.06
        );
      });
    },
  }));

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden"
      aria-hidden="true"
    >
      {colors.map((color, i) => (
        <div
          key={i}
          ref={(el) => (layersRef.current[i] = el)}
          className="absolute inset-0 w-full h-full hidden"
          style={{ background: color, zIndex: 10000 + i }}
        />
      ))}
    </div>
  );
});

export default StaggeredTransitionOverlay;
