import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Waves } from "lucide-react"

export default function NotFound() {
  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
      <div className="hero-mesh absolute inset-0 -z-10 opacity-30" />
      <div className="float flex h-20 w-20 items-center justify-center rounded-2xl border border-border/40 bg-muted/50">
        <Waves className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold">Lost at sea</h1>
        <p className="max-w-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has drifted away.
        </p>
      </div>
      <Link href="/">
        <Button className="glow-primary">Go Home</Button>
      </Link>
    </div>
  )
}
