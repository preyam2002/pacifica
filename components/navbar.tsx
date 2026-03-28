"use client"

import Link from "next/link"
import { useAuth } from "@/components/providers"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Waves, TrendingUp, Plus, Trophy, Briefcase, LogOut, User, Settings, Flame, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { ActivityFeed } from "@/components/activity-feed"
import { RankBadge } from "@/components/rank-badge"
import { useRank } from "@/lib/hooks/use-rank"

export const Navbar = () => {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const rank = useRank(user?.id)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <nav className="glass sticky top-0 z-50 border-b border-glass-border">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 transition-all group-hover:bg-primary/25 group-hover:glow-primary">
              <Waves className="h-4.5 w-4.5 text-primary transition-transform group-hover:scale-110" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight text-foreground">
              Pacifica
            </span>
          </Link>
          <div className="hidden items-center gap-0.5 md:flex">
            <Link href="/markets">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-primary/5">
                <TrendingUp className="mr-1.5 h-4 w-4" />
                Markets
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-primary/5">
                <Trophy className="mr-1.5 h-4 w-4" />
                Leaderboard
              </Button>
            </Link>
            {user && (
              <Link href="/portfolio">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-primary/5">
                  <Briefcase className="mr-1.5 h-4 w-4" />
                  Portfolio
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : user && profile ? (
            <>
              <Link href="/markets/create">
                <Button size="sm" variant="outline" className="hidden border-primary/20 text-primary hover:bg-primary/10 hover:text-primary sm:flex">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create
                </Button>
              </Link>
              <ActivityFeed />
              <div className="relative overflow-hidden rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-sm font-semibold text-primary">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 btn-shimmer opacity-50" />
                <span className="relative">${profile.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<button className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 transition-all hover:border-primary/30 hover:bg-accent" />}
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                      {profile.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 glass">
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{profile.display_name ?? profile.username}</p>
                      {rank && <RankBadge rank={rank} />}
                    </div>
                    <p className="text-xs text-muted-foreground">@{profile.username}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-mono">
                        <TrendingUp className="h-3 w-3 text-yes" />
                        {profile.total_trades}
                      </span>
                      {profile.current_streak > 0 && (
                        <span className="flex items-center gap-1 font-mono">
                          <Flame className="h-3 w-3 text-no" />
                          {profile.current_streak}
                        </span>
                      )}
                      {profile.edge_trades > 0 && (
                        <span className="flex items-center gap-1 font-mono">
                          <Zap className="h-3 w-3 text-primary" />
                          {((profile.edge_correct / profile.edge_trades) * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push(`/profile/${profile.username}`)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push("/portfolio")}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Portfolio
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push("/settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer" variant="destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="glow-primary">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
