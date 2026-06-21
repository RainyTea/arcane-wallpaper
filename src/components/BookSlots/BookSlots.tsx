import type { CSSProperties } from 'react'
import type { BookSlot } from '../../types'
import styles from './BookSlots.module.css'

/** Tint a book slot with a coloured glow. */
export type BookTint = null | { direction: 'up' | 'down' | 'system'; intensity: number }

interface BookSlotsProps {
  slots: BookSlot[]
  labels?: Record<number, string>
  hoverOnlyLabels?: Record<number, boolean>
  tints?: Record<number, BookTint>
  flipColors?: boolean
  onBookClick: (slotId: number) => void
  debug?: boolean
}

export default function BookSlots({
  slots,
  labels,
  hoverOnlyLabels,
  tints,
  flipColors = false,
  onBookClick,
  debug = false,
}: BookSlotsProps) {
  return (
    <>
      {slots.map((s) => {
        const tint = tints?.[s.id] ?? null
        const cssDir: 'up' | 'down' | 'system' | null = tint?.direction
          ? tint.direction === 'system'
            ? 'system'
            : flipColors
              ? tint.direction === 'up' ? 'down' : 'up'
              : tint.direction
          : null
        const tintClass =
          cssDir === 'up' ? styles.up
          : cssDir === 'down' ? styles.down
          : cssDir === 'system' ? styles.system
          : ''
        const label = labels?.[s.id]
        const labelClass = hoverOnlyLabels?.[s.id]
          ? `${styles.label} ${styles.hoverOnly}`
          : styles.label
        const style: CSSProperties & Record<'--intensity', string> = {
          left: s.left,
          top: s.top,
          width: s.width,
          height: s.height,
          '--intensity': String(tint?.intensity ?? 0),
        }
        return (
          <button
            key={s.id}
            type="button"
            aria-label={label ? `Book ${label}` : `Book ${s.id}`}
            onClick={() => onBookClick(s.id)}
            className={`${styles.slot} ${tintClass} ${debug ? styles.debug : ''}`}
            style={style}
          >
            {label && <span className={labelClass}>{label}</span>}
          </button>
        )
      })}
    </>
  )
}
