"use client";

import { useState, useEffect } from "react";

export function useMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  const [deviceType, setDeviceType] = useState("desktop");

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const ua = navigator.userAgent;
      
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileUA = mobileRegex.test(ua);
      const isSmallScreen = width < breakpoint;

      setIsMobile(isSmallScreen || isMobileUA);

      if (/iPhone|iPod/i.test(ua)) {
        setDeviceType("iphone");
      } else if (/Android/i.test(ua)) {
        setDeviceType("android");
      } else if (/iPad|Tablet/i.test(ua) || (width >= 768 && width <= 1024)) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return { isMobile, deviceType };
}
