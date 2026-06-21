import { useEffect, useRef } from 'react'
import { useAnimationFrame } from '../../hooks/useAnimationFrame'
import styles from './MagicSparkles.module.css'

export interface SparkleSource {
  fx: number
  fy: number
  radius: number
  hue: number
  rate: number
  isLoss?: boolean
}

interface Sparkle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  hue: number
  twinkle: number
  twinkleSpeed: number
  isLoss: boolean
}

interface MagicSparklesProps {
  sources: SparkleSource[]
}

const MAX_SPARKLES = 80

function spawn(src: SparkleSource, w: number, h: number): Sparkle {
  const min = Math.min(w, h)
  const r = src.radius * min * Math.sqrt(Math.random())
  const angle = Math.random() * Math.PI * 2
  const cx = src.fx * w
  const cy = src.fy * h
  return {
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r,
    vx: (Math.random() - 0.5) * 8,
    vy: -(4 + Math.random() * 10),
    life: 0,
    maxLife: 0.9 + Math.random() * 0.9,
    size: 0.7 + Math.random() * 0.9,
    hue: src.hue + (Math.random() - 0.5) * 20,
    twinkle: Math.random() * Math.PI * 2,
    twinkleSpeed: 4 + Math.random() * 4,
    isLoss: src.isLoss ?? false,
  }
}

function drawSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  hue: number,
  alpha: number,
  isLoss: boolean,
) {
  // Soft glow disc.
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 5)
  grad.addColorStop(0, `hsla(${hue}, 95%, 80%, ${alpha})`)
  grad.addColorStop(0.4, `hsla(${hue}, 95%, 60%, ${alpha * 0.4})`)
  grad.addColorStop(1, `hsla(${hue}, 95%, 60%, 0)`)
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(x, y, r * 5, 0, Math.PI * 2)
  ctx.fill()

    // + or X shape for books 
  ctx.strokeStyle = `hsla(${hue}, 100%, 92%, ${alpha})`
  ctx.lineWidth = 0.8
  ctx.lineCap = 'round'
  const flare = r * 4
  ctx.beginPath()
  if (isLoss) {
    const d = flare * 0.707 // cos/sin(45)
    ctx.moveTo(x - d, y - d)
    ctx.lineTo(x + d, y + d)
    ctx.moveTo(x - d, y + d)
    ctx.lineTo(x + d, y - d)
  } else {
    ctx.moveTo(x - flare, y)
    ctx.lineTo(x + flare, y)
    ctx.moveTo(x, y - flare)
    ctx.lineTo(x, y + flare)
  }
  ctx.stroke()
}

export default function MagicSparkles({ sources }: MagicSparklesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sparklesRef = useRef<Sparkle[]>([])
  const sizeRef = useRef({ w: 0, h: 0 })
  const carryRef = useRef<number[]>([])
  const sourcesRef = useRef(sources)

  useEffect(() => {
    sourcesRef.current = sources
  }, [sources])

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
    if (carryRef.current.length !== srcs.length) carryRef.current = srcs.map(() => 0)

    for (let i = 0; i < srcs.length; i++) {
      carryRef.current[i] += srcs[i].rate * dt
      while (
        carryRef.current[i] >= 1 &&
        sparklesRef.current.length < MAX_SPARKLES
      ) {
        sparklesRef.current.push(spawn(srcs[i], w, h))
        carryRef.current[i] -= 1
      }
      if (carryRef.current[i] > 4) carryRef.current[i] = 4
    }

    const next: Sparkle[] = []
    for (const s of sparklesRef.current) {
      s.life += dt
      if (s.life >= s.maxLife) continue
      s.x += s.vx * dt
      s.y += s.vy * dt
      s.vy += -2 * dt
      s.twinkle += s.twinkleSpeed * dt
      next.push(s)
    }
    sparklesRef.current = next

    ctx.clearRect(0, 0, w, h)
    for (const s of sparklesRef.current) {
      const t = s.life / s.maxLife
      const env = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8
      const tw = 0.5 + 0.5 * Math.sin(s.twinkle)
      const alpha = Math.max(0, Math.min(1, env * tw))
      drawSparkle(ctx, s.x, s.y, s.size, s.hue, alpha, s.isLoss)
    }
  })

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden />
}
