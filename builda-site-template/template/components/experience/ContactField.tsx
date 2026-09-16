'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '@/lib/store'

// ---------- Constants ----------
const PARTICLE_COUNT = 200

// ---------- Vertex Shader ----------
const galaxyVertexShader = `
attribute float aSize;
attribute float aSpeed;
uniform float uTime;
uniform vec2 uMouse;
varying float vRadius;
varying float vSize;

void main() {
  vec3 pos = position;

  // Spiral motion
  float angle = atan(pos.z, pos.x);
  float radius = length(pos.xz);
  angle += uTime * 0.1 * aSpeed;
  radius += sin(uTime * aSpeed + radius) * 0.1;

  pos.x = cos(angle) * radius;
  pos.z = sin(angle) * radius;
  pos.y += sin(uTime * aSpeed * 2.0 + radius) * 0.05;

  // Mouse interaction
  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  vec4 proj = projectionMatrix * mvPos;
  vec2 screen = proj.xy / proj.w;
  vec2 mouseDir = screen - uMouse;
  float mouseDist = length(mouseDir);
  if (mouseDist < 0.4) {
    float force = (0.4 - mouseDist) / 0.4;
    pos.xz += normalize(mouseDir) * force * 1.5;
  }

  mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aSize * (200.0 / -mvPos.z);
  gl_Position = projectionMatrix * mvPos;

  vRadius = radius;
  vSize = aSize;
}
`

// ---------- Fragment Shader ----------
const galaxyFragmentShader = `
varying float vRadius;
varying float vSize;

void main() {
  float dist = length(gl_PointCoord - 0.5);
  float circle = smoothstep(0.5, 0.2, dist);
  if (circle < 0.01) discard;

  // Color: white center, violet mid, indigo edge
  vec3 white = vec3(1.0);
  vec3 violet = vec3(0.655, 0.545, 0.984);
  vec3 indigo = vec3(0.388, 0.4, 0.945);

  float t = clamp(vRadius / 8.0, 0.0, 1.0);
  vec3 color = mix(white, mix(violet, indigo, t), t);

  float alpha = circle * mix(0.4, 0.15, t);
  gl_FragColor = vec4(color, alpha);
}
`

// ---------- Main ContactField component ----------
export default function ContactField() {
  const groupRef = useRef<THREE.Group>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const shaderRef = useRef<THREE.ShaderMaterial>(null)
  const portalRef = useRef<THREE.Mesh>(null)

  // Generate galaxy particle data
  const particleData = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)
    const speeds = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 2 + Math.random() * 6 // ring distribution, 2-8 units
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.6 // near-flat disk
      positions[i * 3 + 2] = Math.sin(angle) * radius
      sizes[i] = 1 + Math.random() * 4
      speeds[i] = 0.5 + Math.random() * 1.5
    }

    return { positions, sizes, speeds }
  }, [])

  // Shader uniforms (stable reference)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    []
  )

  useFrame((_, delta) => {
    const { scrollProgress, mouseNormalized } = useStore.getState()

    if (!groupRef.current) return

    // Visibility: visible when scrollProgress > 0.85
    const visible = scrollProgress > 0.85
    groupRef.current.visible = visible
    if (!visible) return

    // Update shader uniforms
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value += delta
      shaderRef.current.uniforms.uMouse.value.set(
        mouseNormalized.x,
        mouseNormalized.y
      )
    }

    // Rotate the galaxy disk slowly
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05
    }

    // Rotate distant portal
    if (portalRef.current) {
      portalRef.current.rotation.z += delta * 0.2
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, -210]}>
      {/* Galaxy Particle Disk */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleData.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-aSize"
            args={[particleData.sizes, 1]}
          />
          <bufferAttribute
            attach="attributes-aSpeed"
            args={[particleData.speeds, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={shaderRef}
          vertexShader={galaxyVertexShader}
          fragmentShader={galaxyFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Distant Portal — visual loop echo */}
      <mesh ref={portalRef} position={[0, 0, -20]}>
        <torusGeometry args={[1, 0.01, 8, 32]} />
        <meshBasicMaterial
          color="#6366f1"
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  )
}
