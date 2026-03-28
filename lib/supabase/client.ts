import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const isPlaceholder =
  !supabaseUrl ||
  !supabaseKey ||
  !supabaseUrl.startsWith("http")

export const createClient = () =>
  createBrowserClient(
    isPlaceholder ? "https://placeholder.supabase.co" : supabaseUrl,
    isPlaceholder ? "placeholder" : supabaseKey
  )
