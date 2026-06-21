import { CANDLE_FLAME } from '../../coords'
import { MASTER_CYCLE_DELAY } from '../../cycleSync'
import styles from './CandleFlicker.module.css'

export default function CandleFlicker() {
  return (
    <>
      <div
        className={styles.candle}
        style={{ left: CANDLE_FLAME.x, top: CANDLE_FLAME.y, animationDelay: MASTER_CYCLE_DELAY }}
        aria-hidden
      >
        <div className={styles.blinkGlow} />
        <div className={styles.halo} />
        <div className={styles.flame}>
          <div className={styles.flameHalo} />
        </div>
      </div>
      {/* smoke trail */}
      <div
        className={styles.smoke}
        style={{ left: CANDLE_FLAME.x, top: CANDLE_FLAME.y }}
        aria-hidden
      >
        <div className={`${styles.trail} ${styles.t1}`} />
        <div className={`${styles.trail} ${styles.t2}`} />
        <div className={`${styles.trail} ${styles.t3}`} />
        <div className={`${styles.trail} ${styles.t4}`} />
        <div className={`${styles.trail} ${styles.t5}`} />
        <div className={`${styles.trail} ${styles.t6}`} />
        <div className={`${styles.trail} ${styles.t7}`} />
        <div className={`${styles.trail} ${styles.t8}`} />
        <div className={`${styles.trail} ${styles.t9}`} />
        <div className={`${styles.trail} ${styles.t10}`} />
        <div className={`${styles.trail} ${styles.t11}`} />
        <div className={`${styles.trail} ${styles.t12}`} />
      </div>
    </>
  )
}
