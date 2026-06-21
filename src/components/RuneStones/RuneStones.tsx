import { RUNE_STONES } from '../../coords'
import styles from './RuneStones.module.css'

interface RuneStonesProps {
  activeCount: number
  debug?: boolean
}

export default function RuneStones({ activeCount, debug = false }: RuneStonesProps) {
  const full = activeCount >= RUNE_STONES.length

  return (
    <>
      {RUNE_STONES.map((p, i) => {
        const active = i < activeCount
        const cls = [
          styles.rune,
          active ? styles.active : '',
          full ? styles.full : '',
          debug ? styles.debug : '',
        ]
          .filter(Boolean)
          .join(' ')
        return (
          <div
            key={i}
            className={cls}
            style={{ left: p.x, top: p.y }}
            aria-hidden
          />
        )
      })}
    </>
  )
}
