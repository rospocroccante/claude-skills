'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const fragmentShader = `
uniform float uTime;
varying vec2 vUv;

// Hash function for grain
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = vUv;

  // Diagonal gradient 135deg: #1E2224 top-left to #121416 bottom-right
  vec3 voidColor = vec3(0.118, 0.133, 0.141);   // #1E2224
  vec3 deepVoid  = vec3(0.071, 0.078, 0.086);    // #121416
  float gradientT = (uv.x + uv.y) * 0.5;
  vec3 base = mix(voidColor, deepVoid, gradientT);

  // Subtle film grain (paper texture, near invisible)
  float grain = hash(uv * 1000.0 + fract(uTime * 0.05)) * 0.05;
  base += grain - 0.025; // centered grain at ~0.025 opacity

  gl_FragColor = vec4(base, 1.0);
}
`

export default function ShaderBackground() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), [])

  useFrame((_, delta) => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uTime.value += delta
  })

  return (
    <mesh frustumCulled={false} renderOrder={-1000}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}
