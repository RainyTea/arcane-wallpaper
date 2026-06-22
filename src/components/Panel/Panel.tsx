import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import parchment from '../../assets/parchment.webp'
import type { Pos } from '../../types'
import styles from './Panel.module.css'

interface PanelProps {
  title: string
  onClose: () => void
  onFocus?: () => void
  onMove?: (pos: Pos) => void
  getInitialPos?: () => Pos | null
  z?: number
  stackIndex?: number
  focused?: boolean
  children: ReactNode
}

const STAGGER_PX = 24
const OVERSHOOT_X = 140
const OVERSHOOT_TOP = 40

interface DragState {
  pointerId: number
  startX: number
  startY: number
  origX: number
  origY: number
  width: number
  height: number
}

interface Bounds {
  left: number
  top: number
  right: number
  bottom: number
}

function getStageBounds(): Bounds {
  const stage = document.querySelector('[data-stage]') as HTMLElement | null
  if (!stage) {
    return { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }
  }
  const r = stage.getBoundingClientRect()
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }
}

/** Clamps a desired top-left so the panel stays within the stage, plus
 *  a small overshoot allowance on top/left/right */
function clampToStage(x: number, y: number, w: number, h: number) {
  const b = getStageBounds()
  const minX = b.left - OVERSHOOT_X
  const maxX = Math.max(minX, b.right - w + OVERSHOOT_X)
  const minY = b.top - OVERSHOOT_TOP
  const maxY = Math.max(minY, b.bottom - h)
  return {
    x: Math.min(maxX, Math.max(minX, x)),
    y: Math.min(maxY, Math.max(minY, y)),
  }
}

/**
 * Draggable parchment used by StockPanel and SystemPanel.
 * Owns its position state (getInitialPos), enforces stage bounds, and calls
 * onMove when dragged. Drag is tracked via window-level pointer listeners so it
 * survives the cursor leaving the panel, leaving the window, or passing over
 * any child element that calls stopPropagation.
 */
export default function Panel({
  title,
  onClose,
  onFocus,
  onMove,
  getInitialPos,
  z = 10,
  stackIndex = 0,
  focused = false,
  children,
}: PanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const [pos, setPos] = useState<Pos | null>(() => getInitialPos?.() ?? null)

  // Set up window-level pointer listeners for dragging.
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const d = dragRef.current
      if (!d || d.pointerId !== e.pointerId) return
      const nx = d.origX + (e.clientX - d.startX)
      const ny = d.origY + (e.clientY - d.startY)
      const next = clampToStage(nx, ny, d.width, d.height)
      setPos(next)
      onMove?.(next)
    }
    const handleEnd = (e: PointerEvent) => {
      const d = dragRef.current
      if (!d || d.pointerId !== e.pointerId) return
      dragRef.current = null
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleEnd)
    window.addEventListener('pointercancel', handleEnd)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleEnd)
      window.removeEventListener('pointercancel', handleEnd)
    }
  }, [onMove])

  const beginDrag = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0) return
    const el = panelRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top,
      width: rect.width,
      height: rect.height,
    }
    e.preventDefault()
  }

  const style: CSSProperties =
    pos === null
      ? {
          left: `calc(50% + ${stackIndex * STAGGER_PX}px)`,
          top: `calc(50% + ${stackIndex * STAGGER_PX}px)`,
          transform: 'translate(-50%, -50%)',
          zIndex: z,
        }
      : { left: pos.x, top: pos.y, zIndex: z }

  const className = focused ? `${styles.panel} ${styles.focused}` : styles.panel

  return (
    <div
      ref={panelRef}
      className={className}
      style={style}
      role="dialog"
      aria-label={title}
    >
      <img src={parchment} alt="" className={styles.parchment} aria-hidden />
      {/* Invisible hitbox that covers the whole panel for dragging */}
      <div
        className={styles.hitbox}
        onPointerDown={(e) => {
          onFocus?.()
          beginDrag(e)
        }}
      />
      <div className={styles.content}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Close"
          >
            X
          </button>
        </header>
        <div
          className={styles.body}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

