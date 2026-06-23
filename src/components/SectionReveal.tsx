"use client";

import { type ReactNode } from "react";

export default function SectionReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div className={`section-reveal ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}
