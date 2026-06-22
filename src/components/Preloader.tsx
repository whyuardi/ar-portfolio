"use client";

import { useState, useEffect } from "react";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Simulate loading with acceleration
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 8 + 2;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          setVisible(false);
        }, 500);
      } else {
        setProgress(Math.floor(current));
      }
    }, 60);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div
      id="preloader"
      className={progress >= 100 ? "hidden" : ""}
      style={{ transition: "opacity 0.8s ease, visibility 0.8s ease" }}
    >
      {/* Animated rings background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-40 h-40 rounded-full border border-accent/20"
          style={{
            animation: "spin 8s linear infinite",
          }}
        />
        <div
          className="absolute w-56 h-56 rounded-full border border-accent/10"
          style={{
            animation: "spin 12s linear infinite reverse",
          }}
        />
        <div
          className="absolute w-72 h-72 rounded-full border border-accent/5"
          style={{
            animation: "spin 16s linear infinite",
          }}
        />
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="text-lg font-bold tracking-tight">
          <span className="text-accent">/</span> ar
        </div>

        {/* Progress number */}
        <div className="text-5xl font-bold tabular-nums text-text">
          {String(progress).padStart(3, "0")}
        </div>

        {/* Progress bar */}
        <div className="w-48 h-px bg-border overflow-hidden rounded-full">
          <div
            className="h-full bg-accent transition-all duration-100 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-xs text-text-muted font-mono uppercase tracking-widest">
          Loading
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
