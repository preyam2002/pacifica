import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "See who's best at predicting the future. Rankings by portfolio value, accuracy, streaks, and edge vs real-money markets.",
}

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
