"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
interface SearchResult {
  id: string
  question: string
  probability: number
  status: string
  category: string
}
import Link from "next/link"
import { cn } from "@/lib/utils"

export const SearchBar = ({ className }: { className?: string }) => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from("markets")
        .select("id, question, probability, status, category")
        .ilike("question", `%${query}%`)
        .limit(8)
      setResults(data ?? [])
      setOpen(true)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search markets..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-8"
          onFocus={() => query.length >= 2 && setOpen(true)}
        />
        {query && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => { setQuery(""); setOpen(false) }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full z-50 mt-1 w-full max-h-80 overflow-y-auto rounded-xl border border-border/50 bg-popover/95 backdrop-blur-lg p-1 shadow-xl">
          {loading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Searching...</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No markets found</div>
          ) : (
            results.map((market) => (
              <Link
                key={market.id}
                href={`/markets/${market.id}`}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent"
                onClick={() => { setOpen(false); setQuery("") }}
              >
                <span className="line-clamp-1 flex-1">{market.question}</span>
                <span className={cn(
                  "ml-2 shrink-0 font-mono text-xs",
                  market.probability >= 0.5 ? "text-yes" : "text-no"
                )}>
                  {Math.round(market.probability * 100)}%
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
