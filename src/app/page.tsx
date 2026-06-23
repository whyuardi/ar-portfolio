"use client";

import dynamic from "next/dynamic";
import SectionReveal from "@/components/SectionReveal";
import CanvasLogo from "@/components/CanvasLogo";
import TiltCard from "@/components/TiltCard";
import Marquee from "@/components/Marquee";
import { useState, useEffect } from "react";

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
    github: "https://github.com/whyuardi",
    live: null,
    featured: true,
    gradient: "linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 50%, #1a0f2e 100%)",
    icon: "GF",
  },
  {
    title: "Siaprak",
    role: "Mobile Developer",
    desc: "Mobile app for monitoring vocational students' internship progress with daily logging and real-time reporting.",
    techs: ["Kotlin", "React JS", "REST API", "Firebase"],
    github: "https://github.com/whyuardi",
    live: null,
    featured: false,
    gradient: "linear-gradient(135deg, #0f1a2e 0%, #1b2e4e 50%, #0f1a2e 100%)",
    icon: "SP",
  },
  {
    title: "BioFace",
    role: "ML & Android Dev",
    desc: "Android app detecting facial skin diseases in real-time using TensorFlow Lite.",
    techs: ["Kotlin", "TensorFlow Lite", "Firebase", "MVVM"],
    github: "https://github.com/whyuardi",
    live: null,
    featured: false,
    gradient: "linear-gradient(135deg, #0f2e1a 0%, #1b4e2d 50%, #0f2e1a 100%)",
    icon: "BF",
  },
  {
    title: "Ignite Launchpad",
    role: "Full-stack Dev",
    desc: "Multi-chain token launch platform with wallet integration, tiered sales, and real-time progress tracking.",
    techs: ["Next.js", "TypeScript", "Three.js", "Motion"],
    github: "https://github.com/whyuardi/ignite-launchpad",
    live: "https://ignite-launchpad.vercel.app",
    featured: false,
    gradient: "linear-gradient(135deg, #2e1a0f 0%, #4e2d1b 50%, #2e1a0f 100%)",
    icon: "IG",
  },
  {
    title: "ORION Dashboard",
    role: "Full-stack Dev",
    desc: "Web3 operations suite with wallet management, portfolio tracking, and 3D data visualization.",
    techs: ["Three.js", "Ethers.js", "Web3", "Chart.js"],
    github: "https://github.com/whyuardi/orion-dashboard",
    live: null,
    featured: false,
    gradient: "linear-gradient(135deg, #1a0f28 0%, #2d1b40 50%, #1a0f28 100%)",
    icon: "OR",
  },
  {
    title: "MEV Arena",
    role: "Full-stack Dev",
    desc: "Gamified MEV bot competition platform with interactive 3D mempool visualization.",
    techs: ["Next.js", "TypeScript", "Three.js", "Solidity"],
    github: "https://github.com/whyuardi/mev-bot-arena",
    live: "https://mev-bot-arena.vercel.app",
    featured: false,
    gradient: "linear-gradient(135deg, #2e0f1a 0%, #4e1b2d 50%, #2e0f1a 100%)",
    icon: "ME",
  },
];

const techCategories = [
  { name: "Languages", items: ["TypeScript", "JavaScript", "Kotlin", "Dart", "Solidity", "Python"], icon: "⟨⟩", color: "#8B7FFF" },
  { name: "Mobile & Frontend", items: ["React", "Next.js", "Android", "Flutter", "Tailwind", "Three.js"], icon: "◻", color: "#FF6B9D" },
  { name: "Backend & Web3", items: ["Node.js", "Firebase", "Ethers.js", "REST API", "Smart Contracts"], icon: "⬡", color: "#00D4AA" },
  { name: "Tools & Infra", items: ["Git", "TensorFlow", "Figma", "Linux", "Jetpack", "MVVM"], icon: "⚙", color: "#FFB347" },
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

// ─── ARROW ICON ───
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
              <div className="hero-overline">
                <span className="dot" />
                Available for hire
              </div>

              <h1 className="hero-title">
                <span className="line">
                  <span className="line-inner">Ardhi<span className="accent">a</span>nsyah</span>
                </span>
              </h1>

              <p className="hero-subtitle">
                Building mobile apps, Web3 protocols, and intelligent systems — from concept to deployment.
              </p>

              <div className="hero-cta">
                <a href="#home-evernet" className="button is-gradient">
                  <span>View Work</span>
                  <ArrowIcon />
                </a>
                <a href="https://linkedin.com/in/wahyuardi" target="_blank" rel="noopener noreferrer" className="button">
                  LinkedIn
                </a>
                <a href="https://github.com/whyuardi" target="_blank" rel="noopener noreferrer" className="button is-transparent">
                  GitHub
                </a>
              </div>

              <div className="hero-stats">
                {[
                  { v: "6+", l: "Projects" },
                  { v: "4", l: "Experiences" },
                  { v: "2026", l: "Graduate" },
                ].map((s) => (
                  <div key={s.l} className="hero-stat">
                    <div className="hero-stat-value">{s.v}</div>
                    <div className="hero-stat-label">{s.l}</div>
                  </div>
                ))}
              </div>

              <div className="hero-accent-line" />
            </div>
          </section>

          {/* ═══════════ MARQUEE ═══════════ */}
          <Marquee />

          {/* ═══════════ ABOUT ═══════════ */}
          <section id="home-everblade" className="section" style={{ minHeight: "100vh" }}>
            <div className="section__content">
              <SectionReveal>
                <p className="kicker">Who am I</p>
              </SectionReveal>
              <SectionReveal delay={0.1}>
                <h2 className="title">
                  About <span className="italic-serif">Me</span>
                </h2>
              </SectionReveal>

              <div className="about-grid">
                <SectionReveal delay={0.2}>
                  <div className="about-text">
                    <p>
                      Informatics graduate from <strong>Universitas Teknologi Yogyakarta</strong> with hands-on
                      mobile development experience from <strong>Bangkit Academy</strong> — a program by Google, GoTo,
                      and Traveloka.
                    </p>
                    <p style={{ marginTop: "1rem" }}>
                      Currently serving as <strong>IT Support Officer</strong> at PT Benua Green Energy while building
                      Web3 platforms and intelligent systems on the side. Skilled in Android development, full-stack
                      engineering, and blockchain protocols.
                    </p>
                  </div>
                </SectionReveal>

                <SectionReveal delay={0.3}>
                  <div className="about-visual">
                    <div className="about-tag-row">
                      {["Web3 Builder", "Mobile Dev", "Problem Solver", "Fast Learner"].map((tag) => (
                        <span key={tag} className="about-tag">{tag}</span>
                      ))}
                    </div>
                    <div className="about-stat-block">
                      <div className="about-stat">
                        <div className="about-stat-num">6+</div>
                        <div className="about-stat-label">Projects</div>
                      </div>
                      <div className="about-stat">
                        <div className="about-stat-num">500+</div>
                        <div className="about-stat-label">Connections</div>
                      </div>
                      <div className="about-stat">
                        <div className="about-stat-num">4</div>
                        <div className="about-stat-label">Roles</div>
                      </div>
                    </div>
                  </div>
                </SectionReveal>
              </div>
            </div>
          </section>

          {/* ═══════════ PROJECTS ═══════════ */}
          <section id="home-evernet" className="section" style={{ minHeight: "auto", padding: "8rem 0" }}>
            <div className="section__content">
              <div className="projects-header">
                <div style={{ textAlign: "left" }}>
                  <SectionReveal>
                    <p className="kicker">Selected Work</p>
                  </SectionReveal>
                  <SectionReveal delay={0.1}>
                    <h2 className="title" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
                      Projects
                    </h2>
                  </SectionReveal>
                </div>
                <SectionReveal delay={0.15}>
                  <span className="projects-count">{projects.length} projects</span>
                </SectionReveal>
              </div>

              <div className="projects-grid">
                {projects.map((project, i) => (
                  <SectionReveal key={project.title} delay={0.1 + i * 0.08} className={project.featured ? "project-card--featured" : "project-card--regular"}>
                    <TiltCard className="project-card">
                      <div className="project-card-visual">
                        <div className="project-visual-gradient" style={{ background: project.gradient }}>
                          <div className="project-visual-icon">{project.icon}</div>
                        </div>
                      </div>

                      <div className="project-card-meta">
                        <span className="role-label">{project.role}</span>
                        <div className="project-card-links">
                          {project.github && (
                            <a href={project.github} target="_blank" rel="noopener noreferrer" title="GitHub">
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                              </svg>
                            </a>
                          )}
                          {project.live && (
                            <a href={project.live} target="_blank" rel="noopener noreferrer" title="Live">
                              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 13L13 1M13 1H3M13 1V11" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>

                      <h3>{project.title}</h3>
                      <p className="body2">{project.desc}</p>
                      <div className="project-tags">
                        {project.techs.map((tech) => (
                          <span key={tech} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    </TiltCard>
                  </SectionReveal>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════ SKILLS — BENTO ═══════════ */}
          <section id="home-everyone" className="section" style={{ minHeight: "auto", padding: "8rem 0" }}>
            <div className="section__content">
              <SectionReveal>
                <p className="kicker">Tech Stack</p>
              </SectionReveal>
              <SectionReveal delay={0.1}>
                <h2 className="title">
                  Built <span className="italic-serif">with</span>
                </h2>
              </SectionReveal>

              <div className="bento-grid">
                {techCategories.map((cat, i) => (
                  <SectionReveal key={cat.name} delay={0.15 + i * 0.08} className={i === 0 ? "bento-card--wide" : ""}>
                    <div
                      className="bento-card"
                      style={{ "--glow-color": `${cat.color}10` } as React.CSSProperties}
                    >
                      <div
                        className="bento-card-icon"
                        style={{
                          background: `${cat.color}12`,
                          color: cat.color,
                          fontSize: "1.1rem",
                        }}
                      >
                        {cat.icon}
                      </div>
                      <h3>{cat.name}</h3>
                      <div className="bento-skills">
                        {cat.items.map((item) => (
                          <span key={item} className="bento-skill">{item}</span>
                        ))}
                      </div>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════ EXPERIENCE — TIMELINE ═══════════ */}
          <section id="home-relayers" className="section" style={{ minHeight: "auto", padding: "8rem 0" }}>
            <div className="section__content">
              <SectionReveal>
                <p className="kicker">Journey</p>
              </SectionReveal>
              <SectionReveal delay={0.1}>
                <h2 className="title">
                  Re<span className="italic-serif">Built</span>
                </h2>
              </SectionReveal>

              <div className="timeline">
                {experience.map((exp, i) => (
                  <SectionReveal key={exp.role} delay={0.2 + i * 0.1}>
                    <div className="timeline-item">
                      <div className="timeline-dot" />
                      <p className="timeline-period">{exp.period}</p>
                      <h3 className="timeline-role">{exp.role}</h3>
                      <p className="timeline-company">{exp.company}</p>
                      <p className="timeline-desc">{exp.desc}</p>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════ CTA ═══════════ */}
          <section id="home-pool" className="section" style={{ minHeight: "80vh" }}>
            <div className="section__content">
              <SectionReveal>
                <div className="cta-content">
                  <h2>
                    <span style={{ display: "block" }}>Let&apos;s</span>
                    <span style={{ display: "block" }} className="gradient-text">Build Together</span>
                  </h2>
                  <p>
                    Looking for a developer who ships mobile apps, builds Web3 protocols,
                    and designs systems from scratch? Let&apos;s make it happen.
                  </p>
                  <a
                    href="https://linkedin.com/in/wahyuardi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button is-gradient"
                  >
                    <span>Get In Touch</span>
                    <ArrowIcon />
                  </a>
                </div>
              </SectionReveal>
            </div>
          </section>

          {/* ═══════════ FOOTER ═══════════ */}
          <section id="home-join" className="section" style={{ minHeight: "auto", padding: "6rem 0 3rem" }}>
            <div className="section__content">
              <SectionReveal>
                <div className="btn2" style={{ marginBottom: "3rem" }}>
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

              <div className="footer-bottom">
                <p className="footer-copyright">© {new Date().getFullYear()} Ardhiansyah. Temanggung, Indonesia.</p>
                <div className="footer-links">
                  <a href="https://linkedin.com/in/wahyuardi" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                  <a href="https://github.com/whyuardi" target="_blank" rel="noopener noreferrer">GitHub</a>
                  <a href="mailto:ardiansyahwahyuu@gmail.com">Email</a>
                </div>
              </div>
            </div>
          </section>

        </main>
      </div>
    </>
  );
}

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
