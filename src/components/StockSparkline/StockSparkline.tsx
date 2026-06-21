import { useEffect, useRef } from 'react'
import styles from './StockSparkline.module.css'

interface StockSparklineProps {
  closes: number[]
  up: boolean
  rangeLabel: string
  flipColors?: boolean
}

// to not go out of graph bounds
const INSET = 4

/** format of graph price */
function fmtPrice(n: number): string {
  if (n >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (n >= 1) return n.toFixed(2)
  return n.toFixed(4)
}

/**
 * tag are drawn at the corners of the plot itself
 * the tags have a backplate for better readability and lay on top of the plot
 */
export default function StockSparkline({ closes, up, rangeLabel, flipColors = false }: StockSparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const draw = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width))
      const h = Math.max(1, Math.floor(rect.height))
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      if (closes.length < 2) return

      const innerW = Math.max(1, w - INSET * 2)
      const innerH = Math.max(1, h - INSET * 2)
      const min = Math.min(...closes)
      const max = Math.max(...closes)
      const span = max - min || 1
      const stepX = innerW / (closes.length - 1)
      const yFor = (v: number) => INSET + (1 - (v - min) / span) * innerH

      // When flipColors is on, swap stroke/fill so red = gains and
      // green = losses
      const showGreen = up !== flipColors
      const stroke = showGreen ? 'rgba(47, 107, 42, 0.95)' : 'rgba(138, 36, 24, 0.95)'
      const fill = showGreen ? 'rgba(47, 107, 42, 0.18)' : 'rgba(138, 36, 24, 0.18)'
      const labelInk = '#2a1408'
      const backplate = 'rgba(245, 230, 200, 0.78)'

      // Filled area under the line
      ctx.beginPath()
      ctx.moveTo(INSET, INSET + innerH)
      closes.forEach((v, i) => ctx.lineTo(INSET + i * stepX, yFor(v)))
      ctx.lineTo(INSET + (closes.length - 1) * stepX, INSET + innerH)
      ctx.closePath()
      ctx.fillStyle = fill
      ctx.fill()

      // Line itself
      ctx.beginPath()
      closes.forEach((v, i) => {
        const x = INSET + i * stepX
        const y = yFor(v)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.strokeStyle = stroke
      ctx.lineWidth = 1.5
      ctx.lineJoin = 'round'
      ctx.stroke()

      // Axis labels
      ctx.font = "500 11px 'Rubik', 'Segoe UI', system-ui, sans-serif"
      const drawTag = (text: string, x: number, y: number, align: CanvasTextAlign, baseline: CanvasTextBaseline) => {
        ctx.textAlign = align
        ctx.textBaseline = baseline
        const m = ctx.measureText(text)
        const padX = 3
        const padY = 1
        const tw = m.width + padX * 2
        const th = 13 + padY * 2
        let bx: number
        if (align === 'right') bx = x - tw + padX
        else if (align === 'center') bx = x - tw / 2
        else bx = x - padX
        let by = y - padY
        if (baseline === 'bottom') by = y - th + padY
        else if (baseline === 'middle') by = y - th / 2
        ctx.fillStyle = backplate
        ctx.fillRect(bx, by, tw, th)
        ctx.fillStyle = labelInk
        ctx.fillText(text, x, y)
      }

      drawTag(fmtPrice(max), INSET + 2, INSET + 2, 'left', 'top')
      drawTag(fmtPrice(min), INSET + 2, INSET + innerH - 2, 'left', 'bottom')
      drawTag(rangeLabel, INSET + innerW - 2, INSET + innerH - 2, 'right', 'bottom')
    }

    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [closes, up, rangeLabel, flipColors])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden />
}


