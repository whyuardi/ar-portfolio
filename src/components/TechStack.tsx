"use client";

const techCategories = [
  {
    name: "Languages",
    items: ["TypeScript", "JavaScript", "Kotlin", "Dart", "Solidity", "Python"],
  },
  {
    name: "Mobile & Frontend",
    items: ["React", "Next.js", "Android (Kotlin)", "Flutter", "Tailwind CSS", "Three.js"],
  },
  {
    name: "Backend & Web3",
    items: ["Node.js", "Firebase", "Ethers.js", "REST API", "Smart Contracts", "Sepolia"],
  },
  {
    name: "Tools & Infra",
    items: ["Git", "TensorFlow Lite", "Jetpack", "MVVM", "Figma", "Linux"],
  },
];

export default function TechStack() {
  return (
    <section id="stack" className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16">
          <span className="section-label">Toolkit</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Tech <span className="text-gradient">Stack</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {techCategories.map((cat) => (
            <div
              key={cat.name}
              className="p-6 rounded-[var(--radius)] border border-border bg-surface hover:border-accent/20 transition-all duration-300"
            >
              <h3 className="text-sm font-semibold text-accent font-mono mb-4">
                {"// "}{cat.name}
              </h3>
              <div className="space-y-2">
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
          ))}
        </div>
      </div>
    </section>
  );
}
