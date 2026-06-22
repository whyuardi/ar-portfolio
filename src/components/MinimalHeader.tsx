"use client";

import { GithubLogo, LinkedinLogo } from "@phosphor-icons/react";

const navLinks = [
  { label: "Projects", href: "#projects" },
  { label: "Stack", href: "#stack" },
  { label: "Contact", href: "#contact" },
];

export default function MinimalHeader() {
  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <a
          href="#hero"
          onClick={(e) => { e.preventDefault(); scrollTo("#hero"); }}
          className="text-lg font-bold tracking-tight hover:text-accent transition-colors"
        >
          <span className="text-accent">/</span>ar
        </a>

        <nav className="flex items-center gap-6">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => { e.preventDefault(); scrollTo(l.href); }}
              className="text-sm text-text-secondary hover:text-accent transition-colors hidden sm:inline"
            >
              {l.label}
            </a>
          ))}

          <a
            href="https://github.com/whyuardi"
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-lg bg-border flex items-center justify-center hover:bg-border-hover hover:text-accent transition-all"
          >
            <GithubLogo size={14} weight="duotone" />
          </a>
          <a
            href="https://linkedin.com/in/wahyuardi"
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-lg bg-border flex items-center justify-center hover:bg-border-hover hover:text-accent transition-all"
          >
            <LinkedinLogo size={14} weight="duotone" />
          </a>
        </nav>
      </div>
    </header>
  );
}
