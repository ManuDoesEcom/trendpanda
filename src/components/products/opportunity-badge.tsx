import { Flame, Sprout, TriangleAlert } from "lucide-react"
import type { OpportunityBadge } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { badgeVariant } from "@/lib/utils/scoring"
import { cn } from "cn"

const BADGE_ICON: Record<OpportunityBadge, typeof Flame> = {
  WINNER: Flame,
  POTENTIAL: Sprout,
  SATURATED: TriangleAlert,
}

export function OpportunityBadgePill({
  badge,
  score,
  className,
}: {
  badge: OpportunityBadge
  score?: number
  className?: string
}) {
  const Icon = BADGE_ICON[badge]

  return (
    <Badge variant={badgeVariant(badge)} className={cn("gap-1", className)}>
      <Icon />
      {badge}
      {typeof score === "number" && <span className="opacity-80">· {score}</span>}
    </Badge>
  )
}
