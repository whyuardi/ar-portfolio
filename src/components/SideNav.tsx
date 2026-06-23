"use client";

import { useState, useEffect } from "react";

const sections = [
  { id: "home-hero", label: "Home" },
  { id: "home-everblade", label: "About" },
  { id: "home-evernet", label: "Projects" },
  { id: "home-everyone", label: "Expertise" },
  { id: "home-relayers", label: "Experience" },
  { id: "home-pool", label: "Contact" },
  { id: "home-join", label: "Connect" },
];

// EverSwap-style chevron/diamond SVG icon
function NavIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 2L18 10L10 18L2 10L10 2Z"
        fill={active ? "#F8F7F2" : "none"}
        stroke="#F8F7F2"
        strokeWidth={active ? "0" : "0.8"}
        opacity={active ? 1 : 0.3}
      />
    </svg>
  );
}

export default function SideNav() {
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sections.findIndex((s) => s.id === entry.target.id);
            if (idx !== -1) setActiveSection(idx);
          }
        });
      },
      { threshold: 0.35, rootMargin: "-10% 0px -10% 0px" }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav id="navbar" aria-label="Section navigation">
      <ul>
        {sections.map((section, i) => (
          <li key={section.id} className={i === activeSection ? "active" : ""}>
            <a
              href={`#${section.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleClick(section.id);
              }}
              aria-label={section.label}
              title={section.label}
            >
              <NavIcon active={i === activeSection} />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
