"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useState } from "react"
const categories = [
  { id: "all", label: "الكل" },
  { id: "house", label: "بيت" },
  { id: "villa", label: "فيلات" },
  { id: "apartment", label: "شقق" },
  { id: "featured", label: "مميز" },
]

export function CategoryFilter() {
  const [activeCategory, setActiveCategory] = useState("all")

  return (
    <div dir="rtl" className="w-full">
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full !rounded-none" dir="rtl">
        <TabsList
          className={cn(
            "flex  w-full h-auto gap-2 p-1", 
            "overflow-x-auto overflow-y-hidden",
            "scrollbar-hide !rounded-none",
            "snap-x snap-mandatory",
            "scroll-smooth justify-start",
          )}
        >
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="
                flex-shrink-0 snap-start w-max px-6 py-2.5
                bg-primary/20
                data-[state=active]:bg-primary
                data-[state=active]:text-primary-foreground
                data-[state=active]:shadow-md
                whitespace-nowrap transition-all
              "
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
