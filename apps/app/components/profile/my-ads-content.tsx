import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MyAdsContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <Link href="/profile">
          <Button variant="outline" size="icon" className="rounded-2xl bg-transparent">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">إعلاناتي</h1>
        <div className="w-10" />
      </header>

      <div className="p-6">
        <p className="text-center text-muted-foreground">لا توجد إعلانات</p>
      </div>
    </div>
  )
}
