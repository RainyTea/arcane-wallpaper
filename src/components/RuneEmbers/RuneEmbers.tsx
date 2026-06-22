import { memo, useEffect, useRef } from 'react'
import { useAnimationFrame } from '../../hooks/useAnimationFrame'
import styles from './RuneEmbers.module.css'

interface Ember {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  hue: number
  wobble: number
  wobbleSpeed: number
}

export interface RuneEmberSource {
  fx: number
  fy: number
}

interface RuneEmbersProps {
  sources: RuneEmberSource[]
  full?: boolean
  maxEmbers?: number
  maxEmbersFull?: number
}

// Slow, sparse magical embers
const MAX_EMBERS_DEFAULT = 18
const MAX_EMBERS_FULL_DEFAULT = 32
const SPAWN_PER_SEC_PER_SOURCE = 1.2
const SPAWN_PER_SEC_PER_SOURCE_FULL = 2.6
const SPREAD_X_FRAC = 0.006
const SPREAD_X_FRAC_FULL = 0.018

function spawn(src: RuneEmberSource, w: number, h: number, full: boolean): Ember {
  const spreadX = full ? SPREAD_X_FRAC_FULL : SPREAD_X_FRAC
  const baseX = src.fx * w + (Math.random() - 0.5) * w * spreadX
  const baseY = src.fy * h + (Math.random() - 0.2) * h * 0.004
  return {
    x: baseX,
    y: baseY,
    vx: (Math.random() - 0.5) * (full ? 5 : 3),
    vy: -(7 + Math.random() * 8),
    life: 0,
    maxLife: 3.2 + Math.random() * 2.4,
    size: 0.8 + Math.random() * 1.0,
    hue: 270 + Math.random() * 30,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.7 + Math.random() * 1.0,
  }
}

/**
 * Slow purple embers drifting up from each active rune stone
 */
function RuneEmbers({
  sources,
  full = false,
  maxEmbers = MAX_EMBERS_DEFAULT,
  maxEmbersFull = MAX_EMBERS_FULL_DEFAULT,
}: RuneEmbersProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const embersRef = useRef<Ember[]>([])
  const sizeRef = useRef({ w: 0, h: 0 })
  const carryRef = useRef<number[]>([])
  const sourcesRef = useRef(sources)
  const fullRef = useRef(full)
  const capRef = useRef(full ? maxEmbersFull : maxEmbers)

  useEffect(() => {
    sourcesRef.current = sources
    fullRef.current = full
    capRef.current = full ? maxEmbersFull : maxEmbers
  }, [sources, full, maxEmbers, maxEmbersFull])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width))
      const h = Math.max(1, Math.floor(rect.height))
      canvas.width = w * dpr
      canvas.height = h * dpr
      sizeRef.current = { w, h }
      const ctx = canvas.getContext('2d')
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  useAnimationFrame((delta) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { w, h } = sizeRef.current
    if (w === 0 || h === 0) return
    const dt = Math.min(delta, 80) / 1000
    const srcs = sourcesRef.current
    const isFull = fullRef.current
    const rate = isFull ? SPAWN_PER_SEC_PER_SOURCE_FULL : SPAWN_PER_SEC_PER_SOURCE
    const cap = capRef.current

    if (carryRef.current.length !== srcs.length) carryRef.current = srcs.map(() => 0)

    for (let i = 0; i < srcs.length; i++) {
      carryRef.current[i] += rate * dt
      while (
        carryRef.current[i] >= 1 &&
        embersRef.current.length < cap
      ) {
        embersRef.current.push(spawn(srcs[i], w, h, isFull))
        carryRef.current[i] -= 1
      }
      if (carryRef.current[i] > 4) carryRef.current[i] = 4
    }

    const next: Ember[] = []
    for (const e of embersRef.current) {
      e.life += dt
      if (e.life >= e.maxLife) continue
      e.wobble += e.wobbleSpeed * dt
      e.x += (e.vx + Math.sin(e.wobble) * 2) * dt
      e.y += e.vy * dt
      e.vy += -1.5 * dt
      next.push(e)
    }
    embersRef.current = next

    ctx.clearRect(0, 0, w, h)
    for (const e of embersRef.current) {
      const t = e.life / e.maxLife
      const alpha = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8
      const a = Math.max(0, Math.min(1, alpha))
      const r = e.size * (1 + t * 0.5)
      const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r * 6)
      grad.addColorStop(0, `hsla(${e.hue}, 90%, 80%, ${0.7 * a})`)
      grad.addColorStop(0.35, `hsla(${e.hue}, 90%, 60%, ${0.3 * a})`)
      grad.addColorStop(1, `hsla(${e.hue}, 90%, 55%, 0)`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(e.x, e.y, r * 6, 0, Math.PI * 2)
      ctx.fill()
    }
  })

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden />
}

export default memo(RuneEmbers)
