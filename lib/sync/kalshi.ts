import { KALSHI_API } from "@/lib/constants"
import type { MarketCategory } from "@/types"

interface KalshiMarket {
  ticker: string
  event_ticker: string
  title: string
  subtitle: string
  yes_ask: number
  no_ask: number
  last_price: number
  volume: number
  close_time: string
  status: string
  result: string
  category: string
}

interface KalshiResponse {
  markets: KalshiMarket[]
  cursor: string
}

const mapCategory = (category: string): MarketCategory => {
  const lower = category?.toLowerCase() ?? ""
  if (lower.includes("politic") || lower.includes("elect")) return "politics"
  if (lower.includes("sport")) return "sports"
  if (lower.includes("tech")) return "tech"
  if (lower.includes("crypto") || lower.includes("financ")) return "crypto"
  if (lower.includes("climate") || lower.includes("science")) return "science"
  if (lower.includes("econom")) return "economics"
  return "custom"
}

export const fetchKalshiMarkets = async () => {
  const res = await fetch(
    `${KALSHI_API}/markets?limit=50&status=open`,
    { next: { revalidate: 0 } }
  )
  if (!res.ok) throw new Error(`Kalshi API error: ${res.status}`)

  const data: KalshiResponse = await res.json()

  return data.markets.map((m) => {
    // Kalshi prices are in cents (0-100)
    const probability = Math.max(0.01, Math.min(0.99, (m.last_price || 50) / 100))

    return {
      sync_source: "kalshi" as const,
      sync_id: m.ticker,
      question: m.title,
      description: m.subtitle || null,
      category: mapCategory(m.category),
      resolution_date: m.close_time,
      probability,
      sync_probability: probability,
      sync_volume: m.volume || 0,
      total_volume: 0,
      is_synced: true,
      status: "open" as const,
      last_synced_at: new Date().toISOString(),
    }
  })
}
