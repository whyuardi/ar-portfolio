"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
} from "@react-three/postprocessing";
import * as THREE from "three";


// ─── SKY DOME SHADERS ───
const skyVertShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const skyFragShader = `
uniform vec3 uSkyColor0;
uniform vec3 uSkyColor1;
varying vec2 vUv;
void main() {
  vec3 color = mix(uSkyColor1, uSkyColor0, vUv.y);
  gl_FragColor = vec4(color, 1.0);
}
`;

// ─── CLOUD SHADERS ───
const cloudVertShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const cloudFragShader = `
varying vec2 vUv;
uniform float uDimRatio;
uniform float uTime;

float hash(vec2 p) {
  p = fract(p * vec2(5.3983, 5.4427));
  p += dot(p.yx, p.xy + vec2(21.5351, 14.3137));
  return fract(p.x * p.y * 95.4337);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  
  float a = hash(i + vec2(0.0, 0.0));
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for(int i = 0; i < 3; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  // Circular soft mask
  vec2 center = vUv - 0.5;
  float dist = length(center);
  float mask = smoothstep(0.5, 0.2, dist);
  
  if (mask <= 0.0) discard;
  
  // Turbulent noise shape
  float n = fbm(vUv * 3.0 + vec2(uTime * 0.02, 0.0));
  float alpha = mask * n * 0.18 * (1.0 - uDimRatio * 0.6);
  
  // Cloud base color: bright soft white/cyan
  vec3 col = vec3(0.9, 0.95, 1.0);
  
  gl_FragColor = vec4(col, alpha);
}
`;

// ─── WATER LAKE SHADERS ───
const waterVertShader = `
varying vec2 vUv;
varying vec3 vWorldPos;
void main() {
  vUv = uv;
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const waterFragShader = `
varying vec2 vUv;
varying vec3 vWorldPos;
uniform float uTime;
uniform float uDimRatio;

void main() {
  float w1 = sin(vWorldPos.x * 2.5 + uTime * 1.5) * cos(vWorldPos.z * 2.5 + uTime * 1.0);
  float w2 = sin(vWorldPos.z * 5.0 - uTime * 2.0) * cos(vWorldPos.x * 4.0 + uTime * 1.2);
  float wave = (w1 + w2) * 0.5;
  
  vec3 baseColor = mix(vec3(0.04, 0.10, 0.15), vec3(0.01, 0.02, 0.04), uDimRatio);
  
  vec3 normal = normalize(vec3(wave * 0.15, 1.0, wave * 0.15));
  vec3 lightDir = normalize(vec3(1.0, 1.2, 0.8));
  vec3 viewDir = normalize(vec3(0.0, 2.0, 9.0) - vWorldPos);
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(0.0, dot(normal, halfDir)), 32.0);
  
  vec3 col = baseColor + vec3(0.5, 0.85, 1.0) * spec * 0.25 * (1.0 - uDimRatio * 0.8);
  
  float dist = length(vUv - 0.5) * 2.0;
  float alpha = 1.0 - clamp(dist * 0.85, 0.0, 1.0);
  alpha = pow(alpha, 0.5) * 0.8;
  
  gl_FragColor = vec4(col, alpha);
}
`;

// ─── LIGHT TRAIL SHADERS ───
const trailVertShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const trailFragShader = `
varying vec2 vUv;
uniform float uTime;
uniform float uDimRatio;
uniform vec3 uColor;
void main() {
  float x = vUv.x * 2.0 - uTime * 1.5;
  float pulse = sin(x) * 0.5 + 0.5;
  pulse = pow(pulse, 6.0);
  
  float edge = sin(vUv.y * 3.14159);
  edge = pow(edge, 1.5);
  
  float alpha = pulse * edge * 0.6 * (1.0 - uDimRatio * 0.5);
  
  gl_FragColor = vec4(uColor, alpha);
}
`;

// ─── LIGHT BEAM SHADERS ───
const beamVertShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const beamFragShader = `
varying vec2 vUv;
uniform float uTime;
uniform float uDimRatio;
uniform vec3 uColor;

void main() {
  float fadeY = 1.0 - vUv.y;
  fadeY = pow(fadeY, 2.5);
  
  float fadeX = sin(vUv.x * 3.14159);
  fadeX = pow(fadeX, 2.0);
  
  float pulse = sin(uTime * 2.0 + vUv.y * 3.0) * 0.2 + 0.8;
  
  float alpha = fadeY * fadeX * pulse * 0.35 * (1.0 - uDimRatio * 0.8);
  
  gl_FragColor = vec4(uColor, alpha);
}
`;

// ─── GLB TERRAIN MODEL (dari Blender) ───
function TerrainModel({ dimRatio }: { dimRatio: number }) {
  const { scene } = useGLTF("/terrain.glb");
  const meshRef = useRef<THREE.Group>(null);

  // Clone + optimize materials
  const cloned = useMemo(() => {
    const copy = scene.clone();
    copy.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = child.material.clone();
        const mat = child.material as THREE.MeshStandardMaterial;
        // Boost greens, add wet look
        const hsl = new THREE.Color();
        hsl.copy(mat.color);
        const h = hsl.getHSL({ h: 0, s: 0, l: 0 });
        hsl.setHSL(h.h, Math.min(h.s * 1.2, 1), Math.min(h.l * 1.1, 1));
        mat.color.copy(hsl);
        mat.metalness = 0.2;
        mat.roughness = 0.65;
        mat.envMapIntensity = 0.4;
        mat.needsUpdate = true;
      }
    });
    return copy;
  }, [scene]);

  useFrame(() => {
    if (meshRef.current) {
      // Dim scroll effect
      meshRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          mat.opacity = 1 - dimRatio * 0.7;
          mat.transparent = true;
        }
      });
    }
  });

  return (
    <group ref={meshRef}>
      <primitive
        object={cloned}
        scale={3.5}
        position={[0, -4, -8]}
        rotation={[0, Math.PI * 0.15, 0]}
      />
    </group>
  );
}

// ─── SKY DOME ───
function SkyDome({ dimRatio }: { dimRatio: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const SKY_0 = useMemo(() => new THREE.Color("#0b2046"), []);
  const SKY_1 = useMemo(() => new THREE.Color("#205ca5"), []);
  const DIMMED_0 = useMemo(() => new THREE.Color("#08080a"), []);
  const DIMMED_1 = useMemo(() => new THREE.Color("#08080a"), []);

  const uniforms = useMemo(
    () => ({
      uSkyColor0: { value: new THREE.Color("#0b2046") },
      uSkyColor1: { value: new THREE.Color("#205ca5") },
    }),
    []
  );

  useFrame(() => {
    if (matRef.current) {
      matRef.current.uniforms.uSkyColor0.value
        .copy(SKY_0)
        .lerp(DIMMED_0, dimRatio);
      matRef.current.uniforms.uSkyColor1.value
        .copy(SKY_1)
        .lerp(DIMMED_1, dimRatio);
    }
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <sphereGeometry args={[2000, 8, 8]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={skyVertShader}
        fragmentShader={skyFragShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

// ─── INSTANCED CLOUDS ───
function Clouds({ dimRatio }: { dimRatio: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const count = 12;

  const cloudUniforms = useMemo(
    () => ({
      uDimRatio: { value: 0 },
      uTime: { value: 0 },
    }),
    []
  );

  const cloudData = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      return {
        pos: [
          (Math.random() - 0.5) * 30, // x
          1.5 + Math.random() * 2.5, // y
          -1 - Math.random() * 6,   // z
        ] as [number, number, number],
        scale: 2.0 + Math.random() * 3.5,
        speed: 0.02 + Math.random() * 0.04,
      };
    });
  }, []);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uDimRatio.value = dimRatio;
      matRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const data = cloudData[i];
        // Float slowly to the right
        child.position.x += data.speed * 0.1;
        // Wrap around
        if (child.position.x > 20) child.position.x = -20;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {cloudData.map((data, i) => (
        <mesh
          key={i}
          position={data.pos}
          scale={[data.scale * 1.6, data.scale, 1]}
          renderOrder={2}
        >
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            ref={i === 0 ? matRef : undefined}
            vertexShader={cloudVertShader}
            fragmentShader={cloudFragShader}
            uniforms={cloudUniforms}
            transparent={true}
            depthWrite={false}
            blending={THREE.NormalBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── PARTICLES (EverSwap green-tinted) ───
function Particles() {
  const ref = useRef<THREE.Points>(null);
  const count = 256;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 5 + Math.random() * 25;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = Math.sin(theta) * r;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.003;
  });

  return (
    <points ref={ref} frustumCulled={false} renderOrder={4}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.03}
        transparent
        opacity={0.12}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function Bird() {
  const groupRef = useRef<THREE.Group>(null);
  const wingLeftRef = useRef<THREE.Group>(null);
  const wingRightRef = useRef<THREE.Group>(null);
  const wingLeftOuterRef = useRef<THREE.Group>(null);
  const wingRightOuterRef = useRef<THREE.Group>(null);
  const clockRef = useRef(0);

  const bodyGeo = useMemo(() => new THREE.ConeGeometry(0.05, 0.35, 4), []);
  const headGeo = useMemo(() => new THREE.ConeGeometry(0.04, 0.1, 4), []);
  const wingInnerGeo = useMemo(() => new THREE.BoxGeometry(0.3, 0.01, 0.1), []);
  const wingOuterGeo = useMemo(() => new THREE.BoxGeometry(0.3, 0.008, 0.08), []);

  const birdMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0x4a6a5a,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x1a3a2a,
        emissiveIntensity: 0.3,
        flatShading: true,
      }),
    []
  );

  const wingMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0x3a5a4a,
        metalness: 0.9,
        roughness: 0.1,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        flatShading: true,
      }),
    []
  );

  const beakMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xffaa44,
      }),
    []
  );

  useFrame((_, delta) => {
    clockRef.current += delta;
    if (groupRef.current) {
      const t = clockRef.current * 0.35;
      const x = Math.sin(t) * 6;
      const z = Math.sin(t * 2) * 4;
      const y = 3.2 + Math.sin(t * 1.5) * 0.8;
      groupRef.current.position.set(x, y, z);

      const lt = t + 0.01;
      const nx = Math.sin(lt) * 6;
      const nz = Math.sin(lt * 2) * 4;
      const ny = 3.2 + Math.sin(lt * 1.5) * 0.8;
      const dir = new THREE.Vector3(nx - x, ny - y, nz - z).normalize();
      if (dir.length() > 0.01) {
        const quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
        groupRef.current.quaternion.copy(quat);
        groupRef.current.rotateZ(Math.sin(t * 2) * 0.1);
      }
    }

    const flapTime = clockRef.current * 8.0;
    const flapInner = Math.sin(flapTime) * 0.38;
    const flapOuter = Math.sin(flapTime + 0.5) * 0.28 - 0.15;

    if (wingLeftRef.current) wingLeftRef.current.rotation.z = flapInner;
    if (wingLeftOuterRef.current) wingLeftOuterRef.current.rotation.z = flapOuter;
    
    if (wingRightRef.current) wingRightRef.current.rotation.z = -flapInner;
    if (wingRightOuterRef.current) wingRightOuterRef.current.rotation.z = -flapOuter;
  });

  return (
    <group ref={groupRef} position={[0, 3.2, 0]} scale={1.2}>
      <mesh geometry={bodyGeo} material={birdMat} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={headGeo} material={birdMat} position={[0, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh position={[0, -0.02, 0.29]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.015, 0.05, 4]} />
        <primitive object={beakMat} />
      </mesh>
      
      <group position={[-0.03, 0, 0.05]} ref={wingLeftRef}>
        <mesh geometry={wingInnerGeo} material={wingMat} position={[-0.15, 0, 0]} />
        <group position={[-0.3, 0, 0]} ref={wingLeftOuterRef}>
          <mesh geometry={wingOuterGeo} material={wingMat} position={[-0.15, 0, 0]} />
        </group>
      </group>

      <group position={[0.03, 0, 0.05]} ref={wingRightRef}>
        <mesh geometry={wingInnerGeo} material={wingMat} position={[0.15, 0, 0]} />
        <group position={[0.3, 0, 0]} ref={wingRightOuterRef}>
          <mesh geometry={wingOuterGeo} material={wingMat} position={[0.15, 0, 0]} />
        </group>
      </group>
    </group>
  );
}

// ─── WATER LAKE ───
function WaterLake({ dimRatio }: { dimRatio: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  
  const waterUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDimRatio: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      matRef.current.uniforms.uDimRatio.value = dimRatio;
    }
  });

  return (
    <mesh position={[0, -1.22, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <planeGeometry args={[30, 30, 64, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={waterVertShader}
        fragmentShader={waterFragShader}
        uniforms={waterUniforms}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── LIGHT TRAILS (Spline Animation) ───
function LightTrails({ dimRatio }: { dimRatio: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  
  const trailUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDimRatio: { value: 0 },
    }),
    []
  );

  const curves = useMemo(() => [
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-6, -0.9, -5),
      new THREE.Vector3(-2, -0.6, -2),
      new THREE.Vector3(1, -0.4, 0),
      new THREE.Vector3(5, -0.8, 3),
    ]),
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5, -0.8, -3),
      new THREE.Vector3(-1.5, -0.5, -0.5),
      new THREE.Vector3(2.5, -0.3, 1.5),
      new THREE.Vector3(6, -0.75, 4),
    ]),
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-7, -1.0, -1),
      new THREE.Vector3(-3, -0.7, 1),
      new THREE.Vector3(0.5, -0.5, 2),
      new THREE.Vector3(4, -0.9, 5),
    ]),
  ], []);

  const geos = useMemo(() => {
    return curves.map(c => new THREE.TubeGeometry(c, 64, 0.015, 8, false));
  }, [curves]);

  const colors = useMemo(() => [
    new THREE.Color("#52c67e"), // Emerald Green
    new THREE.Color("#49b3fc"), // Electric Cyan
    new THREE.Color("#fa5d29"), // Golden Orange
  ], []);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      matRef.current.uniforms.uDimRatio.value = dimRatio;
    }
  });

  return (
    <group>
      {geos.map((geo, i) => (
        <mesh key={i} geometry={geo} renderOrder={3}>
          <shaderMaterial
            ref={i === 0 ? matRef : undefined}
            vertexShader={trailVertShader}
            fragmentShader={trailFragShader}
            uniforms={{
              ...trailUniforms,
              uColor: { value: colors[i] },
            }}
            transparent={true}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── LIGHT BEAMS (Relayers) ───
function LightBeams({ dimRatio }: { dimRatio: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  
  const beamUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDimRatio: { value: 0 },
    }),
    []
  );

  const beamsData = useMemo(() => [
    { pos: [-3, -0.5, -2.5] as [number, number, number], color: "#52c67e", scale: 0.25 },
    { pos: [2.5, -0.4, -1.0] as [number, number, number], color: "#49b3fc", scale: 0.18 },
    { pos: [0.5, -0.5, -4.5] as [number, number, number], color: "#e2bd79", scale: 0.22 },
  ], []);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      matRef.current.uniforms.uDimRatio.value = dimRatio;
    }
  });

  return (
    <group>
      {beamsData.map((data, i) => (
        <mesh key={i} position={data.pos} scale={[data.scale, 8.0, data.scale]}>
          <cylinderGeometry args={[1, 1, 1, 16, 1, true]} />
          <shaderMaterial
            ref={i === 0 ? matRef : undefined}
            vertexShader={beamVertShader}
            fragmentShader={beamFragShader}
            uniforms={{
              ...beamUniforms,
              uColor: { value: new THREE.Color(data.color) },
            }}
            transparent={true}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene({
  scrollProgress,
}: {
  scrollProgress: React.MutableRefObject<number>;
}) {
  const { camera } = useThree();
  const dimRatio = useRef(0);

  const camPoints = useMemo(() => [
    { pos: new THREE.Vector3(0, 2.2, 8.5), look: new THREE.Vector3(0, 1.4, 0) },     // Hero
    { pos: new THREE.Vector3(-3.2, 2.0, 7.8), look: new THREE.Vector3(0.6, 1.2, 0) }, // About
    { pos: new THREE.Vector3(3.2, 1.4, 6.2), look: new THREE.Vector3(-0.6, 0.9, 0) }, // Projects
    { pos: new THREE.Vector3(0, 0.9, 4.2), look: new THREE.Vector3(0, 0.6, 0) },     // Expertise
    { pos: new THREE.Vector3(0, 0.5, 3.2), look: new THREE.Vector3(0, 1.5, 0) },     // Contact/Footer
  ], []);

  useFrame((state) => {
    const scroll = scrollProgress.current;

    // Segment index and local interpolation factor (t)
    const segment = Math.min(Math.floor(scroll * 4), 3);
    const t = (scroll * 4) % 1;

    const p0 = camPoints[segment];
    const p1 = camPoints[segment + 1];

    const targetPos = new THREE.Vector3().lerpVectors(p0.pos, p1.pos, t);
    const targetLook = new THREE.Vector3().lerpVectors(p0.look, p1.look, t);

    // Smooth camera interpolation
    camera.position.lerp(targetPos, 0.05);

    // Mouse parallax offset
    const mx = (state.pointer.x || 0) * 0.25;
    const my = (state.pointer.y || 0) * 0.15;
    camera.position.x += mx;
    camera.position.y += my;

    camera.lookAt(targetLook);

    // Dim ratio (sky darkens as you scroll)
    const targetDim = Math.min(scroll * 2.5, 1);
    dimRatio.current += (targetDim - dimRatio.current) * 0.03;
  });

  return (
    <>
      <ambientLight intensity={0.15} color="#3a5a6a" />
      <directionalLight position={[3, 8, 4]} intensity={0.4} color="#aaccdd" />
      <pointLight position={[0, 5, 0]} intensity={0.15} color="#5588aa" />

      <SkyDome dimRatio={dimRatio.current} />
      <TerrainModel dimRatio={dimRatio.current} />
      <WaterLake dimRatio={dimRatio.current} />
      <LightTrails dimRatio={dimRatio.current} />
      <LightBeams dimRatio={dimRatio.current} />
      <Clouds dimRatio={dimRatio.current} />
      <Particles />
      <Bird />
    </>
  );
}

// ─── SCROLL MANAGER ───
function useScrollManager() {
  const scrollProgress = useRef(0);
  const onScroll = useCallback(() => {
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.current =
      docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0;
  }, []);
  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);
  return scrollProgress;
}

// ─── EXPORT ───
export default function WebGLBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const scrollProgress = useScrollManager();
  if (!mounted) return null;

  return (
    <div
      id="webgl-canvas"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: "transparent",
      }}
    >
      <Canvas
        camera={{ position: [0, 2, 9], fov: 50, near: 0.1, far: 5000 }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        dpr={[1, 1.5]}
        frameloop="always"
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);
          scene.background = null;
        }}
        style={{ background: "transparent" }}
      >
        <Scene scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
