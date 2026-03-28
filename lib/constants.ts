import type { MarketCategory } from "@/types"

export const DEFAULT_BALANCE = 10_000
export const DEFAULT_LIQUIDITY_PARAM = 100
export const DEFAULT_PROBABILITY = 0.5

export const CATEGORIES: { value: MarketCategory; label: string; emoji: string }[] = [
  { value: "politics", label: "Politics", emoji: "🏛️" },
  { value: "sports", label: "Sports", emoji: "⚽" },
  { value: "tech", label: "Tech", emoji: "💻" },
  { value: "crypto", label: "Crypto", emoji: "₿" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
  { value: "science", label: "Science", emoji: "🔬" },
  { value: "economics", label: "Economics", emoji: "📈" },
  { value: "custom", label: "Custom", emoji: "✨" },
]

export const SYNC_INTERVAL_MS = 15 * 60 * 1000
export const POLYMARKET_API = "https://gamma-api.polymarket.com"
export const KALSHI_API = "https://api.elections.kalshi.com/trade-api/v2"
