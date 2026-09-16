'use client'

import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
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

// ---------- Intelligence sphere shaders ----------
const intelligenceVertexShader = `
${SIMPLEX_NOISE_GLSL}

uniform float uTime;
varying float vDisplacement;
varying vec3 vNormal;

void main() {
  vNormal = normal;

  // Displacement along normals using simplex noise
  float noiseAmp = 0.15 + 0.08 * sin(uTime * 0.7);
  float noise = snoise(position * 2.0 + uTime * 0.3);
  vDisplacement = noise;

  vec3 displaced = position + normal * noise * noiseAmp;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`

const intelligenceFragmentShader = `
varying float vDisplacement;
varying vec3 vNormal;

void main() {
  // Violet/indigo gradient based on displacement
  vec3 violet = vec3(0.388, 0.4, 0.945);   // #6366f1
  vec3 indigo = vec3(0.655, 0.545, 0.98);   // #a78bfa
  vec3 deep   = vec3(0.192, 0.18, 0.506);   // #312e81

  float t = vDisplacement * 0.5 + 0.5; // normalize to 0-1
  vec3 color = mix(deep, mix(violet, indigo, t), t);

  // Simple fresnel-like rim lighting from normal
  float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
  color += violet * rim * 0.3;

  gl_FragColor = vec4(color, 1.0);
}
`

// ---------- Sphere configuration ----------
interface SphereConfig {
  name: string
  position: [number, number, number]
  radius: number
  floatFreq: number
  floatAmplitude: number
  floatPhase: number
  rotAxisX: number
  rotAxisY: number
  rotAxisZ: number
  rotationSpeed: number
}

const SPHERE_CONFIGS: SphereConfig[] = [
  {
    name: 'Intelligence',
    position: [-3, 0.5, 0],
    radius: 1.0,
    floatFreq: 0.8,
    floatAmplitude: 0.15,
    floatPhase: 0,
    rotAxisX: 0.3, rotAxisY: 1, rotAxisZ: 0.2,
    rotationSpeed: 0.15,
  },
  {
    name: 'Automation',
    position: [2.5, -0.8, -3],
    radius: 0.6,
    floatFreq: 1.1,
    floatAmplitude: 0.12,
    floatPhase: 1.2,
    rotAxisX: 0.5, rotAxisY: 0.8, rotAxisZ: 0.3,
    rotationSpeed: 0.2,
  },
  {
    name: 'Design',
    position: [-1.5, 1.5, 2],
    radius: 0.8,
    floatFreq: 0.9,
    floatAmplitude: 0.18,
    floatPhase: 2.5,
    rotAxisX: 0.2, rotAxisY: 0.6, rotAxisZ: 1,
    rotationSpeed: 0.12,
  },
  {
    name: 'Engineering',
    position: [3.5, 1.0, -5],
    radius: 0.5,
    floatFreq: 1.3,
    floatAmplitude: 0.1,
    floatPhase: 3.8,
    rotAxisX: 1, rotAxisY: 0.3, rotAxisZ: 0.5,
    rotationSpeed: 0.25,
  },
  {
    name: 'decorative1',
    position: [-4, -1, -2],
    radius: 0.2,
    floatFreq: 1.5,
    floatAmplitude: 0.08,
    floatPhase: 5.0,
    rotAxisX: 0.7, rotAxisY: 0.7, rotAxisZ: 0,
    rotationSpeed: 0.3,
  },
  {
    name: 'decorative2',
    position: [1, 2.5, -6],
    radius: 0.15,
    floatFreq: 1.7,
    floatAmplitude: 0.06,
    floatPhase: 0.8,
    rotAxisX: 0, rotAxisY: 1, rotAxisZ: 0.5,
    rotationSpeed: 0.35,
  },
]

// Constellation line pairs (indices into SPHERE_CONFIGS)
// Intelligence(0)->Automation(1), Automation(1)->Design(2),
// Design(2)->Engineering(3), Intelligence(0)->Design(2)
const CONSTELLATION_PAIRS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 2],
]

// ---------- Main UniverseScene component ----------
export default function UniverseScene() {
  const groupRef = useRef<THREE.Group>(null)

  // Refs for each sphere mesh (indexed by SPHERE_CONFIGS order)
  const sphereRefs = useRef<(THREE.Mesh | null)[]>(new Array(6).fill(null))

  // Ref for the Intelligence shader material
  const intelligenceMatRef = useRef<THREE.ShaderMaterial>(null)

  // Refs for constellation line geometries and materials
  const lineGeomRefs = useRef<(THREE.BufferGeometry | null)[]>(new Array(4).fill(null))
  const lineMatRefs = useRef<(THREE.LineBasicMaterial | null)[]>(new Array(4).fill(null))

  // Pre-compute normalized rotation axes (stable, computed once)
  const rotationAxes = useMemo(() =>
    SPHERE_CONFIGS.map((cfg) =>
      new THREE.Vector3(cfg.rotAxisX, cfg.rotAxisY, cfg.rotAxisZ).normalize()
    ), []
  )

  // Intelligence sphere shader uniforms (stable reference)
  const intelligenceUniforms = useMemo(
    () => ({ uTime: { value: 0 } }),
    []
  )

  // Pre-allocate position buffers for constellation lines
  const lineBuffers = useMemo(() =>
    CONSTELLATION_PAIRS.map(() => new Float32Array(6)), // 2 points * 3 components
    []
  )

  // Sphere geometry instances (memoized)
  const sphereGeometries = useMemo(() =>
    SPHERE_CONFIGS.map((cfg, i) =>
      i === 0
        ? new THREE.SphereGeometry(cfg.radius, 64, 64)
        : new THREE.SphereGeometry(cfg.radius, 32, 32)
    ), []
  )

  // Stable ref callbacks
  const setSphereRef = useCallback((index: number) => (el: THREE.Mesh | null) => {
    sphereRefs.current[index] = el
  }, [])

  const setLineGeomRef = useCallback((index: number) => (el: THREE.BufferGeometry | null) => {
    lineGeomRefs.current[index] = el
  }, [])

  const setLineMatRef = useCallback((index: number) => (el: THREE.LineBasicMaterial | null) => {
    lineMatRefs.current[index] = el
  }, [])

  useFrame((_, delta) => {
    const { scrollProgress } = useStore.getState()

    if (!groupRef.current) return

    // ---- Visibility ----
    const visible = scrollProgress > 0.08 && scrollProgress < 0.35
    groupRef.current.visible = visible
    if (!visible) return

    const time = performance.now() * 0.001

    // ---- Fade in: scale 0.5 -> 1 as scrollProgress 0.10 -> 0.15 ----
    let scale = 1
    if (scrollProgress < 0.15) {
      const t = Math.max(0, Math.min(1, (scrollProgress - 0.10) / 0.05))
      scale = 0.5 + t * 0.5
    }

    // ---- Fade out: scale down as scrollProgress 0.28 -> 0.33 ----
    if (scrollProgress > 0.28) {
      const t = Math.min(1, (scrollProgress - 0.28) / 0.05)
      scale *= 1 - t * 0.5
    }

    groupRef.current.scale.setScalar(scale)

    // ---- Update Intelligence shader time ----
    if (intelligenceMatRef.current) {
      intelligenceUniforms.uTime.value += delta
    }

    // ---- Animate each sphere: float + rotate ----
    for (let i = 0; i < SPHERE_CONFIGS.length; i++) {
      const mesh = sphereRefs.current[i]
      if (!mesh) continue
      const cfg = SPHERE_CONFIGS[i]
      mesh.position.y = cfg.position[1] + Math.sin(time * cfg.floatFreq + cfg.floatPhase) * cfg.floatAmplitude
      mesh.rotateOnAxis(rotationAxes[i], delta * cfg.rotationSpeed)
    }

    // ---- Update constellation line positions & opacity ----
    const opacity = 0.05 + Math.sin(time * 1.5) * 0.05 + 0.05 // range ~0.05-0.15

    for (let i = 0; i < CONSTELLATION_PAIRS.length; i++) {
      const [a, b] = CONSTELLATION_PAIRS[i]
      const sphereA = sphereRefs.current[a]
      const sphereB = sphereRefs.current[b]
      const geom = lineGeomRefs.current[i]
      const mat = lineMatRefs.current[i]

      if (sphereA && sphereB && geom) {
        const buf = lineBuffers[i]
        buf[0] = sphereA.position.x
        buf[1] = sphereA.position.y
        buf[2] = sphereA.position.z
        buf[3] = sphereB.position.x
        buf[4] = sphereB.position.y
        buf[5] = sphereB.position.z

        const posAttr = geom.getAttribute('position') as THREE.BufferAttribute
        if (posAttr) {
          posAttr.set(buf)
          posAttr.needsUpdate = true
        }
      }

      if (mat) {
        mat.opacity = opacity
      }
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, -30]}>
      {/* Lights local to this world */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 3, 0]} color="#6366f1" intensity={2} distance={15} />

      {/* Intelligence sphere (custom shader, index 0) */}
      <mesh
        ref={setSphereRef(0)}
        position={SPHERE_CONFIGS[0].position}
        geometry={sphereGeometries[0]}
      >
        <shaderMaterial
          ref={intelligenceMatRef}
          vertexShader={intelligenceVertexShader}
          fragmentShader={intelligenceFragmentShader}
          uniforms={intelligenceUniforms}
        />
      </mesh>

      {/* Automation sphere (index 1) */}
      <mesh
        ref={setSphereRef(1)}
        position={SPHERE_CONFIGS[1].position}
        geometry={sphereGeometries[1]}
      >
        <meshStandardMaterial color="#06b6d4" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Design sphere (index 2) */}
      <mesh
        ref={setSphereRef(2)}
        position={SPHERE_CONFIGS[2].position}
        geometry={sphereGeometries[2]}
      >
        <meshStandardMaterial color="#ec4899" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Engineering sphere (index 3) */}
      <mesh
        ref={setSphereRef(3)}
        position={SPHERE_CONFIGS[3].position}
        geometry={sphereGeometries[3]}
      >
        <meshBasicMaterial color="white" wireframe />
      </mesh>

      {/* Decorative sphere 1 (index 4) */}
      <mesh
        ref={setSphereRef(4)}
        position={SPHERE_CONFIGS[4].position}
        geometry={sphereGeometries[4]}
      >
        <meshBasicMaterial color="white" transparent opacity={0.3} />
      </mesh>

      {/* Decorative sphere 2 (index 5) */}
      <mesh
        ref={setSphereRef(5)}
        position={SPHERE_CONFIGS[5].position}
        geometry={sphereGeometries[5]}
      >
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.2} />
      </mesh>

      {/* Constellation Lines (raw THREE.Line for easy buffer updates) */}
      {CONSTELLATION_PAIRS.map(([a, b], i) => (
        <line key={i}>
          <bufferGeometry
            ref={setLineGeomRef(i)}
            attach="geometry"
          >
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  ...SPHERE_CONFIGS[a].position,
                  ...SPHERE_CONFIGS[b].position,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            ref={setLineMatRef(i)}
            attach="material"
            color="white"
            transparent
            opacity={0.1}
          />
        </line>
      ))}
    </group>
  )
}
