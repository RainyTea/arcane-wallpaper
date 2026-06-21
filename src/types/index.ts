/** Formatted stock quote shown in a StockPanel. */
export interface Stock {
  ticker: string
  price: string
  change: string
  changePercent: string
  volume: string
  up: boolean
  closes: number[]
}

/** 2D pixel position in viewport space. */
export interface Pos {
  x: number
  y: number
}

/** What kind of content an open panel is showing. */
type PanelMode = 'stock' | 'system'

/** Runtime state for one panel currently open on the scene. */
export interface OpenPanel {
  id: number
  mode: PanelMode
  slotIndex: number
  z: number
}

/** Hit-box for an interactive book on the shelf, expressed in % */
export interface BookSlot {
  id: number
  left: string
  top: string
  width: string
  height: string
}
