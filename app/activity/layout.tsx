import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Activity",
  description: "See recent trades and comments on your markets.",
}

export default function ActivityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
