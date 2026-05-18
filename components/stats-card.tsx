import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("border-border/50", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{title}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{value}</span>
              {trend && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.isPositive ? "text-success" : "text-destructive"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
            {description && (
              <span className="text-xs text-muted-foreground">{description}</span>
            )}
          </div>
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
