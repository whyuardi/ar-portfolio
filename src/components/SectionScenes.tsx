"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Environment, Stars, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";

// ─── Shared Floating Gem ───
function FloatingGem({
  position,
  color = "#14d9c4",
  scale = 1,
  speed = 1,
  distort = 0.3,
}: {
  position: [number, number, number];
  color?: string;
  scale?: number;
  speed?: number;
  distort?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    ref.current.rotation.x = t * 0.3;
    ref.current.rotation.y = t * 0.5;
  });
  return (
    <Float speed={speed * 2} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={ref} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          distort={distort}
          speed={2}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

// ─── Wobble Shape ───
function WobbleShape({
  position,
  color = "#a855f7",
  scale = 1,
  speed = 1,
}: {
  position: [number, number, number];
  color?: string;
  scale?: number;
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ref.current.rotation.z = state.clock.elapsedTime * 0.2 * speed;
  });
  return (
    <Float speed={speed * 1.5} rotationIntensity={0.8} floatIntensity={2}>
      <mesh ref={ref} position={position} scale={scale}>
        <torusKnotGeometry args={[0.8, 0.25, 128, 16]} />
        <MeshWobbleMaterial
          color={color}
          metalness={0.85}
          roughness={0.15}
          factor={0.4}
          speed={speed}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </mesh>
    </Float>
  );
}

// ─── Rotating Ring ───
function RotatingRing({
  radius = 2,
  color = "#14d9c4",
  speed = 0.5,
  opacity = 0.3,
}: {
  radius?: number;
  color?: string;
  speed?: number;
  opacity?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ref.current.rotation.x = state.clock.elapsedTime * speed;
    ref.current.rotation.y = state.clock.elapsedTime * speed * 0.7;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.015, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

// ─── Cursor-Following Orb ───
function CursorOrb() {
  const ref = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();
  useFrame((state) => {
    const x = (state.pointer.x * viewport.width) / 2;
    const y = (state.pointer.y * viewport.height) / 2;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, x, 0.05);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, y, 0.05);
  });
  return (
    <mesh ref={ref} position={[0, 0, 2]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshBasicMaterial color="#14d9c4" transparent opacity={0.6} />
    </mesh>
  );
}

// ─── Particle Field ───
function ParticleField({ count = 200, color = "#14d9c4", spread = 15 }: { count?: number; color?: string; spread?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * spread;
      arr[i * 3 + 1] = (Math.random() - 0.5) * spread;
      arr[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    return arr;
  }, [count, spread]);

  const ref = useRef<THREE.Points>(null!);
  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={color}
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

// ─── HERO SCENE ───
export function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 1, 12], fov: 50 }} gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#14d9c4" />
        <pointLight position={[-10, -5, 5]} intensity={0.5} color="#a855f7" />
        <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} intensity={0.8} color="#f59e0b" />

        <FloatingGem position={[0, 0.5, 0]} scale={2.2} color="#14d9c4" distort={0.4} speed={0.8} />
        <FloatingGem position={[-4, -1, -3]} scale={0.8} color="#a855f7" distort={0.5} speed={1.2} />
        <FloatingGem position={[4, 2, -2]} scale={0.6} color="#f59e0b" distort={0.3} speed={1.5} />
        <FloatingGem position={[3, -2, -4]} scale={0.5} color="#ef4444" distort={0.4} speed={1.0} />
        <FloatingGem position={[-3, 2, -5]} scale={0.7} color="#06b6d4" distort={0.35} speed={1.3} />

        <WobbleShape position={[5, 0, -6]} scale={0.5} color="#ec4899" speed={0.8} />
        <WobbleShape position={[-5, -1, -4]} scale={0.4} color="#10b981" speed={1.0} />

        <RotatingRing radius={4} color="#14d9c4" speed={0.3} opacity={0.2} />
        <RotatingRing radius={5} color="#a855f7" speed={-0.2} opacity={0.15} />
        <RotatingRing radius={3.5} color="#f59e0b" speed={0.4} opacity={0.12} />

        <ParticleField count={300} spread={20} />
        <Sparkles count={100} scale={15} size={2} speed={0.3} color="#14d9c4" />
        <Stars radius={50} depth={50} count={1000} factor={2} saturation={0.5} fade speed={0.5} />

        <CursorOrb />

        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={0.8} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}

// ─── PROJECTS SCENE ───
export function ProjectsScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: "none" }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#a855f7" />
        <pointLight position={[-5, -3, 3]} intensity={0.5} color="#14d9c4" />

        <FloatingGem position={[-6, 2, -3]} scale={0.6} color="#a855f7" distort={0.5} speed={0.7} />
        <FloatingGem position={[6, -1, -4]} scale={0.5} color="#14d9c4" distort={0.4} speed={0.9} />
        <FloatingGem position={[0, 3, -5]} scale={0.4} color="#f59e0b" distort={0.3} speed={1.1} />

        <WobbleShape position={[-4, -2, -6]} scale={0.3} color="#ef4444" speed={0.6} />
        <WobbleShape position={[5, 2, -5]} scale={0.25} color="#06b6d4" speed={0.8} />

        <RotatingRing radius={3} color="#a855f7" speed={0.2} opacity={0.1} />

        <ParticleField count={100} spread={15} color="#a855f7" />

        <EffectComposer>
          <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} intensity={0.5} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}

// ─── EXPERIENCE SCENE ───
export function ExperienceScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: "none" }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 3, 5]} intensity={0.7} color="#f59e0b" />
        <pointLight position={[-5, -2, 3]} intensity={0.4} color="#14d9c4" />

        <FloatingGem position={[5, 1, -3]} scale={0.5} color="#f59e0b" distort={0.4} speed={0.6} />
        <FloatingGem position={[-5, -1, -4]} scale={0.4} color="#14d9c4" distort={0.3} speed={0.8} />

        <WobbleShape position={[0, 2, -6]} scale={0.3} color="#a855f7" speed={0.5} />

        <RotatingRing radius={4} color="#f59e0b" speed={0.15} opacity={0.08} />

        <ParticleField count={80} spread={12} color="#f59e0b" />

        <EffectComposer>
          <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} intensity={0.4} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}

// ─── TECH STACK SCENE ───
export function TechStackScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: "none" }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.2} />
        <pointLight position={[3, 3, 5]} intensity={0.6} color="#06b6d4" />
        <pointLight position={[-3, -2, 3]} intensity={0.4} color="#a855f7" />

        <FloatingGem position={[4, 1, -3]} scale={0.4} color="#06b6d4" distort={0.5} speed={0.7} />
        <FloatingGem position={[-4, -1, -4]} scale={0.35} color="#a855f7" distort={0.4} speed={0.9} />
        <FloatingGem position={[0, 2, -5]} scale={0.3} color="#10b981" distort={0.3} speed={1.0} />

        <WobbleShape position={[3, -2, -6]} scale={0.2} color="#f59e0b" speed={0.6} />
        <WobbleShape position={[-3, 2, -5]} scale={0.25} color="#ef4444" speed={0.8} />

        <ParticleField count={80} spread={12} color="#06b6d4" />

        <EffectComposer>
          <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} intensity={0.4} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}

// ─── CONTACT SCENE ───
export function ContactScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: "none" }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 3, 5]} intensity={0.7} color="#14d9c4" />
        <pointLight position={[-5, -2, 3]} intensity={0.4} color="#ec4899" />

        <FloatingGem position={[4, 0, -3]} scale={0.5} color="#14d9c4" distort={0.4} speed={0.6} />
        <FloatingGem position={[-4, 1, -4]} scale={0.4} color="#ec4899" distort={0.5} speed={0.8} />

        <WobbleShape position={[0, -1, -5]} scale={0.3} color="#a855f7" speed={0.7} />

        <RotatingRing radius={3.5} color="#ec4899" speed={0.2} opacity={0.1} />

        <ParticleField count={80} spread={12} color="#ec4899" />

        <EffectComposer>
          <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} intensity={0.4} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
