import { useEffect, useState } from 'react'
import type { Stock } from '../types'
import { corsProxyUrl, yahooChartUrl } from '../endpoints'
import type { ChartRange } from '../endpoints'
import defaultConfig from '../assets/stocks.json'

const MAX_SLOTS = 4
const POLL_MS = 60_000

function placeholder(ticker: string): Stock {
  return { ticker, price: '-', change: '-', changePercent: '-', volume: '-', up: true, closes: [] }
}

function formatPrice(n: number): string {
  return n >= 1000
    ? n.toLocaleString('en-US', { maximumFractionDigits: 2 })
    : n.toFixed(2)
}

function formatVolume(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(n)
}

interface YahooMeta {
  regularMarketPrice?: number
  chartPreviousClose?: number
  previousClose?: number
  regularMarketVolume?: number
}

interface YahooQuote {
  close?: Array<number | null>
}

interface YahooResponse {
  chart?: { result?: Array<{ meta?: YahooMeta; indicators?: { quote?: YahooQuote[] } }> }
}

async function getJson(url: string, signal: AbortSignal): Promise<YahooResponse> {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<YahooResponse>
}

/**
 * Fetches a single ticker from Yahoo Finance over the requested range.
 * Tries the direct endpoint first, then a public CORS proxy as a fallback.
 */
async function fetchQuote(ticker: string, range: ChartRange, signal: AbortSignal): Promise<Stock> {
  const yahoo = yahooChartUrl(ticker, range)
  const data = await getJson(yahoo, signal).catch(() =>
    getJson(corsProxyUrl(yahoo), signal),
  )

  const result = data.chart?.result?.[0]
  const meta = result?.meta
  if (!meta || meta.regularMarketPrice == null) throw new Error('no price')

  const price = meta.regularMarketPrice
  const prev = meta.chartPreviousClose ?? meta.previousClose ?? price
  const diff = price - prev
  const pct = prev !== 0 ? (diff / prev) * 100 : 0
  const vol = meta.regularMarketVolume ?? 0
  const sign = diff >= 0 ? '+' : ''
  const closes = (result?.indicators?.quote?.[0]?.close ?? []).filter(
    (n): n is number => typeof n === 'number' && Number.isFinite(n),
  )

  return {
    ticker,
    price: formatPrice(price),
    change: sign + diff.toFixed(2),
    changePercent: sign + pct.toFixed(2) + '%',
    volume: vol ? formatVolume(vol) : '—',
    up: diff >= 0,
    closes,
  }
}

/**
 * Polls Yahoo Finance for the given tickers + range every POLL_MS. Changing
 * tickers or range triggers an immediate refetch.
 */
export function useStocks(
  tickers: string[] = defaultConfig.tickers,
  range: ChartRange = '1mo',
): Stock[] {
  const key = tickers.slice(0, MAX_SLOTS).join(',')
  const [quotes, setQuotes] = useState<Record<string, Stock>>({})

  useEffect(() => {
    const list = key ? key.split(',') : []
    if (list.length === 0) return

    const controller = new AbortController()
    const { signal } = controller

    async function refresh() {
      const entries = await Promise.all(
        list.map(async (t): Promise<[string, Stock]> => {
          try {
            return [t, await fetchQuote(t, range, signal)]
          } catch (err) {
            if (!signal.aborted) console.warn(`[useStocks] ${t} fetch failed:`, err)
            return [t, placeholder(t)]
          }
        }),
      )
      if (signal.aborted) return
      setQuotes((prev) => ({ ...prev, ...Object.fromEntries(entries) }))
    }

    refresh()
    const id = window.setInterval(refresh, POLL_MS)

    return () => {
      controller.abort()
      window.clearInterval(id)
    }
  }, [key, range])

  return (key ? key.split(',') : []).map((t) => quotes[t] ?? placeholder(t))
}
