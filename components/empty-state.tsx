import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => (
  <div className={cn("flex flex-col items-center justify-center gap-5 py-16 text-center", className)}>
    <div className="relative">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/40 bg-secondary/50 text-muted-foreground">
        {icon}
      </div>
      <div className="absolute inset-0 -z-10 rounded-2xl bg-primary/5 blur-xl" />
    </div>
    <div className="max-w-xs space-y-1.5">
      <h3 className="font-heading text-lg font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    {action}
  </div>
)
