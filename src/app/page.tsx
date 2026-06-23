"use client";

import dynamic from "next/dynamic";
import SectionReveal from "@/components/SectionReveal";
import CanvasLogo from "@/components/CanvasLogo";
import { useState, useEffect, useRef } from "react";

const Preloader = dynamic(() => import("@/components/Preloader"), { ssr: false });
const MinimalHeader = dynamic(() => import("@/components/MinimalHeader"), { ssr: false });
const ScrollIndicator = dynamic(() => import("@/components/ScrollIndicator"), { ssr: false });
const SideNav = dynamic(() => import("@/components/SideNav"), { ssr: false });
const WebGLBackground = dynamic(() => import("@/components/WebGLBackground"), { ssr: false });

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
  },
  {
    company: "Bangkit Academy",
    role: "Mobile Developer Cohort",
    type: "Internship",
    period: "Sep 2024 — Jan 2025",
    desc: "Completed intensive mobile development program by Google. Built Android apps using Kotlin, MVVM, Firebase, and TensorFlow Lite.",
  },
  {
    company: "Universitas Teknologi Yogyakarta",
    role: "Academic Accreditation Assistant",
    type: "Part-time",
    period: "Feb 2024 — Nov 2024",
    desc: "Prepared and managed campus accreditation documentation. Coordinated with academic departments for compliance.",
  },
  {
    company: "Seven Computer",
    role: "IT Support",
    type: "Apprenticeship",
    period: "2023",
    desc: "Technical troubleshooting, hardware repair, and customer support for IT-related issues.",
  },
];

// ─── SCROLL HOOK ───
function useScrollRatio(id: string) {
  const [ratio, setRatio] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById(id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const r = 1 - (rect.top / vh);
      setRatio(Math.max(0, Math.min(1, r)));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [id]);
  return ratio;
}

// ─── SVG ICONS ───
function DiamondIcon() {
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M38 4L72 38L38 72L4 38L38 4Z" stroke="#F8F7F2" strokeWidth="0.8" fill="none" />
      <path d="M38 16L60 38L38 60L16 38L38 16Z" stroke="#F8F7F2" strokeWidth="0.5" fill="none" opacity="0.4" />
      <circle cx="38" cy="38" r="4" fill="#F8F7F2" opacity="0.6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── MAIN PAGE ───
export default function Home() {
  const aboutRatio = useScrollRatio("home-everblade");
  const expRatio = useScrollRatio("home-relayers");

  return (
    <>
      <Preloader />
      <WebGLBackground />
      <MinimalHeader />
      <ScrollIndicator />
      <SideNav />

      <div id="ui">
        <main className="page">
          {/* ═══════════ HERO ═══════════ */}
          <section id="home-hero" className="section" style={{ minHeight: "100vh" }}>
            <div className="section__content">
              <SectionReveal delay={0.3}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 text-xs text-white/70 mb-4 font-sans tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                  #OPENTOWORK
                </div>
              </SectionReveal>
              <SectionReveal delay={0.5}>
                <h1 className="title">Ardhi<span className="italic-serif">a</span>nsyah</h1>
              </SectionReveal>
              <SectionReveal delay={0.7}>
                <p className="subtitle" style={{ marginTop: "0.5rem", opacity: 0.5 }}>
                  Mobile Developer · IT Support · 0x Enthusiast
                </p>
              </SectionReveal>
              <SectionReveal delay={0.9}>
                <div className="btn2" style={{ marginTop: "1.5rem" }}>
                  <a href="#home-everblade" className="button">
                    Explore
                  </a>
                  <a href="https://linkedin.com/in/wahyuardi" target="_blank" rel="noopener noreferrer" className="button is-transparent">
                    LinkedIn
                  </a>
                  <a href="https://github.com/whyuardi" target="_blank" rel="noopener noreferrer" className="button is-transparent">
                    GitHub
                  </a>
                </div>
              </SectionReveal>
            </div>
          </section>

          {/* ═══════════ ABOUT ═══════════ */}
          <section id="home-everblade" className="section" style={{ minHeight: "120vh" }}>
            <div className="section__content">
              <SectionReveal>
                <div className="title-wrapper">
                  <h2 className="title">
                    <span style={{ display: "block" }}>About</span>
                    <span style={{ display: "block" }}>Me</span>
                  </h2>
                </div>
              </SectionReveal>

              <SectionReveal delay={0.15}>
                <CanvasLogo ratio={aboutRatio} style={{ margin: "2rem auto" }} />
              </SectionReveal>

              <SectionReveal delay={0.2}>
                <p className="body1 description" style={{ marginTop: "0.5rem" }}>
                  Informatics graduate from <strong style={{ color: "var(--color-text)" }}>Universitas Teknologi Yogyakarta</strong>{" "}
                  with hands-on mobile development experience from <strong style={{ color: "var(--color-text)" }}>Bangkit Academy</strong>{" "}
                  — a program by Google, GoTo, and Traveloka. Skilled in Android development, Web3, and full-stack engineering.
                </p>
              </SectionReveal>

              <SectionReveal delay={0.3}>
                <div style={{
                  display: "flex",
                  gap: "3rem",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  marginTop: "2rem",
                }}>
                  {[
                    { n: "2026", l: "Graduate", d: "Universitas Teknologi Yogyakarta" },
                    { n: "6", l: "Projects", d: "Web3, Mobile & ML" },
                    { n: "500+", l: "Connections", d: "LinkedIn Network" },
                  ].map((s) => (
                    <div key={s.l} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 500, lineHeight: 1, color: "var(--color-text)" }}>
                        {s.n}
                      </div>
                      <div className="body2" style={{ marginTop: "0.25rem" }}>{s.l}</div>
                      <div className="body2" style={{ fontSize: "0.75rem" }}>{s.d}</div>
                    </div>
                  ))}
                </div>
              </SectionReveal>
            </div>
          </section>

          {/* ═══════════ PROJECTS ═══════════ */}
          <section id="home-evernet" className="section" style={{ minHeight: "120vh" }}>
            <div className="section__content">
              <SectionReveal>
                <p className="subtitle" style={{ marginBottom: "0.5rem" }}>Where creativity</p>
                <h2 className="title">Flows</h2>
              </SectionReveal>

              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "2rem",
                marginTop: "3rem",
                width: "100%",
                maxWidth: "48rem",
              }}>
                {projects.map((project, i) => (
                  <SectionReveal key={project.title} delay={0.1 * (i + 1)}>
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      textAlign: "left",
                      padding: "2rem",
                      border: "1px solid rgba(248, 247, 242, 0.06)",
                      borderRadius: "2px",
                      background: "rgba(248, 247, 242, 0.02)",
                      transition: "border-color 0.3s ease, background 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(248, 247, 242, 0.12)";
                      e.currentTarget.style.background = "rgba(248, 247, 242, 0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(248, 247, 242, 0.06)";
                      e.currentTarget.style.background = "rgba(248, 247, 242, 0.02)";
                    }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <p className="body2" style={{ fontSize: "0.7rem", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
                            {project.role}
                          </p>
                          <h3 className="title" style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", textAlign: "left" }}>
                            {project.title}
                          </h3>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          {project.github && (
                            <a href={project.github} target="_blank" rel="noopener noreferrer" className="button" style={{ padding: "0.375rem 0.75rem" }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                              </svg>
                            </a>
                          )}
                          {project.live && (
                            <a href={project.live} target="_blank" rel="noopener noreferrer" className="button" style={{ padding: "0.375rem 0.75rem" }}>
                              <ArrowIcon />
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="body2">{project.desc}</p>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {project.techs.map((tech) => (
                          <span key={tech} style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "100px",
                            border: "1px solid rgba(248, 247, 242, 0.1)",
                            fontSize: "0.7rem",
                            color: "var(--color-text-muted)",
                            letterSpacing: "0.04em",
                          }}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════ EXPERTISE ═══════════ */}
          <section id="home-everyone" className="section" style={{ minHeight: "100vh" }}>
            <div className="section__content">
              <SectionReveal>
                <p className="kicker">Built with</p>
              </SectionReveal>

              <div className="cards-grid" style={{ marginTop: "2.5rem" }}>
                {techCategories.map((cat, i) => (
                  <SectionReveal key={cat.name} delay={0.15 * (i + 1)}>
                    <div className="everyone-card">
                      <div className="icon-wrapper" style={{ "--opacity": 1 } as React.CSSProperties}>
                        <DiamondIcon />
                      </div>
                      <h3 className="title" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}>{cat.name}</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", marginTop: "0.5rem" }}>
                        {cat.items.map((item) => (
                          <p key={item} className="body2">{item}</p>
                        ))}
                      </div>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════ EXPERIENCE ═══════════ */}
          <section id="home-relayers" className="section" style={{ minHeight: "120vh" }}>
            <div className="section__content">
              <SectionReveal>
                <CanvasLogo ratio={expRatio} style={{ margin: "0 auto 2rem" }} />
              </SectionReveal>

              <SectionReveal delay={0.1}>
                <h2 className="title">
                  Re<span style={{ fontWeight: 600 }}>Built</span>
                </h2>
              </SectionReveal>

              <SectionReveal delay={0.2}>
                <p className="body1 description" style={{ marginTop: "1.5rem" }}>
                  From IT support at PT Benua Green Energy to crafting Web3 platforms — every step has been about solving real problems with technology.
                </p>
              </SectionReveal>

              <SectionReveal delay={0.3}>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                  marginTop: "2.5rem",
                  textAlign: "left",
                  width: "100%",
                  maxWidth: "36rem",
                }}>
                  {experience.map((exp, i) => (
                    <SectionReveal key={exp.role} delay={0.35 + i * 0.1}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        padding: "1rem 0",
                        borderBottom: "1px solid rgba(248, 247, 242, 0.06)",
                      }}>
                        <div>
                          <p style={{ fontWeight: 400, color: "var(--color-text)" }}>{exp.role}</p>
                          <p className="body2" style={{ marginTop: "0.25rem" }}>{exp.company}</p>
                        </div>
                        <p className="body2" style={{ whiteSpace: "nowrap" }}>{exp.period}</p>
                      </div>
                    </SectionReveal>
                  ))}
                </div>
              </SectionReveal>
            </div>
          </section>

          {/* ═══════════ CTA ═══════════ */}
          <section id="home-pool" className="section" style={{ minHeight: "100vh" }}>
            <div className="section__content">
              <SectionReveal>
                <div className="content-inner">
                  <h2 className="title">
                    <span style={{ display: "block" }}>One Goal</span>
                    <span style={{ display: "block" }}>Every Skill</span>
                  </h2>
                  <p className="body1" style={{ marginTop: "1rem" }}>
                    Looking for a developer who can ship mobile apps, build Web3 protocols,
                    and design systems from scratch? Let&apos;s build something extraordinary.
                  </p>
                  <a
                    href="mailto:ardiansyahwahyuu@gmail.com"
                    className="button"
                    style={{ marginTop: "1.5rem" }}
                  >
                    <span>Hire Me</span>
                    <ArrowIcon />
                  </a>
                </div>
              </SectionReveal>
            </div>
          </section>

          {/* ═══════════ FOOTER ═══════════ */}
          <section id="home-join" className="section">
            <div className="section__content">
              <SectionReveal>
                <p className="subtitle">Stay connected</p>
              </SectionReveal>
              <SectionReveal delay={0.1}>
                <h2 className="title" style={{ marginTop: "0.5rem" }}>
                  <span>Build with</span>
                  <span>Ardhiansyah</span>
                </h2>
              </SectionReveal>
              <SectionReveal delay={0.2}>
                <div className="btn2" style={{ marginTop: "2rem" }}>
                  <a href="https://linkedin.com/in/wahyuardi" target="_blank" rel="noopener noreferrer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </a>
                  <a href="https://github.com/whyuardi" target="_blank" rel="noopener noreferrer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    GitHub
                  </a>
                  <a href="mailto:ardiansyahwahyuu@gmail.com">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M22 7l-10 6L2 7" />
                    </svg>
                    Email
                  </a>
                </div>
              </SectionReveal>

              <SectionReveal delay={0.3}>
                <p className="body2" style={{ marginTop: "3rem" }}>
                  © {new Date().getFullYear()} Ardhiansyah. Temanggung, Indonesia.
                </p>
              </SectionReveal>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
