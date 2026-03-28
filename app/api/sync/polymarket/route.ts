import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchPolymarketMarkets } from "@/lib/sync/polymarket"

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const markets = await fetchPolymarketMarkets()
    const supabase = await createClient()

    // Get or create system bot user for synced markets
    let { data: botProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", "pacifica_bot")
      .single()

    if (!botProfile) {
      // Bot profile needs to be created manually in Supabase
      return NextResponse.json({
        error: "Bot profile not found. Create a 'pacifica_bot' profile in Supabase.",
      }, { status: 500 })
    }

    let synced = 0
    let updated = 0

    for (const market of markets) {
      // Check if market already exists
      const { data: existing } = await supabase
        .from("markets")
        .select("id")
        .eq("sync_source", "polymarket")
        .eq("sync_id", market.sync_id)
        .eq("is_synced", true)
        .single()

      if (existing) {
        // Update sync probability
        await supabase
          .from("markets")
          .update({
            sync_probability: market.sync_probability,
            sync_volume: market.sync_volume,
            last_synced_at: market.last_synced_at,
          })
          .eq("id", existing.id)
        updated++
      } else {
        // Insert new synced market
        await supabase.from("markets").insert({
          ...market,
          creator_id: botProfile.id,
          liquidity_param: 100,
          yes_shares: 0,
          no_shares: 0,
        })
        synced++
      }
    }

    return NextResponse.json({ synced, updated, total: markets.length })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    )
  }
}
