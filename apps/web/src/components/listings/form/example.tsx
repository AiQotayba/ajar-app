"use client"

import { ListingForm } from "./listing-form"

/**
 * مثال على استخدام ListingForm للإنشاء
 */
export function CreateListingExample() {
    const handleSuccess = (data: any) => {
        console.log("تم إنشاء الإعلان بنجاح:", data)
    }

    const handleCancel = () => {
        window.history.back()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ListingForm
                isEditing={false}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </div>
    )
}

/**
 * مثال على استخدام ListingForm للتعديل
 */
export function EditListingExample({ listingId }: { listingId: string }) {
    const handleSuccess = (data: any) => {
        console.log("تم تحديث الإعلان:", data)
    }

    const handleCancel = () => {
        window.history.back()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ListingForm
                isEditing={true}
                listingId={listingId}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </div>
    )
}

/**
 * مثال على البيانات الأولية للتعديل
 */
export const MOCK_EDIT_DATA = {
    title_ar: "شقة فاخرة في قلب المدينة",
    title_en: "Luxury Apartment in City Center",
    description_ar: "شقة فاخرة في موقع مميز مع إطلالة رائعة",
    description_en: "Luxury apartment in prime location with stunning views",
    type: "apartment",
    category_id: "1",
    properties: [
        { id: 1, value: "3" }, // عدد الغرف
        { id: 2, value: "2" }, // عدد الحمامات
        { id: 3, value: "120" }, // المساحة
    ],
    features: ["1", "2", "3"], // IDs of selected features
    governorate_id: "1",
    city_id: "1",
    latitude: 31.2001,
    longitude: 29.9187,
    price: "5000",
    currency: "USD",
    availability_status: "available",
    status: "active",
}

/**
 * مثال على APIs المطلوبة
 */
export const REQUIRED_APIS = {
    // التصنيفات
    categories: "GET /user/categories",
    subCategories: "GET /user/categories?parent_id={parent_id}",
    categoryDetails: "GET /user/categories/{category_id}",

    // المحافظات والمدن
    governorates: "GET /user/governorates",
    cities: "GET /user/cities?governorate_id={governorate_id}",

    // الإعلانات
    createListing: "POST /user/listings",
    updateListing: "PUT /user/listings/{id}",
    getListing: "GET /user/listings/{id}",
}
