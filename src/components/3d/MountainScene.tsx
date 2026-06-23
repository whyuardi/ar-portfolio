'use client'

import { useRef, useMemo, Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, useGLTF, ContactShadows, Float } from '@react-three/drei'
import * as THREE from 'three'

// ─── GLB TERRAIN MODEL ───
function TerrainModel() {
  const { scene } = useGLTF('/terrain.glb')

  return (
    <primitive
      object={scene}
      scale={2.5}
      position={[0, -3, -6]}
      rotation={[0, 0, 0]}
    />
  )
}

// ─── AMBIENT PARTICLES ───
function Particles() {
  const count = 300
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40
      arr[i * 3 + 1] = (Math.random() - 0.5) * 15 + 3
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5
    }
    return arr
  }, [])

  const ref = useRef<THREE.Points>(null)

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.003
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
        color="#ff8844"
        size={0.05}
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  )
}

// ─── FLOATING ORBS ───
function FloatingOrbs() {
  const groupRef = useRef<THREE.Group>(null)

  const orbs = useMemo(() => {
    const arr: { pos: [number, number, number]; color: string; size: number }[] = []
    for (let i = 0; i < 8; i++) {
      arr.push({
        pos: [
          (Math.random() - 0.5) * 12,
          Math.random() * 4 - 1,
          (Math.random() - 0.5) * 8 - 2,
        ],
        color: ['#ff6b35', '#ff8844', '#ffaa55', '#ffcc77'][Math.floor(Math.random() * 4)],
        size: Math.random() * 0.15 + 0.05,
      })
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.02
    }
  })

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <Float key={i} speed={1.5 + Math.random()} rotationIntensity={0.2} floatIntensity={0.5}>
          <mesh position={orb.pos}>
            <sphereGeometry args={[orb.size, 16, 16]} />
            <meshPhysicalMaterial
              color={orb.color}
              emissive={orb.color}
              emissiveIntensity={0.3}
              transparent
              opacity={0.6}
              roughness={0.1}
              metalness={0.1}
            />
          </mesh>
        </Float>
      ))}
    </group>
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
          fov: 50,
          position: [0, 1, 7],
          near: 0.1,
          far: 100,
        }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} color="#ff8844" />
        <directionalLight position={[8, 10, 4]} intensity={1.2} color="#ffdd99" />
        <directionalLight position={[-5, 2, -5]} intensity={0.4} color="#4466ff" />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#ff8844" />

        {/* Scene */}
        <Suspense fallback={null}>
          <TerrainModel />
          <Environment preset="sunset" />
          <ContactShadows
            position={[0, -3.5, -6]}
            opacity={0.4}
            scale={20}
            blur={2.5}
            far={10}
          />
        </Suspense>

        <Particles />
        <FloatingOrbs />
      </Canvas>
    </div>
  )
}
