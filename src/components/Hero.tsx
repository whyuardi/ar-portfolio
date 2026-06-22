"use client";

import dynamic from "next/dynamic";
import { ArrowRight, MapPin, At, GraduationCap, LinkedinLogo, GithubLogo } from "@phosphor-icons/react";

const ParticleNetwork = dynamic(() => import("./ParticleNetwork"), {
  ssr: false,
  loading: () => null,
});

export default function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      <ParticleNetwork />

      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent z-[1]" />

      <div className="relative z-10 w-full">
        <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-glow border border-accent/20 text-xs text-accent mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                #OPENTOWORK
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] mb-4">
                {`Hey, I'm`}{" "}
                <span className="text-gradient-name">Ardhiansyah</span>
              </h1>

              <div className="text-base md:text-lg text-text-secondary font-mono mb-6">
                0x Enthusiast · Mobile Developer · IT Support
              </div>

              <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-xl mb-6">
                Informatics graduate from{" "}
                <span className="text-text font-medium">Universitas Teknologi Yogyakarta</span>{" "}
                with hands-on mobile development experience from{" "}
                <span className="text-text font-medium">Bangkit Academy</span> — a program by Google, GoTo, and Traveloka. Skilled in Android dev, Web3, and full-stack.
              </p>

              <div className="flex flex-wrap gap-4 mb-8 text-sm text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} weight="duotone" className="text-accent" />
                  Temanggung, Indonesia
                </span>
                <span className="flex items-center gap-1.5">
                  <GraduationCap size={14} weight="duotone" className="text-accent" />
                  S1 Informatics · 3.69 GPA
                </span>
                <span className="flex items-center gap-1.5">
                  <At size={14} weight="duotone" className="text-accent" />
                  ardiansyahwahyuu@gmail.com
                </span>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href="#projects"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-bg font-medium text-sm hover:bg-accent-dim transition-all hover:gap-3"
                >
                  View Projects
                  <ArrowRight size={16} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
                </a>
                <a
                  href="https://linkedin.com/in/wahyuardi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-text-secondary text-sm hover:border-accent/30 hover:text-accent transition-all"
                >
                  <LinkedinLogo size={16} weight="duotone" />
                  LinkedIn
                </a>
                <a
                  href="https://github.com/whyuardi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-text-secondary text-sm hover:border-accent/30 hover:text-accent transition-all"
                >
                  <GithubLogo size={16} weight="duotone" />
                  GitHub
                </a>
              </div>

              <div className="flex gap-8 mt-12 pt-8 border-t border-border">
                {[
                  { n: "2026", l: "Graduate" },
                  { n: "5", l: "Projects" },
                  { n: "500+", l: "Connections" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="text-xl font-bold text-text">{s.n}</div>
                    <div className="text-xs text-text-muted mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 hidden lg:block" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-text-muted">
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-border flex items-start justify-center p-1.5">
          <div className="w-1 h-2 rounded-full bg-text-muted animate-bounce" />
        </div>
      </div>
    </section>
  );
}
