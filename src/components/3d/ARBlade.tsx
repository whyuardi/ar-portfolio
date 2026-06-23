'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Environment,
  MeshTransmissionMaterial,
  Sphere,
} from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

function CrystalBlade() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const sphereRef = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>(null!)

  // 🌀 Auto-rotate + float
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.6 // 10s = 0.6 rad/s
      meshRef.current.position.y = Math.sin(t * 0.9) * 0.2 // float
      meshRef.current.rotation.x = Math.sin(t * 0.45) * 0.14 // subtle tilt
    }
    if (sphereRef.current) {
      sphereRef.current.material.opacity =
        0.08 + Math.sin(t * 0.6) * 0.04
    }
  })

  // 🎨 Colors
  const gradientColors = useMemo(() => {
    const g = new THREE.DataTexture(
      new Uint8Array([
        0, 229, 255, 255, // cyan #00E5FF
        107, 47, 255, 255, // purple #6B2FFF
      ]),
      2, 1, THREE.RGBAFormat
    )
    g.needsUpdate = true
    return g
  }, [])

  return (
    <>
      {/* Glow orb di belakang */}
      <Sphere
        ref={sphereRef}
        args={[2.2, 16, 16]}
        position={[0, 0, -1.5]}
        scale={[1, 1, 0.12]}
      >
        <meshStandardMaterial
          color="#3B00FF"
          emissive="#00D4FF"
          emissiveIntensity={1.5}
          roughness={1}
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </Sphere>

      {/* Main Crystal Blade — Icosahedron elongated */}
      <mesh ref={meshRef} scale={[0.55, 2.0, 0.45]}>
        <icosahedronGeometry args={[1, 0]} />

        {/* Base Glass */}
        <MeshTransmissionMaterial
          background={new THREE.Color('#050510')}
          metalness={0.05}
          roughness={0.02}
          transmission={0.88}
          ior={1.5}
          thickness={0.5}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
          envMapIntensity={0.4}
          clearcoat={0.2}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Wireframe overlay untuk edge definition */}
      <mesh scale={[0.56, 2.02, 0.46]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          wireframe
          color="#00FFFF"
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>

      {/* Ambient rim light helper */}
      <ambientLight intensity={0.15} color="#050520" />

      {/* Key Light — Cyan from left front */}
      <pointLight
        position={[-2, 3, 4]}
        color="#00D4FF"
        intensity={20}
        distance={12}
      />

      {/* Rim Light — Purple from back right */}
      <pointLight
        position={[3, -1, -3]}
        color="#7B2FFF"
        intensity={14}
        distance={10}
      />

      {/* Fill light from bottom */}
      <pointLight
        position={[0, -3, 2]}
        color="#0022FF"
        intensity={5}
        distance={8}
      />
    </>
  )
}

export function ARBlade() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 40 }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
        }}
        dpr={[1, 1.5]}
      >
        <CrystalBlade />

        <EffectComposer>
          <Bloom
            threshold={0.3}
            intensity={0.8}
            radius={0.4}
            mipmapBlur
          />
        </EffectComposer>

        <Environment
          preset="city"
          background={false}
        />
      </Canvas>
    </div>
  )
}
