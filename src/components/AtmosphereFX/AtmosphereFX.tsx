import { memo } from 'react'
import { MASTER_CYCLE_DELAY } from '../../cycleSync'
import styles from './AtmosphereFX.module.css'

function AtmosphereFX() {
  return <div className={styles.ambient} style={{ animationDelay: MASTER_CYCLE_DELAY }} aria-hidden />
}

export default memo(AtmosphereFX)
