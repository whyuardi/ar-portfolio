"use client";

import { useState, useEffect } from "react";
import { GithubLogo, LinkedinLogo, List, X } from "@phosphor-icons/react";

const navLinks = [
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Stack", href: "#stack" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <button
            className="md:hidden w-8 h-8 rounded-lg bg-border flex items-center justify-center hover:bg-border-hover hover:text-accent transition-all"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-72 bg-bg/95 backdrop-blur-xl border-l border-border/60 z-50 md:hidden flex flex-col transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-border">
          <a href="#" className="text-lg font-bold tracking-tight">
            <span className="text-accent">/</span> ar
          </a>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 rounded-lg bg-border flex items-center justify-center hover:bg-border-hover hover:text-accent transition-all"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-6">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="py-3 px-4 rounded-lg text-sm text-text-secondary hover:text-text hover:bg-surface transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-4 flex gap-3 px-4">
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
          <a
            href="#contact"
            onClick={() => setMobileOpen(false)}
            className="mt-4 mx-4 py-3 rounded-lg bg-accent text-bg text-sm font-semibold text-center hover:bg-accent-dim transition-colors"
          >
            Connect Wallet
          </a>
        </nav>
      </div>
    </header>
  );
}
