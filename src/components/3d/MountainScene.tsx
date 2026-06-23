'use client'

import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, useGLTF, ContactShadows, Float, Sky } from '@react-three/drei'
import * as THREE from 'three'

// ─── GLB TERRAIN MODEL ───
function TerrainModel() {
  const { scene } = useGLTF('/terrain.glb')

  useMemo(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Warm up the materials to match everswap's vibrant green
        if (child.material) {
          const mat = child.material as THREE.MeshStandardMaterial
          if (mat.color) {
            // Make greens more vibrant
            const hsl = new THREE.Color()
            hsl.copy(mat.color)
            const h = hsl.getHSL({ h: 0, s: 0, l: 0 })
            // Boost saturation and lightness for painterly feel
            hsl.setHSL(h.h, Math.min(h.s * 1.3, 1), Math.min(h.l * 1.15, 1))
            mat.color.copy(hsl)
          }
          mat.envMapIntensity = 0.6
          mat.needsUpdate = true
        }
      }
    })
  }, [scene])

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
  const count = 200
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 35
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12 + 3
      arr[i * 3 + 2] = (Math.random() - 0.5) * 25 - 5
    }
    return arr
  }, [])

  const ref = useRef<THREE.Points>(null)

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.002
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
        color="#ffffff"
        size={0.03}
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  )
}

// ─── FLOATING LIGHT ORBS (everswap-style) ───
function FloatingOrbs() {
  const groupRef = useRef<THREE.Group>(null)

  const orbs = useMemo(() => {
    const arr: { pos: [number, number, number]; color: string; size: number; speed: number }[] = []
    for (let i = 0; i < 6; i++) {
      arr.push({
        pos: [
          (Math.random() - 0.5) * 10,
          Math.random() * 5 + 0.5,
          (Math.random() - 0.5) * 8 - 2,
        ],
        color: ['#c2e07c', '#8cb86b', '#ffdd99', '#e0f289'][Math.floor(Math.random() * 4)],
        size: Math.random() * 0.12 + 0.04,
        speed: 1 + Math.random() * 1.5,
      })
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.015
    }
  })

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <Float key={i} speed={orb.speed} rotationIntensity={0.1} floatIntensity={0.4}>
          <mesh position={orb.pos}>
            <sphereGeometry args={[orb.size, 16, 16]} />
            <meshPhysicalMaterial
              color={orb.color}
              emissive={orb.color}
              emissiveIntensity={0.2}
              transparent
              opacity={0.5}
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
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        camera={{
          fov: 50,
          position: [0, 1.5, 7],
          near: 0.1,
          far: 100,
        }}
        style={{ background: 'linear-gradient(180deg, #1a3a4a 0%, #2d5a5a 30%, #4a8a6a 60%, #6aaa5a 100%)' }}
        dpr={[1, 2]}
      >
        {/* Everswap-style: warm directional light from top-left */}
        <ambientLight intensity={0.4} color="#cceeff" />
        <directionalLight position={[8, 12, 4]} intensity={2.0} color="#ffeebb" />
        <directionalLight position={[-4, 1, -5]} intensity={0.3} color="#4488ff" />
        <hemisphereLight
          color="#87ceeb"
          groundColor="#4a7a4a"
          intensity={0.5}
        />

        {/* Scene */}
        <Suspense fallback={null}>
          <TerrainModel />
          <Environment preset="sunset" />
          <ContactShadows
            position={[0, -3.5, -6]}
            opacity={0.3}
            scale={15}
            blur={3}
            far={10}
          />
        </Suspense>

        <Particles />
        <FloatingOrbs />

        {/* Fog for depth */}
        <fog attach="fog" args={['#1a3a4a', 8, 25]} />
      </Canvas>
    </div>
  )
}
