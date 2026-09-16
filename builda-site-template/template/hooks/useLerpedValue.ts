'use client'

import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'

export function useLerpedValue(target: number, factor = 0.08) {
  const ref = useRef(target)

  useFrame(() => {
    ref.current += (target - ref.current) * factor
  })

  return ref
}

export function useLerpedValueRAF(factor = 0.08) {
  const currentRef = useRef(0)
  const targetRef = useRef(0)

  const setTarget = useCallback((v: number) => {
    targetRef.current = v
  }, [])

  const update = useCallback(() => {
    currentRef.current += (targetRef.current - currentRef.current) * factor
    return currentRef.current
  }, [factor])

  return { current: currentRef, setTarget, update }
}
