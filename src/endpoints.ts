
/** Yahoo range values, matching the WE options. */
export type ChartRange = '1d' | '5d' | '1mo' | '6mo' | '1y'

/** Short display label for ChartRange, used in StockSparkline */
export const RANGE_LABEL: Record<ChartRange, string> = {
  '1d': '1D',
  '5d': '5D',
  '1mo': '1M',
  '6mo': '6M',
  '1y': '1Y',
}

/** Yahoo requires interval & range to match. Daily candles for anything older than 1month,
 *  under that, use shorter intervals to get more detail, 
 *  also more to plot on graphs to seem more alive
 */
const INTERVAL_FOR: Record<ChartRange, string> = {
  '1d': '5m',
  '5d': '15m',
  '1mo': '1d',
  '6mo': '1d',
  '1y': '1d',
}

/** Yahoo Finance chart endpoint for a single ticker over the given range */
export function yahooChartUrl(ticker: string, range: ChartRange = '1mo'): string {
  const interval = INTERVAL_FOR[range]
  return `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    ticker,
  )}?interval=${interval}&range=${range}`
}

/** CORS proxy (fallback option) */
export function corsProxyUrl(url: string): string {
  return `https://corsproxy.io/?url=${encodeURIComponent(url)}`
}

/** Optional local HWInfo bridge companion app */
export const HWINFO_BRIDGE_URL = 'http://127.0.0.1:8765/sensors'
