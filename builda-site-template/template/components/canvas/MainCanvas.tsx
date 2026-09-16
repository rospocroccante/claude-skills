'use client'

import { Canvas } from '@react-three/fiber'
import ShaderBackground from './ShaderBackground'

export default function MainCanvas() {
  return (
    <Canvas
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      frameloop="always"
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true }}
      camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, 1] }}
    >
      <ShaderBackground />
    </Canvas>
  )
}
