"use client"
import { Header } from "@/components/layout/header"
import { PropertyGallery } from "@/components/property/property-gallery"
import { PropertyInfo } from "@/components/property/property-info"
import { PropertyFeatures } from "@/components/property/property-features"
import { PropertyLocation } from "@/components/property/property-location"
import { PropertyReviews } from "@/components/property/property-reviews"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

interface PropertyDetailsProps {
  propertyId: string
}

export function PropertyDetails({ propertyId }: PropertyDetailsProps) {
  // Mock data - in real app, fetch based on propertyId
  const property = {
    id: propertyId,
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/modern-apartment-living-YRbPNUUbeCTyrJJXR2uhtUrlgNnplt.png",
      "/luxury-villa-exterior.png",
      "/modern-kitchen.png",
      "/spacious-bedroom.jpg",
      "/elegant-bathroom.png",
      "/beautiful-garden.jpg",
    ],
    title: "شقة عائلية واسعة ومفروشة بالكامل للإيجار بموقع مركزي",
    description: "قريب من المدارس والأسواق.",
    price: "400",
    period: "دفع 6 أشهر",
    badge: "مؤجر",
    bedrooms: 5,
    area: "250 م²",
    deposit: "$200 تأمين",
    furnished: true,
    features: [
      { icon: "bath", label: "2 حمام" },
      { icon: "wifi", label: "شبكة WiFi" },
      { icon: "ac", label: "تكييف" },
      { icon: "parking", label: "موقف" },
    ],
    location: {
      address: "حلب - مدينة إعزاز",
      neighborhood: "الحي الجنوبي",
      lat: 36.2012,
      lng: 37.1343,
    },
    rating: 4.9,
    reviews: [
      {
        id: 1,
        author: "أحمد الأحمد",
        rating: 3,
        comment: "الشقة واسعة ومميزة، الأثاث بحالة جيدة جداً، والمكان هادئ ومناسب للعائلات.",
        date: "2024-01-15",
      },
      {
        id: 2,
        author: "أحمد الأحمد",
        rating: 3,
        comment: "الشقة واسعة ومميزة، الأثاث بحالة جيدة جداً، والمكان هادئ ومناسب للعائلات.",
        date: "2024-01-10",
      },
    ],
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="تفاصيل العقار" showBack showNotifications />

      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <PropertyGallery images={property.images} badge={property.badge} />

        <PropertyInfo
          title={property.title}
          description={property.description}
          price={property.price}
          period={property.period}
          bedrooms={property.bedrooms}
          area={property.area}
          deposit={property.deposit}
          furnished={property.furnished}
        />

        <PropertyFeatures features={property.features} />

        <PropertyLocation location={property.location} />

        <PropertyReviews rating={property.rating} reviews={property.reviews} propertyId={property.id} />

        {/* WhatsApp Contact Button */}
        <Button className="w-full h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90">
          <MessageCircle className="ml-2 h-5 w-5" />
          تواصل واتساب
        </Button>
      </div>
    </div>
  )
}
