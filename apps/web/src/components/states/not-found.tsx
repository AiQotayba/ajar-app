import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function NotFound() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="خطأ" showBack />

      <main className="flex flex-col items-center justify-center py-16 px-6">
        {/* 404 Illustration */}
        <div className="relative w-64 h-64 mb-8">
          <div className="absolute inset-0 bg-surface rounded-3xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-7xl font-bold text-primary mb-2">404</div>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-primary mx-auto">
                <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="2" />
                <circle cx="30" cy="35" r="3" fill="currentColor" />
                <circle cx="50" cy="35" r="3" fill="currentColor" />
                <path d="M28 52 Q40 45 52 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -top-3 right-4 w-8 h-8 text-muted">
            <svg viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 0 L20 12 L32 16 L20 20 L16 32 L12 20 L0 16 L12 12 Z" />
            </svg>
          </div>
          <div className="absolute bottom-8 -left-4 w-6 h-6 text-muted">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-foreground mb-3 text-center">الصفحة غير موجودة!</h2>
        <p className="text-sm text-muted-foreground text-center mb-8 leading-relaxed max-w-sm">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى موقع آخر.
        </p>
        <Link href="/" className="w-full max-w-sm h-12 rounded-2xl bg-primary hover:bg-primary-hover text-white font-medium">
          <Button className="w-full max-w-sm h-12 rounded-2xl bg-primary hover:bg-primary-hover text-white font-medium">
            العودة للرئيسية
          </Button>
        </Link>
      </main>
    </div>
  )
}
