"use client";

import dynamic from "next/dynamic";
import SectionReveal from "@/components/SectionReveal";
import {
  ArrowRight,
  MapPin,
  At,
  GraduationCap,
  LinkedinLogo,
  GithubLogo,
  ArrowSquareOut,
  PaperPlaneRight,
} from "@phosphor-icons/react";

const Preloader = dynamic(() => import("@/components/Preloader"), { ssr: false });
const MinimalHeader = dynamic(() => import("@/components/MinimalHeader"), { ssr: false });
const ScrollDots = dynamic(() => import("@/components/ScrollDots"), { ssr: false });
const ScrollIndicator = dynamic(() => import("@/components/ScrollIndicator"), { ssr: false });

// ─── DATA ───
const projects = [
  {
    title: "Gemfund",
    role: "Mobile Developer",
    desc: "Web3-based mobile crowdfunding app on Ethereum Sepolia. Integrates Gemini AI for fraud detection.",
    techs: ["Flutter", "Dart", "Solidity", "Web3", "Gemini AI"],
    tags: ["Ethereum", "AI Fraud Detection", "Mobile"],
    github: "https://github.com/whyuardi",
    live: null,
    featured: true,
  },
  {
    title: "Siaprak",
    role: "Mobile Developer",
    desc: "Mobile app for monitoring vocational students' internship progress. Features daily logging, assessment, and real-time reporting.",
    techs: ["Kotlin", "React JS", "REST API", "Firebase"],
    tags: ["Education", "Internship", "Monitoring"],
    github: "https://github.com/whyuardi",
    live: null,
    featured: false,
  },
  {
    title: "BioFace",
    role: "ML & Android Dev",
    desc: "Android app detecting facial skin diseases in real-time using TensorFlow Lite. Provides natural treatment recommendations.",
    techs: ["Kotlin", "TensorFlow Lite", "Firebase", "Retrofit", "MVVM"],
    tags: ["ML/AI", "Healthcare", "Bangkit"],
    github: "https://github.com/whyuardi",
    live: null,
    featured: false,
  },
  {
    title: "Ignite Launchpad",
    role: "Full-stack Dev",
    desc: "Multi-chain token launch platform with wallet integration, tiered sales, and real-time progress tracking.",
    techs: ["Next.js", "TypeScript", "Three.js", "Motion"],
    tags: ["Web3", "DeFi", "Launchpad"],
    github: "https://github.com/whyuardi/ignite-launchpad",
    live: "https://ignite-launchpad.vercel.app",
    featured: false,
  },
  {
    title: "ORION Dashboard",
    role: "Full-stack Dev",
    desc: "Web3 operations suite with wallet management, portfolio tracking, and 3D data visualization.",
    techs: ["Three.js", "Ethers.js", "Web3", "Chart.js"],
    tags: ["Multi-chain", "3D Viz", "Dashboard"],
    github: "https://github.com/whyuardi/orion-dashboard",
    live: null,
    featured: false,
  },
  {
    title: "MEV Arena",
    role: "Full-stack Dev",
    desc: "Gamified MEV bot competition platform. Deploy bots to compete for block rewards. Interactive 3D mempool visualization.",
    techs: ["Next.js", "TypeScript", "Three.js", "Solidity", "Hardhat"],
    tags: ["Web3", "DeFi", "Gaming", "MEV"],
    github: "https://github.com/whyuardi/mev-bot-arena",
    live: "https://mev-bot-arena.vercel.app",
    featured: false,
  },
];

const techCategories = [
  { name: "Languages", items: ["TypeScript", "JavaScript", "Kotlin", "Dart", "Solidity", "Python"] },
  { name: "Mobile & Frontend", items: ["React", "Next.js", "Android (Kotlin)", "Flutter", "Tailwind CSS", "Three.js"] },
  { name: "Backend & Web3", items: ["Node.js", "Firebase", "Ethers.js", "REST API", "Smart Contracts", "Sepolia"] },
  { name: "Tools & Infra", items: ["Git", "TensorFlow Lite", "Jetpack", "MVVM", "Figma", "Linux"] },
];

const experience = [
  {
    company: "PT Benua Green Energy",
    role: "IT Support Officer",
    type: "Full-time",
    period: "Jun 2026 — Present",
    desc: "Providing IT support, maintaining hardware and network infrastructure, and ensuring smooth technology operations.",
    tags: ["IT Hardware", "Help Desk"],
  },
  {
    company: "Bangkit Academy",
    role: "Mobile Developer Cohort",
    type: "Internship",
    period: "Sep 2024 — Jan 2025",
    desc: "Completed intensive mobile development program by Google. Built Android apps using Kotlin, MVVM, Firebase, and TensorFlow Lite.",
    tags: ["Kotlin", "Android Dev", "TensorFlow Lite"],
  },
  {
    company: "Universitas Teknologi Yogyakarta",
    role: "Academic Accreditation Assistant",
    type: "Part-time",
    period: "Feb 2024 — Nov 2024",
    desc: "Prepared and managed campus accreditation documentation. Coordinated with academic departments for compliance.",
    tags: ["Documentation", "Accreditation"],
  },
  {
    company: "Seven Computer",
    role: "IT Support",
    type: "Apprenticeship",
    period: "2023",
    desc: "Technical troubleshooting, hardware repair, and customer support for IT-related issues.",
    tags: ["Technical Support", "Hardware"],
  },
];

const stats = [
  { n: "2026", l: "Graduate" },
  { n: "6", l: "Projects" },
  { n: "500+", l: "Connections" },
];

// ─── PAGE ───
export default function Home() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Preloader />
      <MinimalHeader />
      <ScrollDots />
      <ScrollIndicator />

      <div className="scroll-container">
        {/* ─── HERO ─── */}
        <section id="hero" className="snap-section">
          <div className="section-content flex flex-col justify-center min-h-[100vh]">
            <SectionReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-glow border border-accent/20 text-xs text-accent mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                #OPENTOWORK
              </div>
            </SectionReveal>

            <SectionReveal delay={0.1}>
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.85] mb-4">
                Hey, I&apos;m
                <br />
                <span className="text-gradient-name">Ardhiansyah</span>
              </h1>
            </SectionReveal>

            <SectionReveal delay={0.2}>
              <p className="text-lg md:text-xl text-text-secondary font-mono mb-8">
                Mobile Developer · IT Support · 0x Enthusiast
              </p>
            </SectionReveal>

            <SectionReveal delay={0.3}>
              <div className="flex flex-wrap gap-4 mb-10">
                <a
                  href="#projects"
                  onClick={(e) => { e.preventDefault(); scrollTo("projects"); }}
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-accent text-bg font-medium text-sm hover:bg-accent-dim transition-all hover:gap-3"
                >
                  View Projects
                  <ArrowRight size={16} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
                </a>
                <a
                  href="https://linkedin.com/in/wahyuardi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border text-text-secondary text-sm hover:border-accent/30 hover:text-accent transition-all"
                >
                  <LinkedinLogo size={16} weight="duotone" />
                  LinkedIn
                </a>
                <a
                  href="https://github.com/whyuardi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border text-text-secondary text-sm hover:border-accent/30 hover:text-accent transition-all"
                >
                  <GithubLogo size={16} weight="duotone" />
                  GitHub
                </a>
              </div>
            </SectionReveal>

            <SectionReveal delay={0.4}>
              <div className="flex gap-10 pt-8 border-t border-border">
                {stats.map((s) => (
                  <div key={s.l}>
                    <div className="text-2xl font-bold text-text">{s.n}</div>
                    <div className="text-xs text-text-muted mt-1 font-mono uppercase tracking-wider">{s.l}</div>
                  </div>
                ))}
              </div>
            </SectionReveal>
          </div>
        </section>

        {/* ─── ABOUT ─── */}
        <section id="about" className="snap-section">
          <div className="section-content">
            <SectionReveal>
              <span className="section-label">About</span>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                Who <span className="text-gradient">am I?</span>
              </h2>
            </SectionReveal>

            <SectionReveal delay={0.1}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-6">
                    Informatics graduate from{" "}
                    <span className="text-text font-medium">Universitas Teknologi Yogyakarta</span>{" "}
                    with hands-on mobile development experience from{" "}
                    <span className="text-text font-medium">Bangkit Academy</span> — a program by Google, GoTo, and Traveloka.
                  </p>
                  <p className="text-base text-text-secondary leading-relaxed mb-8">
                    Skilled in Android development, Web3, and full-stack engineering. Currently providing IT support at{" "}
                    <span className="text-text font-medium">PT Benua Green Energy</span> while building Web3 projects on the side.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
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
                </div>

                <div className="flex flex-col gap-4">
                  {stats.map((s) => (
                    <div
                      key={s.l}
                      className="flex items-center gap-6 p-6 rounded-[var(--radius)] border border-border bg-surface hover:border-accent/20 transition-all duration-300"
                    >
                      <div className="text-4xl font-bold text-accent w-20 text-center">{s.n}</div>
                      <div>
                        <div className="text-sm font-medium text-text">{s.l}</div>
                        <div className="text-xs text-text-muted mt-0.5">
                          {s.l === "Graduate" && "Universitas Teknologi Yogyakarta"}
                          {s.l === "Projects" && "Web3, Mobile & ML"}
                          {s.l === "Connections" && "LinkedIn Network"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>

        {/* ─── PROJECTS ─── */}
        <section id="projects" className="snap-section !h-auto !min-h-[100vh]">
          <div className="section-content py-16">
            <SectionReveal>
              <span className="section-label">Projects</span>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
                Case <span className="text-gradient">Studies</span>
              </h2>
              <p className="text-text-secondary mb-10 max-w-xl text-base">
                Mobile apps, ML/AI, and Web3 platforms built from the ground up.
              </p>
            </SectionReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p, i) => (
                <SectionReveal key={p.title} delay={0.05 * i}>
                  <div
                    className={`group relative p-6 rounded-[var(--radius)] border border-border bg-surface hover:border-accent/20 hover:bg-surface-elevated transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 flex flex-col h-full ${
                      p.featured ? "md:col-span-2 lg:col-span-2" : ""
                    }`}
                  >
                    <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-start justify-between mb-3">
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

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {p.techs.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-accent-glow text-[11px] text-accent font-mono">
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
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── STACK ─── */}
        <section id="stack" className="snap-section !h-auto !min-h-[100vh]">
          <div className="section-content py-16">
            <SectionReveal>
              <span className="section-label">Toolkit</span>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-10">
                Tech <span className="text-gradient">Stack</span>
              </h2>
            </SectionReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {techCategories.map((cat, i) => (
                <SectionReveal key={cat.name} delay={0.08 * i}>
                  <div className="p-6 rounded-[var(--radius)] border border-border bg-surface hover:border-accent/20 transition-all duration-300 h-full">
                    <h3 className="text-sm font-semibold text-accent font-mono mb-4">
                      {"// "}{cat.name}
                    </h3>
                    <div className="space-y-2.5">
                      {cat.items.map((item) => (
                        <div
                          key={item}
                          className="text-sm text-text-secondary hover:text-text transition-colors flex items-center gap-2"
                        >
                          <span className="w-1 h-1 rounded-full bg-border" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── EXPERIENCE ─── */}
        <section id="experience" className="snap-section !h-auto !min-h-[100vh]">
          <div className="section-content py-16">
            <SectionReveal>
              <span className="section-label">Background</span>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-10">
                Experience
              </h2>
            </SectionReveal>

            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-px bg-border hidden md:block" />

              <div className="space-y-6">
                {experience.map((exp, i) => (
                  <SectionReveal key={`${exp.company}-${exp.role}`} delay={0.08 * i}>
                    <div className="relative pl-8 md:pl-20">
                      <div className="absolute left-[7px] md:left-[29px] top-1.5 w-3 h-3 rounded-full bg-accent ring-4 ring-bg" />

                      <div className="p-6 rounded-[var(--radius)] border border-border bg-surface hover:border-accent/20 transition-all duration-300">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">{exp.company}</h3>
                            <div className="flex items-center gap-2 text-sm text-text-secondary mt-0.5 flex-wrap">
                              <span>{exp.role}</span>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <span className="text-text-muted">{exp.type}</span>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <span>{exp.period}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
                          {exp.desc}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {exp.tags.map((t) => (
                            <span key={t} className="px-2 py-0.5 rounded bg-border text-[11px] text-text-muted font-mono">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── CONTACT ─── */}
        <section id="contact" className="snap-section">
          <div className="section-content">
            <SectionReveal>
              <div className="relative rounded-[var(--radius)] border border-border bg-surface-elevated p-12 md:p-20 text-center overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0" />

                <div className="relative z-10 max-w-lg mx-auto">
                  <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
                    Let&apos;s build
                    <br />
                    <span className="text-gradient">together</span>
                  </h2>

                  <p className="text-text-secondary leading-relaxed mb-8">
                    Currently open to mobile development and Web3 opportunities. Hit me up.
                  </p>

                  <div className="flex flex-wrap justify-center gap-4">
                    <a
                      href="https://linkedin.com/in/wahyuardi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-bg text-sm font-medium hover:bg-accent-dim transition-all"
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
                    <a
                      href="mailto:ardiansyahwahyuu@gmail.com"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-text-secondary text-sm hover:border-accent/30 hover:text-accent transition-all"
                    >
                      <PaperPlaneRight size={16} weight="duotone" />
                      Email
                    </a>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>
      </div>
    </>
  );
}
