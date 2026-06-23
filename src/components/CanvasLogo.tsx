"use client";

import { useRef, useEffect, useCallback } from "react";

// Utility: gradient line stroke
function makeLineGradient(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  alpha: number
) {
  const grad = ctx.createLinearGradient(x1, y1, x2, y2);
  grad.addColorStop(0, "rgba(248, 247, 242, 0)");
  grad.addColorStop(0.2, `rgba(248, 247, 242, ${alpha})`);
  grad.addColorStop(0.8, `rgba(248, 247, 242, ${alpha})`);
  grad.addColorStop(1, "rgba(248, 247, 242, 0)");
  return grad;
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  from: [number, number],
  to: [number, number],
  style: string | CanvasGradient,
  width: number
) {
  ctx.strokeStyle = style;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(from[0], from[1]);
  ctx.lineTo(to[0], to[1]);
  ctx.closePath();
  ctx.stroke();
}

// Stagger ratios for square line animation
function makeStaggerRatios(overlap: number) {
  const t = 1 / (1 + 3 * (1 - overlap));
  const gap = t * (1 - overlap);
  return Array.from({ length: 4 }, (_, i) => {
    const start = i * gap;
    return [start, start + t];
  });
}

function fit(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

const STAGGER_RATIOS = makeStaggerRatios(0.2);

// Draw EverSwap-style rotating square lines
function drawSquareLine(
  ctx: CanvasRenderingContext2D,
  size: number,
  progress: number,
  alpha: number
) {
  const n = 0.05 * size;

  // Map progress to 4 stagger lines
  const fitClamped = (v: number, a: number, b: number, c: number, d: number) =>
    clamp(fit(v, a, b, c, d), Math.min(c, d), Math.max(c, d));

  const o = fitClamped(progress, STAGGER_RATIOS[0][0], STAGGER_RATIOS[0][1], -1, 1);
  const s = fitClamped(progress, STAGGER_RATIOS[1][0], STAGGER_RATIOS[1][1], -1, 1);
  const l = fitClamped(progress, STAGGER_RATIOS[2][0], STAGGER_RATIOS[2][1], -1, 1);
  const u = fitClamped(progress, STAGGER_RATIOS[3][0], STAGGER_RATIOS[3][1], -1, 1);

  // 4 sides of the diamond
  const lines: { start: [number, number]; end: [number, number] }[] = [
    { start: [-size / 2 + n, -size / 2], end: [-size / 2 + n, (o * size) / 2] },
    { start: [size / 2 - n, size / 2], end: [size / 2 - n, (-s * size) / 2] },
    { start: [-size / 2, size / 2 - n], end: [(l * size) / 2, size / 2 - n] },
    { start: [size / 2, -size / 2 + n], end: [(-u * size) / 2, -size / 2 + n] },
  ];

  lines.forEach(({ start, end }) => {
    const isVertical = start[0] === end[0];
    const grad = isVertical
      ? makeLineGradient(ctx, 0, start[1], 0, end[1], alpha)
      : makeLineGradient(ctx, start[0], 0, end[0], 0, alpha);
    drawLine(ctx, start, end, grad, 1);
  });
}

interface CanvasLogoProps {
  ratio: number; // scroll ratio 0-1
  className?: string;
  style?: React.CSSProperties;
}

export default function CanvasLogo({ ratio, className, style }: CanvasLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(
    (r: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const size = w * Math.SQRT2;

      ctx.translate(cx, cy);

      // Horizontal line with stagger
      let lineStart = fit(r, 0.25, 0.33, -cx, cx);
      lineStart = fit(r, 0.65, 0.75, lineStart, -cx);
      let lineEnd = fit(r, 0.08, 0.16, lineStart, cx);
      lineEnd = fit(r, 0.85, 0.9, lineEnd, -cx);

      lineStart = clamp(lineStart, -cx, cx);
      lineEnd = clamp(lineEnd, -cx, cx);

      const hGrad = makeLineGradient(ctx, lineStart, 0, lineEnd, 0, 1);
      drawLine(ctx, [lineStart, 0], [lineEnd, 0], hGrad, 1);

      ctx.restore();

      // Rotating diamond
      const diamondProgress = clamp(fit(r, 0.35, 0.45, 0, 1), 0, 1);
      const fadeOut = 1 - clamp(fit(r, 0.65, 0.7, 0, 1), 0, 1);

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.translate(cx, cy);
      ctx.save();
      ctx.scale(fadeOut, fadeOut);
      ctx.rotate(-Math.PI * 0.25 * fadeOut);
      drawSquareLine(ctx, 0.5 * size, diamondProgress, fadeOut);
      ctx.restore();
      ctx.restore();
    },
    []
  );

  useEffect(() => {
    draw(ratio);
  }, [ratio, draw]);

  return (
    <div className={`canvas-logo ${className || ""}`} style={style}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
