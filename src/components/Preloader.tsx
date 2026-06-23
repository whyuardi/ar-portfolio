"use client";

import { useState, useEffect, useRef } from "react";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas animation for preloader
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 220;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    let frame = 0;
    const animate = () => {
      if (!visible) return;
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.translate(size / 2, size / 2);

      // Draw rotating diagonal lines with gradient
      const lineCount = 6;
      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI + frame * 0.003;
        const len = size * 0.45;
        const x1 = Math.cos(angle) * len;
        const y1 = Math.sin(angle) * len;
        const x2 = -x1;
        const y2 = -y1;

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, "rgba(248, 247, 242, 0)");
        grad.addColorStop(0.5, `rgba(248, 247, 242, ${0.12 + Math.sin(frame * 0.02 + i) * 0.05})`);
        grad.addColorStop(1, "rgba(248, 247, 242, 0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      ctx.restore();
      frame++;
      requestAnimationFrame(animate);
    };
    animate();
  }, [visible]);

  // Simulate loading
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 6 + 2;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        clearInterval(interval);
        setTimeout(() => setVisible(false), 600);
      } else {
        setProgress(Math.floor(current));
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div
      id="preloader"
      className={progress >= 100 ? "hidden" : ""}
    >
      <div id="preloader-logo" style={{ opacity: 1 }}>
        {/* Decorative diagonal lines SVG */}
        <svg
          width="218"
          height="220"
          viewBox="0 0 218 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", opacity: 0.3 }}
        >
          {[0, 7.5, 14, 21.5, 48.9, 56.4].map((offset, i) => (
            <rect
              key={`l${i}`}
              opacity="0.4"
              x={58 - offset}
              y={offset}
              width="226"
              height="1"
              transform={`rotate(45 ${58 - offset} ${offset})`}
              fill="url(#preloaderGrad)"
            />
          ))}
          {[2.4, 10, 37, 44.4, 51.3, 58.8].map((offset, i) => (
            <rect
              key={`r${i}`}
              opacity="0.4"
              width="226"
              height="1"
              transform={`matrix(-0.707107 0.707107 0.707107 0.707107 ${160 + i * 8} ${offset})`}
              fill="url(#preloaderGrad)"
            />
          ))}
          <defs>
            <linearGradient id="preloaderGrad" x1="0" y1="0.5" x2="226" y2="0.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F8F7F2" stopOpacity="0" />
              <stop offset="0.5" stopColor="#F8F7F2" />
              <stop offset="1" stopColor="#F8F7F2" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* AR Logo SVG (geometric) */}
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* A shape */}
          <path
            d="M24 60L40 16L56 60H48L44 48H36L32 60H24ZM38 42H42L40 34L38 42Z"
            fill="#F8F7F2"
          />
          {/* Decorative chevrons */}
          <path d="M10 40L20 30L30 40L20 50L10 40Z" fill="none" stroke="#F8F7F2" strokeWidth="0.5" opacity="0.3" />
          <path d="M50 40L60 30L70 40L60 50L50 40Z" fill="none" stroke="#F8F7F2" strokeWidth="0.5" opacity="0.3" />
        </svg>

        {/* Canvas animation */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />

        <div className="preloader-percent">{progress}%</div>
      </div>
    </div>
  );
}
