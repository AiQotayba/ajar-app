"use client"

import { Building2, MapPin, Users, TrendingUp } from "lucide-react"

const stats = [
  {
    icon: Building2,
    value: "2,500+",
    label: "عقار متاح",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: MapPin,
    value: "15+",
    label: "مدينة",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Users,
    value: "1,200+",
    label: "عميل راضٍ",
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
  },
  {
    icon: TrendingUp,
    value: "98%",
    label: "نسبة النجاح",
    color: "text-emerald-600",
    bgColor: "bg-emerald-600/10",
  },
]

export function StatsSection() {
  return (
    <div className="px-4">
      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-card border border-border hover:shadow-md transition-all duration-300"
            >
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-xl mb-2`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-lg font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground text-center mt-1">{stat.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
