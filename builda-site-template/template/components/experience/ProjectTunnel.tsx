'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '@/lib/store'
import { PROJECTS } from '@/lib/constants'

// ---------- Tunnel Shaders ----------
const tunnelVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const tunnelFragmentShader = `
uniform float uTime;
varying vec2 vUv;

void main() {
  // Flowing lines along the tunnel
  float lineY = sin(vUv.y * 80.0 - uTime * 4.0);
  lineY = smoothstep(0.95, 1.0, lineY); // thin bright lines

  // Cross lines (rings)
  float lineX = sin(vUv.x * 40.0);
  lineX = smoothstep(0.97, 1.0, lineX) * 0.3;

  float lines = max(lineY, lineX);

  // Color: indigo/violet
  vec3 color1 = vec3(0.388, 0.4, 0.945); // indigo
  vec3 color2 = vec3(0.655, 0.545, 0.984); // violet
  vec3 color = mix(color1, color2, vUv.y);

  float alpha = lines * 0.6;
  if (alpha < 0.01) discard;

  gl_FragColor = vec4(color, alpha);
}
`

// ---------- Project Window Shaders ----------
const windowVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const windowFragmentShader = `
uniform float uTime;
uniform vec3 uColor;
uniform float uActive;
varying vec2 vUv;

void main() {
  vec2 center = vUv - 0.5;
  float dist = length(center);

  // Radial gradient with project color
  float glow = smoothstep(0.8, 0.0, dist) * (0.3 + uActive * 0.7);

  // Animated noise pattern
  float noise = sin(vUv.x * 10.0 + uTime) * sin(vUv.y * 10.0 + uTime * 0.7) * 0.5 + 0.5;

  vec3 color = uColor * glow + uColor * noise * 0.1;
  float alpha = glow * 0.8 + 0.05;

  gl_FragColor = vec4(color, alpha);
}
`

// ---------- Utility: hex color to THREE.Color vec3 ----------
function hexToVec3(hex: string): THREE.Color {
  return new THREE.Color(hex)
}

// ---------- Project window config ----------
const PROJECT_WINDOWS = [
  { position: [-5, 0, -5] as const, rotationY: 0.3, subStart: 0.54, subEnd: 0.60 },
  { position: [5, 0, -15] as const, rotationY: -0.3, subStart: 0.60, subEnd: 0.66 },
  { position: [-5, 0, -25] as const, rotationY: 0.3, subStart: 0.66, subEnd: 0.72 },
  { position: [5, 0, -35] as const, rotationY: -0.3, subStart: 0.72, subEnd: 0.75 },
]

// ---------- Single Project Window ----------
function ProjectWindow({ index }: { index: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const config = PROJECT_WINDOWS[index]
  const project = PROJECTS[index]

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: hexToVec3(project.color) },
      uActive: { value: 0 },
    }),
    [project.color]
  )

  useFrame((_, delta) => {
    if (!matRef.current) return

    const { scrollProgress } = useStore.getState()
    matRef.current.uniforms.uTime.value += delta

    // Calculate active state based on sub-range
    const mid = (config.subStart + config.subEnd) / 2
    const halfRange = (config.subEnd - config.subStart) / 2
    const distToMid = Math.abs(scrollProgress - mid)
    const active = Math.max(0, Math.min(1, 1 - distToMid / halfRange))
    matRef.current.uniforms.uActive.value = active

    // Update store active project
    if (active > 0.5) {
      useStore.getState().setActiveProject(index)
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={[config.position[0], config.position[1], config.position[2]]}
      rotation={[0, config.rotationY, 0]}
    >
      <planeGeometry args={[4, 6]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={windowVertexShader}
        fragmentShader={windowFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ---------- Main ProjectTunnel Component ----------
export default function ProjectTunnel() {
  const groupRef = useRef<THREE.Group>(null)
  const tunnelMatRef = useRef<THREE.ShaderMaterial>(null)

  // Tunnel curve
  const tunnelCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, 0, 10),
        new THREE.Vector3(1, 0.5, 0),
        new THREE.Vector3(-0.5, -0.3, -10),
        new THREE.Vector3(0.3, 0.2, -20),
        new THREE.Vector3(-0.3, -0.1, -30),
        new THREE.Vector3(0, 0, -40),
      ],
      false,
      'catmullrom',
      0.5
    )
  }, [])

  // Tunnel shader uniforms
  const tunnelUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  )

  useFrame((_, delta) => {
    const { scrollProgress } = useStore.getState()

    if (!groupRef.current) return

    // Visibility: 0.48 to 0.78
    const visible = scrollProgress > 0.48 && scrollProgress < 0.78
    groupRef.current.visible = visible

    if (!visible) return

    // Scale fade in from 0.48 to 0.52, fade out from 0.75 to 0.78
    let scale = 1
    if (scrollProgress < 0.52) {
      scale = (scrollProgress - 0.48) / (0.52 - 0.48)
    } else if (scrollProgress > 0.75) {
      scale = 1 - (scrollProgress - 0.75) / (0.78 - 0.75)
    }
    scale = Math.max(0.001, Math.min(1, scale))
    groupRef.current.scale.setScalar(scale)

    // Update tunnel shader time
    if (tunnelMatRef.current) {
      tunnelMatRef.current.uniforms.uTime.value += delta
    }

    // Clear active project when outside main range
    if (scrollProgress < 0.52 || scrollProgress > 0.75) {
      useStore.getState().setActiveProject(null)
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, -120]}>
      {/* Tunnel Structure */}
      <mesh>
        <tubeGeometry args={[tunnelCurve, 128, 8, 32, false]} />
        <shaderMaterial
          ref={tunnelMatRef}
          vertexShader={tunnelVertexShader}
          fragmentShader={tunnelFragmentShader}
          uniforms={tunnelUniforms}
          transparent
          side={THREE.BackSide}
        />
      </mesh>

      {/* Project Windows */}
      {PROJECTS.map((_, index) => (
        <ProjectWindow key={index} index={index} />
      ))}
    </group>
  )
}
