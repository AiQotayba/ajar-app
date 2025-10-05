"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function EmptyFavorites() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-center">المفضلة</h1>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        {/* Illustration */}
        <div className="relative w-64 h-64 mb-8">
          <div className="absolute inset-0 bg-muted/30 rounded-full" />
          <div className="absolute inset-8 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full text-primary">
              {/* Face circle */}
              <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="4" />
              {/* Left eye */}
              <circle cx="75" cy="90" r="8" fill="currentColor" />
              {/* Right eye */}
              <circle cx="125" cy="90" r="8" fill="currentColor" />
              {/* Mouth */}
              <line x1="80" y1="120" x2="120" y2="120" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              {/* Left blush */}
              <circle cx="55" cy="105" r="15" fill="currentColor" opacity="0.3" />
              {/* Right blush */}
              <circle cx="145" cy="105" r="15" fill="currentColor" opacity="0.3" />
            </svg>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-12 right-8 text-muted-foreground/30">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute top-20 left-4 text-muted-foreground/20">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <polygon points="6,0 8,4 12,6 8,8 6,12 4,8 0,6 4,4" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute bottom-16 right-12 text-muted-foreground/20">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="2" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute bottom-24 left-8 text-muted-foreground/30">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute top-32 right-2 text-muted-foreground/20">
            <svg width="8" height="8" viewBox="0 0 8 8">
              <rect width="8" height="8" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute bottom-32 left-2 text-muted-foreground/25">
            <svg width="14" height="14" viewBox="0 0 14 14">
              <polygon points="7,0 9,5 14,7 9,9 7,14 5,9 0,7 5,5" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold mb-3">مفضلتك فارغة!</h2>
        <p className="text-muted-foreground leading-relaxed max-w-sm mb-8">
          ابدأ بإضافة عقاراتك المميزة لتجدها هنا دائماً في متناول يدك.
        </p>

        {/* Action Button */}
        <Button onClick={() => router.push("/")} className="h-14 px-12 rounded-2xl text-base font-bold">
          إعادة المحاولة
        </Button>
      </div> 
    </div>
  )
}
