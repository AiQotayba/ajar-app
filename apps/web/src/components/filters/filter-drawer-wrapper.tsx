"use client"

import { Suspense } from "react"
import { FilterDrawer } from "./filter-drawer"

interface FilterDrawerWrapperProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FilterDrawerWrapper({ open, onOpenChange }: FilterDrawerWrapperProps) {
  return (
    <Suspense fallback={null}>
      <FilterDrawer open={open} onOpenChange={onOpenChange} />
    </Suspense>
  )
}
