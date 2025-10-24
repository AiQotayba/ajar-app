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
  category_id: z.string().min(1, "التصنيف مطلوب"),
  properties: z.array(z.object({
    id: z.number(),
    value: z.string()
  })).default([]),
  features: z.array(z.string()).default([]),
  
  // Step 2: Location
  governorate_id: z.string().min(1, "المحافظة مطلوبة"),
  city_id: z.string().optional(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  
  // Step 3: Images
  media: z.array(z.instanceof(File)).default([]),
  cover_image_index: z.number().default(0),
  
  // Step 4: Price
  price: z.number().min(0, "السعر يجب أن يكون أكبر من أو يساوي صفر"),
  payment_frequency: z.string().optional(),
  insurance: z.number().optional(),
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

// Form Step Configuration
export interface FormStep {
  id: number
  title: string
  description: string
  fields: string[]
  api?: string
}

export const FORM_STEPS: FormStep[] = [
  {
    id: 1,
    title: "البيانات الأساسية",
    description: "معلومات العقار الأساسية",
    fields: ["title_ar", "title_en", "description_ar", "description_en", "type", "availability_status", "category_id", "properties", "features"],
    api: "GET /user/categories"
  },
  {
    id: 2,
    title: "الموقع",
    description: "موقع العقار الجغرافي",
    fields: ["governorate_id", "city_id", "latitude", "longitude"],
    api: "GET /user/governorates"
  },
  {
    id: 3,
    title: "الصور",
    description: "صور العقار",
    fields: ["media", "cover_image_index"]
  },
  {
    id: 4,
    title: "السعر والتوفر",
    description: "معلومات السعر والتوفر",
    fields: ["price", "currency", "availability_status", "status"]
  },
  {
    id: 5,
    title: "المراجعة",
    description: "مراجعة البيانات قبل الإرسال",
    fields: []
  }
]
