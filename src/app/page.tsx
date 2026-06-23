"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

const Preloader = dynamic(() => import("@/components/Preloader"), { ssr: false });
const MinimalHeader = dynamic(() => import("@/components/MinimalHeader"), { ssr: false });
const ScrollIndicator = dynamic(() => import("@/components/ScrollIndicator"), { ssr: false });
const SideNav = dynamic(() => import("@/components/SideNav"), { ssr: false });
const WebGLBackground = dynamic(() => import("@/components/WebGLBackground"), { ssr: false });

// ─── DATA ───
const projects = [
  {
    num: "01",
    title: "Gemfund",
    role: "Mobile Developer",
    desc: "Web3-based mobile crowdfunding app on Ethereum Sepolia. Integrates Gemini AI for fraud detection.",
    techs: ["Flutter", "Dart", "Solidity", "Web3", "Gemini AI"],
    github: "https://github.com/whyuardi",
    live: null,
  },
  {
    num: "02",
    title: "Siaprak",
    role: "Mobile Developer",
    desc: "Mobile app for monitoring vocational students' internship progress with daily logging and real-time reporting.",
    techs: ["Kotlin", "React JS", "REST API", "Firebase"],
    github: "https://github.com/whyuardi",
    live: null,
  },
  {
    num: "03",
    title: "BioFace",
    role: "ML & Android Dev",
    desc: "Android app detecting facial skin diseases in real-time using TensorFlow Lite.",
    techs: ["Kotlin", "TensorFlow Lite", "Firebase", "MVVM"],
    github: "https://github.com/whyuardi",
    live: null,
  },
  {
    num: "04",
    title: "Ignite Launchpad",
    role: "Full-stack Dev",
    desc: "Multi-chain token launch platform with wallet integration, tiered sales, and real-time progress tracking.",
    techs: ["Next.js", "TypeScript", "Three.js", "Motion"],
    github: "https://github.com/whyuardi/ignite-launchpad",
    live: "https://ignite-launchpad.vercel.app",
  },
  {
    num: "05",
    title: "ORION Dashboard",
    role: "Full-stack Dev",
    desc: "Web3 operations suite with wallet management, portfolio tracking, and 3D data visualization.",
    techs: ["Three.js", "Ethers.js", "Web3", "Chart.js"],
    github: "https://github.com/whyuardi/orion-dashboard",
    live: null,
  },
  {
    num: "06",
    title: "MEV Arena",
    role: "Full-stack Dev",
    desc: "Gamified MEV bot competition platform with interactive 3D mempool visualization.",
    techs: ["Next.js", "TypeScript", "Three.js", "Solidity"],
    github: "https://github.com/whyuardi/mev-bot-arena",
    live: "https://mev-bot-arena.vercel.app",
  },
];

const skillGroups = [
  {
    name: "Languages",
    items: ["TypeScript", "JavaScript", "Kotlin", "Dart", "Solidity", "Python"],
  },
  {
    name: "Frontend",
    items: ["React", "Next.js", "Tailwind", "Three.js", "Flutter", "Android"],
  },
  {
    name: "Backend",
    items: ["Node.js", "Firebase", "REST API", "Smart Contracts", "Ethers.js"],
  },
  {
    name: "Tools",
    items: ["Git", "TensorFlow Lite", "Figma", "Linux", "Jetpack Compose", "MVVM"],
  },
];

const experience = [
  {
    period: "Jun 2026 - Present",
    role: "IT Support Officer",
    company: "PT Benua Green Energy",
    type: "Full-time",
    desc: "Providing IT support, maintaining hardware and network infrastructure, and ensuring smooth technology operations.",
  },
  {
    period: "Sep 2024 - Jan 2025",
    role: "Mobile Developer Cohort",
    company: "Bangkit Academy",
    type: "Internship",
    desc: "Completed intensive mobile development program by Google. Built Android apps using Kotlin, MVVM, Firebase, and TensorFlow Lite.",
  },
  {
    period: "Feb 2024 - Nov 2024",
    role: "Academic Accreditation Assistant",
    company: "Universitas Teknologi Yogyakarta",
    type: "Part-time",
    desc: "Prepared and managed campus accreditation documentation. Coordinated with academic departments for compliance.",
  },
  {
    period: "2023",
    role: "IT Support",
    company: "Seven Computer",
    type: "Apprenticeship",
    desc: "Technical troubleshooting, hardware repair, and customer support for IT-related issues.",
  },
];

// ─── MAIN ───
export default function Home() {
  useEffect(() => {
    // Intersection Observer for active nav
    const sections = document.querySelectorAll<HTMLElement>("section[id]");
    const navLinks = document.querySelectorAll("#navbar li");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach((link) => {
              link.classList.toggle("active", link.getAttribute("data-section") === id);
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

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
          <section id="home-hero" className="section">
            <div className="section__content">
              <p className="hero-meta">Available for hire</p>

              <h1 className="hero-name">
                <span className="line">
                  <span className="line-inner">Ardhian<span className="accent">sya</span>h</span>
                </span>
              </h1>

              <p className="hero-desc">
                Building mobile apps, Web3 protocols, and intelligent systems
                from concept to deployment. Based in Temanggung, Indonesia.
              </p>

              <div className="hero-cta">
                <a href="#home-evernet" className="btn-primary">
                  <span>View Work</span>
                  <svg viewBox="0 0 14 14" fill="none"><path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
                <a href="https://linkedin.com/in/wahyuardi" target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  LinkedIn
                </a>
              </div>

              <div className="hero-bottom">
                <div className="hero-stats">
                  <div>
                    <div className="hero-stat-value">6+</div>
                    <div className="hero-stat-label">Projects</div>
                  </div>
                  <div>
                    <div className="hero-stat-value">4</div>
                    <div className="hero-stat-label">Experiences</div>
                  </div>
                  <div>
                    <div className="hero-stat-value">2026</div>
                    <div className="hero-stat-label">Graduate</div>
                  </div>
                </div>
                <span className="hero-scroll-hint">Scroll</span>
              </div>
            </div>
          </section>

          {/* ═══════════ ABOUT ═══════════ */}
          <section id="home-everblade" className="section" style={{ minHeight: "auto" }}>
            <div className="section__content" style={{ padding: "8rem 2rem" }}>
              <div className="about-grid">
                <div className="about-left">
                  <p className="section-label">Who am I</p>
                  <h2 className="about-heading">
                    Informatics<br />graduate from<br />UTY
                  </h2>
                </div>
                <div className="about-right">
                  <p>
                    Informatics graduate from <strong>Universitas Teknologi Yogyakarta</strong> with hands-on
                    mobile development experience from <strong>Bangkit Academy</strong>, a program by Google, GoTo,
                    and Traveloka.
                  </p>
                  <p>
                    Currently serving as <strong>IT Support Officer</strong> at PT Benua Green Energy while building
                    Web3 platforms and intelligent systems on the side.
                  </p>
                  <div className="about-tags">
                    {["Web3 Builder", "Mobile Dev", "Problem Solver", "Fast Learner"].map((tag) => (
                      <span key={tag} className="about-tag">{tag}</span>
                    ))}
                  </div>
                  <div className="about-stats">
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
              </div>
            </div>
          </section>

          {/* ═══════════ PROJECTS — NUMBERED LIST ═══════════ */}
          <section id="home-evernet" className="section" style={{ minHeight: "auto" }}>
            <div className="section__content" style={{ padding: "6rem 2rem" }}>
              <div className="projects-header">
                <h2>Projects</h2>
                <span className="projects-count">{projects.length} total</span>
              </div>

              {projects.map((project) => (
                <div key={project.num} className="project-row">
                  <span className="project-num">{project.num}</span>
                  <div className="project-info">
                    <span className="project-role">{project.role}</span>
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-desc">{project.desc}</p>
                    <div className="project-tags">
                      {project.techs.map((tech) => (
                        <span key={tech} className="project-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                  <div className="project-links">
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer" title="GitHub">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                      </a>
                    )}
                    {project.live && (
                      <a href={project.live} target="_blank" rel="noopener noreferrer" title="Live">
                        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 13L13 1M13 1H3M13 1V11" /></svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ═══════════ SKILLS — TEXT LIST ═══════════ */}
          <section id="home-everyone" className="section" style={{ minHeight: "auto" }}>
            <div className="section__content" style={{ padding: "6rem 2rem" }}>
              <h2 style={{ marginBottom: "0.5rem" }}>Tech Stack</h2>

              <div className="skills-layout">
                {skillGroups.map((group) => (
                  <div key={group.name} className="skill-category">
                    <h3>{group.name}</h3>
                    <div className="skill-items">
                      {group.items.map((item) => (
                        <span key={item} className="skill-item">{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════ EXPERIENCE — TABLE ═══════════ */}
          <section id="home-relayers" className="section" style={{ minHeight: "auto" }}>
            <div className="section__content" style={{ padding: "6rem 2rem" }}>
              <h2 style={{ marginBottom: "0.5rem" }}>Experience</h2>

              <div className="exp-list">
                {experience.map((exp) => (
                  <div key={exp.role} className="exp-row">
                    <span className="exp-period">{exp.period}</span>
                    <div className="exp-content">
                      <h3>{exp.role}</h3>
                      <p className="exp-company">{exp.company}</p>
                      <p className="exp-desc">{exp.desc}</p>
                    </div>
                    <span className="exp-type">{exp.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════ CTA ═══════════ */}
          <section id="home-pool" className="section" style={{ minHeight: "80vh" }}>
            <div className="section__content" style={{ padding: "8rem 2rem" }}>
              <h2 className="cta-heading">
                Let&apos;s build<br />
                something<span className="accent">.</span>
              </h2>
              <p className="cta-desc">
                Looking for a developer who ships mobile apps, builds Web3 protocols,
                and designs systems from scratch.
              </p>
              <a
                href="https://linkedin.com/in/wahyuardi"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-btn"
              >
                <span>Get In Touch</span>
                <svg viewBox="0 0 14 14" fill="none"><path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </div>
          </section>

          {/* ═══════════ FOOTER ═══════════ */}
          <section id="home-join" className="section" style={{ minHeight: "auto" }}>
            <div className="section__content" style={{ padding: "3rem 2rem" }}>
              <div className="footer-inner">
                <div className="footer-links">
                  <a href="https://linkedin.com/in/wahyuardi" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                  <a href="https://github.com/whyuardi" target="_blank" rel="noopener noreferrer">GitHub</a>
                  <a href="mailto:ardiansyahwahyuu@gmail.com">Email</a>
                </div>
                <p className="footer-copy">&copy; {new Date().getFullYear()} Ardhiansyah. Temanggung, Indonesia.</p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </>
  );
}
