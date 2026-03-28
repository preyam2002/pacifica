import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProfileView } from "./profile-view"

export const dynamic = "force-dynamic"

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single()

  if (!profile) notFound()

  const [{ data: positions }, { data: recentTrades }, { count: marketsCreated }, { count: higherBalanceCount }] = await Promise.all([
    supabase
      .from("positions")
      .select("*, market:markets(question, probability, status)")
      .eq("user_id", profile.id)
      .or("yes_shares.gt.0,no_shares.gt.0")
      .limit(10),
    supabase
      .from("trades")
      .select("*, market:markets(question)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("markets")
      .select("id", { count: "exact", head: true })
      .eq("creator_id", profile.id),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gt("balance", profile.balance),
  ])

  const rank = (higherBalanceCount ?? 0) + 1

  return (
    <ProfileView
      profile={profile}
      positions={positions ?? []}
      recentTrades={recentTrades ?? []}
      marketsCreated={marketsCreated ?? 0}
      rank={rank}
    />
  )
}
