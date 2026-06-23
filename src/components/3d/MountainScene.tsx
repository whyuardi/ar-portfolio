'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// ─── TERRAIN SHADERS ───
const vertShader = `
uniform float uTime;
varying float vElevation;
varying vec2 vUv;
varying vec3 vPosition;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
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
  return 105.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vec3 pos = position;
  
  // Multi-octave noise for terrain
  float t = uTime * 0.04;
  float n1 = snoise(vec3(pos.x * 0.08, pos.y * 0.08, t));
  float n2 = snoise(vec3(pos.x * 0.18 + 1.5, pos.y * 0.18 + 2.3, t * 1.3));
  float n3 = snoise(vec3(pos.x * 0.35 + 3.7, pos.y * 0.35 + 4.1, t * 0.7));
  float n4 = snoise(vec3(pos.x * 0.05 + 0.5, pos.y * 0.05 + 1.0, t * 0.5));
  
  float elevation = n1 * 2.5 + n2 * 1.5 + n3 * 0.5 + n4 * 3.0;
  
  // Sharpen peaks
  elevation = elevation > 1.0 ? elevation * 1.3 : elevation * 0.7;
  
  pos.z += elevation;
  vElevation = elevation;
  vUv = uv;
  vPosition = pos;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const fragShader = `
varying float vElevation;
varying vec2 vUv;
varying vec3 vPosition;

uniform vec3 uColorDeep;
uniform vec3 uColorMid;
uniform vec3 uColorHigh;
uniform vec3 uColorPeak;
uniform vec3 uLightDir;

void main() {
  // Compute normal from position derivatives
  vec3 dx = dFdx(vPosition);
  vec3 dy = dFdy(vPosition);
  vec3 n = normalize(cross(dx, dy));
  
  vec3 lightDir = normalize(uLightDir);
  float diff = max(dot(n, lightDir), 0.0);
  float ambient = 0.25;
  float lighting = ambient + diff * 0.55 + pow(max(dot(n, normalize(vec3(0.0, 0.3, -1.0))), 0.0), 8.0) * 0.2;
  
  // Rim light
  float rim = 1.0 - max(dot(n, normalize(vec3(0.0, 0.0, -1.0))), 0.0);
  rim = pow(rim, 3.0) * 0.3;
  
  float e = vElevation;
  vec3 col;
  
  // Terrain coloring
  if (e < -2.0) col = uColorDeep;                      // deep valleys
  else if (e < 0.5) col = mix(uColorDeep, uColorMid, (e + 2.0) / 2.5);  // slopes
  else if (e < 2.0) col = mix(uColorMid, uColorHigh, (e - 0.5) / 1.5);  // highlands
  else if (e < 3.5) col = mix(uColorHigh, uColorPeak, (e - 2.0) / 1.5); // near peak
  else col = uColorPeak;                                                  // peaks
  
  col *= lighting;
  col += rim * vec3(0.15, 0.25, 0.15);
  
  // Subtle fog
  float fog = clamp((gl_FragCoord.z / gl_FragCoord.w) * 0.03, 0.0, 0.3);
  col = mix(col, uColorDeep, fog);
  
  gl_FragColor = vec4(col, 1.0);
}
`

// ─── TERRAIN MESH ───
function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorDeep: { value: new THREE.Color('#0a1f1a') },
    uColorMid: { value: new THREE.Color('#1a5a3a') },
    uColorHigh: { value: new THREE.Color('#3a8a4a') },
    uColorPeak: { value: new THREE.Color('#5aaa5a') },
    uLightDir: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() },
  }), [])

  const geo = useMemo(() => new THREE.PlaneGeometry(25, 25, 200, 200), [])

  useFrame((_, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta * 0.5
    }
  })

  return (
    <mesh ref={meshRef} geometry={geo} rotation={[-Math.PI / 3.8, 0, 0]} position={[0, -2, -5]}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertShader}
        fragmentShader={fragShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ─── BIRD ───
function Bird() {
  const groupRef = useRef<THREE.Group>(null)
  const leftWingRef = useRef<THREE.Mesh>(null)
  const rightWingRef = useRef<THREE.Mesh>(null)

  const bodyMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#1a1a1a',
    metalness: 0.1,
    roughness: 0.8,
  }), [])

  const wingMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#2a2a2a',
    metalness: 0.05,
    roughness: 0.9,
    side: THREE.DoubleSide,
  }), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    
    // Flight path: circle with gentle bobbing
    if (groupRef.current) {
      const radius = 4.5
      const speed = 0.25
      groupRef.current.position.x = Math.sin(t * speed) * radius
      groupRef.current.position.z = Math.cos(t * speed) * radius - 2
      groupRef.current.position.y = 1.5 + Math.sin(t * speed * 1.3) * 0.3
      // Face direction of movement
      groupRef.current.rotation.y = t * speed
    }

    // Wing flap
    if (leftWingRef.current) {
      leftWingRef.current.rotation.x = Math.sin(t * 5.5) * 0.5 + 0.3
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.x = -Math.sin(t * 5.5) * 0.5 - 0.3
    }
  })

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh>
        <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
        <primitive object={bodyMat} attach="material" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.05, 0.22]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <primitive object={bodyMat} attach="material" />
      </mesh>

      {/* Tail */}
      <mesh position={[0, -0.02, -0.25]} rotation={[0.4, 0, 0]}>
        <coneGeometry args={[0.04, 0.12, 4]} />
        <primitive object={bodyMat} attach="material" />
      </mesh>

      {/* Left Wing */}
      <mesh ref={leftWingRef} position={[-0.05, 0.05, 0]} rotation={[0.3, 0, -0.3]}>
        <planeGeometry args={[0.4, 0.12]} />
        <primitive object={wingMat} attach="material" />
      </mesh>

      {/* Right Wing */}
      <mesh ref={rightWingRef} position={[0.05, 0.05, 0]} rotation={[-0.3, 0, 0.3]}>
        <planeGeometry args={[0.4, 0.12]} />
        <primitive object={wingMat} attach="material" />
      </mesh>
    </group>
  )
}

// ─── AMBIENT PARTICLES ───
function Particles() {
  const count = 200
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10 + 3
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5
    }
    return arr
  }, [])

  const ref = useRef<THREE.Points>(null)

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.005
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#5aaa5a"
        size={0.04}
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  )
}

// ─── MAIN SCENE ───
export default function MountainScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
        }}
        camera={{
          fov: 45,
          position: [0, 4, 8],
          near: 0.1,
          far: 50,
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 10, 5]} intensity={0.6} color="#ffd4a0" />
        <directionalLight position={[-3, 5, -2]} intensity={0.2} color="#80ffcc" />

        <Terrain />
        <Bird />
        <Particles />

        <EffectComposer>
          <Bloom
            intensity={0.3}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.5}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
