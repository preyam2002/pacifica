import { POLYMARKET_API } from "@/lib/constants"
import type { MarketCategory } from "@/types"

interface PolymarketMarket {
  condition_id: string
  question: string
  description: string
  outcomes: string
  outcomePrices: string
  volume_num: number
  end_date_iso: string
  active: boolean
  closed: boolean
  category: string
}

const mapCategory = (category: string): MarketCategory => {
  const lower = category?.toLowerCase() ?? ""
  if (lower.includes("politic") || lower.includes("elect")) return "politics"
  if (lower.includes("sport")) return "sports"
  if (lower.includes("tech")) return "tech"
  if (lower.includes("crypto") || lower.includes("bitcoin")) return "crypto"
  if (lower.includes("entertain") || lower.includes("pop")) return "entertainment"
  if (lower.includes("science")) return "science"
  if (lower.includes("econom") || lower.includes("financ")) return "economics"
  return "custom"
}

export const fetchPolymarketMarkets = async () => {
  const res = await fetch(
    `${POLYMARKET_API}/markets?active=true&closed=false&limit=50&order=volume_num&ascending=false`,
    { next: { revalidate: 0 } }
  )
  if (!res.ok) throw new Error(`Polymarket API error: ${res.status}`)

  const markets: PolymarketMarket[] = await res.json()

  // Filter to binary markets (exactly 2 outcomes)
  return markets
    .filter((m) => {
      try {
        const outcomes = JSON.parse(m.outcomes)
        return outcomes.length === 2
      } catch {
        return false
      }
    })
    .map((m) => {
      let probability = 0.5
      try {
        const prices = JSON.parse(m.outcomePrices)
        probability = parseFloat(prices[0]) || 0.5
      } catch {}

      return {
        sync_source: "polymarket" as const,
        sync_id: m.condition_id,
        question: m.question,
        description: m.description || null,
        category: mapCategory(m.category),
        resolution_date: m.end_date_iso,
        probability: Math.max(0.01, Math.min(0.99, probability)),
        sync_probability: Math.max(0.01, Math.min(0.99, probability)),
        sync_volume: m.volume_num || 0,
        total_volume: 0,
        is_synced: true,
        status: "open" as const,
        last_synced_at: new Date().toISOString(),
      }
    })
}
