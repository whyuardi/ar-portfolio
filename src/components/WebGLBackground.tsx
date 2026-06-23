"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
} from "@react-three/postprocessing";
import * as THREE from "three";

// ─── EVERSWAP DIAMOND — EXACT REPLICA ───
// Octahedron wireframe viewed from Z-axis = diamond shape
// 4 outer edges + 4 internal crossing edges
// No fill — pure wireframe + bloom glow
// Background: dark green #2A3D2F

// ─── Section → Camera ───
type CamState = { x: number; y: number; z: number };
const sectionCameras: Record<string, CamState> = {
  hero:       { x: 0,  y: 0,   z: 5 },
  about:      { x: 0,  y: 0,   z: 5 },
  projects:   { x: 0,  y: 0,   z: 5 },
  stack:      { x: 0,  y: 0,   z: 5 },
  experience: { x: 0,  y: 0,   z: 5 },
  contact:    { x: 0,  y: 0,   z: 5 },
};

// ─── Diamond Wireframe ───
function Diamond() {
  const meshRef = useRef<THREE.Mesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const fogRef = useRef<THREE.Mesh>(null);

  // Octahedron: 6 vertices, 8 faces
  // Viewed from Z-axis: 4 outer diamond vertices + 1 front center + 1 back (hidden)
  const geometry = useMemo(() => new THREE.OctahedronGeometry(1.8, 0), []);

  // Edges for wireframe
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  // Glass fill — very subtle
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    metalness: 0,
    roughness: 0.1,
    transparent: true,
    opacity: 0.04,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), []);

  // Wireframe — bright white
  const lineMat = useMemo(() => new THREE.LineBasicMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0.8,
  }), []);

  // Fog/glow sphere — creates volumetric bloom effect
  const fogMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0.03,
    side: THREE.BackSide,
    depthWrite: false,
  }), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Very slow rotation (like everswap)
    if (linesRef.current) {
      linesRef.current.rotation.y += delta * 0.08;
      linesRef.current.rotation.x = Math.sin(t * 0.05) * 0.05;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.08;
      meshRef.current.rotation.x = Math.sin(t * 0.05) * 0.05;
    }
    if (fogRef.current) {
      fogRef.current.rotation.y += delta * 0.08;
    }

    // Pulse opacity subtly
    if (lineMat) {
      lineMat.opacity = 0.7 + Math.sin(t * 0.5) * 0.1;
    }
    if (fogMat) {
      fogMat.opacity = 0.02 + Math.sin(t * 0.3) * 0.01;
    }
  });

  return (
    <group>
      {/* Volumetric glow sphere */}
      <mesh ref={fogRef}>
        <sphereGeometry args={[2.0, 16, 16]} />
        <primitive object={fogMat} attach="material" />
      </mesh>

      {/* Glass fill octahedron */}
      <mesh ref={meshRef} geometry={geometry} material={material} />

      {/* Wireframe edges — the actual diamond */}
      <lineSegments ref={linesRef} geometry={edgesGeo} material={lineMat} />
    </group>
  );
}

// ─── Scene ───
function Scene() {
  useFrame((state) => {
    // Static camera — no movement (like everswap loading screen)
    state.camera.position.set(0, 0, 5);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={1.0} />
      <Diamond />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.0}
          luminanceSmoothing={0.7}
          intensity={2.5}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

// ─── Export ───
export default function WebGLBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
      background: "transparent",
    }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 100 }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        dpr={[1, 1.5]}
        frameloop="always"
      >
        <Scene />
      </Canvas>
    </div>
  );
}
