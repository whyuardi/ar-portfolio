"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── FLOATING WIREFRAME ICOSAHEDRON ───
function WireframeIcosahedron({ dimRatio }: { dimRatio: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(2.2, 0), []);
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(t * 0.15) * 0.3;
      meshRef.current.rotation.y = t * 0.08;
      meshRef.current.rotation.z = Math.cos(t * 0.12) * 0.15;
      meshRef.current.position.y = Math.sin(t * 0.3) * 0.2;
    }
    if (edgesRef.current) {
      edgesRef.current.rotation.x = meshRef.current?.rotation.x ?? 0;
      edgesRef.current.rotation.y = meshRef.current?.rotation.y ?? 0;
      edgesRef.current.rotation.z = meshRef.current?.rotation.z ?? 0;
      edgesRef.current.position.y = meshRef.current?.position.y ?? 0;
    }
  });

  return (
    <group position={[0, 0.5, -3]}>
      {/* Solid face (very subtle) */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color="#F8F7F2"
          transparent
          opacity={0.02 * (1 - dimRatio * 0.8)}
          wireframe={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Wireframe edges */}
      <lineSegments ref={edgesRef} geometry={edgesGeometry}>
        <lineBasicMaterial
          color="#F8F7F2"
          transparent
          opacity={0.18 * (1 - dimRatio * 0.8)}
          linewidth={1}
        />
      </lineSegments>
    </group>
  );
}

// ─── FLOATING OCTAHEDRON (smaller, offset) ───
function WireframeOctahedron({ dimRatio }: { dimRatio: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => new THREE.OctahedronGeometry(1.0, 0), []);
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.12;
      meshRef.current.rotation.y = Math.sin(t * 0.2) * 0.5;
      meshRef.current.position.y = Math.cos(t * 0.25) * 0.3;
    }
    if (edgesRef.current) {
      edgesRef.current.rotation.x = meshRef.current?.rotation.x ?? 0;
      edgesRef.current.rotation.y = meshRef.current?.rotation.y ?? 0;
      edgesRef.current.position.y = meshRef.current?.position.y ?? 0;
    }
  });

  return (
    <group position={[3.5, -0.8, -5]}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color="#F8F7F2"
          transparent
          opacity={0.015 * (1 - dimRatio * 0.8)}
          wireframe={false}
        />
      </mesh>
      <lineSegments ref={edgesRef} geometry={edgesGeometry}>
        <lineBasicMaterial
          color="#F8F7F2"
          transparent
          opacity={0.12 * (1 - dimRatio * 0.8)}
        />
      </lineSegments>
    </group>
  );
}

// ─── TORUS RING ───
function TorusRing({ dimRatio }: { dimRatio: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const edgesGeometry = useMemo(() => {
    const torus = new THREE.TorusGeometry(3.0, 0.02, 8, 64);
    return new THREE.EdgesGeometry(torus);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.PI * 0.35 + Math.sin(t * 0.1) * 0.1;
      meshRef.current.rotation.y = t * 0.05;
    }
  });

  return (
    <lineSegments ref={meshRef} geometry={edgesGeometry} position={[0, 0.5, -3]}>
      <lineBasicMaterial
        color="#F8F7F2"
        transparent
        opacity={0.1 * (1 - dimRatio * 0.8)}
      />
    </lineSegments>
  );
}

// ─── PARTICLE FIELD ───
function ParticleField({ dimRatio }: { dimRatio: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, sizes } = useMemo(() => {
    const count = 200;
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = -2 - Math.random() * 15;
      sz[i] = 0.5 + Math.random() * 1.5;
    }
    return { positions: pos, sizes: sz };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, sizes]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.01;
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.25 * (1 - dimRatio * 0.7);
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#F8F7F2"
        size={0.03}
        transparent
        opacity={0.25}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ─── GRID FLOOR (subtle) ───
function GridFloor({ dimRatio }: { dimRatio: number }) {
  const ref = useRef<THREE.GridHelper>(null);

  useFrame(() => {
    if (ref.current) {
      const mat = ref.current.material as THREE.Material;
      if (Array.isArray(mat)) {
        mat.forEach((m) => {
          if ("opacity" in m) (m as THREE.Material).opacity = 0.06 * (1 - dimRatio * 0.8);
        });
      } else {
        mat.opacity = 0.06 * (1 - dimRatio * 0.8);
      }
    }
  });

  return (
    <gridHelper
      ref={ref}
      args={[40, 40, "#F8F7F2", "#F8F7F2"]}
      position={[0, -4, -5]}
      rotation={[0, 0, 0]}
    >
      <lineBasicMaterial transparent opacity={0.06} depthWrite={false} />
    </gridHelper>
  );
}

// ─── SCENE CONTAINER ───
function Scene({ dimRatio }: { dimRatio: number }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <pointLight position={[-3, 2, 2]} intensity={0.3} color="#F8F7F2" />

      <WireframeIcosahedron dimRatio={dimRatio} />
      <WireframeOctahedron dimRatio={dimRatio} />
      <TorusRing dimRatio={dimRatio} />
      <ParticleField dimRatio={dimRatio} />
      <GridFloor dimRatio={dimRatio} />
    </>
  );
}

// ─── SCROLL DIM HOOK ───
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

// ─── MAIN BACKGROUND ───
import { useState, useEffect } from "react";

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
        camera={{ position: [0, 0, 6], fov: 50, near: 0.1, far: 100 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <Scene dimRatio={dimRatio} />
      </Canvas>
    </div>
  );
}
