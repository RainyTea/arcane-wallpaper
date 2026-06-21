import { useEffect, useState } from 'react'
import { HWINFO_BRIDGE_URL } from '../endpoints'

export interface SystemInfo {
  fps: number
  cpuName: string | null
  cpuUsage: number | null
  cpuTemp: number | null
  cpuWatts: number | null
  cpuCoreClockMhz: number | null
  gpuName: string | null
  gpuUsage: number | null
  gpuTemp: number | null
  gpuWatts: number | null
  gpuCoreClockMhz: number | null
  gpuVramUsedGb: number | null
  gpuVramTotalGb: number | null
  ramTotalGb: number | null
  ramUsedGb: number | null
  watts: number | null
  storageTotalGb: number | null
  bridgeConnected: boolean
}

interface BridgeSensors {
  cpu?: { name?: string; usage?: number; temp?: number; watts?: number; coreClockMhz?: number }
  gpu?: {
    name?: string
    usage?: number
    temp?: number
    watts?: number
    coreClockMhz?: number
    memory?: { totalGb?: number; usedGb?: number }
  }
  memory?: { totalGb?: number; usedGb?: number }
  storage?: { totalGb?: number }
  system?: { watts?: number }
}

const BRIDGE_POLL_MS = 2000

const emptyInfo: SystemInfo = {
  fps: 0,
  cpuName: null,
  cpuUsage: null,
  cpuTemp: null,
  cpuWatts: null,
  cpuCoreClockMhz: null,
  gpuName: null,
  gpuUsage: null,
  gpuTemp: null,
  gpuWatts: null,
  gpuCoreClockMhz: null,
  gpuVramUsedGb: null,
  gpuVramTotalGb: null,
  ramTotalGb: null,
  ramUsedGb: null,
  watts: null,
  storageTotalGb: null,
  bridgeConnected: false,
}

/**
 * Live system info for the System Codex panel. FPS is always computed locally
 * CPU/GPU/RAM/power/storage come from the optional HWInfo bridge 
 * If the bridge isn't reachable, those fields stay null
 */
export function useSystemInfo(): SystemInfo {
  const [info, setInfo] = useState<SystemInfo>(emptyInfo)

  // FPS via rAF, updated once per second.
  useEffect(() => {
    let rafId = 0
    let frames = 0
    let windowStart = performance.now()

    const tick = (now: number) => {
      frames += 1
      const elapsed = now - windowStart
      if (elapsed >= 1000) {
        const fps = Math.round((frames * 1000) / elapsed)
        setInfo((prev) => (prev.fps === fps ? prev : { ...prev, fps }))
        frames = 0
        windowStart = now
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  // Optional bridge polling.
  useEffect(() => {
    const controller = new AbortController()

    async function poll() {
      try {
        const res = await fetch(HWINFO_BRIDGE_URL, {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as BridgeSensors
        setInfo((prev) => ({
          ...prev,
          cpuName: data.cpu?.name ?? prev.cpuName,
          cpuUsage: data.cpu?.usage ?? null,
          cpuTemp: data.cpu?.temp ?? null,
          cpuWatts: data.cpu?.watts ?? null,
          cpuCoreClockMhz: data.cpu?.coreClockMhz ?? null,
          gpuName: data.gpu?.name ?? prev.gpuName,
          gpuUsage: data.gpu?.usage ?? null,
          gpuTemp: data.gpu?.temp ?? null,
          gpuWatts: data.gpu?.watts ?? null,
          gpuCoreClockMhz: data.gpu?.coreClockMhz ?? null,
          gpuVramUsedGb: data.gpu?.memory?.usedGb ?? null,
          gpuVramTotalGb: data.gpu?.memory?.totalGb ?? prev.gpuVramTotalGb,
          ramTotalGb: data.memory?.totalGb ?? prev.ramTotalGb,
          ramUsedGb: data.memory?.usedGb ?? null,
          watts: data.system?.watts ?? null,
          storageTotalGb: data.storage?.totalGb ?? prev.storageTotalGb,
          bridgeConnected: true,
        }))
      } catch {
        if (controller.signal.aborted) return
        setInfo((prev) =>
          prev.bridgeConnected ? { ...prev, bridgeConnected: false } : prev,
        )
      }
    }

    poll()
    const id = window.setInterval(poll, BRIDGE_POLL_MS)
    return () => {
      controller.abort()
      window.clearInterval(id)
    }
  }, [])

  return info
}
