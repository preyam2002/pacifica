import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { MarketDetail } from "./market-detail"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: market } = await supabase
    .from("markets")
    .select("question, probability, status, category")
    .eq("id", id)
    .single()

  if (!market) return { title: "Market Not Found - Pacifica" }

  const prob = Math.round(market.probability * 100)
  const title = `${market.question} | ${prob}% Yes`
  const description = `Currently at ${prob}% on Pacifica. Trade with play money and see if you can beat the crowd.`

  const ogImage = `/markets/${id}/opengraph-image`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "Pacifica",
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function MarketPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: market }, { data: history }, { data: recentTrades }] = await Promise.all([
    supabase
      .from("markets")
      .select("*, creator:profiles(*)")
      .eq("id", id)
      .single(),
    supabase
      .from("market_history")
      .select("*")
      .eq("market_id", id)
      .order("recorded_at", { ascending: true })
      .limit(500),
    supabase
      .from("trades")
      .select("*, user:profiles(username, avatar_url)")
      .eq("market_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
  ])

  if (!market) notFound()

  return (
    <MarketDetail
      initialMarket={market}
      initialHistory={history ?? []}
      initialTrades={recentTrades ?? []}
    />
  )
}
