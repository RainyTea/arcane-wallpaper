import { memo } from 'react'
import bg from '../../assets/wallpaperAL.webp'
import styles from './Background.module.css'

function Background() {
  return <img src={bg} alt="" className={styles.background} aria-hidden />
}

export default memo(Background)
