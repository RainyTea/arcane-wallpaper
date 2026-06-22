import Panel from '../Panel/Panel'
import { useSystemInfo } from '../../hooks/useSystemInfo'
import type { Pos } from '../../types'
import styles from './SystemPanel.module.css'

interface SystemPanelProps {
  stackIndex?: number
  z?: number
  focused?: boolean
  getInitialPos?: () => Pos | null
  onMove?: (pos: Pos) => void
  onFocus?: () => void
  onClose: () => void
}

function fmtUsageTemp(usage: number | null, temp: number | null): string | null {
  const parts: string[] = []
  if (usage != null) parts.push(`Usage ${Math.round(usage)}%`)
  if (temp != null) parts.push(`Temp ${Math.round(temp)}°C`)
  return parts.length ? parts.join('   ') : null
}

// HWiNFO/Windows often surfaces CPU names with a trailing core-count phrase
// (e.g. "AMD Ryzen 9 5900X 12-Core Processor"). Trim it so the panel reads cleanly.
function trimCpuName(raw: string | null): string | null {
  if (!raw) return raw
  return raw
    .replace(/\s*\d+\s*-?\s*Core(?:\s*Processor)?\s*$/i, '')
    .replace(/\s+with\s+Radeon.*$/i, '')
    .trim()
}

function fmtClock(mhz: number | null): string | null {
  if (mhz == null) return null
  return `${(mhz / 1000).toFixed(2)} GHz`
}

function fmtClockMhz(mhz: number | null): string | null {
  if (mhz == null) return null
  return `${Math.round(mhz)} MHz`
}

function fmtPowerBreakdown(gpuW: number | null, cpuW: number | null): string | null {
  const parts: string[] = []
  if (gpuW != null) parts.push(`GPU ${Math.round(gpuW)} W`)
  if (cpuW != null) parts.push(`CPU ${Math.round(cpuW)} W`)
  return parts.length ? parts.join(' / ') : null
}

function fmtUsedTotalGb(used: number | null, total: number | null): string | null {
  if (used != null && total != null) {
    return `${used.toFixed(1)} / ${total.toFixed(0)} GB`
  }
  if (total != null) return `${total.toFixed(0)} GB`
  if (used != null) return `${used.toFixed(1)} GB`
  return null
}

interface DeviceRowsProps {
  label: string
  name: string | null
  primary?: string | null
  secondary?: string | null
}

function DeviceRows({ label, name, primary, secondary }: DeviceRowsProps) {
  if (!name && !primary && !secondary) return null
  return (
    <>
      <tr className={styles.deviceRow}>
        <th scope="row">{label}</th>
        <td>
          {name && <div className={styles.deviceName}>{name}</div>}
        </td>
      </tr>
      {(primary || secondary) && (
        <tr className={styles.statsRow}>
          <th scope="row" aria-hidden />
          <td>
            {primary && <div className={styles.primaryMetric}>{primary}</div>}
            {secondary && <div className={styles.secondaryMetric}>{secondary}</div>}
          </td>
        </tr>
      )}
    </>
  )
}

export default function SystemPanel({
  stackIndex,
  z,
  focused,
  getInitialPos,
  onMove,
  onFocus,
  onClose,
}: SystemPanelProps) {
  const info = useSystemInfo({ enableFps: true })

  const cpuClock = fmtClock(info.cpuCoreClockMhz)
  const cpuUsageTemp = fmtUsageTemp(info.cpuUsage, info.cpuTemp)
  const gpuClock = fmtClockMhz(info.gpuCoreClockMhz)
  const gpuUsageTemp = fmtUsageTemp(info.gpuUsage, info.gpuTemp)
  const ram = info.bridgeConnected ? fmtUsedTotalGb(info.ramUsedGb, info.ramTotalGb) : null
  const vram = info.bridgeConnected ? fmtUsedTotalGb(info.gpuVramUsedGb, info.gpuVramTotalGb) : null
  const watts = info.watts != null ? `${Math.round(info.watts)} W` : null
  const powerBreakdown = fmtPowerBreakdown(info.gpuWatts, info.cpuWatts)
  const storage = info.storageTotalGb != null ? `${info.storageTotalGb.toFixed(1)} GB` : null
  const fps = info.fps ? String(info.fps) : null

  return (
    <Panel
      title="System Codex"
      onClose={onClose}
      onFocus={onFocus}
      onMove={onMove}
      getInitialPos={getInitialPos}
      z={z}
      stackIndex={stackIndex}
      focused={focused}
    >
      <table className={styles.table}>
        <tbody>
          <DeviceRows
            label="CPU"
            name={trimCpuName(info.cpuName)}
            primary={cpuClock}
            secondary={cpuUsageTemp}
          />
          <DeviceRows label="GPU" name={info.gpuName} primary={gpuClock} secondary={gpuUsageTemp} />
          {ram && (
            <tr>
              <th scope="row">Memory</th>
              <td>{ram}</td>
            </tr>
          )}
          {vram && (
            <tr>
              <th scope="row">VRAM</th>
              <td>{vram}</td>
            </tr>
          )}
          {watts && (
            <tr>
              <th scope="row">System Power</th>
              <td>
                {watts}
                {powerBreakdown && (
                  <span className={styles.powerBreakdown}> ({powerBreakdown})</span>
                )}
              </td>
            </tr>
          )}
          {storage && (
            <tr>
              <th scope="row">Storage</th>
              <td>{storage}</td>
            </tr>
          )}
          {fps && (
            <tr>
              <th scope="row">FPS</th>
              <td>{fps}</td>
            </tr>
          )}
        </tbody>
      </table>
    </Panel>
  )
}
