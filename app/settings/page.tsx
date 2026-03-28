"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EmptyState } from "@/components/empty-state"
import { Loader2, ArrowLeft, Settings, Check, User, Mail, DollarSign, TrendingUp } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user || !profile) {
    return (
      <EmptyState
        icon={<Settings className="h-8 w-8" />}
        title="Sign in to access settings"
        description="Manage your profile and preferences."
        action={
          <Link href="/auth/login">
            <Button className="glow-primary">Sign in</Button>
          </Link>
        }
      />
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const supabase = createClient()
    const { error: err } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      })
      .eq("id", user.id)

    if (err) {
      setError(err.message)
    } else {
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className="mx-auto max-w-lg space-y-6"
    >
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <Link href={`/profile/${profile.username}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-xs text-muted-foreground">Manage your profile</p>
        </div>
      </motion.div>

      <motion.form
        variants={stagger}
        onSubmit={handleSave}
        className="space-y-5 rounded-2xl border border-border/30 bg-card/60 p-5 backdrop-blur-sm"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-4 pb-2">
          <div className="relative">
            <Avatar className="h-16 w-16 ring-2 ring-border/30 ring-offset-2 ring-offset-card">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-primary/15 text-primary text-lg font-bold">
                {profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <p className="font-heading text-base font-bold">@{profile.username}</p>
            <p className="text-xs text-muted-foreground">Username cannot be changed</p>
          </div>
        </motion.div>

        <div className="sep-fade" />

        <motion.div variants={fadeUp} className="space-y-1.5">
          <Label htmlFor="display-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Display Name
          </Label>
          <Input
            id="display-name"
            placeholder={profile.username}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            className="bg-secondary/30 border-border/40 focus:border-primary/40"
          />
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-1.5">
          <Label htmlFor="avatar-url" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Avatar URL
          </Label>
          <Input
            id="avatar-url"
            placeholder="https://..."
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            type="url"
            className="bg-secondary/30 border-border/40 focus:border-primary/40"
          />
          <p className="text-[10px] text-muted-foreground">
            Paste a URL to any image. Try Gravatar or GitHub avatar.
          </p>
        </motion.div>

        {error && (
          <motion.p variants={fadeUp} className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
            {error}
          </motion.p>
        )}

        <motion.div variants={fadeUp}>
          <Button type="submit" className="w-full h-11 font-semibold" disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : saved ? (
              <Check className="mr-2 h-4 w-4" />
            ) : null}
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </motion.div>
      </motion.form>

      {/* Account info */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-border/30 bg-card/60 p-5 backdrop-blur-sm"
      >
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/50">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground">Balance</p>
              <p className="text-sm font-mono font-bold">
                ${profile.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yes/10">
              <TrendingUp className="h-3.5 w-3.5 text-yes" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground">Total Trades</p>
              <p className="text-sm font-mono font-bold">{profile.total_trades}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
