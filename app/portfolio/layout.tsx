import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Track your positions, P&L, trade history, and followed markets.",
}

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
