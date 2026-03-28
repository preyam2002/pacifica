"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MarketCard } from "@/components/market-card"
import { CategoryFilter } from "@/components/category-filter"
import { SearchBar } from "@/components/search-bar"
import { EmptyState } from "@/components/empty-state"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp } from "lucide-react"
import { useProbChanges } from "@/lib/hooks/use-prob-changes"
import { useMarketSparklines } from "@/lib/hooks/use-market-sparklines"
import { cn } from "@/lib/utils"
import type { Market, MarketCategory } from "@/types"

type SortOption = "trending" | "newest" | "closing_soon"
type SourceFilter = "all" | "synced" | "community"

export default function MarketsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialSort = (searchParams.get("sort") as SortOption) ?? "trending"
  const initialCategory = (searchParams.get("category") as MarketCategory) ?? null

  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<SortOption>(initialSort)
  const [category, setCategory] = useState<MarketCategory | null>(initialCategory)
  const [source, setSource] = useState<SourceFilter>("all")

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (sort !== "trending") params.set("sort", sort)
    if (category) params.set("category", category)
    if (source !== "all") params.set("source", source)
    const qs = params.toString()
    router.replace(`/markets${qs ? `?${qs}` : ""}`, { scroll: false })
  }, [sort, category, source, router])

  const fetchMarkets = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    // Trending uses a custom RPC for composite scoring
    if (sort === "trending" && !category && source === "all") {
      const { data } = await supabase
        .rpc("get_trending_markets", { p_limit: 50 })
        .select("*, creator:profiles(*)")
      setMarkets(data ?? [])
      setLoading(false)
      return
    }

    let query = supabase
      .from("markets")
      .select("*, creator:profiles(*)")
      .eq("status", "open")

    if (category) query = query.eq("category", category)
    if (source === "synced") query = query.eq("is_synced", true)
    if (source === "community") query = query.eq("is_synced", false)

    switch (sort) {
      case "trending":
        query = query.order("total_volume", { ascending: false })
        break
      case "newest":
        query = query.order("created_at", { ascending: false })
        break
      case "closing_soon":
        query = query
          .gte("resolution_date", new Date().toISOString())
          .order("resolution_date", { ascending: true })
        break
    }

    const { data } = await query.limit(50)
    setMarkets(data ?? [])
    setLoading(false)
  }, [sort, category, source])

  useEffect(() => {
    fetchMarkets()
  }, [fetchMarkets])

  const marketIds = useMemo(() => markets.map((m) => m.id), [markets])
  const probChanges = useProbChanges(marketIds)
  const sparklines = useMarketSparklines(marketIds)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Markets</h1>
        <SearchBar className="w-full sm:w-72" />
      </div>

      <Tabs value={sort} onValueChange={(v) => setSort(v as SortOption)}>
        <TabsList>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="newest">Newest</TabsTrigger>
          <TabsTrigger value="closing_soon">Closing Soon</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <CategoryFilter selected={category} onSelect={setCategory} />
        <div className="ml-auto flex items-center gap-1.5">
          {(["all", "synced", "community"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSource(s)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                source === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {s === "all" ? "All" : s === "synced" ? "Synced" : "Community"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : markets.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="h-8 w-8" />}
          title="No markets found"
          description={
            category
              ? "No open markets in this category yet."
              : "No open markets yet. Be the first to create one!"
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} probChange={probChanges[market.id]} sparkline={sparklines[market.id]} />
          ))}
        </div>
      )}
    </div>
  )
}
