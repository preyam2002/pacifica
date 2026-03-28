import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { EmbedWidget } from "./embed-widget"

export const dynamic = "force-dynamic"

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: market } = await supabase
    .from("markets")
    .select("id, question, probability, status, outcome, total_volume, trades_count, sync_source, sync_probability")
    .eq("id", id)
    .single()

  if (!market) notFound()

  return <EmbedWidget market={market} />
}
