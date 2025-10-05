"use client"

import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

const slides = [
  {
    id: 1,
    image: "/luxury-modern-house-exterior-wooden-deck.jpg",
    title: "شقة للإيجار في مدينة إدلب",
    subtitle: "ابدأ رحلتك للعثور على منزل أحلامك",
    badge: "جديد",
  },
  {
    id: 2,
    image: "/luxury-modern-house-exterior-wooden-deck.jpg",
    title: "فيلا فاخرة مع مسبح",
    subtitle: "فيلا للبيع في دمشق",
    badge: "مميز",
  },
  {
    id: 3,
    image: "/luxury-modern-house-exterior-wooden-deck.jpg",
    title: "مكتب تجاري للإيجار",
    subtitle: "موقع مميز في حلب",
    badge: "عرض خاص",
  },
]

export function HeroSlider() {
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
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="basis-[90%]">
              <div className="relative h-56  rounded-3xl overflow-hidden">
                <Image
                  src={slide.image || "/luxury-modern-house-exterior-wooden-deck.jpg"}
                  alt={slide.title}
                  fill
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground shadow-lg">
                  {slide.badge}
                </Badge>

                <div className="absolute bottom-0 right-0 left-0 p-6 text-white text-right">
                  <h2 className="text-2xl font-bold mb-1">{slide.title}</h2>
                  <p className="text-sm text-white/80">{slide.subtitle}</p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* ✅ مؤشرات أسفل السلايدر */}
      <div className="absolute  left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`h-2 w-2 rounded-full transition-all bg-primary duration-300 ${index === selectedIndex ? "w-[30px] scale-125 mx-2" : "p-1"
              }`}
          />
        ))}
      </div>
    </div>
  )
}
