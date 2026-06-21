import type { ReactNode } from 'react'
import styles from './Scene.module.css'

type SceneProps = { children: ReactNode }

export default function Scene({ children }: SceneProps) {
  return (
    <div className={styles.scene}>
      <div className={styles.stage} data-stage="">{children}</div>
    </div>
  )
}
