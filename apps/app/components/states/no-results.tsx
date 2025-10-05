"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function NoResults() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="relative w-48 h-48 mb-8">
        <div className="absolute inset-0 bg-surface rounded-3xl flex items-center justify-center">
          {/* Magnifying Glass Illustration */}
          <svg viewBox="0 0 200 200" className="w-32 h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Magnifying glass circle */}
            <circle cx="80" cy="80" r="45" stroke="currentColor" strokeWidth="8" className="text-primary" />
            {/* Inner circle detail */}
            <circle cx="80" cy="80" r="30" stroke="currentColor" strokeWidth="4" className="text-primary/40" />
            {/* Handle */}
            <rect
              x="110"
              y="110"
              width="50"
              height="16"
              rx="8"
              transform="rotate(45 110 110)"
              fill="currentColor"
              className="text-primary"
            />
            {/* Decorative sparkles */}
            <circle cx="50" cy="50" r="3" fill="currentColor" className="text-primary" />
            <circle cx="110" cy="50" r="2" fill="currentColor" className="text-primary/60" />
          </svg>
        </div>
        {/* Decorative Elements */}
        <div className="absolute -top-2 -right-2 w-4 h-4 rotate-12">
          <div className="w-full h-full bg-primary/20 rounded-sm" />
        </div>
        <div className="absolute top-8 -left-3 w-3 h-3">
          <div className="w-full h-full border-2 border-primary/30 rotate-45" />
        </div>
        <div className="absolute bottom-12 -right-4 w-2 h-6 bg-primary/20 rounded-full" />
        <div className="absolute -bottom-2 left-8 w-3 h-3 bg-primary/20 rounded-full" />
      </div>

      <h2 className="text-xl font-bold text-foreground mb-3 text-center text-balance">
        لم يتم العثور على نتائج مطابقة لبحثك!
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-8 leading-relaxed max-w-md text-balance">
        جرب تعديل كلمات البحث أو تغيير الفلاترة للحصول على المزيد من العقارات المتاحة...
      </p>

      <div className="flex gap-3 w-full max-w-md">
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="flex-1 h-14 rounded-2xl text-base font-semibold border-primary text-primary hover:bg-primary/5 bg-transparent"
        >
          تغيير الفلاتر
        </Button>
        <Button onClick={() => router.push("/")} className="flex-1 h-14 rounded-2xl text-base font-semibold">
          تصفح
        </Button>
      </div>
    </div>
  )
}
