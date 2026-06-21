import { useEffect, useLayoutEffect, useRef } from 'react'

type FrameCallback = (deltaMs: number, elapsedMs: number) => void

export function useAnimationFrame(callback: FrameCallback, enabled = true) {
  const cbRef = useRef(callback)
  useLayoutEffect(() => {
    cbRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return
    let rafId = 0
    let last = performance.now()
    const start = last

    const tick = (now: number) => {
      const delta = now - last
      last = now
      cbRef.current(delta, now - start)
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [enabled])
}
