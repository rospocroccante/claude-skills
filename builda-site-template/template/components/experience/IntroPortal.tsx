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

// ---------- Vortex shader ----------
const vortexVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const vortexFragmentShader = `
${SIMPLEX_NOISE_GLSL}

uniform float uTime;
uniform float uActivation;
varying vec2 vUv;

void main() {
  vec2 center = vUv - 0.5;
  float dist = length(center);
  float angle = atan(center.y, center.x);

  // Spiral noise
  float speed = 1.0 + uActivation * 3.0;
  float noise = snoise(vec3(
    cos(angle) * 2.0 + dist * 3.0,
    sin(angle) * 2.0 - uTime * speed,
    uTime * 0.5
  ));

  // Color: black at center, violet at edges
  vec3 violet = vec3(0.388, 0.4, 0.945);   // #6366f1
  vec3 indigo = vec3(0.192, 0.18, 0.506);
  vec3 color = mix(vec3(0.0), mix(indigo, violet, noise * 0.5 + 0.5), dist * 1.5);

  // Fade at edges
  float alpha = smoothstep(1.0, 0.3, dist) * (0.6 + uActivation * 0.4);

  gl_FragColor = vec4(color, alpha);
}
`

// ---------- Orbit data for particles (generated once) ----------
interface OrbitDatum {
  radius: number
  speed: number
  offset: number
  inclination: number
  y: number
}

function generateOrbitData(count: number): OrbitDatum[] {
  const data: OrbitDatum[] = []
  for (let i = 0; i < count; i++) {
    data.push({
      radius: 3.5 + Math.random() * 2,
      speed: 0.2 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
      inclination: (Math.random() - 0.5) * 0.5,
      y: (Math.random() - 0.5) * 1.5,
    })
  }
  return data
}

// ---------- Orbiting Particles sub-component ----------
function OrbitingParticles({ orbitData }: { orbitData: OrbitDatum[] }) {
  const instancesRef = useRef<(THREE.InstancedMesh | null)[]>([])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    orbitData.forEach((orbit, i) => {
      const ref = instancesRef.current[i]
      if (!ref) return
      const t = time * orbit.speed + orbit.offset
      const x = Math.cos(t) * orbit.radius
      const z = Math.sin(t) * orbit.radius * 0.3
      const y = orbit.y + Math.sin(t * 0.7) * orbit.inclination
      ref.position.set(x, y, z)
    })
  })

  return (
    <Instances limit={25}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshBasicMaterial color="white" />
      {orbitData.map((_, i) => (
        <Instance
          key={i}
          ref={(el) => { instancesRef.current[i] = el as unknown as THREE.InstancedMesh | null }}
        />
      ))}
    </Instances>
  )
}

// ---------- Main IntroPortal component ----------
export default function IntroPortal() {
  const groupRef = useRef<THREE.Group>(null)
  const torusRef = useRef<THREE.Mesh>(null)
  const vortexMatRef = useRef<THREE.ShaderMaterial>(null)

  // Stable orbit data
  const orbitData = useMemo(() => generateOrbitData(25), [])

  // Shader uniforms (stable reference)
  const vortexUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uActivation: { value: 0 },
    }),
    []
  )

  useFrame((_, delta) => {
    const { scrollProgress } = useStore.getState()
    const time = performance.now() * 0.001

    // ---------- Visibility ----------
    if (groupRef.current) {
      groupRef.current.visible = scrollProgress < 0.15
    }
    if (!groupRef.current?.visible) return

    // ---------- Torus ring animation ----------
    if (torusRef.current) {
      torusRef.current.rotation.z += delta * 0.3
      torusRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.03)
    }

    // ---------- Vortex shader ----------
    if (vortexMatRef.current) {
      vortexMatRef.current.uniforms.uTime.value += delta

      // Activation ramp: 0 when progress <= 0.06, 1 when progress >= 0.08
      const targetActivation = scrollProgress > 0.06
        ? Math.min(1, (scrollProgress - 0.06) / 0.02)
        : 0
      const currentActivation = vortexMatRef.current.uniforms.uActivation.value
      vortexMatRef.current.uniforms.uActivation.value +=
        (targetActivation - currentActivation) * Math.min(1, delta * 4)
    }

    // ---------- Fade out when progress > 0.10 ----------
    if (groupRef.current) {
      const fadeStart = 0.10
      const fadeEnd = 0.14
      if (scrollProgress > fadeStart) {
        const fade = 1 - Math.min(1, (scrollProgress - fadeStart) / (fadeEnd - fadeStart))
        groupRef.current.children.forEach((child) => {
          if ((child as THREE.Mesh).material) {
            const mat = (child as THREE.Mesh).material as THREE.Material
            if ('opacity' in mat) {
              ;(mat as THREE.MeshBasicMaterial).opacity = fade * 0.6
            }
          }
        })
        // Scale down slightly
        groupRef.current.scale.setScalar(1 + (1 - fade) * 0.1)
      }
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Torus Ring */}
      <mesh ref={torusRef}>
        <torusGeometry args={[3, 0.02, 16, 100]} />
        <meshBasicMaterial
          color="#6366f1"
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Vortex Portal */}
      <mesh>
        <circleGeometry args={[2.8, 64]} />
        <shaderMaterial
          ref={vortexMatRef}
          vertexShader={vortexVertexShader}
          fragmentShader={vortexFragmentShader}
          uniforms={vortexUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Orbiting Spheres */}
      <OrbitingParticles orbitData={orbitData} />
    </group>
  )
}
