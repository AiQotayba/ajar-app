"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowRight, Edit } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { ListingForm } from "@/components/pages/listings/listingForm"

export default function EditListingPage() {
    const params = useParams()
    const router = useRouter()
    const listingId = params?.id ? Number(params.id) : null

    return (
        <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8" dir="rtl">
            <PageHeader
                title="تعديل الإعلان"
                description="قم بتعديل بيانات الإعلان خطوة بخطوة"
                icon={Edit}
                actions={[
                    {
                        label: "العودة للقائمة",
                        icon: ArrowRight,
                        onClick: () => router.push("/listings"),
                    }
                ]}
            />

            <ListingForm mode="edit" listingId={listingId} />
        </div>
    )
}
