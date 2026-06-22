import { memo, useMemo, type CSSProperties } from 'react'
import styles from './DustMotes.module.css'

const MOTE_COUNT = 24

interface Mote {
  left: string
  top: string
  size: number
  duration: number
  delay: number
  xDrift: number
  yDrift: number
  opacity: number
}

function makeMotes(): Mote[] {
  const arr: Mote[] = []
  for (let i = 0; i < MOTE_COUNT; i++) {
    arr.push({
      left: `${Math.random() * 100}%`,
      top: `${20 + Math.random() * 75}%`,
      size: 1.5 + Math.random() * 2.5,
      duration: 22 + Math.random() * 28,
      delay: -Math.random() * 50,
      xDrift: (Math.random() - 0.5) * 140,
      yDrift: -(50 + Math.random() * 110),
      opacity: 0.25 + Math.random() * 0.4,
    })
  }
  return arr
}

function DustMotes() {
  const motes = useMemo(() => makeMotes(), [])
  return (
    <div className={styles.dust} aria-hidden>
      {motes.map((m, i) => (
        <span
          key={i}
          className={styles.mote}
          style={{
            left: m.left,
            top: m.top,
            width: `${m.size}px`,
            height: `${m.size}px`,
            animationDuration: `${m.duration}s`,
            animationDelay: `${m.delay}s`,
            ['--x-drift' as string]: `${m.xDrift}px`,
            ['--y-drift' as string]: `${m.yDrift}px`,
            ['--peak-opacity' as string]: String(m.opacity),
          } as CSSProperties}
        />
      ))}
    </div>
  )
}

export default memo(DustMotes)
