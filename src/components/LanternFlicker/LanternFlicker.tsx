import { memo, type CSSProperties } from 'react'
import { LANTERN_LEFT, LANTERN_RIGHT } from '../../coords'
import type { GlowPoint } from '../../coords'
import { MASTER_CYCLE_DELAY } from '../../cycleSync'
import styles from './LanternFlicker.module.css'

interface LanternProps {
  point: GlowPoint
  phase?: 'a' | 'b'
}

function Lantern({ point, phase = 'a' }: LanternProps) {
  return (
    <>
      <div
        className={`${styles.halo} ${phase === 'b' ? styles.haloPhaseB : styles.haloPhaseA}`}
        style={{ left: point.x, top: point.y, width: point.radius }}
        aria-hidden
      />
      <div
        className={styles.anchor}
        style={{ left: point.x, top: point.y }}
        aria-hidden
      >
        <div className={styles.blinkGlow} />
        <div className={`${styles.flame} ${phase === 'b' ? styles.flameB : styles.flameA}`}>
          <div className={styles.flameHalo} />
        </div>
      </div>
    </>
  )
}

function LanternSmoke({ point, phase = 'a' }: LanternProps) {
  const phaseClass = phase === 'b' ? styles.pB : ''
  return (
    <div
      className={styles.smoke}
      style={{ left: point.x, top: point.y, '--master-cycle-delay': MASTER_CYCLE_DELAY } as CSSProperties}
      aria-hidden
    >
      <div className={`${styles.trail} ${styles.t1} ${phaseClass}`} />
      <div className={`${styles.trail} ${styles.t2} ${phaseClass}`} />
      <div className={`${styles.trail} ${styles.t3} ${phaseClass}`} />
      <div className={`${styles.trail} ${styles.t4} ${phaseClass}`} />
      <div className={`${styles.trail} ${styles.t5} ${phaseClass}`} />
      <div className={`${styles.trail} ${styles.t6} ${phaseClass}`} />
      <div className={`${styles.trail} ${styles.t7} ${phaseClass}`} />
      <div className={`${styles.trail} ${styles.t8} ${phaseClass}`} />
    </div>
  )
}

function LanternFlicker() {
  return (
    <>
      <div className={styles.daycycle} style={{ animationDelay: MASTER_CYCLE_DELAY }}>
        <Lantern point={LANTERN_LEFT} phase="a" />
        <Lantern point={LANTERN_RIGHT} phase="b" />
      </div>
      <LanternSmoke point={LANTERN_LEFT} phase="a" />
      <LanternSmoke point={LANTERN_RIGHT} phase="b" />
    </>
  )
}

export default memo(LanternFlicker)
