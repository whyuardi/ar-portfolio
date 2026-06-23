"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── GLASS DODECAHEDRON ───
function GlassDodecahedron({ dimRatio }: { dimRatio: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const geo = useMemo(() => new THREE.DodecahedronGeometry(1.8, 0), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.2;
      meshRef.current.rotation.y = t * 0.15;
      meshRef.current.rotation.z = Math.cos(t * 0.1) * 0.1;
    }
    if (edgesRef.current) {
      edgesRef.current.rotation.copy(meshRef.current!.rotation);
    }
    if (glowRef.current) {
      glowRef.current.rotation.x = -meshRef.current!.rotation.x * 0.5;
      glowRef.current.rotation.y = -meshRef.current!.rotation.y * 0.5;
    }
  });

  const opacity = 1 - dimRatio * 0.7;

  return (
    <group position={[0, 0.3, -2]}>
      {/* Outer glow halo */}
      <mesh ref={glowRef} geometry={geo} scale={1.15}>
        <meshBasicMaterial
          color="#6C63FF"
          transparent
          opacity={0.04 * opacity}
          wireframe
          depthWrite={false}
        />
      </mesh>

      {/* Glass body */}
      <mesh ref={meshRef} geometry={geo}>
        <meshPhysicalMaterial
          color="#C8C0FF"
          transparent
          opacity={0.15 * opacity}
          roughness={0.1}
          metalness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.3}
          envMapIntensity={1.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Wireframe edges with glow */}
      <lineSegments
        ref={edgesRef}
        geometry={new THREE.EdgesGeometry(geo)}
      >
        <lineBasicMaterial
          color="#8B7FFF"
          transparent
          opacity={0.35 * opacity}
          linewidth={1}
        />
      </lineSegments>

      {/* Inner glow points */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <pointLight
          key={i}
          position={[
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3,
          ]}
          intensity={0.15 * opacity}
          distance={4}
          color="#8B7FFF"
        />
      ))}
    </group>
  );
}

// ─── ORBITING FRAGMENTS ───
function OrbitingFragments({ dimRatio }: { dimRatio: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const count = 16;
  const fragmentGeo = useMemo(() => new THREE.OctahedronGeometry(0.08, 0), []);

  const fragments = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 2.2 + Math.random() * 0.8;
      const tilt = Math.random() * Math.PI;
      const speed = 0.3 + Math.random() * 0.4;
      const startOffset = Math.random() * Math.PI * 2;
      return { angle, radius, tilt, speed, startOffset };
    });
  }, []);

  const opacity = 1 - dimRatio * 0.7;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.3, -2]}>
      {fragments.map((f, i) => {
        const x = Math.cos(f.angle + f.startOffset) * f.radius;
        const z = Math.sin(f.angle + f.startOffset) * f.radius;
        const y = Math.sin(f.startOffset * 2 + i) * 0.5;
        return (
          <mesh
            key={i}
            geometry={fragmentGeo}
            position={[x, y, z]}
          >
            <meshStandardMaterial
              color="#8B7FFF"
              transparent
              opacity={0.3 * opacity}
              emissive="#6C63FF"
              emissiveIntensity={0.2 * opacity}
            />
          </mesh>
        );
      })}

      {/* Connecting beams */}
      {fragments.slice(0, 8).map((f, i) => {
        const x = Math.cos(f.angle + f.startOffset) * f.radius;
        const z = Math.sin(f.angle + f.startOffset) * f.radius;
        const y = Math.sin(f.startOffset * 2 + i) * 0.5;
        return (
          <sprite key={`beam-${i}`} position={[x, y, z]}>
            <spriteMaterial
              color="#6C63FF"
              transparent
              opacity={0.08 * opacity}
              depthWrite={false}
            />
          </sprite>
        );
      })}
    </group>
  );
}

// ─── FLOATING LIGHT ORBS ───
function LightOrbs({ dimRatio }: { dimRatio: number }) {
  const orbsRef = useRef<THREE.Group>(null);

  const orbs = useMemo(() => {
    const count = 8;
    return Array.from({ length: count }, (_, i) => ({
      pos: [
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        -1 - Math.random() * 8,
      ] as [number, number, number],
      size: 0.03 + Math.random() * 0.08,
      speed: 0.1 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (orbsRef.current) {
      orbsRef.current.rotation.y = t * 0.005;
    }
  });

  const opacity = 0.4 * (1 - dimRatio * 0.7);

  return (
    <group ref={orbsRef}>
      {orbs.map((o, i) => (
        <mesh key={i} position={o.pos}>
          <sphereGeometry args={[o.size, 8, 8]} />
          <meshBasicMaterial
            color="#8B7FFF"
            transparent
            opacity={opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── SUBTLE FLOATING RING ───
function FloatingRing({ dimRatio }: { dimRatio: number }) {
  const ref = useRef<THREE.Mesh>(null);

  const ringGeo = useMemo(() => {
    const r = new THREE.RingGeometry(2.6, 2.8, 64);
    r.rotateX(-Math.PI / 2);
    return r;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.z = t * 0.06;
      ref.current.position.y = Math.sin(t * 0.4) * 0.15;
    }
  });

  const opacity = 0.12 * (1 - dimRatio * 0.7);

  return (
    <mesh ref={ref} geometry={ringGeo} position={[0, 0.3, -2]}>
      <meshBasicMaterial
        color="#6C63FF"
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── SCENE ───
function Scene({ dimRatio }: { dimRatio: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={0.4} color="#C8C0FF" />
      <directionalLight position={[-3, -2, 4]} intensity={0.2} color="#6C63FF" />
      <hemisphereLight
        args={["#6C63FF", "#1a1a2e", 0.3]}
      />

      <GlassDodecahedron dimRatio={dimRatio} />
      <OrbitingFragments dimRatio={dimRatio} />
      <LightOrbs dimRatio={dimRatio} />
      <FloatingRing dimRatio={dimRatio} />
    </>
  );
}

// ─── SCROLL DIM ───
function useScrollDim() {
  const [dimRatio, setDimRatio] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const ratio = Math.min(1, scrollY / (vh * 2));
      setDimRatio(ratio);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return dimRatio;
}

// ─── MAIN EXPORT ───
export default function WebGLBackground() {
  const dimRatio = useScrollDim();

  return (
    <div
      id="webgl-canvas"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45, near: 0.1, far: 50 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <Scene dimRatio={dimRatio} />
      </Canvas>
    </div>
  );
}
