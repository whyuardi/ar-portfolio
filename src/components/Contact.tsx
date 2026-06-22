"use client";

import { GithubLogo, LinkedinLogo, PaperPlaneRight } from "@phosphor-icons/react";

export default function Contact() {
  return (
    <section id="contact" className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative rounded-[var(--radius)] border border-border bg-surface-elevated p-12 md:p-20 text-center overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0" />

          <div className="relative z-10 max-w-lg mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Let&apos;s build
              <br />
              <span className="text-gradient">together</span>
            </h2>

            <p className="text-text-secondary leading-relaxed mb-6">
              Currently open to mobile development and Web3 opportunities. Hit me up.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://linkedin.com/in/wahyuardi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-bg text-sm font-medium hover:bg-accent-dim transition-all"
              >
                <LinkedinLogo size={16} weight="duotone" />
                LinkedIn
              </a>
              <a
                href="https://github.com/whyuardi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-text-secondary text-sm hover:border-accent/30 hover:text-accent transition-all"
              >
                <GithubLogo size={16} weight="duotone" />
                GitHub
              </a>
              <a
                href="mailto:ardiansyahwahyuu@gmail.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-text-secondary text-sm hover:border-accent/30 hover:text-accent transition-all"
              >
                <PaperPlaneRight size={16} weight="duotone" />
                Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
