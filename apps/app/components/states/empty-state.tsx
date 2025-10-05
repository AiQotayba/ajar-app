import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"

export function EmptyState() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="إعلاناتي" showBack />

      <main className="flex flex-col items-center justify-center py-16 px-6">
        {/* Empty Illustration */}
        <div className="relative w-64 h-64 mb-8">
          <div className="absolute inset-0 bg-surface rounded-3xl flex items-center justify-center">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-primary">
              <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="3" />
              <circle cx="45" cy="50" r="5" fill="currentColor" />
              <circle cx="75" cy="50" r="5" fill="currentColor" />
              <path d="M40 75 Q60 65 80 75" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="35" cy="65" r="8" fill="currentColor" />
              <circle cx="85" cy="65" r="8" fill="currentColor" />
            </svg>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -top-2 right-8 w-6 h-6 text-muted">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9 Z" />
            </svg>
          </div>
          <div className="absolute bottom-4 -right-3 w-8 h-8 text-muted">
            <svg viewBox="0 0 32 32" fill="currentColor">
              <circle cx="16" cy="16" r="4" />
            </svg>
          </div>
          <div className="absolute top-16 -left-4 w-5 h-5 text-muted">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-foreground mb-3 text-center">لا يوجد إعلاناتك!!</h2>
        <p className="text-sm text-muted-foreground text-center mb-8 leading-relaxed max-w-sm">
          لم تقم بإضافة أي إعلان بعد! الآن بإضافة إعلانك الأول ليظهر للمستخدمين الباحثين عن العقارات.
        </p>

        <Button className="w-full max-w-sm h-12 rounded-2xl bg-primary hover:bg-primary-hover text-white font-medium">
          إنشاء إعلان
        </Button>
      </main> 
    </div>
  )
}
