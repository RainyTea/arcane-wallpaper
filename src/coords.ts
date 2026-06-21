// Calibration coordinates for wallpaperAL.png (3440x1440).

import type { BookSlot } from './types'

// Stock books coordinates found with https://imageonline.io/find-coordinates-of-image/
// manually check cords are correct by redboxes 
export const BOOK_SLOTS: BookSlot[] = [
  { id: 0, left: '70.49%', top: '44.38%', width: '4.24%', height: '13.54%' },
  { id: 1, left: '76.40%', top: '44.58%', width: '4.24%', height: '13.54%' },
  { id: 2, left: '82.30%', top: '44.44%', width: '4.24%', height: '13.54%' },
  { id: 3, left: '88.11%', top: '44.58%', width: '4.24%', height: '13.54%' },
]

// system info book coords.
export const SYSTEM_BOOK: BookSlot = {
  id: 4,
  left: '93.23%',
  top: '43.68%',
  width: '4.77%',
  height: '14.38%',
}

interface Point {
  x: string
  y: string
}

/** Glow source  */
export interface GlowPoint extends Point {
  radius: string
}

export const RUNE_STONES: Point[] = [
  { x: '78.66%', y: '86.25%' },
  { x: '83.55%', y: '86.25%' },
  { x: '88.69%', y: '86.25%' },
  { x: '93.90%', y: '86.25%' },
]

export const LANTERN_LEFT: GlowPoint = { x: '2.21%', y: '41.81%', radius: '8%' }
export const LANTERN_RIGHT: GlowPoint = { x: '51.83%', y: '41.11%', radius: '8%' }
export const CANDLE_FLAME: Point = { x: '52.85%', y: '69.58%' }
export const WINDOW_BBOX = {
  left: '7.69%',
  top: '2.39%',
  width: '38.19%',
  height: '82.98%',
}

// window arch for the skyeffects 
export const WINDOW_CLIP =
  'polygon(0.48% 100%, 0% 46.58%, 10.13% 17.27%, 49.92% 0%, 83.46% 14.03%, 100% 41.72%, 100% 99.29%)'

// Moon placements coords 
export const MOON_IN_WINDOW: Point = { x: '63.52%', y: '30.43%' }

export type Polygon = Array<[number, number]>

// star spawn locations
export const SKY_POLYGONS: Polygon[] = [
  [
    [0.2799, 0.4245], [0.3011, 0.3165], [0.3584, 0.2086], [0.4943, 0.0881],
    [0.5892, 0.1367], [0.6645, 0.2518], [0.7169, 0.3597], [0.7119, 0.4622],
    [0.7283, 0.5612], [0.6498, 0.6043], [0.5761, 0.5396], [0.5057, 0.5000],
    [0.4272, 0.5288], [0.3535, 0.4748],
  ],
  [
    [0.8167, 0.5108], [0.8871, 0.4910], [0.9607, 0.4281], [0.8871, 0.3363],
  ],
]