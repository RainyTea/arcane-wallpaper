import { useEffect, useState } from 'react'
import type { ChartRange } from '../endpoints'
import { DEFAULT_QUALITY, type QualityLevel, type QualitySettings } from '../quality'

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
  quality_stars?: WallpaperProperty<string>
  quality_motes?: WallpaperProperty<string>
  quality_sparkles?: WallpaperProperty<string>
  quality_embers?: WallpaperProperty<string>
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
const VALID_LEVELS: QualityLevel[] = ['off', 'low', 'medium', 'high']

function parseLevel(raw: unknown, fallback: QualityLevel): QualityLevel {
  return typeof raw === 'string' && (VALID_LEVELS as string[]).includes(raw)
    ? (raw as QualityLevel)
    : fallback
}

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
  quality: QualitySettings
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
    const quality: QualitySettings = { ...DEFAULT_QUALITY }

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
        if (props.quality_stars) quality.stars = parseLevel(props.quality_stars.value, quality.stars)
        if (props.quality_motes) quality.motes = parseLevel(props.quality_motes.value, quality.motes)
        if (props.quality_sparkles) quality.sparkles = parseLevel(props.quality_sparkles.value, quality.sparkles)
        if (props.quality_embers) quality.embers = parseLevel(props.quality_embers.value, quality.embers)
        setConfig({
          tickers: SLOT_KEYS.map((k) => slots[k]).filter(Boolean),
          range,
          flipColors,
          quality: { ...quality },
        })
      },
    }
    return () => {
      window.wallpaperPropertyListener = undefined
    }
  }, [])

  return config
}

