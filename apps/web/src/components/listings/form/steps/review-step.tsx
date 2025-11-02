 "use client"

import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, DollarSign, Home, Image as ImageIcon } from "lucide-react"
import type { ListingFormData } from "../types"

interface ReviewStepProps {
  onSubmit: () => void
  onPrevious: () => void
  onEditStep: (step: number) => void
  isEditing?: boolean
  isLoading?: boolean
  showNavigation?: boolean
}

export function ReviewStep({ 
  onSubmit, 
  onPrevious, 
  onEditStep, 
  isEditing = false, 
  isLoading = false,
  showNavigation = true
}: ReviewStepProps) {
  const { watch, setValue, register, formState: { errors } } = useFormContext<ListingFormData>()
  const formData = watch()

  return (
    <div className="space-y-6 pb-6">
      {/* Success Message */}
      <div className="bg-primary-light/30 border border-primary/20 rounded-2xl p-4 text-right">
        <p className="text-sm text-foreground/80 leading-relaxed">
          {isEditing
            ? "راجع التعديلات بعناية قبل الحفظ. سيتم تحديث الإعلان فوراً."
            : "خطوة أخيرة! راجع بياناتك بعناية قبل الإرسال. سيقوم فريقنا بمراجعته والتأكد من مطابقته للمعايير. ستتلقى إشعاراً فور اعتماد الطلب ليظهر ضمن الإعلانات المتاحة للمستخدمين."
          }
        </p>
      </div>

      {/* Full Edit Form */}
        <div className="space-y-6 bg-gray-50 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-right">مراجعة وتعديل البيانات</h2>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Home className="h-5 w-5" />
              المعلومات الأساسية
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title_ar" className="text-right block">
                  العنوان بالعربية <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title_ar"
                  {...register("title.ar")}
                  placeholder="أدخل العنوان بالعربية"
                  className="text-right"
                />
                {errors.title?.ar && (
                  <p className="text-xs text-destructive text-right">{errors.title.ar.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title_en" className="text-right block">
                  العنوان بالإنجليزية
                </Label>
                <Input
                  id="title_en"
                  {...register("title.en")}
                  placeholder="Enter title in English"
                  className="text-right"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description_ar" className="text-right block">
                الوصف بالعربية
              </Label>
              <Textarea
                id="description_ar"
                {...register("description.ar")}
                placeholder="أدخل الوصف بالعربية"
                className="text-right min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description_en" className="text-right block">
                الوصف بالإنجليزية
              </Label>
              <Textarea
                id="description_en"
                {...register("description.en")}
                placeholder="Enter description in English"
                className="text-right min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-right block">
                  نوع العقار <span className="text-destructive">*</span>
                </Label>
                <Select value={watch("type")} onValueChange={(value) => setValue("type", value)}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر نوع العقار" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">بيع</SelectItem>
                    <SelectItem value="rent">إيجار</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability_status" className="text-right block">
                  حالة التوفر <span className="text-destructive">*</span>
                </Label>
                <Select value={watch("availability_status")} onValueChange={(value) => setValue("availability_status", value)}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر حالة التوفر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">متاح</SelectItem>
                    <SelectItem value="rented">مؤجر</SelectItem>
                    <SelectItem value="sold">مباع</SelectItem>
                    <SelectItem value="reserved">محجوز</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Price Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              معلومات السعر
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-right block">
                  السعر <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={watch("price") || ""}
                  onChange={(e) => setValue("price", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="text-right"
                />
                {errors.price && (
                  <p className="text-xs text-destructive text-right">{errors.price.message}</p>
                )}
              </div>

              {watch("type") === "rent" && (
                <div className="space-y-2">
                  <Label htmlFor="payment_frequency" className="text-right block">
                    دورية الدفع
                  </Label>
                  <Select value={watch("payment_frequency")} onValueChange={(value) => setValue("payment_frequency", value)}>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="اختر دورية الدفع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">شهرياً</SelectItem>
                      <SelectItem value="quarterly">كل 3 أشهر</SelectItem>
                      <SelectItem value="semi_annually">كل 6 أشهر</SelectItem>
                      <SelectItem value="annually">سنوياً</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="insurance" className="text-right block">
                  التأمين (اختياري)
                </Label>
                <Input
                  id="insurance"
                  type="number"
                  step="0.01"
                  value={watch("insurance") || ""}
                  onChange={(e) => setValue("insurance", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="text-right"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              معلومات الموقع
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="governorate_id" className="text-right block">
                  المحافظة <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="governorate_id"
                  value={watch("governorate_id") || ""}
                  onChange={(e) => setValue("governorate_id", e.target.value)}
                  placeholder="المحافظة"
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city_id" className="text-right block">
                  المدينة (اختياري)
                </Label>
                <Input
                  id="city_id"
                  value={watch("city_id") || ""}
                  onChange={(e) => setValue("city_id", e.target.value)}
                  placeholder="المدينة"
                  className="text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude" className="text-right block">
                  خط العرض
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={watch("latitude") || ""}
                  onChange={(e) => setValue("latitude", parseFloat(e.target.value) || 0)}
                  placeholder="خط العرض"
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude" className="text-right block">
                  خط الطول
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={watch("longitude") || ""}
                  onChange={(e) => setValue("longitude", parseFloat(e.target.value) || 0)}
                  placeholder="خط الطول"
                  className="text-right"
                />
              </div>
            </div>
          </div>

        </div>

      {/* Navigation Buttons - Only show if navigation is enabled */}
      {showNavigation && (
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={onPrevious}
            variant="outline"
            className="flex-1 h-14 text-base font-bold rounded-xl bg-transparent"
          >
            السابق
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            className="flex-1 h-14 text-base font-bold rounded-xl"
          >
            {isLoading ? "جاري الحفظ..." : isEditing ? "حفظ التعديلات" : "إرسال للمراجعة"}
          </Button>
        </div>
      )}
    </div>
  )
}