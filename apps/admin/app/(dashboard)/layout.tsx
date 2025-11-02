"use client"
import type React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="flex h-screen bg-gradient-to-br from-primary/8 via-background to-primary/5">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={cn("flex flex-1 flex-col", isOpen ? "md:mr-64" : "mr-16")}>
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
