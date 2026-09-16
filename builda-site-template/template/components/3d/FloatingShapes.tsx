'use client'

import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

function FloatingShape({
  geometry,
  position,
  wireframe = false,
  color = '#2d1b69',
  speed = 1,
  rotationSpeed = [0.003, 0.002],
}: {
  geometry: 'torus' | 'octahedron' | 'box' | 'cone' | 'capsule'
  position: [number, number, number]
  wireframe?: boolean
  color?: string
  speed?: number
  rotationSpeed?: [number, number]
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const initialY = position[1]

  useFrame((state) => {
    if (!meshRef.current) return

    // Float animation
    const t = state.clock.elapsedTime
    meshRef.current.position.y = initialY + Math.sin(t * 0.5 * speed) * 0.3

    // Rotation
    meshRef.current.rotation.x += rotationSpeed[0]
    meshRef.current.rotation.y += rotationSpeed[1]

    // Mouse reactivity
    const mouse = state.pointer
    meshRef.current.rotation.x += mouse.y * 0.001
    meshRef.current.rotation.z += mouse.x * 0.001
  })

  const Geo = () => {
    switch (geometry) {
      case 'torus':
        return <torusGeometry args={[0.3, 0.12, 16, 32]} />
      case 'octahedron':
        return <octahedronGeometry args={[0.3]} />
      case 'box':
        return <boxGeometry args={[0.35, 0.35, 0.35]} />
      case 'cone':
        return <coneGeometry args={[0.25, 0.5, 8]} />
      default:
        return <sphereGeometry args={[0.25, 16, 16]} />
    }
  }

  return (
    <mesh ref={meshRef} position={position}>
      <Geo />
      <meshPhysicalMaterial
        color={color}
        metalness={0.4}
        roughness={0.2}
        clearcoat={1}
        clearcoatRoughness={0.1}
        wireframe={wireframe}
        transparent={wireframe}
        opacity={wireframe ? 0.4 : 1}
      />
    </mesh>
  )
}

export default function FloatingShapes() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 40 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 3, 5]} color="#6366f1" intensity={1} />

      <FloatingShape geometry="torus" position={[-1.5, 0.5, 0]} color="#2d1b69" speed={0.8} />
      <FloatingShape geometry="octahedron" position={[1.2, -0.3, -0.5]} color="#1e1545" wireframe speed={1.2} />
      <FloatingShape geometry="box" position={[0, 1, -1]} color="#1a1040" speed={0.6} rotationSpeed={[0.002, 0.004]} />
      <FloatingShape geometry="cone" position={[-0.8, -1, 0.5]} color="#2d1b69" wireframe speed={1} />

      <EffectComposer>
        <Bloom intensity={0.2} luminanceThreshold={0.8} />
      </EffectComposer>
    </Canvas>
  )
}
