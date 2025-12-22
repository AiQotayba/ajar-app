"use client"

import { FilterDrawerWrapper } from "@/components/filters/filter-drawer-wrapper"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useState } from "react"
import { FilterBadge } from "../filters"

export function SearchBar() {
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <>
      {/* Mobile Search Icon Only */}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setFilterOpen(true)}
        className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
      >
        <Search className="w-5 h-5" />
      </Button>

      <FilterDrawerWrapper open={filterOpen} onOpenChange={setFilterOpen} />
    </>
  )
}
