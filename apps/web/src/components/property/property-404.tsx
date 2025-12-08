"use client"
import { PropertyDetailsSkeleton } from "@/components/property/property-details-skeleton"
import { PropertyFeatures } from "@/components/property/property-features"
import { PropertyGallery } from "@/components/property/property-gallery"
import { PropertyInfo } from "@/components/property/property-info"
import { PropertyMapV2 } from "@/components/property/map/property-map-v2"
import { PropertyReviews } from "@/components/property/property-reviews"
import { Button } from "@/components/ui/button"
import { useTranslationsHook } from "@/hooks/use-translations"
import { api } from "@/lib/api"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/use-auth"
import { Eye, Heart, MapPin, Home, Search, AlertCircle } from "lucide-react"
import { notFound } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { useLocale } from "next-intl"



export function Property404() {
  const t = useTranslationsHook()
  const locale = useLocale()
  const isArabic = locale === 'ar'
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8">
          {/* 404 Illustration */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80">
            <div className="absolute inset-0 bg-muted/50 rounded-3xl flex items-center justify-center shadow-lg">
              <div className="text-center">
                <div className="text-8xl sm:text-9xl font-bold text-primary mb-4">404</div>
                <div className="flex justify-center">
                  <AlertCircle className="h-16 w-16 sm:h-20 sm:w-20 text-destructive" />
                </div>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-3 -right-3 w-8 h-8 text-muted-foreground opacity-50">
              <svg viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 0 L20 12 L32 16 L20 20 L16 32 L12 20 L0 16 L12 12 Z" />
              </svg>
            </div>
            <div className="absolute bottom-8 -left-4 w-6 h-6 text-muted-foreground opacity-50">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {isArabic ? 'الإعلان غير موجود' : 'Listing Not Found'}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed">
              {isArabic
                ? 'عذراً، الإعلان الذي تبحث عنه غير موجود أو تم حذفه. يرجى التحقق من الرابط والمحاولة مرة أخرى.'
                : 'Sorry, the listing you are looking for does not exist or has been deleted. Please check the link and try again.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
            <Link href="/" className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto h-12 px-8 text-base font-semibold rounded-2xl bg-primary hover:bg-primary/90"
                size="lg"
              >
                <Home className={`h-5 w-5 ${isArabic ? 'mr-2' : 'ml-2'}`} />
                {isArabic ? 'العودة للرئيسية' : 'Back to Home'}
              </Button>
            </Link>
            <Link href="/listings" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-12 px-8 text-base font-semibold rounded-2xl"
                size="lg"
              >
                <Search className={`h-5 w-5 ${isArabic ? 'mr-2' : 'ml-2'}`} />
                {isArabic ? 'تصفح الإعلانات' : 'Browse Listings'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 