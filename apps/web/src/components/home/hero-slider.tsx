"use client"

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { api as Api } from "@/lib/api"
import { useLocale } from "next-intl"
import { toast } from "sonner"


interface Slider {
  id: number;
  title: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  image_url: string;
  target_url: string;
  start_at: string;
  end_at: string;
  active: boolean;
  clicks: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function HeroSlider({ sliders, isLoading }: { sliders: Slider[] | undefined, isLoading: boolean }) {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }))
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [carouselApi, setCarouselApi] = useState<any>(null)
  const locale = useLocale()
  const [clickedSliders, setClickedSliders] = useState<Set<number>>(new Set())

  // تحديث المؤشر عند تغيير السلايد
  useEffect(() => {
    if (!carouselApi) return

    setSelectedIndex(carouselApi.selectedScrollSnap())

    const onSelect = () => setSelectedIndex(carouselApi.selectedScrollSnap())
    carouselApi.on("select", onSelect)
    return () => {
      carouselApi.off("select", onSelect)
    }
  }, [carouselApi])
  // دالة لتتبع النقرات
  const handleSliderClick = async (slide: Slider) => {
    try {
      // إرسال إحصائيات النقر إذا لم يتم النقر من قبل
      if (!clickedSliders.has(slide.id)) {
        // استخدام request method بدلاً من post
        await Api.post(`/user/sliders/${slide.id}/click`)
          .then(() => {
            setClickedSliders(prev => new Set(Array.from(prev).concat(slide.id)))
            if (slide.target_url) {
              window.open(slide.target_url, '_blank')
            }
            else {  
              toast.warning(locale === 'ar' ? 'لا يوجد رابط مستهدف لهذا السلايد' : 'No target URL for this slider')
            }
          })
          .catch((error) => {
            console.error('Error tracking slider click:', error)
          })
      }

      // فتح الرابط في نافذة جديدة

    } catch (error) {
      console.error('Error tracking slider click:', error)
      // فتح الرابط حتى لو فشل تتبع النقر
      window.open(slide.target_url, '_blank')
    }
  }

  // Show loading skeleton if loading
  if (isLoading) {
    return <HeroSliderSkeleton />
  }

  // إذا لم تكن هناك سلايدرز، لا نعرض المكون
  if (!sliders || sliders.length === 0) {
    return null;
  }

  return (
    <div dir="rtl" className="relative w-full group">
      <Carousel
        setApi={setCarouselApi}
        opts={{
          align: "center",
          loop: true,
          direction: "rtl",
        }}
        plugins={[plugin.current as any]}
        className="w-full pb-6"
      >
        <CarouselContent className="rounded-3xl gap-4 mx-4 w-full px-2 " classNameRoot="p-4" >
          {sliders.map((slide: Slider) => (
            <CarouselItem key={slide.id} className="basis-[95%] sm:basis-[90%] md:basis-[85%] lg:basis-[80%] xl:basis-[75%] mx-auto">
              <div
                className="relative h-64 sm:h-72 md:h-80 lg:h-96 rounded-3xl overflow-hidden cursor-pointer group/slide transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                onClick={() => handleSliderClick(slide)}
              >
                <Image
                  src={slide.image_url || "/luxury-modern-house-exterior-wooden-deck.jpg"}
                  alt={slide.title[locale as keyof typeof slide.title]}
                  fill
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/slide:scale-105"
                  priority={false}
                  sizes="(max-width: 640px) 95vw, (max-width: 768px) 90vw, (max-width: 1024px) 85vw, (max-width: 1280px) 80vw, 75vw"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/slide:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute bottom-0 right-0 left-0 p-4 sm:p-6 text-white">
                  <div className="space-y-2 sm:space-y-3  ltr:text-right">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight ltr:text-left">
                      {slide.title[locale as keyof typeof slide.title]}
                    </h2>
                    <p className="text-sm sm:text-base text-white/90 leading-relaxed ltr:text-left w-full ltr:left-0">
                      {slide.description[locale as keyof typeof slide.description]}
                    </p>
                  </div>

                  {/* Click Indicator */}
                  {/* <div className="mt-4 flex items-center gap-2 text-white/70 text-xs sm:text-sm">
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" />
                    <span>{locale === 'ar' ? 'انقر للمزيد' : 'Click for more'}</span>
                  </div> */}
                </div>

                {/* Corner Decoration */}
                <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white/30 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white/60 rounded-full" />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Enhanced Indicators */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 px-4">
        {sliders.map((_, index) => (
          <button
            key={index}
            onClick={() => carouselApi?.scrollTo(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300 bg-white/40 hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-white/50",
              index === selectedIndex
                ? "w-8 bg-white scale-110"
                : "w-2 hover:w-4"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows (Hidden on mobile) */}
      <button
        onClick={() => carouselApi?.scrollPrev()}
        className="absolute ltr:left-4 rtl:right-4 rtl:rotate-180 rotate-0 top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={() => carouselApi?.scrollNext()}
        className="absolute ltr:left-4 rtl:left-4 rtl:rotate-180 rotate-0 top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

function HeroSliderSkeleton() {
  return (
    <div dir="rtl" className="relative w-full mx-4 px-2">
      <div className="w-full pb-6">
        <div className="rounded-3xl overflow-hidden">
          {/* Main slider skeleton */}
          <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 rounded-3xl overflow-hidden bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse">
            {/* Shimmer effect */}
            <div className="absolute inset-0 animate-shimmer opacity-50" />

            {/* Content skeleton */}
            <div className="absolute bottom-0 right-0 left-0 p-4 sm:p-6">
              <div className="space-y-3 animate-pulse">
                {/* Title skeleton */}
                <div className="h-8 sm:h-10 md:h-12 bg-white/20 rounded-lg w-3/4" />
                <div className="h-6 sm:h-8 bg-white/20 rounded-lg w-full" />
                {/* Description skeleton */}
                <div className="space-y-2 max-w-2xl">
                  <div className="h-4 sm:h-5 bg-white/10 rounded w-full" />
                  <div className="h-4 sm:h-5 bg-white/10 rounded w-5/6" />
                </div>
              </div>
            </div>

            {/* Corner decoration skeleton */}
            <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white/30 rounded-full flex items-center justify-center bg-white/10">
              <div className="w-2 h-2 bg-white/40 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Indicators skeleton */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 px-4">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="h-2 w-2 rounded-full bg-white/40 animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}
