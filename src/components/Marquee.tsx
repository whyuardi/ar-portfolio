"use client";

const items = [
  "TypeScript", "Kotlin", "Solidity", "Dart", "Python", "JavaScript",
  "React", "Next.js", "Flutter", "Three.js", "Tailwind CSS", "Android",
  "Node.js", "Firebase", "Ethers.js", "Web3", "REST API", "Smart Contracts",
  "TensorFlow", "MVVM", "Git", "Figma", "Linux", "Sepolia",
];

export default function Marquee() {
  return (
    <div className="marquee-section">
      <div className="marquee-track">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="marquee-item">
            {item}
            <span className="sep" />
          </span>
        ))}
      </div>
    </div>
  );
}
