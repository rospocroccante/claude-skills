'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '@/lib/store'

// ---------- Simplex noise GLSL (Ashima Arts, MIT License) ----------
const SIMPLEX_NOISE_GLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
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
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`

// ---------- Utility: compute fade for a sub-range ----------
function computeFade(
  scrollProgress: number,
  fadeInStart: number,
  fullyVisible: number,
  fadeOutStart: number,
  fadeOutEnd: number,
): number {
  if (scrollProgress < fadeInStart) return 0
  if (scrollProgress < fullyVisible) {
    return (scrollProgress - fadeInStart) / (fullyVisible - fadeInStart)
  }
  if (scrollProgress < fadeOutStart) return 1
  if (scrollProgress < fadeOutEnd) {
    return 1 - (scrollProgress - fadeOutStart) / (fadeOutEnd - fadeOutStart)
  }
  return 0
}

// ---------- AI Blob Shaders ----------
const blobVertexShader = `
${SIMPLEX_NOISE_GLSL}

uniform float uTime;
uniform float uAmplitude;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normal;
  vPosition = position;

  // 3 octaves of simplex noise for displacement
  float n1 = snoise(position * 0.8 + uTime * 0.3) * 0.5;
  float n2 = snoise(position * 1.6 + uTime * 0.5) * 0.25;
  float n3 = snoise(position * 3.2 + uTime * 0.7) * 0.125;
  float displacement = (n1 + n2 + n3) * uAmplitude;

  vec3 newPos = position + normal * displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
`

const blobFragmentShader = `
${SIMPLEX_NOISE_GLSL}

uniform float uTime;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // Noise-based gradient between violet and indigo
  float n = snoise(vPosition * 1.2 + uTime * 0.2) * 0.5 + 0.5;
  vec3 violet = vec3(0.388, 0.4, 0.945);   // #6366f1
  vec3 indigo = vec3(0.541, 0.369, 0.976);  // #8a5ff9
  vec3 color = mix(indigo, violet, n);

  // Simple lighting based on normal
  float light = dot(normalize(vNormal), normalize(vec3(1.0, 1.0, 1.0))) * 0.5 + 0.5;
  color *= 0.6 + light * 0.4;

  gl_FragColor = vec4(color, 1.0);
}
`

// ---------- Object 1: AI Blob ----------
function AIBlob() {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: 0 },
    }),
    []
  )

  useFrame((_, delta) => {
    const { scrollProgress } = useStore.getState()
    const fade = computeFade(scrollProgress, 0.28, 0.30, 0.36, 0.39)

    if (meshRef.current) {
      meshRef.current.scale.setScalar(Math.max(0.001, fade))
      meshRef.current.visible = fade > 0.001
    }

    if (!matRef.current || fade < 0.001) return
    const time = matRef.current.uniforms.uTime.value + delta
    matRef.current.uniforms.uTime.value = time
    matRef.current.uniforms.uAmplitude.value = 0.15 + Math.sin(time * 0.8) * 0.08

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15
    }
  })

  return (
    <mesh ref={meshRef} position={[-3, 0, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={blobVertexShader}
        fragmentShader={blobFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

// ---------- Object 2: Automation Gyroscope ----------
function AutomationGyroscope() {
  const groupRef = useRef<THREE.Group>(null)
  const torus1Ref = useRef<THREE.Mesh>(null)
  const torus2Ref = useRef<THREE.Mesh>(null)
  const torus3Ref = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    const { scrollProgress } = useStore.getState()
    const fade = computeFade(scrollProgress, 0.34, 0.36, 0.42, 0.45)

    if (groupRef.current) {
      groupRef.current.scale.setScalar(Math.max(0.001, fade))
      groupRef.current.visible = fade > 0.001
    }

    if (fade < 0.001) return
    if (torus1Ref.current) torus1Ref.current.rotation.x += delta * 0.8
    if (torus2Ref.current) torus2Ref.current.rotation.y += delta * 0.6
    if (torus3Ref.current) torus3Ref.current.rotation.z += delta * 0.4
  })

  return (
    <group ref={groupRef} position={[3, 0, -5]}>
      <mesh ref={torus1Ref}>
        <torusGeometry args={[1.2, 0.02, 16, 64]} />
        <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.4} />
      </mesh>
      <mesh ref={torus2Ref}>
        <torusGeometry args={[1.5, 0.02, 16, 64]} />
        <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.4} />
      </mesh>
      <mesh ref={torus3Ref}>
        <torusGeometry args={[1.8, 0.02, 16, 64]} />
        <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

// ---------- Object 3: SaaS Cube ----------
interface CubeGridPosition {
  x: number
  y: number
  z: number
  index: number
}

function SaaSCube() {
  const groupRef = useRef<THREE.Group>(null)
  const instancesRef = useRef<(THREE.InstancedMesh | null)[]>([])

  const gridPositions = useMemo<CubeGridPosition[]>(() => {
    const positions: CubeGridPosition[] = []
    let idx = 0
    for (let ix = 0; ix < 5; ix++) {
      for (let iy = 0; iy < 4; iy++) {
        for (let iz = 0; iz < 5; iz++) {
          positions.push({
            x: (ix - 2) * 0.4,
            y: (iy - 1.5) * 0.4,
            z: (iz - 2) * 0.4,
            index: idx++,
          })
        }
      }
    }
    return positions
  }, [])

  useFrame(({ clock }) => {
    const { scrollProgress } = useStore.getState()
    const fade = computeFade(scrollProgress, 0.40, 0.42, 0.48, 0.51)

    if (groupRef.current) {
      groupRef.current.scale.setScalar(Math.max(0.001, fade))
      groupRef.current.visible = fade > 0.001
    }

    if (fade < 0.001) return

    const time = clock.getElapsedTime()
    gridPositions.forEach((pos) => {
      const ref = instancesRef.current[pos.index]
      if (!ref) return
      const oscillation = Math.sin(time + pos.index * 0.1) * 0.05
      ref.position.set(pos.x + oscillation, pos.y + oscillation, pos.z + oscillation)
    })
  })

  return (
    <group ref={groupRef} position={[-2, 0, -12]}>
      <Instances limit={100}>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.1} />
        {gridPositions.map((pos) => (
          <Instance
            key={pos.index}
            ref={(el) => {
              instancesRef.current[pos.index] = el as unknown as THREE.InstancedMesh | null
            }}
            position={[pos.x, pos.y, pos.z]}
          />
        ))}
      </Instances>
    </group>
  )
}

// ---------- Object 4: Web DNA Helix ----------
interface HelixSphereData {
  x: number
  y: number
  z: number
  index: number
  spiral: number
}

function WebDNAHelix() {
  const outerRef = useRef<THREE.Group>(null)
  const helixRef = useRef<THREE.Group>(null)
  const instancesRef = useRef<(THREE.InstancedMesh | null)[]>([])

  const sphereData = useMemo<HelixSphereData[]>(() => {
    const data: HelixSphereData[] = []
    let idx = 0
    // Spiral 1
    for (let i = 0; i < 30; i++) {
      data.push({
        x: Math.cos(i * 0.4) * 1,
        y: i * 0.25 - 3.75,
        z: Math.sin(i * 0.4) * 1,
        index: idx++,
        spiral: 0,
      })
    }
    // Spiral 2 (offset by PI)
    for (let i = 0; i < 30; i++) {
      data.push({
        x: Math.cos(i * 0.4 + Math.PI) * 1,
        y: i * 0.25 - 3.75,
        z: Math.sin(i * 0.4 + Math.PI) * 1,
        index: idx++,
        spiral: 1,
      })
    }
    return data
  }, [])

  useFrame(({ clock }, delta) => {
    const { scrollProgress } = useStore.getState()
    const fade = computeFade(scrollProgress, 0.46, 0.48, 0.52, 0.55)

    if (outerRef.current) {
      outerRef.current.scale.setScalar(Math.max(0.001, fade))
      outerRef.current.visible = fade > 0.001
    }

    if (fade < 0.001) return

    const time = clock.getElapsedTime()

    // Rotate the whole helix
    if (helixRef.current) {
      helixRef.current.rotation.y += delta * 0.3
    }

    // Pulse each sphere's scale
    sphereData.forEach((s) => {
      const ref = instancesRef.current[s.index]
      if (!ref) return
      const localI = s.spiral === 0 ? s.index : s.index - 30
      const pulse = 0.8 + Math.sin(localI * 0.2 + time * 3) * 0.3
      ref.scale.set(pulse, pulse, pulse)
    })
  })

  return (
    <group ref={outerRef} position={[3, 0, -18]}>
      <group ref={helixRef}>
        <Instances limit={60}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshBasicMaterial color="#ec4899" />
          {sphereData.map((s) => (
            <Instance
              key={s.index}
              ref={(el) => {
                instancesRef.current[s.index] = el as unknown as THREE.InstancedMesh | null
              }}
              position={[s.x, s.y, s.z]}
            />
          ))}
        </Instances>
      </group>
    </group>
  )
}

// ---------- Main ServiceOrbs component ----------
export default function ServiceOrbs() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    const { scrollProgress } = useStore.getState()

    // Group visibility
    if (groupRef.current) {
      groupRef.current.visible = scrollProgress > 0.25 && scrollProgress < 0.58
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, -70]}>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} />
      <AIBlob />
      <AutomationGyroscope />
      <SaaSCube />
      <WebDNAHelix />
    </group>
  )
}
