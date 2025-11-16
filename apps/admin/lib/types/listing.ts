export interface Listing {
  id: number
  owner_id: number | null
  category_id: number
  title: {
    ar: string | null
    en: string | null
  }
  ribon_text: {
    ar: string | null
    en: string | null
  }
  ribon_color: string
  description: {
    ar: string | null
    en: string | null
  }
  price: number
  currency: string
  governorate_id: number
  city_id: number | null
  latitude: string | null
  longitude: string | null
  status: "draft" | "in_review" | "approved" | "rejected"
  availability_status: "available" | "unavailable" | "rented" | "solded"
  available_from: string | null
  available_until: string | null
  type: "rent" | "sale" 
  pay_every: "monthly" | "quarterly" | "semi_annually" | "annually" | null
  insurance: number | null
  is_featured: boolean
  views_count: number
  is_favorite: boolean
  favorites_count: number
  average_rating: number
  reviews_count: number
  cover_image: string
  whatsapp_url: string
  created_at: string
  updated_at: string
  // Relations
  owner?: {
    id: number
    first_name: string
    last_name: string
    phone: string
  }
  category?: {
    id: number
    name: {
      ar: string
      en: string
    }
  }
  governorate?: {
    id: number
    name: {
      ar: string
      en: string
    }
  }
  city?: {
    id: number
    name: {
      ar: string
      en: string
    }
  }
  images?: Array<{
    id: number
    type: "image" | "video"
    url: string
    full_url: string
    source: "file" | "link"
    sort_order: number
    created_at: string
  }>
  media?: Array<{
    id: number
    type: "image" | "video"
    url: string
    full_url: string
    source: "file" | "link"
    sort_order: number
    created_at: string
  }>
  features?: Array<any>
  properties?: Array<any>
  reviews?: Array<any>
}

export interface ListingsResponse {
  data: Listing[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export interface ListingFilters {
  search?: string
  status?: string
  category_id?: string
  city_id?: string
  governorate_id?: string
  type?: string
}
