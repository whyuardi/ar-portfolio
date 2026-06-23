"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
} from "@react-three/postprocessing";
import * as THREE from "three";

// ─── GLASS ICOSAHEDRON — everswap style ───
// Main object: large icosahedron with glass material
// + edge wireframe + internal ring structures
// + bloom + environment reflections

// ─── Section → Camera ───
type CamState = { x: number; y: number; z: number };
const sectionCameras: Record<string, CamState> = {
  hero:       { x: 0,  y: 0.5, z: 6 },
  about:      { x: -1.2, y: 1.2, z: 6.5 },
  projects:   { x: 0.5, y: 0.8, z: 5 },
  stack:      { x: 1.5, y: 0.3, z: 7.5 },
  experience: { x: -0.5, y: 1,   z: 6.5 },
  contact:    { x: 0,  y: 0.5, z: 6 },
};

// ─── Main Glass Object ───
function GlassIcosahedron({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const d = Math.min(delta, 0.1);
    const t = state.clock.elapsedTime;

    // Scroll response: scale down + move up + tilt
    const scaleTarget = 1 - scrollProgress * 0.45;
    const yTarget = scrollProgress * 1.2;
    const rotXTarget = scrollProgress * 0.3;
    const rotZTarget = scrollProgress * 0.15;

    const lerp = 1 - Math.exp(-d * 3);
    const s = groupRef.current.scale.x + (scaleTarget - groupRef.current.scale.x) * lerp;
    groupRef.current.scale.setScalar(s);
    groupRef.current.position.y += (yTarget - groupRef.current.position.y) * lerp;
    groupRef.current.rotation.x += (rotXTarget - groupRef.current.rotation.x) * lerp;
    groupRef.current.rotation.z += (rotZTarget - groupRef.current.rotation.z) * lerp;

    // Slow idle rotation
    groupRef.current.rotation.y += d * 0.15;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Outer wireframe shell — octahedron (diamond shape) */}
      <mesh ref={shellRef}>
        <octahedronGeometry args={[2.2, 0]} />
        <meshPhysicalMaterial
          color="#4488cc"
          metalness={0.95}
          roughness={0.05}
          transparent
          opacity={0.08}
          wireframe
          envMapIntensity={0.6}
        />
      </mesh>

      {/* Inner glass core — octahedron, no subdivision = sharp diamond */}
      <mesh ref={innerRef}>
        <octahedronGeometry args={[2.0, 0]} />
        <meshPhysicalMaterial
          color="#5599dd"
          metalness={0.9}
          roughness={0.08}
          transparent
          opacity={0.15}
          envMapIntensity={0.8}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Edge glow ring — horizontal */}
      <mesh>
        <ringGeometry args={[2.3, 2.5, 64]} />
        <meshBasicMaterial
          color="#4488ff"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Edge glow ring — vertical */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.4, 2.6, 64]} />
        <meshBasicMaterial
          color="#8855ff"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ─── Orbiting Mini Icosahedrons ───
function Orbiters() {
  const ref1 = useRef<THREE.Mesh>(null);
  const ref2 = useRef<THREE.Mesh>(null);
  const ref3 = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const speed = 0.3;

    // Orbiter 1 — large orbit, blue
    if (ref1.current) {
      const angle = t * speed;
      ref1.current.position.x = Math.cos(angle) * 3.8;
      ref1.current.position.z = Math.sin(angle) * 3.8;
      ref1.current.position.y = Math.sin(t * 0.4) * 0.6;
      ref1.current.rotation.x += delta * 0.5;
      ref1.current.rotation.y += delta * 0.7;
    }

    // Orbiter 2 — medium orbit, purple
    if (ref2.current) {
      const angle = t * speed * 0.7 + Math.PI * 0.8;
      ref2.current.position.x = Math.cos(angle) * 3.0;
      ref2.current.position.z = Math.sin(angle) * 3.0;
      ref2.current.position.y = Math.sin(t * 0.3 + 1) * 0.4;
      ref2.current.rotation.x += delta * 0.4;
      ref2.current.rotation.y += delta * 0.6;
    }

    // Orbiter 3 — small orbit, cyan
    if (ref3.current) {
      const angle = t * speed * 1.2 + Math.PI * 0.3;
      ref3.current.position.x = Math.cos(angle) * 2.2;
      ref3.current.position.z = Math.sin(angle) * 2.2;
      ref3.current.position.y = Math.sin(t * 0.5 + 2) * 0.3;
      ref3.current.rotation.x += delta * 0.6;
      ref3.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <>
      <mesh ref={ref1}>
        <icosahedronGeometry args={[0.18, 0]} />
        <meshPhysicalMaterial
          color="#5599ff"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.5}
          envMapIntensity={0.5}
        />
      </mesh>
      <mesh ref={ref2}>
        <icosahedronGeometry args={[0.14, 0]} />
        <meshPhysicalMaterial
          color="#aa66ff"
          metalness={0.85}
          roughness={0.15}
          transparent
          opacity={0.4}
          envMapIntensity={0.4}
        />
      </mesh>
      <mesh ref={ref3}>
        <icosahedronGeometry args={[0.1, 0]} />
        <meshPhysicalMaterial
          color="#44ddff"
          metalness={0.95}
          roughness={0.05}
          transparent
          opacity={0.6}
          envMapIntensity={0.6}
        />
      </mesh>
    </>
  );
}

// ─── Particles ───
function Particles() {
  const ref = useRef<THREE.Points>(null);
  const count = 600;

  const [positions, sizes] = useMemo(() => {
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 20;
      p[i * 3 + 1] = (Math.random() - 0.5) * 15;
      p[i * 3 + 2] = (Math.random() - 0.5) * 12;
      s[i] = Math.random() * 0.03 + 0.01;
    }
    return [p, s];
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#5599ff"
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Scene ───
function Scene({ scrollProgress, cameraTargetRef }: {
  scrollProgress: number;
  cameraTargetRef: React.MutableRefObject<CamState>;
}) {
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.1);
    const target = cameraTargetRef.current;
    const mouseOffX = mouseRef.current.x * 0.3;
    const mouseOffY = mouseRef.current.y * 0.2;

    const lerp = 1 - Math.exp(-d * 2.5);
    state.camera.position.x += (target.x + mouseOffX - state.camera.position.x) * lerp;
    state.camera.position.y += (target.y + mouseOffY - state.camera.position.y) * lerp;
    state.camera.position.z += (target.z - state.camera.position.z) * lerp;

    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[4, 4, 4]} intensity={1.5} color="#4488ff" />
      <directionalLight position={[-3, 1, -4]} intensity={0.8} color="#8855ff" />
      <directionalLight position={[0, -3, 2]} intensity={0.3} color="#44ffaa" />
      <Environment preset="city" />

      <Particles />
      <Orbiters />
      <GlassIcosahedron scrollProgress={scrollProgress} />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.15}
          luminanceSmoothing={0.85}
          intensity={1.0}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

// ─── Export ───
export default function WebGLBackground() {
  const [mounted, setMounted] = useState(false);
  const cameraTargetRef = useRef<CamState>({ x: 0, y: 0.5, z: 6 });
  const scrollRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? scrolled / maxScroll : 0;
      scrollRef.current = progress;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Section detection
    const sections = Object.keys(sectionCameras);
    const observers: IntersectionObserver[] = [];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            cameraTargetRef.current = { ...sectionCameras[id] };
          }
        },
        { threshold: 0.3, rootMargin: "-20% 0px -20% 0px" },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0.5, 6], fov: 45, near: 0.1, far: 100 }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 1.5]}
        frameloop="always"
        style={{ background: "transparent" }}
      >
        <Scene scrollProgress={scrollProgress} cameraTargetRef={cameraTargetRef} />
      </Canvas>
    </div>
  );
}
