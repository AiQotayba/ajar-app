"use client"

import { Home, Building, Store, Warehouse } from "lucide-react"

const actions = [
  {
    icon: Home,
    label: "شقق",
    href: "/properties?type=apartment",
    gradient: "from-primary to-emerald-600",
  },
  {
    icon: Building,
    label: "فيلات",
    href: "/properties?type=villa",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: Store,
    label: "محلات",
    href: "/properties?type=shop",
    gradient: "from-accent to-orange-500",
  },
  {
    icon: Warehouse,
    label: "مكاتب",
    href: "/properties?type=office",
    gradient: "from-purple-500 to-purple-600",
  },
]

export function QuickActions() {
  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">تصفح حسب النوع</h2>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <a
              key={index}
              href={action.href}
              className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300 group"
            >
              <div
                className={`bg-gradient-to-br ${action.gradient} p-4 rounded-xl text-white group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
