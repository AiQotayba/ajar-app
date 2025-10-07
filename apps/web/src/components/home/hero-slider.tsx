"use client"

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"


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

export function HeroSlider({ sliders }: { sliders: Slider[] | undefined }) {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }))
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [api, setApi] = useState<any>(null)

  // تحديث المؤشر عند تغيير السلايد
  useEffect(() => {
    if (!api) return

    setSelectedIndex(api.selectedScrollSnap())

    const onSelect = () => setSelectedIndex(api.selectedScrollSnap())
    api.on("select", onSelect)
    return () => api.off("select", onSelect)
  }, [api])

  // إذا لم تكن هناك سلايدرز، لا نعرض المكون
  if (!sliders || sliders.length === 0) {
    return null;
  }

  return (
    <div dir="rtl" className="relative w-full group">
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
          direction: "rtl", // ✅ الاتجاه من اليمين لليسار
        }}
        plugins={[plugin.current as any]}
        className="w-full pb-4"
      >
        <CarouselContent className="rounded-3xl gap-2 mx-2 w-full px-2" >
          {sliders.map((slide: Slider) => (
            <CarouselItem key={slide.id} className="basis-[90%] mx-auto">
              <div className="relative h-56 rounded-3xl overflow-hidden cursor-pointer"
                onClick={() => window.open(slide.target_url, '_blank')}>
                <Image
                  src={slide.image_url || "/luxury-modern-house-exterior-wooden-deck.jpg"}
                  alt={slide.title.ar}
                  fill
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="absolute bottom-0 right-0 left-0 p-6 text-white text-right">
                  <h2 className="text-2xl font-bold mb-1">{slide.title.ar}</h2>
                  <p className="text-sm text-white/80">{slide.description.ar}</p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* ✅ مؤشرات أسفل السلايدر */}
      <div className="absolute left-0 right-0 flex justify-center gap-2">
        {sliders.map((_, index) => (
          <span
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-all bg-primary duration-300 ",
              index === selectedIndex ? "w-[30px] scale-125 mx-2" : "p-1"
            )}
          />
        ))}
      </div>
    </div>
  )
}
