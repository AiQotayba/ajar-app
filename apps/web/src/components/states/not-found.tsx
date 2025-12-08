"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLocale } from "next-intl"
import { Home, Search, ArrowLeft, Compass } from "lucide-react"

export function NotFound() {
  const locale = useLocale()
  const isArabic = locale === 'ar'

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-4 py-12 sm:py-16">
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

        {/* Main Message */}
        <div className="text-center space-y-4 sm:space-y-6 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            {isArabic 
              ? 'عذراً، لم نجد ما تبحث عنه' 
              : "Oops! We couldn't find what you're looking for"}
          </h1>
          
          <div className="space-y-3">
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {isArabic 
                ? 'يبدو أن الصفحة التي تحاول الوصول إليها غير موجودة أو تم نقلها إلى مكان آخر.'
                : "It looks like the page you're trying to reach doesn't exist or has been moved."}
            </p>
            
            <p className="text-base text-muted-foreground/80 leading-relaxed">
              {isArabic
                ? 'لا تقلق، يمكننا مساعدتك في العثور على ما تحتاجه.'
                : "Don't worry, we can help you find what you need."}
            </p>
          </div>
        </div>

        {/* Helpful Suggestions */}
        <div className="mt-8 sm:mt-12 w-full max-w-md space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-foreground">
              {isArabic ? 'جرب هذه الخيارات:' : 'Try these options:'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link href="/" className="flex-1">
              <Button 
                className="w-full h-14 px-8 text-base font-semibold rounded-2xl bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                <Home className={`h-5 w-5 ${isArabic ? 'mr-2' : 'ml-2'}`} />
                {isArabic ? 'العودة للصفحة الرئيسية' : 'Go to Homepage'}
              </Button>
            </Link>
            
            <Link href="/listings" className="flex-1">
              <Button 
                variant="outline"
                className="w-full h-14 px-8 text-base font-semibold rounded-2xl border-2 hover:bg-muted/50 transition-all"
                size="lg"
              >
                <Search className={`h-5 w-5 ${isArabic ? 'mr-2' : 'ml-2'}`} />
                {isArabic ? 'تصفح الإعلانات' : 'Browse Listings'}
              </Button>
            </Link>
          </div>

          {/* Back Button */}
          <div className="pt-4">
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className={`h-4 w-4 ${isArabic ? 'mr-2 rotate-180' : 'ml-2'}`} />
              {isArabic ? 'العودة للصفحة السابقة' : 'Go Back'}
            </Button>
          </div>
        </div>

        {/* Additional Help Text */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground/70">
            {isArabic
              ? 'إذا كنت تعتقد أن هذا خطأ، يرجى التواصل معنا.'
              : "If you believe this is an error, please contact us."}
          </p>
        </div>
      </main>
    </div>
  )
}
