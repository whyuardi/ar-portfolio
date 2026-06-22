"use client";

import { useState, useEffect } from "react";
import { GithubLogo, LinkedinLogo } from "@phosphor-icons/react";

const navLinks = [
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Stack", href: "#stack" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-header border-b border-border" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="text-lg font-bold tracking-tight hover:text-accent transition-colors">
          <span className="text-accent">/</span> ar
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-text-secondary hover:text-text transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/whyuardi"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg bg-border flex items-center justify-center hover:bg-border-hover hover:text-accent transition-all"
          >
            <GithubLogo size={16} weight="duotone" />
          </a>
          <a
            href="https://linkedin.com/in/wahyuardi"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg bg-border flex items-center justify-center hover:bg-border-hover hover:text-accent transition-all"
          >
            <LinkedinLogo size={16} weight="duotone" />
          </a>
        </div>
      </div>
    </header>
  );
}
