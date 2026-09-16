'use client'

import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '@/lib/store'

// ---------- Constants ----------
const SPHERE_COUNT = 40
const BASE_RADIUS = 1.5
const NEBULA_COUNT = 50

// ---------- Nebula particle data (generated once) ----------
function generateNebulaData(count: number) {
  const positions = new Float32Array(count * 3)
  const speeds = new Float32Array(count * 3)
  const opacities = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    // Scatter in a cylinder: radius 5, height 15
    const angle = Math.random() * Math.PI * 2
    const r = Math.random() * 5
    const y = (Math.random() - 0.5) * 15
    positions[i * 3] = Math.cos(angle) * r
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = Math.sin(angle) * r
    // Slow random drift
    speeds[i * 3] = (Math.random() - 0.5) * 0.02
    speeds[i * 3 + 1] = (Math.random() - 0.5) * 0.015
    speeds[i * 3 + 2] = (Math.random() - 0.5) * 0.02
    // Random opacity 0.05-0.15
    opacities[i] = 0.05 + Math.random() * 0.1
  }
  return { positions, speeds, opacities }
}

// ---------- NebulaParticles sub-component ----------
function NebulaParticles() {
  const pointsRef = useRef<THREE.Points>(null)
  const nebulaData = useMemo(() => generateNebulaData(NEBULA_COUNT), [])

  // Create a stable positions buffer for the geometry
  const positionBuffer = useMemo(() => {
    return new Float32Array(nebulaData.positions)
  }, [nebulaData])

  useFrame((_, delta) => {
    if (!pointsRef.current) return
    const geo = pointsRef.current.geometry
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
    if (!posAttr) return
    const arr = posAttr.array as Float32Array
    for (let i = 0; i < NEBULA_COUNT; i++) {
      arr[i * 3] += nebulaData.speeds[i * 3] * delta
      arr[i * 3 + 1] += nebulaData.speeds[i * 3 + 1] * delta
      arr[i * 3 + 2] += nebulaData.speeds[i * 3 + 2] * delta
      // Wrap around cylinder bounds
      const dx = arr[i * 3]
      const dz = arr[i * 3 + 2]
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist > 5) {
        const angle = Math.random() * Math.PI * 2
        arr[i * 3] = Math.cos(angle) * 0.5
        arr[i * 3 + 2] = Math.sin(angle) * 0.5
      }
      if (Math.abs(arr[i * 3 + 1]) > 7.5) {
        arr[i * 3 + 1] *= -0.5
      }
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positionBuffer, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="white"
        size={0.04}
        transparent
        opacity={0.1}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

// ---------- ConnectingLines sub-component ----------
function ConnectingLines({
  lineGeomRefs,
  lineMatRefs,
}: {
  lineGeomRefs: React.MutableRefObject<(THREE.BufferGeometry | null)[]>
  lineMatRefs: React.MutableRefObject<(THREE.LineBasicMaterial | null)[]>
}) {
  const setLineGeomRef = useCallback(
    (index: number) => (el: THREE.BufferGeometry | null) => {
      lineGeomRefs.current[index] = el
    },
    [lineGeomRefs]
  )

  const setLineMatRef = useCallback(
    (index: number) => (el: THREE.LineBasicMaterial | null) => {
      lineMatRefs.current[index] = el
    },
    [lineMatRefs]
  )

  // Pre-allocate initial line buffers
  const lineBuffers = useMemo(() => {
    return Array.from({ length: SPHERE_COUNT }, () => new Float32Array(6))
  }, [])

  return (
    <>
      {lineBuffers.map((buf, i) => (
        <line key={i}>
          <bufferGeometry ref={setLineGeomRef(i)} attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              args={[buf, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            ref={setLineMatRef(i)}
            attach="material"
            color="white"
            transparent
            opacity={0.12}
          />
        </line>
      ))}
    </>
  )
}

// ---------- Main AboutDNA component ----------
export default function AboutDNA() {
  const groupRef = useRef<THREE.Group>(null)
  const helixGroupRef = useRef<THREE.Group>(null)

  // Refs for sphere instances (spiral 0: indices 0-39, spiral 1: indices 40-79)
  const instanceRefs = useRef<(THREE.InstancedMesh | null)[]>([])

  // Refs for connecting line geometries and materials
  const lineGeomRefs = useRef<(THREE.BufferGeometry | null)[]>(
    new Array(SPHERE_COUNT).fill(null)
  )
  const lineMatRefs = useRef<(THREE.LineBasicMaterial | null)[]>(
    new Array(SPHERE_COUNT).fill(null)
  )

  // Generate initial spiral data (used for initial positions)
  const spiralData = useMemo(() => {
    const data: Array<{ x: number; y: number; z: number; spiral: number }> = []
    for (let s = 0; s < 2; s++) {
      const offset = s * Math.PI // second spiral offset by PI
      for (let i = 0; i < SPHERE_COUNT; i++) {
        const angle = (i / 10) * Math.PI * 2 + offset
        const y = i * 0.3 - (SPHERE_COUNT * 0.3) / 2 // centered vertically
        data.push({
          x: Math.cos(angle) * BASE_RADIUS,
          y,
          z: Math.sin(angle) * BASE_RADIUS,
          spiral: s,
        })
      }
    }
    return data
  }, [])

  useFrame((_, delta) => {
    const { scrollProgress } = useStore.getState()

    if (!groupRef.current) return

    // ---- Visibility: visible between 0.72 and 0.91 ----
    const visible = scrollProgress > 0.72 && scrollProgress < 0.91
    groupRef.current.visible = visible
    if (!visible) return

    const time = performance.now() * 0.001

    // ---- Fade in from 0.72 to 0.76, fade out from 0.88 to 0.91 ----
    let opacity = 1
    if (scrollProgress < 0.76) {
      opacity = Math.max(0, Math.min(1, (scrollProgress - 0.72) / 0.04))
    } else if (scrollProgress > 0.88) {
      opacity = Math.max(0, Math.min(1, 1 - (scrollProgress - 0.88) / 0.03))
    }

    // Apply fade via scale (fade in/out effect)
    const fadeScale = 0.5 + opacity * 0.5
    groupRef.current.scale.setScalar(fadeScale)

    // ---- DNA rotation ----
    if (helixGroupRef.current) {
      helixGroupRef.current.rotation.y += delta * 0.15
    }

    // ---- Unwinding: map 0.75-0.88 to radius multiplier 1.0 -> 1.5 ----
    const unwindT = Math.max(
      0,
      Math.min(1, (scrollProgress - 0.75) / (0.88 - 0.75))
    )
    const currentRadius = BASE_RADIUS * (1.0 + unwindT * 0.5)

    // ---- Update sphere positions based on current radius ----
    for (let s = 0; s < 2; s++) {
      const offset = s * Math.PI
      for (let i = 0; i < SPHERE_COUNT; i++) {
        const idx = s * SPHERE_COUNT + i
        const ref = instanceRefs.current[idx]
        if (!ref) continue
        const angle = (i / 10) * Math.PI * 2 + offset
        const y = i * 0.3 - (SPHERE_COUNT * 0.3) / 2
        const x = Math.cos(angle) * currentRadius
        const z = Math.sin(angle) * currentRadius

        ref.position.set(x, y, z)

        // Pulse scale: wave climbing from bottom
        const pulse = 1 + 0.15 * Math.sin(i * 0.5 + time * 2)
        ref.scale.setScalar(pulse)
      }
    }

    // ---- Update connecting lines ----
    for (let i = 0; i < SPHERE_COUNT; i++) {
      const sphereA = instanceRefs.current[i] // spiral 0, index i
      const sphereB = instanceRefs.current[SPHERE_COUNT + i] // spiral 1, index i
      const geom = lineGeomRefs.current[i]
      const mat = lineMatRefs.current[i]

      if (sphereA && sphereB && geom) {
        const posAttr = geom.getAttribute('position') as THREE.BufferAttribute
        if (posAttr) {
          const arr = posAttr.array as Float32Array
          arr[0] = sphereA.position.x
          arr[1] = sphereA.position.y
          arr[2] = sphereA.position.z
          arr[3] = sphereB.position.x
          arr[4] = sphereB.position.y
          arr[5] = sphereB.position.z
          posAttr.needsUpdate = true
        }
      }

      if (mat) {
        mat.opacity = 0.12 * opacity
      }
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, -170]}>
      {/* Local lights */}
      <ambientLight intensity={0.4} />
      <pointLight
        position={[0, 5, 2]}
        color="#a78bfa"
        intensity={1.5}
        distance={12}
      />

      {/* DNA double helix group (rotates) */}
      <group ref={helixGroupRef}>
        {/* Spiral 0: white spheres */}
        <Instances limit={SPHERE_COUNT}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="white" />
          {spiralData
            .filter((d) => d.spiral === 0)
            .map((d, i) => (
              <Instance
                key={`s0-${i}`}
                ref={(el) => {
                  instanceRefs.current[i] =
                    el as unknown as THREE.InstancedMesh | null
                }}
                position={[d.x, d.y, d.z]}
              />
            ))}
        </Instances>

        {/* Spiral 1: violet spheres */}
        <Instances limit={SPHERE_COUNT}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#a78bfa" />
          {spiralData
            .filter((d) => d.spiral === 1)
            .map((d, i) => (
              <Instance
                key={`s1-${i}`}
                ref={(el) => {
                  instanceRefs.current[SPHERE_COUNT + i] =
                    el as unknown as THREE.InstancedMesh | null
                }}
                position={[d.x, d.y, d.z]}
              />
            ))}
        </Instances>

        {/* Connecting lines between corresponding spheres */}
        <ConnectingLines
          lineGeomRefs={lineGeomRefs}
          lineMatRefs={lineMatRefs}
        />
      </group>

      {/* Local nebula particles */}
      <NebulaParticles />
    </group>
  )
}
