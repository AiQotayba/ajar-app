import { z } from "zod"

// Zod Schema for form validation
export const listingFormSchema = z.object({
  // Step 1: Basic Info
  title: z.object({
    ar: z.string().min(1, "العنوان بالعربية مطلوب"),
    en: z.string().optional()
  }),
  description: z.object({
    ar: z.string().optional(),
    en: z.string().optional()
  }),
  type: z.string().min(1, "نوع العقار مطلوب"),
  availability_status: z.string().min(1, "حالة التوفر مطلوبة"),
  category_id: z.union([
    z.string().min(1, "التصنيف مطلوب"), 
    z.number().positive("التصنيف مطلوب"),
    z.null(),
    z.undefined(),
    z.string().length(0) // Allow empty string
  ]).transform(val => {
    if (val === null || val === undefined || val === "") return ""
    return typeof val === 'string' ? val : val.toString()
  }).optional(),
  sub_category_id: z.union([z.string(), z.number(), z.null(), z.undefined()]).optional().transform(val => 
    val === null || val === undefined || val === "" ? undefined : (typeof val === 'string' ? val : val?.toString())
  ),
  sub_sub_category_id: z.union([z.string(), z.number(), z.null(), z.undefined()]).optional().transform(val => 
    val === null || val === undefined || val === "" ? undefined : (typeof val === 'string' ? val : val?.toString())
  ),
  properties: z.array(z.object({
    id: z.number(),
    value: z.string()
  })).default([]),
  features: z.array(z.string()).default([]),
  
  // Step 2: Location
  governorate_id: z.union([
    z.string().min(1, "المحافظة مطلوبة"), 
    z.number().positive("المحافظة مطلوبة"),
    z.null(),
    z.undefined(),
    z.string().length(0) // Allow empty string
  ]).transform(val => {
    if (val === null || val === undefined || val === "") return ""
    return typeof val === 'string' ? val : val.toString()
  }).optional(),
  city_id: z.union([z.string(), z.number(), z.null()]).optional().transform(val => 
    val === null ? undefined : (typeof val === 'string' ? val : val?.toString())
  ),
  latitude: z.number().min(-90).max(90, "خط العرض غير صحيح"),
  longitude: z.number().min(-180).max(180, "خط الطول غير صحيح"),
  
  // Step 3: Images - Support both File objects and string URLs
  images: z.array(z.union([
    z.instanceof(File),
    z.string().min(5, "رابط الصورة مطلوب"),
    z.object({
      url: z.string().min(1, "رابط الصورة مطلوب"),
      type: z.string().optional(),
      source: z.string().optional(),
      sort_order: z.number().optional()
    }).transform(obj => obj.url)
  ])).min(5, "يجب رفع 5 صور على الأقل"),
  cover_image_index: z.number().default(0),
  
  // Step 4: Price
  price: z.number().min(0, "السعر يجب أن يكون أكبر من أو يساوي صفر"),
  pay_every: z.string().optional(), // monthly, yearly, one-time
  insurance: z.union([z.number(), z.null()]).optional().transform(val => 
    val === null ? undefined : val
  ),
  
  // Admin specific fields
  status: z.enum(["draft", "active", "inactive", "pending", "rejected"]).optional(),
  is_featured: z.boolean().optional().default(false),
})
.refine((data) => {
  // Category validation: Either category_id or sub_category_id or sub_sub_category_id must be provided
  const hasCategory = data.category_id && data.category_id !== ""
  const hasSubCategory = data.sub_category_id && data.sub_category_id !== ""
  const hasSubSubCategory = data.sub_sub_category_id && data.sub_sub_category_id !== ""
  
  if (!hasCategory && !hasSubCategory && !hasSubSubCategory) {
    return false
  }
  return true
}, {
  message: "يجب اختيار تصنيف واحد على الأقل (رئيسي أو فرعي)",
  path: ["category_id"],
})
.refine((data) => {
  // Governorate validation: Either governorate_id or city_id must be provided
  const hasGovernorate = data.governorate_id && data.governorate_id !== ""
  const hasCity = data.city_id && data.city_id !== ""
  
  if (!hasGovernorate && !hasCity) {
    return false
  }
  return true
}, {
  message: "يجب اختيار محافظة أو مدينة",
  path: ["governorate_id"],
})

export type ListingFormData = z.infer<typeof listingFormSchema>

// API Response Types
export interface Category {
  id: number
  name: {
    ar: string
    en: string
  }
  parent_id?: number
  children?: Category[]
  properties?: Property[]
  features?: Feature[]
}

export interface Property {
  id: number
  category_id?: number
  name: {
    ar: string
    en: string
  }
  description?: {
    ar: string | null
    en: string | null
  }
  icon?: string | null
  type: 'text' | 'number' | 'select' | 'string' | 'int' | 'float' | 'bool'
  is_filter?: boolean
  options?: Array<{
    ar: string
    en: string
  }> | null
  sort_order?: number
  is_visible?: boolean
  created_at?: string
  updated_at?: string
}

export interface Feature {
  id: number
  name: {
    ar: string
    en: string
  }
  description?: {
    ar: string | null
    en: string | null
  }
  icon?: string | null
  sort_order?: number
  is_visible?: boolean
}

export interface Governorate {
  id: number
  name: {
    ar: string
    en: string
  }
  cities: City[]
}

export interface City {
  id: number
  name: {
    ar: string
    en: string
  }
  governorate_id: number
}
