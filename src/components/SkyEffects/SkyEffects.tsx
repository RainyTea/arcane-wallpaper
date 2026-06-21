import { useEffect, useRef } from 'react'
import { useAnimationFrame } from '../../hooks/useAnimationFrame'
import {
  WINDOW_BBOX,
  WINDOW_CLIP,
  MOON_IN_WINDOW,
  SKY_POLYGONS,
} from '../../coords'
import type { Polygon } from '../../coords'
import styles from './SkyEffects.module.css'

interface Star {
  x: number
  y: number
  baseAlpha: number
  twinkleSpeed: number
  phase: number
  radius: number
}

const STAR_COUNT = 60
/** radius around the moon, as a fraction of min(canvas w, h). */
const MOON_EXCLUSION = 0.04

const MOON_FRAC_X = parseFloat(MOON_IN_WINDOW.x) / 100
const MOON_FRAC_Y = parseFloat(MOON_IN_WINDOW.y) / 100


function pointInPolygon(px: number, py: number, poly: Polygon): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function polygonBBox(poly: Polygon) {
  let minX = 2
  let minY = 2
  let maxX = 0
  let maxY = 0
  for (const [x, y] of poly) {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
}

/**
 * puts STAR_COUNT stars across SKY_POLYGONS weighted by bbox area,
 * via rejection sampling. Stars are kept out of the circle around the moon
 */
function makeStars(width: number, height: number): Star[] {
  const stars: Star[] = []
  const moonX = MOON_FRAC_X * width
  const moonY = MOON_FRAC_Y * height
  const minDist = Math.min(width, height) * MOON_EXCLUSION
  const minDistSq = minDist * minDist

  const areas = SKY_POLYGONS.map((p) => {
    const bb = polygonBBox(p)
    return bb.width * bb.height
  })
  const total = areas.reduce((a, b) => a + b, 0) || 2
  const perPoly = areas.map((a) => Math.round((a / total) * STAR_COUNT))

  SKY_POLYGONS.forEach((poly, pi) => {
    const bb = polygonBBox(poly)
    let placed = 0
    let attempts = 0
    const target = perPoly[pi]
    while (placed < target && attempts < target * 60) {
      attempts++
      const nx = bb.minX + Math.random() * bb.width
      const ny = bb.minY + Math.random() * bb.height
      if (!pointInPolygon(nx, ny, poly)) continue
      const px = nx * width
      const py = ny * height
      const dx = px - moonX
      const dy = py - moonY
      if (dx * dx + dy * dy < minDistSq) continue
      stars.push({
        x: px,
        y: py,
        baseAlpha: 0.3 + Math.random() * 0.6,
        twinkleSpeed: 0.6 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2,
        radius: 0.9 + Math.random() * 0.9,
      })
      placed++
    }
  })

  return stars
}

/**
 * Canvas sky overlay clipped to the window arch: animated moon halo +
 * twinkling stars constrained to the painted sky regions.
 * (could be done better, just lazy and this works fine)
 */
export default function SkyEffects() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sizeRef = useRef({ w: 0, h: 0 })
  const starsRef = useRef<Star[]>([])

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
      starsRef.current = makeStars(w, h)
      const ctx = canvas.getContext('2d')
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  useAnimationFrame((_delta, elapsed) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { w, h } = sizeRef.current
    if (w === 0 || h === 0) return

    const t = elapsed / 1000
    ctx.clearRect(0, 0, w, h)

    // Moon halo w/pulse.
    const moonX = MOON_FRAC_X * w
    const moonY = MOON_FRAC_Y * h
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.6)
    const haloR = Math.min(w, h) * (0.26 + pulse * 0.05)
    const halo = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, haloR)
    halo.addColorStop(0, `rgba(255, 250, 235, ${0.55 + pulse * 0.18})`)
    halo.addColorStop(0.15, `rgba(235, 235, 255, ${0.32 + pulse * 0.12})`)
    halo.addColorStop(0.45, `rgba(190, 200, 245, ${0.12 + pulse * 0.06})`)
    halo.addColorStop(1, 'rgba(180, 190, 240, 0)')
    ctx.fillStyle = halo
    ctx.beginPath()
    ctx.arc(moonX, moonY, haloR, 0, Math.PI * 2)
    ctx.fill()

    // Star twinkle
    for (const s of starsRef.current) {
      const a = s.baseAlpha * (0.55 + 0.45 * Math.sin(t * s.twinkleSpeed + s.phase))
      ctx.fillStyle = `rgba(240, 235, 255, ${a})`
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
      ctx.fill()
    }
  })

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      style={{
        left: WINDOW_BBOX.left,
        top: WINDOW_BBOX.top,
        width: WINDOW_BBOX.width,
        height: WINDOW_BBOX.height,
        clipPath: WINDOW_CLIP,
        WebkitClipPath: WINDOW_CLIP,
      }}
      aria-hidden
    />
  )
}
