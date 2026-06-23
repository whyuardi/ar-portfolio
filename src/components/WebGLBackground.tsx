"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  MeshDistortMaterial,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
} from "@react-three/postprocessing";
import * as THREE from "three";

// ─── Simplex Noise GLSL (ashima/webgl-noise) — for vertex animation ───
// This is injected into the custom shader for organic distortion
const NOISE_3D = `//
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20201014 (stegu)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
//

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
  }
`;

// ─── Vertex Shader with noise displacement ───
const VERTEX_SHADER = `
${NOISE_3D}

uniform float uTime;
uniform float uDistort;

varying float vNoise;

void main() {
  vec3 pos = position;

  // Organic noise displacement — subtle pulse
  float noiseVal = snoise(vec3(pos.x * 1.5 + uTime * 0.3,
                               pos.y * 1.5 + uTime * 0.2,
                               pos.z * 1.5 + uTime * 0.25));

  // Displace along normal
  pos += normal * noiseVal * uDistort * 0.15;

  vNoise = noiseVal;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const FRAGMENT_SHADER = `
uniform float uTime;

varying float vNoise;

void main() {
  // Soft shimmer based on noise value
  float glow = 0.5 + 0.5 * vNoise;
  gl_FragColor = vec4(vec3(glow * 0.3, glow * 0.35, glow * 0.5), 0.9);
}
`;

// ─── Section → camera position ───
type CamState = { x: number; y: number; z: number };
const sectionCameras: Record<string, CamState> = {
  hero:       { x: 0,  y: 0.5, z: 5.5 },
  about:      { x: -0.8, y: 1,  z: 6 },
  projects:   { x: 0,  y: 0.2, z: 4.5 },
  stack:      { x: 0.8, y: 0.5, z: 7 },
  experience: { x: -0.3, y: 0.8, z: 6 },
  contact:    { x: 0,  y: 0.3, z: 5 },
};

// ─── Main Icosahedron ───
function MainIcosahedron({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const targetScale = useRef(1);
  const targetY = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    const d = Math.min(delta, 0.1);

    // Time uniform for noise animation
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

    // Distort increases with scroll
    const distortTarget = scrollProgress * 1.2;
    materialRef.current.uniforms.uDistort.value +=
      (distortTarget - materialRef.current.uniforms.uDistort.value) * 0.03;

    // Scroll-driven scale down + translate up
    const scaleTarget = 1 - scrollProgress * 0.5;
    const yTarget = scrollProgress * 0.8;

    const lerp = 1 - Math.exp(-d * 3);
    const s = meshRef.current.scale.x + (scaleTarget - meshRef.current.scale.x) * lerp;
    meshRef.current.scale.setScalar(s);
    meshRef.current.position.y += (yTarget - meshRef.current.position.y) * lerp;

    // Slow rotation
    meshRef.current.rotation.x += d * 0.15;
    meshRef.current.rotation.y += d * 0.2;
  });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDistort: { value: 0 },
    }),
    [],
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        wireframe: false,
        side: THREE.DoubleSide,
      }),
    [],
  );

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <icosahedronGeometry args={[1.8, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

// ─── Glass Icosahedron (outer shell, everswap-style) ───
function GlassShell({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const d = Math.min(delta, 0.1);

    // Match main icosahedron scaling
    const scaleTarget = 1 - scrollProgress * 0.5;
    const yTarget = scrollProgress * 0.8;
    const lerp = 1 - Math.exp(-d * 3);
    const s = meshRef.current.scale.x + (scaleTarget - meshRef.current.scale.x) * lerp;
    meshRef.current.scale.setScalar(s * 1.08);
    meshRef.current.position.y += (yTarget - meshRef.current.position.y) * lerp;

    meshRef.current.rotation.x += d * 0.12;
    meshRef.current.rotation.y += d * 0.18;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <icosahedronGeometry args={[1.8, 0]} />
      <meshPhysicalMaterial
        color="#4488cc"
        metalness={0.95}
        roughness={0.05}
        transparent
        opacity={0.12}
        wireframe
        envMapIntensity={0.4}
      />
    </mesh>
  );
}

// ─── Orbiting small icosahedrons ───
function Orbiters() {
  const ref1 = useRef<THREE.Mesh>(null);
  const ref2 = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (ref1.current) {
      const angle = t * 0.4;
      ref1.current.position.x = Math.cos(angle) * 2.8;
      ref1.current.position.z = Math.sin(angle) * 2.8;
      ref1.current.position.y = Math.sin(t * 0.3) * 0.4;
      ref1.current.rotation.x += delta * 0.3;
      ref1.current.rotation.y += delta * 0.5;
    }
    if (ref2.current) {
      const angle = t * 0.3 + Math.PI;
      ref2.current.position.x = Math.cos(angle) * 2.2;
      ref2.current.position.z = Math.sin(angle) * 2.2;
      ref2.current.position.y = Math.sin(t * 0.25 + 1) * 0.3;
      ref2.current.rotation.x += delta * 0.4;
      ref2.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <>
      <mesh ref={ref1}>
        <icosahedronGeometry args={[0.25, 0]} />
        <meshPhysicalMaterial
          color="#66aaff"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>
      <mesh ref={ref2}>
        <icosahedronGeometry args={[0.18, 0]} />
        <meshPhysicalMaterial
          color="#ff66aa"
          metalness={0.8}
          roughness={0.15}
          transparent
          opacity={0.5}
        />
      </mesh>
    </>
  );
}

// ─── Particle system ───
function Particles() {
  const ref = useRef<THREE.Points>(null);
  const count = 800;

  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      p[i] = (Math.random() - 0.5) * 20;
    }
    return p;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.02;
    }
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
        size={0.02}
        color="#4488cc"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Scene ───
function Scene({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      {/* 3-point lighting */}
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#4488ff" />
      <directionalLight position={[-3, 1, -5]} intensity={0.6} color="#ff66aa" />
      <directionalLight position={[0, -4, 3]} intensity={0.3} color="#44ff88" />

      <Environment preset="city" />

      <Particles />
      <Orbiters />
      <MainIcosahedron scrollProgress={scrollProgress} />
      <GlassShell scrollProgress={scrollProgress} />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.3}
          luminanceSmoothing={0.85}
          intensity={1.2}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

// ─── Exported Component ───
export default function WebGLBackground() {
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      scrollRef.current = maxScroll > 0 ? scrolled / maxScroll : 0;
      setScrollProgress(scrollRef.current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
        camera={{ position: [0, 0.5, 5.5], fov: 45, near: 0.1, far: 100 }}
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
        <Scene scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
