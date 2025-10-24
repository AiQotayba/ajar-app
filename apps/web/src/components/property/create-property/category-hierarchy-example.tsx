"use client"

import { PropertyFormEngine } from "./property-form-engine"

/**
 * مثال على استخدام Property Form Engine مع نظام التصنيفات المتدرج
 * 
 * النظام يعمل كالتالي:
 * 1. المستخدم يختار التصنيف الرئيسي (مثل: عقارات سكنية)
 * 2. يظهر التصنيفات الفرعية (مثل: شقق، فيلات، منازل)
 * 3. يختار التصنيف الفرعي (مثل: شقق)
 * 4. يظهر التصنيفات الفرعية للفرعي (مثل: شقق 2 غرفة، شقق 3 غرفة)
 * 5. يختار التصنيف النهائي
 * 6. تظهر خصائص العقار (Properties) والمميزات (Features) بناءً على التصنيف المختار
 */

export function CategoryHierarchyExample() {
  const handleSuccess = (data: any) => {
    console.log("تم إنشاء الإعلان بنجاح:", data)
    console.log("التصنيف المختار:", data.category_id)
    console.log("الخصائص:", data.properties)
    console.log("المميزات:", data.features)
  }

  const handleCancel = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PropertyFormEngine
        isEditing={false}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}

/**
 * مثال على التعديل مع التصنيفات المتدرجة
 */
export function EditPropertyWithCategoriesExample({ 
  listingId 
}: { 
  listingId: string 
}) {
  const handleSuccess = (data: any) => {
    console.log("تم تحديث الإعلان:", data)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PropertyFormEngine
        isEditing={true}
        listingId={listingId}
        onSuccess={handleSuccess}
        onCancel={() => window.history.back()}
      />
    </div>
  )
}

/**
 * مثال على البيانات المتوقعة من API
 */
export const MOCK_CATEGORY_DATA = {
  mainCategories: [
    {
      id: 1,
      name_ar: "عقارات سكنية",
      name_en: "Residential Properties",
      parent_id: null
    },
    {
      id: 2,
      name_ar: "عقارات تجارية",
      name_en: "Commercial Properties", 
      parent_id: null
    }
  ],
  subCategories: [
    {
      id: 11,
      name_ar: "شقق",
      name_en: "Apartments",
      parent_id: 1
    },
    {
      id: 12,
      name_ar: "فيلات",
      name_en: "Villas",
      parent_id: 1
    }
  ],
  subSubCategories: [
    {
      id: 111,
      name_ar: "شقق 2 غرفة",
      name_en: "2 Bedroom Apartments",
      parent_id: 11
    },
    {
      id: 112,
      name_ar: "شقق 3 غرفة",
      name_en: "3 Bedroom Apartments", 
      parent_id: 11
    }
  ],
  categoryDetails: {
    id: 111,
    name_ar: "شقق 2 غرفة",
    properties: [
      {
        id: 1,
        name_ar: "عدد الغرف",
        name_en: "Number of Rooms",
        type: "number",
        required: true
      },
      {
        id: 2,
        name_ar: "عدد الحمامات",
        name_en: "Number of Bathrooms",
        type: "number",
        required: true
      },
      {
        id: 3,
        name_ar: "المساحة",
        name_en: "Area",
        type: "number",
        required: true
      },
      {
        id: 4,
        name_ar: "مفروش",
        name_en: "Furnished",
        type: "select",
        required: false
      }
    ],
    features: [
      {
        id: 1,
        name_ar: "مكيف هواء",
        name_en: "Air Conditioning",
        icon: "ac"
      },
      {
        id: 2,
        name_ar: "إنترنت",
        name_en: "Internet",
        icon: "wifi"
      },
      {
        id: 3,
        name_ar: "موقف سيارات",
        name_en: "Parking",
        icon: "car"
      },
      {
        id: 4,
        name_ar: "مصعد",
        name_en: "Elevator",
        icon: "elevator"
      }
    ]
  }
}

/**
 * مثال على API endpoints المطلوبة
 */
export const REQUIRED_API_ENDPOINTS = {
  // جلب التصنيفات الرئيسية
  getMainCategories: "GET /user/categories?parent_id=null",
  
  // جلب التصنيفات الفرعية
  getSubCategories: "GET /user/categories?parent_id={parent_id}",
  
  // جلب تفاصيل التصنيف مع الخصائص والمميزات
  getCategoryDetails: "GET /user/categories/{category_id}",
  
  // إنشاء إعلان جديد
  createListing: "POST /user/listings",
  
  // تحديث إعلان موجود
  updateListing: "PUT /user/listings/{id}"
}
