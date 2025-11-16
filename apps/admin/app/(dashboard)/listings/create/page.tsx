"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Building2 } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { ListingForm } from "@/components/pages/listings/listingForm"

export default function CreateListingPage() {
  const router = useRouter()

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8" dir="rtl">
      <PageHeader
        title="إنشاء إعلان جديد"
        description="املأ النموذج خطوة بخطوة لإضافة إعلان جديد"
        icon={Building2}
        actions={[
          {
            label: "العودة للقائمة",
            icon: ArrowRight,
            onClick: () => router.push("/listings"),
          }
        ]}
      />

      <ListingForm mode="create" />
    </div>
  )
}
