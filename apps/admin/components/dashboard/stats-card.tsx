import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"
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
  variant?: "default" | "secondary" | "destructive"
  suffix?: string
}

export function StatsCard({ title, value, icon: Icon, trend, className, variant = "default", suffix }: StatsCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300",
        variant === "default" && "!bg-primary ",
        variant === "secondary" && "bg-primary",
        variant === "destructive" && "bg-[#01805F]",
        "hover:scale-[1.02] active:scale-95",
        "rounded-lg",
        className,
      )}
    >
      {/* Background Icon */}
      <div className="absolute bottom-0 right-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
        <Icon className="h-32 w-32 md:h-40 md:w-40 text-primary-foreground translate-x-1/4 translate-y-1/4" strokeWidth={1.5} />
      </div>

      <CardContent className="relative z-10 p-4 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-3">
            <p className="text-sm font-medium text-primary-foreground/80 animate-in fade-in slide-in-from-right-4 delay-150">
              {title}
            </p>
            <p className="text-3xl md:text-4xl font-bold tracking-tight text-primary-foreground animate-in fade-in slide-in-from-right-4 delay-200">
              {value}
              {suffix && <span className="text-xl md:text-2xl font-bold tracking-tight text-primary-foreground animate-in fade-in slide-in-from-right-4 delay-200">{suffix}</span>}
            </p>
          </div>
          <div
            className={cn(
              "flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full",
              "bg-white/20 backdrop-blur-sm",
              "transition-all duration-300",
              "group-hover:bg-white/30 group-hover:scale-110 group-hover:rotate-3",
              "shadow-lg",
              "animate-in zoom-in-95 fade-in delay-100"
            )}
          >
            <Icon className="h-7 w-7 md:h-8 md:w-8 text-primary-foreground transition-transform duration-300 group-hover:scale-110" />
          </div>
        </div>
      </CardContent>
    </div>
  )
}
