import { createClient } from "@/lib/supabase/server"
import { CATEGORIES } from "@/lib/constants"
import { CategoriesGrid } from "./categories-grid"

export const dynamic = "force-dynamic"

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Fetch counts per category
  const counts: Record<string, { count: number; volume: number }> = {}

  const { data } = await supabase
    .from("markets")
    .select("category, total_volume")
    .eq("status", "open")

  for (const cat of CATEGORIES) {
    const matching = (data ?? []).filter((m) => m.category === cat.value)
    counts[cat.value] = {
      count: matching.length,
      volume: matching.reduce((s, m) => s + (m.total_volume ?? 0), 0),
    }
  }

  return <CategoriesGrid counts={counts} />
}
