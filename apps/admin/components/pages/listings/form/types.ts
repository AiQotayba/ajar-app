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
    z.undefined()
  ]).transform(val => {
    if (val === null || val === undefined) return ""
    return typeof val === 'string' ? val : val.toString()
  }).refine(val => val !== "", "التصنيف مطلوب"),
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
    z.undefined()
  ]).transform(val => {
    if (val === null || val === undefined) return ""
    return typeof val === 'string' ? val : val.toString()
  }).refine(val => val !== "", "المحافظة مطلوبة"),
  city_id: z.union([z.string(), z.number(), z.null()]).optional().transform(val => 
    val === null ? undefined : (typeof val === 'string' ? val : val?.toString())
  ),
  latitude: z.number().min(-90).max(90, "خط العرض غير صحيح"),
  longitude: z.number().min(-180).max(180, "خط الطول غير صحيح"),
  
  // Step 3: Images - Support both File objects and string URLs
  media: z.array(z.union([
    z.instanceof(File),
    z.string().min(1, "رابط الصورة مطلوب"),
    z.object({
      url: z.string().min(1, "رابط الصورة مطلوب"),
      type: z.string().optional(),
      source: z.string().optional(),
      sort_order: z.number().optional()
    }).transform(obj => obj.url)
  ])).min(1, "يجب رفع صورة واحدة على الأقل").default([]),
  cover_image_index: z.number().default(0),
  
  // Step 4: Price
  price: z.number().min(0, "السعر يجب أن يكون أكبر من أو يساوي صفر"),
  payment_frequency: z.string().optional(),
  insurance: z.union([z.number(), z.null()]).optional().transform(val => 
    val === null ? undefined : val
  ),
  
  // Admin specific fields
  status: z.enum(["draft", "active", "inactive", "pending", "rejected"]).optional(),
  is_featured: z.boolean().optional().default(false),
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
  type: 'text' | 'number' | 'select' | 'string' | 'int' | 'float'
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

