import { useMemo, useRef, useState } from 'react'
import Scene from './components/Scene/Scene'
import Background from './components/Background/Background'
import SkyEffects from './components/SkyEffects/SkyEffects'
import BookSlots from './components/BookSlots/BookSlots'
import type { BookTint } from './components/BookSlots/BookSlots'
import RuneStones from './components/RuneStones/RuneStones'
import RuneEmbers from './components/RuneEmbers/RuneEmbers'
import type { RuneEmberSource } from './components/RuneEmbers/RuneEmbers'
import LanternFlicker from './components/LanternFlicker/LanternFlicker'
import CandleFlicker from './components/CandleFlicker/CandleFlicker'
import MagicSparkles from './components/MagicSparkles/MagicSparkles'
import type { SparkleSource } from './components/MagicSparkles/MagicSparkles'
import DustMotes from './components/DustMotes/DustMotes'
import AtmosphereFX from './components/AtmosphereFX/AtmosphereFX'
import CalibrationOverlay from './components/CalibrationOverlay/CalibrationOverlay'
import StockPanel from './components/StockPanel/StockPanel'
import SystemPanel from './components/SystemPanel/SystemPanel'
import { useStocks } from './hooks/useStocks'
import { useSystemInfo } from './hooks/useSystemInfo'
import { useWallpaperEngine } from './hooks/useWallpaperEngine'
import { RANGE_LABEL } from './endpoints'
import { BOOK_SLOTS, RUNE_STONES, SYSTEM_BOOK } from './coords'
import type { OpenPanel, Pos } from './types'

const DEBUG_SLOTS = false

/** Stable map key for the panel position memory */
function panelKey(mode: string, slotIndex: number): string {
  return `${mode}:${slotIndex}`
}

export default function App() {
  const [panels, setPanels] = useState<OpenPanel[]>([])
  const nextIdRef = useRef(1)
  const nextZRef = useRef(1)
  const positionsRef = useRef<Map<string, Pos>>(new Map())
  const we = useWallpaperEngine()
  const stocks = useStocks(we?.tickers, we?.range)
  const systemInfo = useSystemInfo()
  const rangeLabel = RANGE_LABEL[we?.range ?? '1mo']
  const flipColors = we?.flipColors ?? false

  const focusPanel = (id: number) => {
    const z = nextZRef.current++
    setPanels((prev) => prev.map((p) => (p.id === id ? { ...p, z } : p)))
  }

  const closePanel = (id: number) => {
    setPanels((prev) => prev.filter((p) => p.id !== id))
  }

  const handleBookClick = (slotId: number) => {
    const mode = slotId === SYSTEM_BOOK.id ? 'system' : 'stock'
    const existing = panels.find((p) => p.mode === mode && p.slotIndex === slotId)
    if (existing) {
      focusPanel(existing.id)
      return
    }
    const id = nextIdRef.current++
    const z = nextZRef.current++
    setPanels((prev) => [...prev, { id, mode, slotIndex: slotId, z }])
  }

  const topZ = panels.reduce((m, p) => (p.z > m ? p.z : m), -Infinity)

  const tints = useMemo<Record<number, BookTint>>(() => {
    const map: Record<number, BookTint> = {}
    BOOK_SLOTS.forEach((slot, i) => {
      const s = stocks[i]
      if (!s || s.change === '—') {
        map[slot.id] = null
        return
      }
      const pct = Math.abs(parseFloat(s.changePercent)) || 0
      const intensity = Math.max(0, Math.min(1, (pct - 0.5) / 4.5))
      map[slot.id] = { direction: s.up ? 'up' : 'down', intensity }
    })
    // SYSTEM book always glows violet; intensity scales with CPU usage when bridge is up.
    const sysIntensity = systemInfo.cpuUsage != null
      ? 0.4 + Math.min(1, systemInfo.cpuUsage / 100) * 0.6
      : 0.5
    map[SYSTEM_BOOK.id] = { direction: 'system', intensity: sysIntensity }
    return map
  }, [stocks, systemInfo.cpuUsage])

  const labels = useMemo<Record<number, string>>(() => {
    const map: Record<number, string> = {}
    BOOK_SLOTS.forEach((slot, i) => {
      const t = stocks[i]?.ticker
      if (t) map[slot.id] = t
    })
    map[SYSTEM_BOOK.id] = 'SYSTEM'
    return map
  }, [stocks])

  // book effects, each book get effect based on gain/loss and % change
  const sparkleSources = useMemo<SparkleSource[]>(() => {
    const list: SparkleSource[] = []
    BOOK_SLOTS.forEach((slot) => {
      const tint = tints[slot.id]
      if (!tint) return
      const isUp = tint.direction === 'up'
      const showGreen = isUp !== flipColors
      const hue = showGreen ? 130 : 0
      const rate = 1.5 + tint.intensity * 6
      list.push({
        fx: parseFloat(slot.left) / 100 + parseFloat(slot.width) / 100 / 2,
        fy: parseFloat(slot.top) / 100 + parseFloat(slot.height) / 100 / 2,
        radius: 0.04,
        hue,
        rate,
        isLoss: !isUp,
      })
    })
    return list
  }, [tints, flipColors])

  // Slow purple embers rising from each active rune stone.
  const runeEmberSources = useMemo<RuneEmberSource[]>(
    () =>
      RUNE_STONES.slice(0, stocks.length).map((p) => ({
        fx: parseFloat(p.x) / 100,
        fy: parseFloat(p.y) / 100,
      })),
    [stocks.length],
  )

  return (
    <Scene>
      <Background />
      <SkyEffects />
      <LanternFlicker />
      <CandleFlicker />
      <RuneStones activeCount={stocks.length} debug={DEBUG_SLOTS} />
      <BookSlots
        slots={[...BOOK_SLOTS, SYSTEM_BOOK]}
        labels={labels}
        hoverOnlyLabels={{ [SYSTEM_BOOK.id]: true }}
        tints={tints}
        flipColors={flipColors}
        onBookClick={handleBookClick}
        debug={DEBUG_SLOTS}
      />
      <RuneEmbers sources={runeEmberSources} full={stocks.length >= RUNE_STONES.length} />
      <MagicSparkles sources={sparkleSources} />
      <DustMotes />
      <AtmosphereFX />
      {DEBUG_SLOTS && <CalibrationOverlay />}
      {panels.map((p, i) => {
        const focused = p.z === topZ
        const key = panelKey(p.mode, p.slotIndex)
        const getInitialPos = () => positionsRef.current.get(key) ?? null
        const onMove = (pos: Pos) => {
          positionsRef.current.set(key, pos)
        }
        return p.mode === 'stock' ? (
          <StockPanel
            key={p.id}
            slotIndex={p.slotIndex}
            stock={stocks[p.slotIndex] ?? null}
            rangeLabel={rangeLabel}
            flipColors={flipColors}
            stackIndex={i}
            z={p.z}
            focused={focused}
            getInitialPos={getInitialPos}
            onMove={onMove}
            onFocus={() => focusPanel(p.id)}
            onClose={() => closePanel(p.id)}
          />
        ) : (
          <SystemPanel
            key={p.id}
            stackIndex={i}
            z={p.z}
            focused={focused}
            getInitialPos={getInitialPos}
            onMove={onMove}
            onFocus={() => focusPanel(p.id)}
            onClose={() => closePanel(p.id)}
          />
        )
      })}
    </Scene>
  )
}

