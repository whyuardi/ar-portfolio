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
varying vec2 vUv;
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+10.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*7.*n_);
  vec4 x_=floor(j*7.*n_);
  vec4 y_=floor(j-7.*x_*n_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;
  vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 105.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
void main(){
  vec3 pos=position;
  float f1=0.05,f2=0.12,f3=0.25;
  float a1=2.5,a2=1.2,a3=0.5;
  float t=uTime*0.1;
  float n1=snoise(vec3(pos.x*f1,pos.y*f1,t));
  float n2=snoise(vec3(pos.x*f2-2.,pos.y*f2+1.,t*1.2));
  float n3=snoise(vec3(pos.x*f3+1.,pos.y*f3-3.,t*0.8));
  float elevation=(n1*a1+n2*a2+n3*a3);
  float morph=clamp(uMorph,0.,1.);
  elevation*=(0.4+morph*0.6);
  vec3 newPos=pos;
  newPos.z+=elevation;
  vElevation=elevation;
  vUv=uv;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(newPos,1.);
}
`;

const terrainFragShader = `
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uLightDir;
uniform float uFogDensity;
varying float vElevation;
varying vec2 vUv;
void main(){
  vec3 n=normalize(cross(dFdx(vUv),dFdy(vUv)));
  float ambient=0.15;
  vec3 lightDir=normalize(uLightDir);
  float diff=max(dot(n,lightDir),0.);
  float lighting=ambient+diff*0.5;
  float rim=1.-max(dot(n,-lightDir),0.);
  rim=pow(rim,2.5)*0.2;
  float e=vElevation;
  vec3 col;
  if(e<-0.5)col=uColor1;
  else if(e<0.3){float t=(e+0.5)/0.8;col=mix(uColor1,uColor2,t);}
  else if(e<0.8){float t=(e-0.3)/0.5;col=mix(uColor2,uColor3,t);}
  else{float t=clamp((e-0.8)/0.8,0.,1.);col=mix(uColor3,vec3(0.3,0.6,0.4),t);}
  col*=lighting;
  col+=rim*vec3(0.2,0.35,0.2);
  float fogDist=length(vUv-.5)*1.4;
  col=mix(col,uColor1,clamp(fogDist*uFogDensity,0.,0.4));
  gl_FragColor=vec4(col,1.);
}
`;

// ─── MOUNTAIN TERRAIN ───
function TerrainMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const clockRef = useRef(0);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorph: { value: 0.5 },
    uColor1: { value: new THREE.Color("#0a1a0f") },
    uColor2: { value: new THREE.Color("#1a3a2a") },
    uColor3: { value: new THREE.Color("#2a5a3a") },
    uLightDir: { value: new THREE.Vector3(0.3, 0.7, 0.5).normalize() },
    uFogDensity: { value: 0.5 },
  }), []);

  const geo = useMemo(() => new THREE.PlaneGeometry(20, 20, 150, 150), []);

  useFrame((state, delta) => {
    clockRef.current += delta;
    if (matRef.current) matRef.current.uniforms.uTime.value = clockRef.current;
    if (meshRef.current) meshRef.current.rotation.x = -Math.PI / 3.8;
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

// ─── WIREFRAME OVERLAY ───
function WireframeOverlay() {
  const ref = useRef<THREE.LineSegments>(null);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(20, 20, 50, 50);
    return new THREE.WireframeGeometry(g);
  }, []);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x = -Math.PI / 3.8;
    }
  });

  return (
    <lineSegments ref={ref} geometry={geo} frustumCulled={false}>
      <lineBasicMaterial color="#3a7a4a" transparent opacity={0.06} depthWrite={false} />
    </lineSegments>
  );
}

// ─── 3D BIRD ───
function Bird() {
  const groupRef = useRef<THREE.Group>(null);
  const wingLeftRef = useRef<THREE.Mesh>(null);
  const wingRightRef = useRef<THREE.Mesh>(null);
  const clockRef = useRef(0);

  // Bird geometry: body + wings
  const bodyGeo = useMemo(() => new THREE.CapsuleGeometry(0.08, 0.25, 4, 8), []);
  const wingGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0.35, 0.12, 0.5, 0);
    shape.quadraticCurveTo(0.35, -0.04, 0, 0);
    const geo = new THREE.ShapeGeometry(shape);
    return geo;
  }, []);

  const birdMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: 0x2a4a3a,
    metalness: 0.3,
    roughness: 0.6,
    emissive: 0x1a3a2a,
    emissiveIntensity: 0.2,
  }), []);

  const wingMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: 0x1a3a2a,
    metalness: 0.2,
    roughness: 0.7,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  }), []);

  useFrame((state, delta) => {
    clockRef.current += delta;

    if (groupRef.current) {
      // Fly in a figure-8 path
      const t = clockRef.current * 0.4;
      const radiusX = 5;
      const radiusZ = 4;
      const yOffset = 2.5;

      // Figure-8 path
      const x = Math.sin(t) * radiusX;
      const z = Math.sin(t * 2) * radiusZ;
      const y = yOffset + Math.sin(t * 1.5) * 0.8;

      groupRef.current.position.set(x, y, z);

      // Face the direction of movement
      const lookT = t + 0.01;
      const nextX = Math.sin(lookT) * radiusX;
      const nextZ = Math.sin(lookT * 2) * radiusZ;
      const nextY = yOffset + Math.sin(lookT * 1.5) * 0.8;

      const dir = new THREE.Vector3(nextX - x, nextY - y, nextZ - z).normalize();
      if (dir.length() > 0.01) {
        const quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
        groupRef.current.quaternion.copy(quat);
        // Tilt slightly
        groupRef.current.rotateZ(Math.sin(t * 2) * 0.2);
      }
    }

    // Wing flap
    if (wingLeftRef.current && wingRightRef.current) {
      const flapAngle = Math.sin(clockRef.current * 8) * 0.5;
      wingLeftRef.current.rotation.z = flapAngle;
      wingRightRef.current.rotation.z = -flapAngle;
    }
  });

  return (
    <group ref={groupRef} position={[0, 2.5, 0]} scale={1.5}>
      {/* Body */}
      <mesh geometry={bodyGeo} material={birdMat} rotation={[Math.PI / 2, 0, 0]} />

      {/* Left wing */}
      <group position={[0, 0, 0]}>
        <mesh
          ref={wingLeftRef}
          geometry={wingGeo}
          material={wingMat}
          position={[-0.04, 0, 0]}
          rotation={[0, 0, 0.3]}
        />
      </group>

      {/* Right wing */}
      <group position={[0, 0, 0]}>
        <mesh
          ref={wingRightRef}
          geometry={wingGeo}
          material={wingMat}
          position={[0.04, 0, 0]}
          rotation={[0, 0, -0.3]}
          scale={[-1, 1, 1]}
        />
      </group>

      {/* Tail */}
      <mesh position={[0, -0.16, 0]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.04, 0.1, 4]} />
        <primitive object={birdMat} />
      </mesh>
    </group>
  );
}

// ─── STARS / PARTICLES ───
function Particles() {
  const ref = useRef<THREE.Points>(null);
  const count = 300;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 10 + Math.random() * 20;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = Math.sin(theta) * r;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.005;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.04} transparent opacity={0.3} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// ─── SCENE ───
function Scene({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const currentZ = useRef(8);

  useFrame((state) => {
    const targetZ = 8 + scrollProgress.current * 3;
    currentZ.current += (targetZ - currentZ.current) * 0.02;
    const mx = (state.pointer.x || 0) * 0.2;
    const my = (state.pointer.y || 0) * 0.15;
    camera.position.x = mx;
    camera.position.y = 1.5 + my;
    camera.position.z = currentZ.current;
    camera.lookAt(0, 1.5, 0);
  });

  return (
    <>
      <ambientLight intensity={0.2} color="#2a5a3a" />
      <directionalLight position={[3, 8, 4]} intensity={0.6} color="#ffffff" />
      <pointLight position={[0, 4, 0]} intensity={0.5} color="#4ade80" />

      <TerrainMesh />
      <WireframeOverlay />
      <Bird />
      <Particles />

      <EffectComposer>
        <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.8} intensity={0.3} mipmapBlur />
      </EffectComposer>
    </>
  );
}

// ─── SCROLL MANAGER ───
function useScrollManager() {
  const scrollProgress = useRef(0);
  const onScroll = useCallback(() => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.current = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0;
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
  useEffect(() => { setMounted(true); }, []);
  const scrollProgress = useScrollManager();
  if (!mounted) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "transparent" }}>
      <Canvas
        camera={{ position: [0, 1.5, 8], fov: 50, near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
        dpr={[1, 1.5]}
        frameloop="always"
      >
        <Scene scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
