import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "cn"

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: {
  label: string
  value: string
  icon: LucideIcon
  hint?: string
  tone?: "default" | "positive" | "warning"
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span
            className={cn(
              "font-heading text-2xl font-semibold",
              tone === "positive" && "text-emerald-500",
              tone === "warning" && "text-amber-500"
            )}
          >
            {value}
          </span>
          {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-4 text-primary" />
        </div>
      </CardContent>
    </Card>
  )
}
