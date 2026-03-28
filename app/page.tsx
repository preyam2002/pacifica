import { createClient } from "@/lib/supabase/server"
import { HomeContent } from "./home-content"

export const dynamic = "force-dynamic"

export default async function Home() {
  const supabase = await createClient()

  const [
    { data: trending },
    { data: newest },
    { data: closingSoon },
    { count: totalMarkets },
    { count: totalUsers },
    { data: volumeData },
  ] = await Promise.all([
    supabase
      .rpc("get_trending_markets", { p_limit: 6 })
      .select("*, creator:profiles(*)"),
    supabase
      .from("markets")
      .select("*, creator:profiles(*)")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("markets")
      .select("*, creator:profiles(*)")
      .eq("status", "open")
      .order("resolution_date", { ascending: true })
      .gte("resolution_date", new Date().toISOString())
      .limit(6),
    supabase
      .from("markets")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("markets")
      .select("total_volume"),
  ])

  return (
    <HomeContent
      trending={trending ?? []}
      newest={newest ?? []}
      closingSoon={closingSoon ?? []}
      stats={{
        totalMarkets: totalMarkets ?? 0,
        totalUsers: totalUsers ?? 0,
        totalVolume: (volumeData ?? []).reduce((s: number, m: any) => s + (m.total_volume ?? 0), 0),
      }}
    />
  )
}
