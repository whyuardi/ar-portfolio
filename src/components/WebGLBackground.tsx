"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
} from "@react-three/postprocessing";
import * as THREE from "three";

// ─── Simplex Noise GLSL (ashima/webgl-noise) — snoise(vec3) ───
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

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

// Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
  }
`;

// ─── Vertex Shader ───
// NOTE: PlaneGeometry is in the XY plane (position.z = 0 for all verts).
// We use pos.y for the 2nd noise dimension (so noise varies in 2D across the plane),
// then displace along pos.y for height.
const VERTEX_SHADER = `
${NOISE_3D}

uniform float uTime;
uniform float uScrollProgress;

varying float vElevation;
varying vec3 vPosition;

void main() {
  vec3 pos = position;

  // ─── FIX: PlaneGeometry is XY-plane → position.z = 0 for ALL verts.
  //      Use pos.y as 2nd noise dimension, NOT pos.z.
  // ───

  // Layer 1: large slow waves (mountain ridges)
  float elevation = 0.0;
  elevation += snoise(vec3(pos.x * 0.3 + uTime * 0.05,
                           pos.y * 0.3,
                           uTime * 0.03)) * 1.8;

  // Layer 2: medium detail (rocky features)
  elevation += snoise(vec3(pos.x * 0.8 + uTime * 0.08,
                           pos.y * 0.8 + uTime * 0.04,
                           uScrollProgress * 0.5)) * 0.6;

  // Layer 3: fine detail
  elevation += snoise(vec3(pos.x * 2.0,
                           pos.y * 2.0 + uTime * 0.1,
                           0.0)) * 0.15;

  // Clamp bawah (bikin flat valley)
  elevation = max(elevation, -0.3);

  // Scroll influence: terrain shifts/morphs saat scroll
  elevation += uScrollProgress * 0.8;

  pos.y += elevation;
  vElevation = elevation;
  vPosition = pos;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

// ─── Fragment Shader ───
const FRAGMENT_SHADER = `
uniform float uTime;
uniform float uScrollProgress;

varying float vElevation;
varying vec3 vPosition;

void main() {
  // Base: sangat gelap, hampir hitam
  vec3 darkBase = vec3(0.02, 0.02, 0.04);

  // Peak color: sedikit lebih terang di puncak tinggi
  vec3 peakColor = vec3(0.12, 0.14, 0.22);

  // Edge rim: subtle indigo/violet glow di ridge lines
  vec3 rimColor = vec3(0.25, 0.22, 0.45);

  // Blend berdasarkan elevation
  float elevNorm = clamp(vElevation / 2.0, 0.0, 1.0);
  vec3 color = mix(darkBase, peakColor, elevNorm);

  // Rim light di puncak tertinggi
  float rimFactor = smoothstep(0.7, 1.0, elevNorm);
  color = mix(color, rimColor, rimFactor * 0.6);

  // Atmospheric depth (lebih fade di kejauhan)
  float depth = clamp(vPosition.z / 6.0 + 0.5, 0.0, 1.0);
  color *= 0.6 + depth * 0.4;

  // Subtle time-based shimmer di peaks
  float shimmer = sin(uTime * 2.0 + vElevation * 8.0) * 0.02;
  color += shimmer * rimFactor;

  gl_FragColor = vec4(color, 0.85);
}
`;

// ─── Section → Camera position mapping ───
type CamState = { x: number; y: number; z: number };
const sectionCameras: Record<string, CamState> = {
  hero:       { x: 0,  y: 2,   z: 8 },
  about:      { x: -1, y: 2.5, z: 7 },
  projects:   { x: 0,  y: 3,   z: 6 },
  toolkit:    { x: 1,  y: 1.5, z: 9 },
  background: { x: 0,  y: 2,   z: 7.5 },
};

// ─── Terrain Mesh ───
function TerrainMesh({ cameraTargetRef, scrollProgressRef }: {
  cameraTargetRef: React.MutableRefObject<CamState>;
  scrollProgressRef: React.MutableRefObject<number>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uScrollProgress: { value: 0 },
  });
  const mouseRef = useRef({ x: 0, y: 0 });

  // ─── Geometry (useMemo — jangan buat baru tiap render) ───
  const geometry = useMemo(() => new THREE.PlaneGeometry(12, 12, 180, 180), []);

  // ─── ShaderMaterial (useMemo) ───
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: uniformsRef.current,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      side: THREE.DoubleSide,
      wireframe: false,
    });
  }, []);

  // ─── Wireframe overlay ───
  const wireGeo = useMemo(() => new THREE.WireframeGeometry(geometry), [geometry]);
  const wireMat = useMemo(() => new THREE.LineBasicMaterial({
    color: 0x2a2a4a,
    transparent: true,
    opacity: 0.06,
  }), []);

  // ─── Track mouse ───
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

  // ─── Dispose on unmount ───
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      wireGeo.dispose();
      wireMat.dispose();
    };
  }, [geometry, material, wireGeo, wireMat]);

  // ─── Frame loop ───
  useFrame((state, delta) => {
    const d = Math.min(delta, 0.1);

    // Update time uniform
    uniformsRef.current.uTime.value = state.clock.elapsedTime;

    // Smooth scroll progress (lerp)
    uniformsRef.current.uScrollProgress.value +=
      (scrollProgressRef.current - uniformsRef.current.uScrollProgress.value) * 0.03;

    // Camera lerp to target + mouse offset
    const target = cameraTargetRef.current;
    const mouseOffX = mouseRef.current.x * 0.5;
    const mouseOffY = mouseRef.current.y * 0.3;

    const lerpFactor = 0.025;
    state.camera.position.x += (target.x + mouseOffX - state.camera.position.x) * lerpFactor;
    state.camera.position.y += (target.y + mouseOffY - state.camera.position.y) * lerpFactor;
    state.camera.position.z += (target.z - state.camera.position.z) * lerpFactor;

    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group rotation={[-Math.PI / 2.4, 0, 0]} position={[0, -1.5, 0]}>
      <mesh ref={meshRef} geometry={geometry} material={material} />
      <lineSegments geometry={wireGeo} material={wireMat} />
    </group>
  );
}

// ─── Track scroll progress & active section ───
function useScrollManager(
  cameraTargetRef: React.MutableRefObject<CamState>,
  scrollProgressRef: React.MutableRefObject<number>,
) {
  useEffect(() => {
    // Scroll progress
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      scrollProgressRef.current = maxScroll > 0 ? scrolled / maxScroll : 0;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // IntersectionObserver for section detection
    const sections = Object.keys(sectionCameras);
    const observers: IntersectionObserver[] = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const cam = sectionCameras[id];
            cameraTargetRef.current = { ...cam };
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
  }, [cameraTargetRef]);

  return scrollProgressRef;
}

// ─── Scene ───
function Scene() {
  const cameraTargetRef = useRef<CamState>({ x: 0, y: 2, z: 8 });
  const scrollProgressRef = useRef(0);
  useScrollManager(cameraTargetRef, scrollProgressRef);

  return (
    <>
      <ambientLight intensity={0.05} />
      <TerrainMesh cameraTargetRef={cameraTargetRef} scrollProgressRef={scrollProgressRef} />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          intensity={0.3}
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
        camera={{ position: [0, 2, 8], fov: 50, near: 0.1, far: 100 }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        dpr={[1, 1.5]}
        frameloop="always"
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
