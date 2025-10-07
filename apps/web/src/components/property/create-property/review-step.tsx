"use client"

import { Button } from "@/components/ui/button"
import { Edit2, MapPin, Star } from "lucide-react"
import Image from "next/image"
import type { PropertyFormData } from "../create-property-form"

interface ReviewStepProps {
  data: PropertyFormData
  onSubmit: () => void
  onPrevious: () => void
  onEditStep?: (step: number) => void
}

export function ReviewStep({ data, onSubmit, onPrevious, onEditStep }: ReviewStepProps) {
  return (
    <div className="space-y-6 pb-6">
      <div className="bg-primary-light/30 border border-primary/20 rounded-2xl p-4 text-right">
        <p className="text-sm text-foreground/80 leading-relaxed">
          خطوة أخيرة! راجع بياناتك بعناية قبل الإرسال. سيقوم فريقنا بمراجعته والتأكد من مطابقته للمعايير. ستتلقى إشعاراً
          فور اعتماد الطلب ليظهر ضمن الإعلانات المتاحة للمستخدمين.
        </p>
      </div>

      <div className="space-y-4 text-right">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">البيانات الأساسية</h3>
          {onEditStep && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(1)}
              className="text-primary hover:text-primary/80"
            >
              <Edit2 className="h-4 w-4 ml-1" />
              تعديل
            </Button>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">العنوان</label>
          <div className="bg-background border border-border rounded-xl p-4">
            <p className="text-foreground">{data.title || "غير محدد"}</p>
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">نوع العقار</label>
          <div className="bg-background border border-border rounded-xl p-4">
            <p className="text-foreground">{data.propertyType || "غير محدد"}</p>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">التصنيف</label>
          <div className="bg-background border border-border rounded-xl p-4">
            <p className="text-foreground">{data.category || "غير محدد"}</p>
          </div>
        </div>

        {/* Area */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">المساحة</label>
          <div className="bg-background border border-border rounded-xl p-4">
            <p className="text-foreground">{data.area || "غير محدد"}</p>
          </div>
        </div>

        {/* Rooms */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">عدد الغرف</label>
          <div className="bg-background border border-border rounded-xl p-4">
            <p className="text-foreground">{data.rooms || "غير محدد"}</p>
          </div>
        </div>

        {/* Furnished Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">الحالة</label>
          <div className="flex gap-3 justify-end">
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
                data.furnished === "unfurnished" ? "bg-background border-border" : "bg-muted border-muted"
              }`}
            >
              <span className="text-sm">غير مفروش</span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  data.furnished === "unfurnished" ? "border-primary" : "border-muted-foreground"
                }`}
              >
                {data.furnished === "unfurnished" && <div className="w-3 h-3 rounded-full bg-primary" />}
              </div>
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
                data.furnished === "furnished"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted border-muted"
              }`}
            >
              <span className="text-sm">مفروش</span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  data.furnished === "furnished" ? "border-white" : "border-muted-foreground"
                }`}
              >
                {data.furnished === "furnished" && <div className="w-3 h-3 rounded-full bg-white" />}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 mt-8">
          <h3 className="text-lg font-bold">الموقع</h3>
          {onEditStep && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(2)}
              className="text-primary hover:text-primary/80"
            >
              <Edit2 className="h-4 w-4 ml-1" />
              تعديل
            </Button>
          )}
        </div>

        {/* Governorate */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">المحافظة</label>
          <div className="bg-background border border-border rounded-xl p-4">
            <p className="text-foreground">{data.governorate || "غير محدد"}</p>
          </div>
        </div>

        {/* City */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">المدينة</label>
          <div className="bg-background border border-border rounded-xl p-4">
            <p className="text-foreground">{data.city || "غير محدد"}</p>
          </div>
        </div>

        {/* Map Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">موقع العقار على الخريطة</label>
          <div className="bg-muted rounded-xl overflow-hidden h-48 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-primary" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 mt-8">
          <h3 className="text-lg font-bold">صور العقار</h3>
          {onEditStep && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(3)}
              className="text-primary hover:text-primary/80"
            >
              <Edit2 className="h-4 w-4 ml-1" />
              تعديل
            </Button>
          )}
        </div>

        {/* Property Images */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            {data.images.map((image, index) => (
              <div key={index} className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                <Image
                  src={image.url || "/images/placeholder.svg"}
                  alt={`Property image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                {image.isCover && (
                  <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm rounded-full p-1.5">
                    <Star className="w-4 h-4 text-white fill-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 mt-8">
          <h3 className="text-lg font-bold">السعر</h3>
          {onEditStep && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(4)}
              className="text-primary hover:text-primary/80"
            >
              <Edit2 className="h-4 w-4 ml-1" />
              تعديل
            </Button>
          )}
        </div>

        {/* Price */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            السعر <span className="text-red-500">*</span>
          </label>
          <div className="bg-background border border-border rounded-xl p-4">
            <p className="text-foreground">{data.price ? `${data.price} (دولار/الشهر)` : "غير محدد"}</p>
          </div>
        </div>

        {/* Payment Frequency */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            دورية الدفع <span className="text-red-500">*</span>
          </label>
          <div className="bg-background border border-border rounded-xl p-4">
            <p className="text-foreground">{data.paymentFrequency || "غير محدد"}</p>
          </div>
        </div>

        {/* Insurance (Optional) */}
        {data.insurance && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">التأمين (اختياري)</label>
            <div className="bg-background border border-border rounded-xl p-4">
              <p className="text-foreground">{data.insurance} دولار</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={onPrevious}
          variant="outline"
          className="flex-1 h-14 text-base font-bold rounded-xl bg-transparent"
        >
          السابق
        </Button>
        <Button onClick={onSubmit} className="flex-1 h-14 text-base font-bold rounded-xl">
          إرسال للمراجعة
        </Button>
      </div>
    </div>
  )
}
