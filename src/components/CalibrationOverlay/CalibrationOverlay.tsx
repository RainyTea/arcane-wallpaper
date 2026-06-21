import { useEffect, useRef, useState } from 'react'
import {
  BOOK_SLOTS,
  CANDLE_FLAME,
  LANTERN_LEFT,
  LANTERN_RIGHT,
  MOON_IN_WINDOW,
  RUNE_STONES,
  SYSTEM_BOOK,
  WINDOW_BBOX,
  WINDOW_CLIP,
} from '../../coords'
import styles from './CalibrationOverlay.module.css'

/**
 * helps with figuring out coordinates for things in the scene, by showing an overlay with
 * the current objects marked and clickable coordiante positions
 * copies coords to clipboard on click. 
 */


const RECT_MODE = false //for sideway book rectangle thingy
const START_BOOK_ID = 0

export default function CalibrationOverlay() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const [pinned, setPinned] = useState<{ x: number; y: number } | null>(null)
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null)
  const [rect, setRect] = useState<{
    id: number
    left: number
    top: number
    width: number
    height: number
  } | null>(null)
  const [nextId, setNextId] = useState(START_BOOK_ID)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      setCursor({
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
      })
    }
    const onLeave = () => setCursor(null)
    const onClick = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width) * 100
      const y = ((e.clientY - r.top) / r.height) * 100
      if (RECT_MODE) {
        if (!rectStart) {
          setRectStart({ x, y })
          setRect(null)
        } else {
          const left = Math.min(rectStart.x, x)
          const top = Math.min(rectStart.y, y)
          const width = Math.abs(x - rectStart.x)
          const height = Math.abs(y - rectStart.y)
          const id = nextId
          setRect({ id, left, top, width, height })
          setRectStart(null)
          setNextId((n) => n + 1)
          const txt = `{ id: ${id}, left: '${left.toFixed(2)}%', top: '${top.toFixed(2)}%', width: '${width.toFixed(2)}%', height: '${height.toFixed(2)}%' },`
          void navigator.clipboard?.writeText(txt)
        }
      } else {
        setPinned({ x, y })
        const txt = `${x.toFixed(2)}%, ${y.toFixed(2)}%`
        void navigator.clipboard?.writeText(txt)
      }
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('click', onClick)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('click', onClick)
    }
  }, [rectStart, nextId])

  const fmt = (n: number) => n.toFixed(2)

  return (
    <div ref={ref} className={styles.overlay} aria-hidden>
      {/* Window bbox + arch preview */}
      <div
        className={styles.windowBox}
        style={{
          left: WINDOW_BBOX.left,
          top: WINDOW_BBOX.top,
          width: WINDOW_BBOX.width,
          height: WINDOW_BBOX.height,
        }}
      />
      <div
        className={styles.windowClip}
        style={{
          left: WINDOW_BBOX.left,
          top: WINDOW_BBOX.top,
          width: WINDOW_BBOX.width,
          height: WINDOW_BBOX.height,
          clipPath: WINDOW_CLIP,
          WebkitClipPath: WINDOW_CLIP,
        }}
      />

      {/* Moon -> MOON_IN_WINDOW is window-bbox-local,
          go with WINDOW_BBOX to get its actual stage position. */}
      {(() => {
        const wbX = parseFloat(WINDOW_BBOX.left)
        const wbY = parseFloat(WINDOW_BBOX.top)
        const wbW = parseFloat(WINDOW_BBOX.width)
        const wbH = parseFloat(WINDOW_BBOX.height)
        const mx = parseFloat(MOON_IN_WINDOW.x)
        const my = parseFloat(MOON_IN_WINDOW.y)
        const stageX = wbX + (mx / 100) * wbW
        const stageY = wbY + (my / 100) * wbH
        return (
          <div
            className={styles.marker}
            style={{ left: `${stageX}%`, top: `${stageY}%` }}
          >
            <div className={styles.dot} style={{ background: '#e6e6ff' }} />
            <span className={styles.label}>
              MOON local {MOON_IN_WINDOW.x},{MOON_IN_WINDOW.y} → stage {stageX.toFixed(2)}%,{stageY.toFixed(2)}%
            </span>
          </div>
        )
      })()}

      {/* Lanterns - show coord + glow radius */}
      {[
        { name: 'LANTERN_LEFT', p: LANTERN_LEFT },
        { name: 'LANTERN_RIGHT', p: LANTERN_RIGHT },
      ].map(({ name, p }) => (
        <div key={name}>
          <div
            className={styles.glowRing}
            style={{ left: p.x, top: p.y, width: p.radius }}
          />
          <div className={styles.marker} style={{ left: p.x, top: p.y }}>
            <div className={styles.dot} style={{ background: '#ffb066' }} />
            <span className={styles.label}>
              {name} {p.x},{p.y} r={p.radius}
            </span>
          </div>
        </div>
      ))}

      {/* Candle flame */}
      <div className={styles.marker} style={{ left: CANDLE_FLAME.x, top: CANDLE_FLAME.y }}>
        <div className={styles.dot} style={{ background: '#ffd166' }} />
        <span className={styles.label}>
          CANDLE {CANDLE_FLAME.x},{CANDLE_FLAME.y}
        </span>
      </div>

      {/* Stock + Codex book slot rectangles */}
      {[...BOOK_SLOTS, SYSTEM_BOOK].map((b) => (
        <div
          key={b.id}
          className={styles.bookBox}
          style={{ left: b.left, top: b.top, width: b.width, height: b.height }}
        >
          <span className={styles.label} style={{ position: 'absolute', top: -16, left: 0 }}>
            BOOK {b.id}
          </span>
        </div>
      ))}

      {/* Runes */}
      {RUNE_STONES.map((p, i) => (
        <div key={i} className={styles.marker} style={{ left: p.x, top: p.y }}>
          <div className={styles.dot} style={{ background: '#c084fc' }} />
          <span className={styles.label}>R{i} {p.x},{p.y}</span>
        </div>
      ))}

      {/* Rect-mode draft (between two clicks) */}
      {RECT_MODE && rectStart && cursor && (
        <div
          className={styles.draftRect}
          style={{
            left: `${Math.min(rectStart.x, cursor.x)}%`,
            top: `${Math.min(rectStart.y, cursor.y)}%`,
            width: `${Math.abs(cursor.x - rectStart.x)}%`,
            height: `${Math.abs(cursor.y - rectStart.y)}%`,
          }}
        />
      )}

      {/* Rect-mode result */}
      {rect && (
        <div
          className={styles.resultRect}
          style={{
            left: `${rect.left}%`,
            top: `${rect.top}%`,
            width: `${rect.width}%`,
            height: `${rect.height}%`,
          }}
        >
          <span className={styles.label} style={{ position: 'absolute', top: -16, left: 0 }}>
            id {rect.id}: {rect.left.toFixed(2)},{rect.top.toFixed(2)} {rect.width.toFixed(2)}×{rect.height.toFixed(2)}
          </span>
        </div>
      )}

      {/* Live readout */}
      <div className={styles.readout}>
        <div>
          cursor:{' '}
          <strong>
            {cursor ? `${fmt(cursor.x)}%, ${fmt(cursor.y)}%` : '—'}
          </strong>
        </div>
        <div>
          last click:{' '}
          <strong>
            {pinned ? `${fmt(pinned.x)}%, ${fmt(pinned.y)}%` : '—'}
          </strong>
        </div>
        {RECT_MODE && (
          <div style={{ marginTop: 4 }}>
            rect mode <strong>ON</strong> · next id <strong>{nextId}</strong>
            <div style={{ opacity: 0.8 }}>
              {rectStart
                ? 'click bottom-right corner'
                : 'click top-left corner of book'}
            </div>
          </div>
        )}
        <div style={{ opacity: 0.6, marginTop: 4 }}>
          edit RECT_MODE in CalibrationOverlay.tsx to toggle
        </div>
      </div>
    </div>
  )
}
