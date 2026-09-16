'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

// Simplex noise for vertex deformation
const noiseGLSL = `
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
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`

function Blob() {
  const meshRef = useRef<THREE.Mesh>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetRotation = useRef({ x: 0, y: 0 })
  const { viewport } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: 0.3 },
    }),
    []
  )

  const vertexShader = `
    ${noiseGLSL}
    uniform float uTime;
    uniform float uAmplitude;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vDisplacement;

    void main() {
      float noise = snoise(position * 1.5 + uTime * 0.5) * uAmplitude;
      noise += snoise(position * 3.0 + uTime * 0.3) * uAmplitude * 0.3;
      vec3 newPosition = position + normal * noise;
      vDisplacement = noise;
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(newPosition, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `

  const fragmentShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vDisplacement;

    void main() {
      vec3 color1 = vec3(0.176, 0.106, 0.412); // deep purple
      vec3 color2 = vec3(0.388, 0.4, 0.945);   // indigo
      vec3 color3 = vec3(0.05, 0.05, 0.1);      // near black

      // Mix colors based on displacement and normals
      float fresnel = pow(1.0 - abs(dot(normalize(-vPosition), vNormal)), 2.0);
      vec3 baseColor = mix(color1, color2, fresnel);
      baseColor = mix(baseColor, color3, smoothstep(-0.2, 0.3, -vDisplacement));

      // Add specular highlight
      vec3 lightDir = normalize(vec3(1.0, 1.0, 2.0));
      float spec = pow(max(dot(reflect(-lightDir, vNormal), normalize(-vPosition)), 0.0), 32.0);
      baseColor += vec3(0.3, 0.3, 0.4) * spec;

      // Add rim light
      baseColor += vec3(0.388, 0.4, 0.945) * fresnel * 0.5;

      gl_FragColor = vec4(baseColor, 1.0);
    }
  `

  useFrame((state) => {
    if (!meshRef.current) return

    // Update time
    uniforms.uTime.value += 0.003

    // Slow Y rotation
    meshRef.current.rotation.y += 0.001

    // Mouse-based rotation with lerp
    const mouse = state.pointer
    targetRotation.current.x = mouse.y * 0.26 // ±15deg approx
    targetRotation.current.y = mouse.x * 0.26

    meshRef.current.rotation.x +=
      (targetRotation.current.x - meshRef.current.rotation.x) * 0.05
    meshRef.current.rotation.y +=
      (targetRotation.current.y - meshRef.current.rotation.y) * 0.05

    // Hover: increase amplitude
    const isHovering = Math.abs(mouse.x) < 1 && Math.abs(mouse.y) < 1
    const targetAmp = isHovering ? 0.35 : 0.3
    uniforms.uAmplitude.value += (targetAmp - uniforms.uAmplitude.value) * 0.02
  })

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const detail = isMobile ? 10 : 20

  return (
    <mesh ref={meshRef} scale={viewport.width > 10 ? 2.2 : 1.8}>
      <icosahedronGeometry args={[1, detail]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

function OrbitingLight() {
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    if (!lightRef.current) return
    const t = state.clock.elapsedTime * 0.3
    lightRef.current.position.set(Math.cos(t) * 4, Math.sin(t) * 2, Math.sin(t) * 4)
  })

  return <pointLight ref={lightRef} color="#6366f1" intensity={2} distance={10} />
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.3} />
      <OrbitingLight />
      <pointLight position={[0, 0, -5]} color="#ffffff" intensity={1} />
      <Blob />
      <Environment preset="city" />
      <EffectComposer>
        <Bloom
          intensity={0.3}
          luminanceThreshold={0.8}
          luminanceSmoothing={0.9}
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.001, 0.001)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette darkness={0.4} offset={0.3} />
      </EffectComposer>
    </Canvas>
  )
}
