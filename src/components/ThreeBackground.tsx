'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';

function MainObject({ mouse }: { mouse: THREE.Vector2 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      meshRef.current.rotation.x = t * 0.15 + mouse.y * 0.3;
      meshRef.current.rotation.y = t * 0.2 + mouse.x * 0.3;
      meshRef.current.rotation.z = t * 0.05;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} scale={2.2}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          ref={materialRef}
          color="#14d9c4"
          envMapIntensity={1.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.8}
          roughness={0.15}
          distort={0.3}
          speed={1.5}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
}

function OrbitParticles({ count = 200 }: { count?: number }) {
  const particlesRef = useRef<THREE.Points>(null);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const radius = 3 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
      siz[i] = Math.random() * 0.03 + 0.01;
    }
    return [pos, siz];
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#14d9c4"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function RingGeometry() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      const t = state.clock.elapsedTime;
      ringRef.current.rotation.x = t * 0.1;
      ringRef.current.rotation.z = t * 0.15;
    }
  });

  return (
    <mesh ref={ringRef} scale={3}>
      <torusGeometry args={[1, 0.005, 16, 100]} />
      <meshStandardMaterial
        color="#7c3aed"
        emissive="#7c3aed"
        emissiveIntensity={2}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

function InnerRing() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      const t = state.clock.elapsedTime;
      ringRef.current.rotation.x = -t * 0.15;
      ringRef.current.rotation.z = -t * 0.1;
    }
  });

  return (
    <mesh ref={ringRef} scale={2.5}>
      <torusGeometry args={[1, 0.003, 16, 100]} />
      <meshStandardMaterial
        color="#14d9c4"
        emissive="#14d9c4"
        emissiveIntensity={1.5}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, 3, -5]} intensity={2} color="#14d9c4" distance={15} />
      <pointLight position={[5, -3, 5]} intensity={1.5} color="#7c3aed" distance={15} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#f0c" distance={10} />
    </>
  );
}

function Scene({ mouse }: { mouse: THREE.Vector2 }) {
  return (
    <>
      <Lights />
      <MainObject mouse={mouse} />
      <OrbitParticles count={300} />
      <RingGeometry />
      <InnerRing />
      <Environment preset="city" />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={1.5}
          mipmapBlur
        />
        <ChromaticAberration offset={[0.0005, 0.0005]} />
      </EffectComposer>
    </>
  );
}

export default function ThreeBackground() {
  const mouseRef = useRef(new THREE.Vector2(0, 0));

  if (typeof window !== 'undefined') {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    // Only attach once
    if (!(window as any).__threeMouseAttached) {
      window.addEventListener('mousemove', onMove);
      (window as any).__threeMouseAttached = true;
    }
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Scene mouse={mouseRef.current} />
      </Canvas>
    </div>
  );
}
