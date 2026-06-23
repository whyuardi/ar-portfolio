"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
} from "@react-three/postprocessing";
import * as THREE from "three";

// ─── ASHIMA WEBGL-NOISE ───
const terrainVertShader = `
uniform float uTime;
uniform float uMorph;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

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
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * 7.0 * n_);
  vec4 x_ = floor(j * 7.0 * n_);
  vec4 y_ = floor(j - 7.0 * x_ * n_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vec3 pos = position;

  // Everswap-style: gentle rolling terrain, not sharp peaks
  float f1 = 0.05;
  float f2 = 0.12;
  float f3 = 0.25;

  float a1 = 2.5;
  float a2 = 1.2;
  float a3 = 0.5;

  float t = uTime * 0.1;

  float n1 = snoise(vec3(pos.x * f1, pos.y * f1, t));
  float n2 = snoise(vec3(pos.x * f2 - 2.0, pos.y * f2 + 1.0, t * 1.2));
  float n3 = snoise(vec3(pos.x * f3 + 1.0, pos.y * f3 - 3.0, t * 0.8));

  float elevation = (n1 * a1 + n2 * a2 + n3 * a3);
  float morph = clamp(uMorph, 0.0, 1.0);
  elevation *= (0.4 + morph * 0.6);

  vec3 newPos = pos;
  newPos.z += elevation;

  // Compute normal
  float eps = 0.01;
  vec3 tangent1 = vec3(eps, 0.0, 0.0);
  vec3 tangent2 = vec3(0.0, eps, 0.0);
  vec3 p1 = pos + tangent1;
  p1.z += (snoise(vec3(p1.x*f1, p1.y*f1, t))*a1 + snoise(vec3(p1.x*f2-2.0, p1.y*f2+1.0, t*1.2))*a2 + snoise(vec3(p1.x*f3+1.0, p1.y*f3-3.0, t*0.8))*a3) * (0.4+morph*0.6);
  vec3 p2 = pos + tangent2;
  p2.z += (snoise(vec3(p2.x*f1, p2.y*f1, t))*a1 + snoise(vec3(p2.x*f2-2.0, p2.y*f2+1.0, t*1.2))*a2 + snoise(vec3(p2.x*f3+1.0, p2.y*f3-3.0, t*0.8))*a3) * (0.4+morph*0.6);
  vec3 n = normalize(cross(p1 - newPos, p2 - newPos));

  vElevation = elevation;
  vNormal = normalize((modelMatrix * vec4(n, 0.0)).xyz);
  vPosition = (modelMatrix * vec4(newPos, 1.0)).xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
`;

const terrainFragShader = `
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uLightDir;
uniform float uFogDensity;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 n = normalize(vNormal);

  float ambient = 0.12;
  vec3 lightDir = normalize(uLightDir);
  float diff = max(dot(n, lightDir), 0.0);
  float lighting = ambient + diff * 0.6;

  // Rim light
  float rim = 1.0 - max(dot(n, -lightDir), 0.0);
  rim = pow(rim, 2.5) * 0.25;

  // Everswap green palette based on elevation
  float e = vElevation;
  vec3 col;
  if (e < -0.5) {
    col = uColor1; // deep valley #0a1a0f
  } else if (e < 0.3) {
    float t = (e + 0.5) / 0.8;
    col = mix(uColor1, uColor2, t); // valley to mid #1a3a2a
  } else if (e < 0.8) {
    float t = (e - 0.3) / 0.5;
    col = mix(uColor2, uColor3, t); // mid to high #2a5a3a
  } else {
    float t = clamp((e - 0.8) / 0.8, 0.0, 1.0);
    col = mix(uColor3, uColor4, t); // high to peak #3a7a4a
  }

  col *= lighting;
  col += rim * vec3(0.2, 0.35, 0.2); // subtle green rim

  // Atmospheric fog
  float fogDist = length(vPosition) / 18.0;
  col = mix(col, uColor1, clamp(fogDist * uFogDensity, 0.0, 0.5));

  gl_FragColor = vec4(col, 1.0);
}
`;

// ─── Terrain Mesh ───
function TerrainMesh({
  scrollProgress,
}: {
  scrollProgress: React.MutableRefObject<number>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const clockRef = useRef(0);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uColor1: { value: new THREE.Color("#0a1a0f") },
    uColor2: { value: new THREE.Color("#1a3a2a") },
    uColor3: { value: new THREE.Color("#2a5a3a") },
    uColor4: { value: new THREE.Color("#3a7a4a") },
    uLightDir: { value: new THREE.Vector3(0.3, 0.7, 0.5).normalize() },
    uFogDensity: { value: 0.6 },
  }), []);

  const geo = useMemo(() => new THREE.PlaneGeometry(22, 22, 180, 180), []);

  useFrame((state, delta) => {
    clockRef.current += delta;
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clockRef.current;
      const target = scrollProgress.current;
      matRef.current.uniforms.uMorph.value += (target - matRef.current.uniforms.uMorph.value) * 0.03;
    }
    if (meshRef.current) {
      // Gentle tilt for mountain range silhouette
      meshRef.current.rotation.x = -Math.PI / 3.8;
      meshRef.current.rotation.z = Math.sin(clockRef.current * 0.008) * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geo} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={terrainVertShader}
        fragmentShader={terrainFragShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
        wireframe={false}
      />
    </mesh>
  );
}

// ─── Wireframe Overlay ───
function WireframeOverlay({ scrollProgress }: {
  scrollProgress: React.MutableRefObject<number>;
}) {
  const ref = useRef<THREE.LineSegments>(null);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(22, 22, 60, 60);
    return new THREE.WireframeGeometry(g);
  }, []);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x = -Math.PI / 3.8;
      const progress = scrollProgress.current;
      const mat = ref.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.03 + progress * 0.08;
    }
  });

  return (
    <lineSegments ref={ref} geometry={geo} frustumCulled={false}>
      <lineBasicMaterial
        color="#4a8a5a"
        transparent
        opacity={0.06}
        depthWrite={false}
      />
    </lineSegments>
  );
}

// ─── Particles (stars) ───
function Particles() {
  const ref = useRef<THREE.Points>(null);
  const count = 400;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 8 + Math.random() * 20;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = Math.sin(theta) * r;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.008;
    }
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.04}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ─── Scroll Manager ───
function useScrollManager() {
  const scrollProgress = useRef(0);
  const activeSection = useRef("hero");

  const onScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.current = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

    const sections = ["hero", "about", "projects", "stack", "experience", "contact"];
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2) {
          activeSection.current = sections[i];
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return { scrollProgress, activeSection };
}

// ─── Scene ───
function Scene({
  scrollProgress,
}: {
  scrollProgress: React.MutableRefObject<number>;
}) {
  const { camera } = useThree();
  const currentZ = useRef(8);

  useFrame((state) => {
    // Scroll zoom
    const targetZ = 8 + scrollProgress.current * 3;
    currentZ.current += (targetZ - currentZ.current) * 0.02;

    // Mouse parallax
    const mx = (state.pointer.x || 0) * 0.2;
    const my = (state.pointer.y || 0) * 0.15;

    camera.position.x = mx;
    camera.position.y = 1.5 + my;
    camera.position.z = currentZ.current;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.2} color="#2a5a3a" />
      <directionalLight position={[3, 8, 4]} intensity={0.6} color="#ffffff" />

      <TerrainMesh scrollProgress={scrollProgress} />
      <WireframeOverlay scrollProgress={scrollProgress} />
      <Particles />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.8}
          intensity={0.3}
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

  const { scrollProgress, activeSection } = useScrollManager();

  if (!mounted) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: "transparent",
      }}
    >
      <Canvas
        camera={{ position: [0, 1.5, 8], fov: 50, near: 0.1, far: 100 }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        dpr={[1, 1.5]}
        frameloop="always"
      >
        <Scene scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
