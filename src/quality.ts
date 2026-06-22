export type QualityLevel = 'off' | 'low' | 'medium' | 'high'

type ActiveLevel = Exclude<QualityLevel, 'off'>

export const STAR_COUNTS: Record<ActiveLevel, number> = {
  low: 25,
  medium: 60,
  high: 100,
}

export const MOTE_COUNTS: Record<ActiveLevel, number> = {
  low: 10,
  medium: 24,
  high: 40,
}

export const SPARKLE_CAPS: Record<ActiveLevel, number> = {
  low: 30,
  medium: 80,
  high: 140,
}

export const EMBER_CAPS: Record<ActiveLevel, { base: number; full: number }> = {
  low: { base: 10, full: 18 },
  medium: { base: 18, full: 32 },
  high: { base: 26, full: 48 },
}

export interface QualitySettings {
  stars: QualityLevel
  motes: QualityLevel
  sparkles: QualityLevel
  embers: QualityLevel
}

export const DEFAULT_QUALITY: QualitySettings = {
  stars: 'medium',
  motes: 'medium',
  sparkles: 'medium',
  embers: 'medium',
}
