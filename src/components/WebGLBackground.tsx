"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
} from "@react-three/postprocessing";
import * as THREE from "three";

// ─── Types ───
type SectionState = {
  position: [number, number, number];
  scale: number;
  rotationSpeed: number;
  edgeOpacity: number;
};

// ─── Section → 3D state mapping ───
const sectionStates: Record<string, SectionState> = {
  hero:       { position: [1.8, 0, 0],    scale: 1,    rotationSpeed: 0.003, edgeOpacity: 0.25 },
  about:      { position: [-1.8, 0.2, 0], scale: 0.75, rotationSpeed: 0.005, edgeOpacity: 0.4  },
  projects:   { position: [0, 0, -0.5],   scale: 1.15, rotationSpeed: 0.008, edgeOpacity: 0.6  },
  stack:      { position: [2, -1, 0],     scale: 0.6,  rotationSpeed: 0.012, edgeOpacity: 0.2  },
  experience: { position: [-2, 1, 0],     scale: 0.85, rotationSpeed: 0.004, edgeOpacity: 0.35 },
  contact:    { position: [0, 0, 0],      scale: 1.0,  rotationSpeed: 0.006, edgeOpacity: 0.5  },
};

// ─── Lerp helper ───
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ─── Icosahedron Mesh (R3F) ───
function IcosahedronObject() {
  const groupRef = useRef<THREE.Group>(null);
  const [activeSection, setActiveSection] = useState("hero");
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({
    pos: new THREE.Vector3(...sectionStates.hero.position),
    scale: sectionStates.hero.scale,
    rotSpeed: sectionStates.hero.rotationSpeed,
    edgeOpacity: sectionStates.hero.edgeOpacity,
  });

  // Track mouse
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  // IntersectionObserver on sections
  useEffect(() => {
    const sections = Object.keys(sectionStates);
    const observers: IntersectionObserver[] = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { threshold: 0.4 },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Update target when section changes
  useEffect(() => {
    const state = sectionStates[activeSection];
    targetRef.current.pos = new THREE.Vector3(...state.position);
    targetRef.current.scale = state.scale;
    targetRef.current.rotSpeed = state.rotationSpeed;
    targetRef.current.edgeOpacity = state.edgeOpacity;
  }, [activeSection]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const g = groupRef.current;
    const t = targetRef.current;
    const lerpFactor = 0.04;

    // Lerp position
    g.position.x = lerp(g.position.x, t.pos.x, lerpFactor);
    g.position.y = lerp(g.position.y, t.pos.y, lerpFactor);
    g.position.z = lerp(g.position.z, t.pos.z, lerpFactor);

    // Lerp scale
    const currentScale = g.scale.x;
    const newScale = lerp(currentScale, t.scale, lerpFactor);
    g.scale.setScalar(newScale);

    // Continuous rotation + mouse parallax
    const targetRotX =
      mouseRef.current.y * 0.15 + state.clock.elapsedTime * t.rotSpeed * 0.3;
    const targetRotY =
      mouseRef.current.x * 0.15 + state.clock.elapsedTime * t.rotSpeed;

    g.rotation.x = lerp(g.rotation.x, targetRotX, 0.05);
    g.rotation.y = lerp(g.rotation.y, targetRotY, 0.05);

    // Float
    g.position.y +=
      Math.sin(state.clock.elapsedTime * 0.8) * 0.003;
  });

  // Edge material ref for opacity updates
  const edgeMatRef = useRef<THREE.LineBasicMaterial>(null);

  useEffect(() => {
    if (edgeMatRef.current) {
      edgeMatRef.current.opacity = targetRef.current.edgeOpacity;
    }
  }, [activeSection]);

  // Update edge opacity in frame
  useFrame(() => {
    if (!edgeMatRef.current) return;
    const target = targetRef.current.edgeOpacity;
    edgeMatRef.current.opacity = lerp(edgeMatRef.current.opacity, target, 0.04);
  });

  // Geometry (memoized by key)
  const icoGeo = new THREE.IcosahedronGeometry(1.8, 10);
  const edgeGeo = new THREE.EdgesGeometry(icoGeo);

  return (
    <group ref={groupRef} position={[1.8, 0, 0]}>
      <mesh geometry={icoGeo}>
        <meshPhysicalMaterial
          color="#0d0d1a"
          metalness={0.95}
          roughness={0.05}
          transmission={0.15}
          thickness={2}
          envMapIntensity={1}
        />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial
          ref={edgeMatRef}
          color="#6366f1"
          transparent
          opacity={0.25}
        />
      </lineSegments>
    </group>
  );
}

// ─── Scene ───
function Scene() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[8, 8, 8]} intensity={3} color="#818cf8" />
      <pointLight position={[-8, -5, -5]} intensity={1.5} color="#06b6d4" />
      <pointLight position={[0, -8, 3]} intensity={0.8} color="#ffffff" />

      <Environment preset="city" />

      <IcosahedronObject />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.3}
          intensity={0.4}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

// ─── Exported Component ───
export default function WebGLBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ alpha: true, antialias: false }}
        dpr={[1, 2]}
        frameloop="always"
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
