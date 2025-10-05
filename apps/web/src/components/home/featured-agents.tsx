"use client"

import { Star, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const agents = [
  {
    id: 1,
    name: "أحمد محمود",
    image: "/placeholder.svg?height=100&width=100",
    rating: 4.9,
    properties: 45,
    verified: true,
  },
  {
    id: 2,
    name: "فاطمة السيد",
    image: "/placeholder.svg?height=100&width=100",
    rating: 4.8,
    properties: 38,
    verified: true,
  },
  {
    id: 3,
    name: "محمد علي",
    image: "/placeholder.svg?height=100&width=100",
    rating: 4.7,
    properties: 32,
    verified: false,
  },
]

export function FeaturedAgents() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">وكلاء مميزون</h2>
        <a href="/agents" className="text-sm text-primary font-medium hover:underline">
          عرض الكل
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300"
          >
            <div className="relative">
              <img
                src={agent.image || "/placeholder.svg"}
                alt={agent.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-primary"
              />
              {agent.verified && (
                <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground">{agent.name}</h3>
                {agent.verified && (
                  <Badge variant="secondary" className="text-xs">
                    موثق
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-medium">{agent.rating}</span>
                </div>
                <span>•</span>
                <span>{agent.properties} عقار</span>
              </div>
            </div>

            <Button size="icon" variant="outline" className="rounded-full h-10 w-10 bg-transparent">
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
