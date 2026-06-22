"use client";

import { useState, useEffect } from "react";

export default function ScrollIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
      setVisible(window.scrollY < 100);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Progress bar at top */}
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />

      {/* Scroll mouse indicator */}
      <div className={`scroll-indicator ${!visible ? "hidden" : ""}`}>
        <span>Scroll</span>
        <div className="scroll-mouse">
          <div />
        </div>
      </div>
    </>
  );
}
