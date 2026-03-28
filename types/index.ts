export type MarketStatus = "open" | "closed" | "resolved"
export type MarketOutcome = "yes" | "no"
export type MarketCategory =
  | "politics"
  | "sports"
  | "tech"
  | "crypto"
  | "entertainment"
  | "science"
  | "economics"
  | "custom"
export type SyncSource = "polymarket" | "kalshi"
export type TradeSide = "yes" | "no"
export type TradeAction = "buy" | "sell"

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  balance: number
  total_trades: number
  correct_predictions: number
  current_streak: number
  best_streak: number
  daily_streak: number
  last_daily_bonus: string | null
  edge_score: number
  edge_trades: number
  edge_correct: number
  created_at: string
}

export interface Market {
  id: string
  creator_id: string
  question: string
  description: string | null
  category: MarketCategory
  resolution_date: string
  resolution_source: string | null
  status: MarketStatus
  outcome: MarketOutcome | null
  probability: number
  yes_shares: number
  no_shares: number
  liquidity_param: number
  total_volume: number
  is_synced: boolean
  sync_source: SyncSource | null
  sync_id: string | null
  sync_probability: number | null
  sync_volume: number | null
  last_synced_at: string | null
  likes_count: number
  comments_count: number
  trades_count: number
  created_at: string
  creator?: Profile
}

export interface Trade {
  id: string
  user_id: string
  market_id: string
  side: TradeSide
  action: TradeAction
  shares: number
  price: number
  cost: number
  sync_prob_at_trade: number | null
  created_at: string
  market?: Market
  user?: Profile
}

export interface Position {
  id: string
  user_id: string
  market_id: string
  yes_shares: number
  no_shares: number
  avg_yes_price: number
  avg_no_price: number
  total_invested: number
  realized_pnl: number
  created_at: string
  market?: Market
}

export interface MarketHistoryPoint {
  id: string
  market_id: string
  probability: number
  volume: number | null
  recorded_at: string
}

export interface Comment {
  id: string
  user_id: string
  market_id: string
  content: string
  created_at: string
  user?: Profile
}

export interface TradeRequest {
  market_id: string
  side: TradeSide
  action: TradeAction
  shares: number
  max_cost?: number
}

export interface TradeResponse {
  trade_id: string
  cost: number
  price: number
  new_probability: number
  new_balance: number
}

export interface CreateMarketRequest {
  question: string
  description?: string
  category: MarketCategory
  resolution_date: string
  resolution_source?: string
}

export interface MarketFilters {
  status?: MarketStatus
  category?: MarketCategory
  search?: string
  sort?: "trending" | "newest" | "closing_soon" | "most_traded"
  is_synced?: boolean
  limit?: number
  offset?: number
}

export interface LeaderboardEntry {
  rank: number
  profile: Profile
  portfolio_value: number
  accuracy: number
}
