"use client"

import { Suspense } from "react"
import { SearchBar } from "./search-bar"

export function SearchBarWrapper() {
  return (
    <Suspense fallback={<div className="h-12 w-12 bg-gray-200 rounded animate-pulse" />}>
      <SearchBar />
    </Suspense>
  )
}
