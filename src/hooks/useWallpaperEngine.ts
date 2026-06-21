import { useEffect, useState } from 'react'
import type { ChartRange } from '../endpoints'

interface WallpaperProperty<T = unknown> {
  value: T
}

interface WallpaperProps {
  stock1?: WallpaperProperty<string>
  stock2?: WallpaperProperty<string>
  stock3?: WallpaperProperty<string>
  stock4?: WallpaperProperty<string>
  chartRange?: WallpaperProperty<string>
  flipColors?: WallpaperProperty<boolean>
  [key: string]: WallpaperProperty | undefined
}

interface WallpaperListener {
  applyUserProperties?: (props: WallpaperProps) => void
}

declare global {
  interface Window {
    wallpaperPropertyListener?: WallpaperListener
  }
}

const SLOT_KEYS = ['stock1', 'stock2', 'stock3', 'stock4'] as const
type SlotKey = (typeof SLOT_KEYS)[number]

const VALID_RANGES: ChartRange[] = ['1d', '5d', '1mo', '6mo', '1y']
const DEFAULT_RANGE: ChartRange = '1mo'

/** Trim, uppercase, and validate one ticker, empty/junk become '' */
function sanitize(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  const t = raw.trim().toUpperCase()
  // Allow letters, digits, dot, dash (covers BRK.B, RDS-A, etc.). Reject anything else.
  return /^[A-Z0-9.-]{1,10}$/.test(t) ? t : ''
}

export interface WallpaperEngineConfig {
  tickers: string[]
  range: ChartRange
  flipColors: boolean
}

// for the stock panel to use, general WE settings
export function useWallpaperEngine(): WallpaperEngineConfig | null {
  const [config, setConfig] = useState<WallpaperEngineConfig | null>(null)

  useEffect(() => {
    const slots: Record<SlotKey, string> = {
      stock1: '',
      stock2: '',
      stock3: '',
      stock4: '',
    }
    let range: ChartRange = DEFAULT_RANGE
    let flipColors = false

    window.wallpaperPropertyListener = {
      applyUserProperties: (props) => {
        for (const key of SLOT_KEYS) {
          if (props[key]) slots[key] = sanitize(props[key]!.value)
        }
        if (props.chartRange) {
          const raw = props.chartRange.value
          if (typeof raw === 'string' && (VALID_RANGES as string[]).includes(raw)) {
            range = raw as ChartRange
          }
        }
        if (props.flipColors) {
          flipColors = Boolean(props.flipColors.value)
        }
        setConfig({
          tickers: SLOT_KEYS.map((k) => slots[k]).filter(Boolean),
          range,
          flipColors,
        })
      },
    }
    return () => {
      window.wallpaperPropertyListener = undefined
    }
  }, [])

  return config
}

