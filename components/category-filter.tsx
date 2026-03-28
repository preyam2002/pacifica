"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { CATEGORIES } from "@/lib/constants"
import type { MarketCategory } from "@/types"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Grid3X3 } from "lucide-react"

interface CategoryFilterProps {
  selected: MarketCategory | null
  onSelect: (category: MarketCategory | null) => void
}

export const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => (
  <ScrollArea className="w-full whitespace-nowrap">
    <div className="flex gap-2 pb-2">
      <Button
        variant={selected === null ? "default" : "outline"}
        size="sm"
        className="shrink-0"
        onClick={() => onSelect(null)}
      >
        All
      </Button>
      <Link href="/markets/categories">
        <Button variant="outline" size="sm" className="shrink-0 gap-1 text-muted-foreground">
          <Grid3X3 className="h-3.5 w-3.5" />
        </Button>
      </Link>
      {CATEGORIES.map((cat) => (
        <Button
          key={cat.value}
          variant={selected === cat.value ? "default" : "outline"}
          size="sm"
          className={cn("shrink-0", selected === cat.value && "bg-primary text-primary-foreground")}
          onClick={() => onSelect(selected === cat.value ? null : cat.value)}
        >
          {cat.emoji} {cat.label}
        </Button>
      ))}
    </div>
    <ScrollBar orientation="horizontal" />
  </ScrollArea>
)
