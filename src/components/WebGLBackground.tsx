"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
} from "@react-three/postprocessing";
import * as THREE from "three";

// ─── Simplex Noise GLSL (ashima/webgl-noise) ───
const NOISE_3D = `//
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+10.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0,i1.z,i2.z,1.0)) + i.y + vec4(0.0,i1.y,i2.y,1.0)) + i.x + vec4(0.0,i1.x,i2.x,1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0+1.0;
  vec4 s1 = floor(b1)*2.0+1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m = m * m;
  return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

// ─── Vertex Shader — MOUNTAIN SCALE displacement ───
const VERTEX_SHADER = `
${NOISE_3D}

uniform float uTime;
uniform float uScrollProgress;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 pos = position;

  // ─── MOUNTAIN-SCALE DISPLACEMENT ───
  // Low frequency = broad mountain shapes, high amplitude = dramatic peaks
  float elevation = 0.0;

  // Layer 1: Massive mountain ridges (broad, tall)
  float ridge = snoise(vec3(pos.x * 0.08 + uTime * 0.02,
                            pos.y * 0.08,
                            uTime * 0.01));
  elevation += ridge * 4.0;

  // Layer 2: Medium mountain features
  float detail = snoise(vec3(pos.x * 0.2 + uTime * 0.04,
                             pos.y * 0.2 + uTime * 0.02,
                             uScrollProgress * 0.3));
  elevation += detail * 2.0;

  // Layer 3: Sharp peaks (higher frequency, lower amplitude)
  float sharp = snoise(vec3(pos.x * 0.5 + uTime * 0.06,
                            pos.y * 0.5,
                            0.0));
  elevation += max(sharp, 0.0) * 0.8; // only positive = sharp peaks

  // Layer 4: Fine texture
  float fine = snoise(vec3(pos.x * 1.2,
                           pos.y * 1.2 + uTime * 0.05,
                           uScrollProgress * 0.2));
  elevation += fine * 0.2;

  // Deep valleys (allow negative to go down)
  // No clamp — let valleys go deep naturally

  // Scroll morph
  elevation += uScrollProgress * 2.0;

  pos.y += elevation;

  vElevation = elevation;
  vPosition = pos;

  // Compute displaced normal via finite differences
  float eps = 0.05;
  float eX = snoise(vec3((pos.x+eps)*0.08+uTime*0.02, pos.y*0.08, uTime*0.01)) * 4.0
           + snoise(vec3((pos.x+eps)*0.2+uTime*0.04, pos.y*0.2+uTime*0.02, uScrollProgress*0.3)) * 2.0;
  float eZ = snoise(vec3(pos.x*0.08+uTime*0.02, (pos.y+eps)*0.08, uTime*0.01)) * 4.0
           + snoise(vec3(pos.x*0.2+uTime*0.04, (pos.y+eps)*0.2+uTime*0.02, uScrollProgress*0.3)) * 2.0;
  vec3 displacedNormal = normalize(vec3(-(eX - elevation)/eps, 1.0, -(eZ - elevation)/eps));
  vNormal = normalize(normalMatrix * displacedNormal);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

// ─── Fragment Shader — CINEMATIC MOUNTAIN ───
const FRAGMENT_SHADER = `
uniform float uTime;
uniform float uScrollProgress;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // ─── NORMAL-BASED SHADING (fake directional light) ───
  vec3 normal = normalize(vNormal);

  // Main light from upper-left
  vec3 lightDir = normalize(vec3(1.0, 2.0, 1.0));
  float diffuse = max(dot(normal, lightDir), 0.0) * 0.6 + 0.4; // wrap lighting

  // Rim light from behind
  vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
  float rim = 1.0 - max(dot(normal, viewDir), 0.0);
  rim = smoothstep(0.4, 0.8, rim);

  // ─── COLORS ───
  // Deep shadow
  vec3 shadowColor = vec3(0.01, 0.01, 0.03);
  // Mid tone — dark indigo
  vec3 midColor = vec3(0.06, 0.07, 0.15);
  // Peak — cold blue-grey
  vec3 peakColor = vec3(0.15, 0.18, 0.30);
  // Rim glow — subtle violet
  vec3 rimColor = vec3(0.35, 0.30, 0.55);

  // Blend by elevation
  float elevNorm = clamp(vElevation / 6.0 + 0.3, 0.0, 1.0);

  // Base color
  vec3 color = mix(shadowColor, midColor, smoothstep(0.0, 0.4, elevNorm));
  color = mix(color, peakColor, smoothstep(0.4, 1.0, elevNorm));

  // Apply lighting (darken shadows, brighten lit areas)
  color *= diffuse;

  // Rim glow on edges facing away from camera
  color += rimColor * rim * 0.4;

  // Snow cap effect on highest peaks
  float snowLine = smoothstep(0.75, 1.0, elevNorm);
  vec3 snowColor = vec3(0.6, 0.65, 0.8);
  color = mix(color, snowColor, snowLine * 0.3);

  // Atmospheric fog (depth fade)
  float depth = clamp(abs(vPosition.x) / 6.0 + 0.2, 0.0, 1.0);
  color = mix(color, vec3(0.02, 0.02, 0.05), depth * 0.5);

  // Subtle time shimmer on peaks
  float shimmer = sin(uTime * 1.5 + vElevation * 5.0) * 0.02;
  color += shimmer * smoothstep(0.5, 1.0, elevNorm);

  gl_FragColor = vec4(color, 0.92);
}
`;

// ─── Section → Camera position ───
type CamState = { x: number; y: number; z: number };
const sectionCameras: Record<string, CamState> = {
  hero:       { x: 0,  y: 1.5, z: 7 },
  about:      { x: -1, y: 2,   z: 6.5 },
  projects:   { x: 0,  y: 2.5, z: 5.5 },
  stack:      { x: 1,  y: 1,   z: 8 },
  experience: { x: 0.5, y: 1.8, z: 7 },
  contact:    { x: 0,  y: 1.5, z: 7 },
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

  const geometry = useMemo(() => new THREE.PlaneGeometry(14, 14, 220, 220), []);

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

  const wireGeo = useMemo(() => new THREE.WireframeGeometry(geometry), [geometry]);
  const wireMat = useMemo(() => new THREE.LineBasicMaterial({
    color: 0x2a2a5a,
    transparent: true,
    opacity: 0.04,
  }), []);

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

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      wireGeo.dispose();
      wireMat.dispose();
    };
  }, [geometry, material, wireGeo, wireMat]);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.1);
    uniformsRef.current.uTime.value = state.clock.elapsedTime;

    uniformsRef.current.uScrollProgress.value +=
      (scrollProgressRef.current - uniformsRef.current.uScrollProgress.value) * 0.03;

    const target = cameraTargetRef.current;
    const mouseOffX = mouseRef.current.x * 0.4;
    const mouseOffY = mouseRef.current.y * 0.2;

    const lerpFactor = 1 - Math.exp(-d * 2.0);
    state.camera.position.x += (target.x + mouseOffX - state.camera.position.x) * lerpFactor;
    state.camera.position.y += (target.y + mouseOffY - state.camera.position.y) * lerpFactor;
    state.camera.position.z += (target.z - state.camera.position.z) * lerpFactor;

    state.camera.lookAt(0, -0.5, 0);
  });

  return (
    <group rotation={[-Math.PI / 3.2, 0.1, 0.05]} position={[0, -2, 0]}>
      <mesh ref={meshRef} geometry={geometry} material={material} />
      <lineSegments geometry={wireGeo} material={wireMat} />
    </group>
  );
}

// ─── Scroll Manager ───
function useScrollManager(
  cameraTargetRef: React.MutableRefObject<CamState>,
  scrollProgressRef: React.MutableRefObject<number>,
) {
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      scrollProgressRef.current = maxScroll > 0 ? scrolled / maxScroll : 0;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

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
  }, [cameraTargetRef]);
}

// ─── Scene ───
function Scene() {
  const cameraTargetRef = useRef<CamState>({ x: 0, y: 1.5, z: 7 });
  const scrollProgressRef = useRef(0);
  useScrollManager(cameraTargetRef, scrollProgressRef);

  return (
    <>
      <TerrainMesh cameraTargetRef={cameraTargetRef} scrollProgressRef={scrollProgressRef} />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={0.4}
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
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 1.5, 7], fov: 50, near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 1.5]}
        frameloop="always"
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
