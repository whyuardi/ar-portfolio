"use client";

const experience = [
  {
    company: "PT Benua Green Energy",
    role: "Information Technology Support Officer",
    type: "Full-time",
    period: "Jun 2026 - Present",
    desc: "Providing IT support services, maintaining hardware and network infrastructure, and ensuring smooth technology operations across the organization.",
    tags: ["IT Hardware Support", "Help Desk Support"],
  },
  {
    company: "Bangkit Academy led by Google, GoTo, & Traveloka",
    role: "Mobile Developer Cohort",
    type: "Internship",
    period: "Sep 2024 - Jan 2025",
    desc: "Completed intensive mobile development program organized by Google. Built Android applications using Kotlin, MVVM, Jetpack, REST API, Firebase, and TensorFlow Lite for on-device ML.",
    tags: ["Kotlin", "Android Development", "TensorFlow Lite"],
  },
  {
    company: "Universitas Teknologi Yogyakarta",
    role: "Academic Accreditation Assistant",
    type: "Part-time",
    period: "Feb 2024 - Nov 2024",
    desc: "Prepared and managed campus accreditation documentation. Coordinated with academic departments to ensure compliance with accreditation standards.",
    tags: ["Documentation", "Accreditation"],
  },
  {
    company: "Seven Computer",
    role: "IT Support",
    type: "Apprenticeship",
    period: "-",
    desc: "Technical troubleshooting, hardware repair, and customer support for IT-related issues.",
    tags: ["Technical Support", "Hardware"],
  },
];

export default function Experience() {
  return (
    <section id="experience" className="py-28 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16">
          <span className="section-label">Background</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Experience
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-8">
            {experience.map((exp) => (
              <div key={`${exp.company}-${exp.role}`} className="relative pl-8 md:pl-20">
                <div className="absolute left-[7px] md:left-[29px] top-1.5 w-3 h-3 rounded-full bg-accent ring-4 ring-bg" />

                <div className="p-6 rounded-[var(--radius)] border border-border bg-surface hover:border-accent/20 transition-all duration-300">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{exp.company}</h3>
                      <div className="flex items-center gap-2 text-sm text-text-secondary mt-0.5">
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
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-border text-[11px] text-text-muted font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
