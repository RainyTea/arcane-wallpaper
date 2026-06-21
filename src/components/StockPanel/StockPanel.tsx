import type { Pos, Stock } from '../../types'
import Panel from '../Panel/Panel'
import StockSparkline from '../StockSparkline/StockSparkline'
import styles from './StockPanel.module.css'

interface StockPanelProps {
  slotIndex: number
  stock: Stock | null
  rangeLabel: string
  flipColors?: boolean
  stackIndex?: number
  z?: number
  focused?: boolean
  getInitialPos?: () => Pos | null
  onMove?: (pos: Pos) => void
  onFocus?: () => void
  onClose: () => void
}

export default function StockPanel({
  slotIndex,
  stock,
  rangeLabel,
  flipColors = false,
  stackIndex,
  z,
  focused,
  getInitialPos,
  onMove,
  onFocus,
  onClose,
}: StockPanelProps) {
  const title = stock?.ticker ?? `Slot ${slotIndex + 1} - Unassigned`
  const showGreen = stock ? stock.up !== flipColors : true

  return (
    <Panel
      title={title}
      onClose={onClose}
      onFocus={onFocus}
      onMove={onMove}
      getInitialPos={getInitialPos}
      z={z}
      stackIndex={stackIndex}
      focused={focused}
    >
      {stock ? (
        <div className={styles.grid}>
          <div className={styles.row}>
            <span className={styles.label}>Price</span>
            <span className={styles.value}>{stock.price}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Change</span>
            <span className={showGreen ? styles.up : styles.down}>
              {stock.change} ({stock.changePercent})
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Volume</span>
            <span className={styles.value}>{stock.volume}</span>
          </div>
          <div className={styles.chart}>
            <StockSparkline closes={stock.closes} up={stock.up} flipColors={flipColors} rangeLabel={rangeLabel} />
          </div>
        </div>
      ) : (
        <p className={styles.empty}>No stock assigned to this slot.</p>
      )}
    </Panel>
  )
}
