"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CATEGORIES, DEFAULT_LIQUIDITY_PARAM, DEFAULT_PROBABILITY } from "@/lib/constants"
import type { MarketCategory } from "@/types"
import { Loader2, ArrowLeft, Sparkles, HelpCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

export default function CreateMarketPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [question, setQuestion] = useState(searchParams.get("q") ?? "")
  const [description, setDescription] = useState(searchParams.get("desc") ?? "")
  const [category, setCategory] = useState<MarketCategory>(
    (searchParams.get("cat") as MarketCategory) ?? "custom"
  )
  const [resolutionDate, setResolutionDate] = useState("")
  const [resolutionSource, setResolutionSource] = useState(searchParams.get("src") ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from("markets")
      .insert({
        creator_id: user.id,
        question,
        description: description || null,
        category,
        resolution_date: new Date(resolutionDate).toISOString(),
        resolution_source: resolutionSource || null,
        probability: DEFAULT_PROBABILITY,
        liquidity_param: DEFAULT_LIQUIDITY_PARAM,
      })
      .select("id")
      .single()

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.push(`/markets/${data.id}`)
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
        <div className="hero-mesh absolute inset-0 -z-10 opacity-20" />
        <div className="float flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold">Create a Market</h1>
          <p className="text-muted-foreground">Sign in to create your prediction market</p>
        </div>
        <Link href="/auth/login">
          <Button className="glow-primary">Sign in</Button>
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className="mx-auto max-w-lg space-y-6"
    >
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <Link href="/markets">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Create a Market</h1>
          <p className="text-xs text-muted-foreground">Ask the crowd a question</p>
        </div>
      </motion.div>

      {/* Live preview */}
      {question.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-4"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/60 mb-2">Preview</p>
          <p className="text-sm font-semibold leading-snug">{question}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-muted-foreground/40">50%</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/40">Starting odds</span>
          </div>
        </motion.div>
      )}

      <motion.form
        variants={stagger}
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-border/30 bg-card/60 p-5 backdrop-blur-sm"
      >
        <motion.div variants={fadeUp} className="space-y-1.5">
          <Label htmlFor="question" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Question
          </Label>
          <Textarea
            id="question"
            placeholder="Will Bitcoin reach $100k by December 2026?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            maxLength={500}
            rows={2}
            className="resize-none bg-secondary/30 border-border/40 text-base focus:border-primary/40"
          />
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <HelpCircle className="h-3 w-3" />
              {question.length > 0 && !question.trim().endsWith("?")
                ? "Tip: questions should end with a ?"
                : "Clear yes/no question with specific resolution criteria"}
            </p>
            <span className={cn(
              "font-mono text-[10px]",
              question.length > 450 ? "text-no" : "text-muted-foreground/50"
            )}>
              {question.length}/500
            </span>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-1.5">
          <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Additional context, resolution criteria, sources..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={2000}
            className="resize-none bg-secondary/30 border-border/40 focus:border-primary/40"
          />
          {description.length > 0 && (
            <span className={cn(
              "block text-right font-mono text-[10px]",
              description.length > 1800 ? "text-no" : "text-muted-foreground/50"
            )}>
              {description.length}/2000
            </span>
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as MarketCategory)}>
              <SelectTrigger className="bg-secondary/30 border-border/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="resolution-date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Closes
            </Label>
            <Input
              id="resolution-date"
              type="datetime-local"
              value={resolutionDate}
              onChange={(e) => setResolutionDate(e.target.value)}
              required
              min={new Date().toISOString().slice(0, 16)}
              className="bg-secondary/30 border-border/40 focus:border-primary/40"
            />
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-1.5">
          <Label htmlFor="resolution-source" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Resolution Source
          </Label>
          <Input
            id="resolution-source"
            placeholder="e.g., CoinGecko price feed, Official announcement"
            value={resolutionSource}
            onChange={(e) => setResolutionSource(e.target.value)}
            className="bg-secondary/30 border-border/40 focus:border-primary/40"
          />
        </motion.div>

        {error && (
          <motion.p variants={fadeUp} className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
            {error}
          </motion.p>
        )}

        <motion.div variants={fadeUp}>
          <Button
            type="submit"
            className={cn(
              "w-full h-12 font-heading text-base font-semibold tracking-tight",
              !loading && "glow-primary"
            )}
            disabled={loading || !question.trim() || !resolutionDate}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Create Market
          </Button>
        </motion.div>
      </motion.form>
    </motion.div>
  )
}
