import { Header } from "@/components/layout/header"
import { SearchBar } from "@/components/search/search-bar"
import { Button } from "@/components/ui/button"

export function OfflineState() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="الرئيسية" showNotification />

      <main className="px-4 pt-4">
        <SearchBar />

        <div className="flex flex-col items-center justify-center py-16 px-6">
          {/* Offline Illustration */}
          <div className="relative w-64 h-64 mb-8">
            <div className="absolute inset-0 bg-surface rounded-3xl flex items-center justify-center">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-primary">
                <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="3" />
                <path d="M30 50 L50 30 M70 30 L90 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path
                  d="M35 65 Q45 55 60 55 Q75 55 85 65"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                <line x1="25" y1="95" x2="95" y2="25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-2 -right-2 w-8 h-8 text-muted">
              <svg viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 0 L20 12 L32 16 L20 20 L16 32 L12 20 L0 16 L12 12 Z" />
              </svg>
            </div>
            <div className="absolute bottom-8 -left-4 w-6 h-6 text-muted">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div className="absolute top-12 -left-2 w-4 h-4 text-muted">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0 L10 6 L16 8 L10 10 L8 16 L6 10 L0 8 L6 6 Z" />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-3 text-center">لا يوجد اتصال بالإنترنت حاليًا!</h2>
          <p className="text-sm text-muted-foreground text-center mb-8 leading-relaxed max-w-sm">
            يرجى التحقق من الاتصال والمحاولة من جديد.
          </p>

          <Button className="w-full max-w-sm h-12 rounded-2xl bg-primary hover:bg-primary-hover text-white font-medium">
            إعادة المحاولة
          </Button>
        </div>
      </main>
    </div>
  )
}
