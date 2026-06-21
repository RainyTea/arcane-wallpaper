import bg from '../../assets/wallpaperAL.png'
import styles from './Background.module.css'

export default function Background() {
  return <img src={bg} alt="" className={styles.background} aria-hidden />
}
