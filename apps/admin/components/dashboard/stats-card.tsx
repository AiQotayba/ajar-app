import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatsCard({ title, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary to-primary/80",
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-3">
            <p className="text-sm font-medium text-primary-foreground/80">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-primary-foreground">{value}</p>
            {trend && (
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm",
                    trend.isPositive ? "bg-white/20 text-white" : "bg-destructive/20 text-white",
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-xs text-primary-foreground/70">من الشهر الماضي</span>
              </div>
            )}
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Icon className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
