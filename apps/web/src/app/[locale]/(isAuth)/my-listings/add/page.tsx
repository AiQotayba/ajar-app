"use client"
import { ListingForm } from "@/components/listings/form"

export default function AddPropertyPage() {
  const handleSuccess = (data: any) => {
    console.log("تم إنشاء الإعلان بنجاح:", data)
    // يمكن إضافة إعادة توجيه أو إظهار رسالة نجاح هنا
  }

  const handleCancel = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <ListingForm
        isEditing={false}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}
