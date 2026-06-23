"use client";

import { useState, useEffect, useRef } from "react";

export default function ScrollIndicator() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0;
      if (barRef.current) {
        barRef.current.style.height = `${progress * 100}%`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div id="scroll-indicator">
      <div id="scroll-indicator__bar" ref={barRef} />
    </div>
  );
}
