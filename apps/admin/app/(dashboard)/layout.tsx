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
  const [isOpen, setIsOpen] = useState(true)
  
  return (
    <div 
      className={cn(
        "flex h-screen w-full",
        "bg-muted/50",
        "relative overflow-hidden"
      )}
      dir="rtl"
    >
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      
      {/* Main Content Area */}
      <div 
        className={cn(
          "flex flex-1 flex-col overflow-hidden relative",
          "transition-all duration-300 ease-out",
          isOpen ? "md:mr-72" : "md:mr-20"
        )}
      >
        <Header onMenuToggle={() => setIsOpen(!isOpen)} />
        
        <main 
          className={cn(
            "flex-1 overflow-y-auto relative",
            "px-4"
          )}
        >
          <div className="mx-auto max-w-7xl pt-4 pb-6 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
