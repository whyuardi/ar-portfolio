"use client";

import { ArrowSquareOut, GithubLogo } from "@phosphor-icons/react";

const projects = [
  {
    title: "Gemfund",
    role: "Mobile Developer",
    desc: "Web3-based mobile crowdfunding application built on the Ethereum Sepolia testnet. Integrates Gemini AI for fraud detection on campaign verification.",
    techs: ["Flutter", "Dart", "Solidity", "Web3", "Gemini AI"],
    tags: ["Ethereum", "AI Fraud Detection", "Mobile"],
    github: "https://github.com/whyuardi",
    span: "lg:col-span-2 lg:row-span-2",
  },
  {
    title: "Siaprak",
    role: "Mobile Developer",
    desc: "Mobile application for monitoring and evaluating vocational students' industrial work practice (PKL/internship). Features daily activity logging, supervisor assessment, and real-time progress reporting. Final project — Universitas Teknologi Yogyakarta 2026.",
    techs: ["Kotlin", "React JS", "REST API", "Firebase"],
    tags: ["Education", "Internship", "Monitoring"],
    github: "https://github.com/whyuardi",
    span: "lg:col-span-1 lg:row-span-1",
  },
  {
    title: "BioFace",
    role: "ML & Android Developer",
    desc: "Android application that detects facial skin diseases in real-time using a TensorFlow Lite machine learning model. Provides natural ingredient-based treatment recommendations. Capstone project — Bangkit Academy 2024 (team of 7).",
    techs: ["Kotlin", "TensorFlow Lite", "Firebase", "Retrofit", "MVVM"],
    tags: ["ML/AI", "Healthcare", "Bangkit"],
    github: "https://github.com/whyuardi",
    span: "lg:col-span-1 lg:row-span-1",
  },
  {
    title: "Ignite Launchpad",
    role: "Full-stack Developer",
    desc: "Multi-chain token launch platform with wallet integration, tiered sales, and real-time progress tracking. Deployed and live on Vercel.",
    techs: ["Next.js", "TypeScript", "Three.js", "Motion"],
    tags: ["Web3", "DeFi", "Launchpad"],
    github: "https://github.com/whyuardi/ignite-launchpad",
    live: "https://ignite-launchpad.vercel.app",
    span: "lg:col-span-1 lg:row-span-1",
  },
  {
    title: "ORION Dashboard",
    role: "Full-stack Developer",
    desc: "Web3 operations suite with wallet management, portfolio tracking, and 3D data visualization. Modular architecture with real-time stats.",
    techs: ["Three.js", "Ethers.js", "Web3", "Chart.js"],
    tags: ["Multi-chain", "3D Viz", "Dashboard"],
    github: "https://github.com/whyuardi/orion-dashboard",
    span: "lg:col-span-1 lg:row-span-1",
  },
  {
    title: "MEV Arena",
    role: "Full-stack Developer",
    desc: "Gamified MEV bot competition platform where users deploy bots (Sandwich, Arbitrage, Liquidation) to compete in 30-second rounds for block rewards. Interactive 3D mempool visualization, customizable strategies, live leaderboard, and on-chain reward distribution via Solidity smart contract.",
    techs: ["Next.js", "TypeScript", "Three.js", "Solidity", "Hardhat", "Recharts"],
    tags: ["Web3", "DeFi", "Gaming", "MEV", "Smart Contract"],
    github: "https://github.com/whyuardi/mev-bot-arena",
    live: "https://mev-bot-arena.vercel.app",
    span: "lg:col-span-2 lg:row-span-1",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-28 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16">
          <span className="section-label">Projects</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Case <span className="text-gradient">Studies</span>
          </h2>
          <p className="text-text-secondary mt-4 max-w-xl leading-relaxed text-base">
            Mobile apps, ML/AI, and Web3 platforms built from the ground up — each solving a real problem.
          </p>
        </div>

        {/* Staggered masonry */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-auto">
          {projects.map((p, i) => (
            <div
              key={p.title}
              className={`group relative ${p.span} p-6 md:p-8 rounded-[var(--radius)] border border-border bg-surface hover:border-accent/20 hover:bg-surface-elevated transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 flex flex-col`}
              style={{
                opacity: 0,
                animation: `fadeIn 0.6s ${0.15 * i}s forwards`,
              }}
            >
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-text-muted font-mono">
                    {p.role}
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight mt-1 group-hover:text-accent transition-colors">
                    {p.title}
                  </h3>
                </div>
                <div className="flex gap-2 shrink-0">
                  {p.github && (
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-md bg-border flex items-center justify-center hover:bg-accent hover:text-bg transition-all"
                    >
                      <GithubLogo size={14} />
                    </a>
                  )}
                  {p.live && (
                    <a
                      href={p.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-md bg-border flex items-center justify-center hover:bg-accent hover:text-bg transition-all"
                    >
                      <ArrowSquareOut size={14} />
                    </a>
                  )}
                </div>
              </div>

              <p className="text-sm text-text-secondary leading-relaxed mb-4 flex-1">
                {p.desc}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.techs.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-accent-glow text-[11px] text-accent font-mono"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex gap-3 pt-3 border-t border-border text-xs text-text-muted">
                {p.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            to { opacity: 1; }
          }
        `}</style>
      </div>
    </section>
  );
}
