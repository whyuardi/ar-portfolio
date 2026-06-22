'use client';

import { useEffect, useRef } from 'react';

export default function FullCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const scrollRef = useRef({ y: 0, targetY: 0 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPR support
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Mouse tracking
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Scroll tracking
    const onScroll = () => {
      scrollRef.current.targetY = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    let time = 0;

    const animate = () => {
      time += 0.005;

      // Smooth interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.03;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.03;
      scrollRef.current.y += (scrollRef.current.targetY - scrollRef.current.y) * 0.05;

      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      // Everswap-style deep blue-to-green gradient sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#0a1628');
      skyGrad.addColorStop(0.3, '#0d1f3c');
      skyGrad.addColorStop(0.6, '#0f2a4a');
      skyGrad.addColorStop(0.85, '#1a3a2a');
      skyGrad.addColorStop(1, '#0a1a0f');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Scroll-based parallax offset
      const scrollOffset = scrollRef.current.y * 0.3;
      const mouseOffsetX = mouseRef.current.x * 15;
      const mouseOffsetY = mouseRef.current.y * 10;

      // ─── ATMOSPHERIC HAZE (bottom) ───
      const hazeGrad = ctx.createLinearGradient(0, h * 0.6, 0, h);
      hazeGrad.addColorStop(0, 'rgba(20, 50, 40, 0)');
      hazeGrad.addColorStop(0.5, 'rgba(30, 60, 50, 0.15)');
      hazeGrad.addColorStop(1, 'rgba(40, 80, 60, 0.3)');
      ctx.fillStyle = hazeGrad;
      ctx.fillRect(0, h * 0.6, w, h * 0.4);

      // ─── MOUNTAIN LAYERS (back to front) ───
      drawMountainLayer(ctx, w, h, {
        baseY: h * 0.55 - scrollOffset * 0.2,
        peakHeight: h * 0.18,
        color1: '#0d2a1a',
        color2: '#1a4a2a',
        highlightColor: 'rgba(100, 200, 120, 0.08)',
        segments: 8,
        offsetX: mouseOffsetX * 0.3,
        time: time * 0.2,
        blur: 4,
      });

      drawMountainLayer(ctx, w, h, {
        baseY: h * 0.6 - scrollOffset * 0.3,
        peakHeight: h * 0.22,
        color1: '#0f3020',
        color2: '#1a5a30',
        highlightColor: 'rgba(120, 220, 140, 0.12)',
        segments: 6,
        offsetX: mouseOffsetX * 0.5,
        time: time * 0.3,
        blur: 2,
      });

      // Main mountain (sharp, in focus)
      drawMountainLayer(ctx, w, h, {
        baseY: h * 0.65 - scrollOffset * 0.4,
        peakHeight: h * 0.35,
        color1: '#1a4a2a',
        color2: '#2a6a3a',
        highlightColor: 'rgba(160, 255, 160, 0.2)',
        segments: 5,
        offsetX: mouseOffsetX * 0.8,
        time: time * 0.4,
        blur: 0,
        isMain: true,
      });

      // Front mountain (darker, closer)
      drawMountainLayer(ctx, w, h, {
        baseY: h * 0.72 - scrollOffset * 0.5,
        peakHeight: h * 0.15,
        color1: '#0a2015',
        color2: '#153a25',
        highlightColor: 'rgba(80, 180, 100, 0.08)',
        segments: 10,
        offsetX: mouseOffsetX * 1.0,
        time: time * 0.5,
        blur: 3,
      });

      // Closest foreground (darkest silhouette)
      drawMountainLayer(ctx, w, h, {
        baseY: h * 0.82 - scrollOffset * 0.6,
        peakHeight: h * 0.08,
        color1: '#050f0a',
        color2: '#0a1a10',
        highlightColor: 'rgba(50, 100, 60, 0.05)',
        segments: 12,
        offsetX: mouseOffsetX * 1.2,
        time: time * 0.6,
        blur: 0,
      });

      // ─── FLOATING PARTICLES (atmospheric) ───
      for (let i = 0; i < 40; i++) {
        const seed = i * 97.3;
        const px = (Math.sin(seed + time * 0.3) * 0.5 + 0.5) * w + mouseOffsetX * 0.5;
        const py = (Math.cos(seed * 0.7 + time * 0.2) * 0.5 + 0.5) * h * 0.7 - scrollOffset * 0.3;
        const size = 0.5 + Math.sin(seed * 0.1) * 0.3;
        const alpha = 0.1 + Math.sin(time + seed) * 0.05;

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 220, 200, ${alpha})`;
        ctx.fill();
      }

      // ─── SUBTLE GLOW (center horizon) ───
      const glowGrad = ctx.createRadialGradient(
        w / 2 + mouseOffsetX, h * 0.5 - scrollOffset * 0.3, 0,
        w / 2 + mouseOffsetX, h * 0.5 - scrollOffset * 0.3, w * 0.4
      );
      glowGrad.addColorStop(0, 'rgba(40, 120, 80, 0.08)');
      glowGrad.addColorStop(0.5, 'rgba(30, 80, 60, 0.04)');
      glowGrad.addColorStop(1, 'rgba(20, 40, 30, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// ─── MOUNTAIN LAYER DRAWING ───
interface MountainLayerOptions {
  baseY: number;
  peakHeight: number;
  color1: string;
  color2: string;
  highlightColor: string;
  segments: number;
  offsetX: number;
  time: number;
  blur: number;
  isMain?: boolean;
}

function drawMountainLayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: MountainLayerOptions
) {
  const { baseY, peakHeight, color1, color2, highlightColor, segments, offsetX, time, blur, isMain } = opts;

  // Save context for blur
  if (blur > 0) {
    ctx.save();
    ctx.filter = `blur(${blur}px)`;
  }

  // Generate mountain peaks using simplex-like noise
  const points: { x: number; y: number }[] = [];
  const segmentWidth = w / segments;

  for (let i = 0; i <= segments + 2; i++) {
    const x = (i - 1) * segmentWidth + offsetX;
    // Multi-octave noise for organic look
    const n1 = Math.sin(i * 1.2 + time) * 0.4;
    const n2 = Math.sin(i * 2.7 + time * 1.3) * 0.25;
    const n3 = Math.sin(i * 4.1 + time * 0.7) * 0.15;
    const noise = n1 + n2 + n3;

    // Center peak is tallest
    const centerFactor = 1 - Math.abs(i - segments / 2) / (segments / 2);
    const heightMult = 0.3 + centerFactor * 0.7;

    const y = baseY - peakHeight * noise * heightMult;
    points.push({ x, y });
  }

  // Draw mountain shape
  ctx.beginPath();
  ctx.moveTo(-10, h + 10);
  ctx.lineTo(points[0].x, points[0].y);

  // Smooth curves between peaks
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    ctx.quadraticCurveTo(prev.x + (curr.x - prev.x) * 0.6, prev.y, cpX, (prev.y + curr.y) / 2);
    ctx.quadraticCurveTo(curr.x - (curr.x - prev.x) * 0.4, curr.y, curr.x, curr.y);
  }

  ctx.lineTo(w + 10, h + 10);
  ctx.closePath();

  // Gradient fill
  const grad = ctx.createLinearGradient(0, baseY - peakHeight, 0, baseY + 50);
  grad.addColorStop(0, color2);
  grad.addColorStop(0.4, color1);
  grad.addColorStop(1, color1);
  ctx.fillStyle = grad;
  ctx.fill();

  // Highlight on peaks (top edges)
  if (isMain) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      ctx.quadraticCurveTo(prev.x + (curr.x - prev.x) * 0.6, prev.y, cpX, (prev.y + curr.y) / 2);
      ctx.quadraticCurveTo(curr.x - (curr.x - prev.x) * 0.4, curr.y, curr.x, curr.y);
    }
    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  if (blur > 0) {
    ctx.restore();
  }
}
