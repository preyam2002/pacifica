import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Markets",
  description: "Browse and trade on prediction markets. Filter by category, sort by trending, newest, or closing soon.",
}

export default function MarketsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
