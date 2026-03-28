"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {error.message.includes("Supabase")
          ? "Database connection failed. Make sure your Supabase project is set up."
          : "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
