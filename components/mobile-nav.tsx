"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { TrendingUp, Trophy, Briefcase, Plus, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers"

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/markets", icon: TrendingUp, label: "Markets" },
  { href: "/markets/create", icon: Plus, label: "Create" },
  { href: "/leaderboard", icon: Trophy, label: "Rank" },
  { href: "/portfolio", icon: Briefcase, label: "Portfolio", auth: true },
]

export const MobileNav = () => {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <nav className="glass fixed bottom-0 left-0 right-0 z-50 border-t border-glass-border md:hidden">
      <div className="flex items-center justify-around py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {navItems
          .filter((item) => !item.auth || user)
          .map((item) => {
            const active = pathname === item.href
            const isCreate = item.href === "/markets/create"
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {isCreate ? (
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                    active
                      ? "bg-primary text-primary-foreground glow-primary"
                      : "bg-primary/15 text-primary"
                  )}>
                    <item.icon className="h-4.5 w-4.5" />
                  </div>
                ) : (
                  <div className="relative">
                    <item.icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_6px_oklch(0.78_0.155_185)]")} />
                    {active && (
                      <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                    )}
                  </div>
                )}
                <span className={cn("whitespace-nowrap", isCreate && "mt-0.5")}>{item.label}</span>
              </Link>
            )
          })}
      </div>
    </nav>
  )
}
