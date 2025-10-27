"use client"

import { Navbar } from "./navbar"
import { Footer } from "./footer"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface MainLayoutProps {
  children: ReactNode
  showFooter?: boolean
  className?: string
}

export function MainLayout({
  children,
  showFooter = true,
  className
}: MainLayoutProps) {
  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  )
}
