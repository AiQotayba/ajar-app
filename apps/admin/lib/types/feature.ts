export interface Feature {
  id: number
  category_id: number
  name: {
    ar: string
    en: string
  }
  description?: {
    ar: string | null
    en: string | null
  }
  icon?: string | null
  sort_order: number
  category?: {
    id: number
    name: {
      ar: string
      en: string
    }
    description?: {
      ar: string | null
      en: string | null
    }
    parent_id: number | null
    icon?: string | null
    properties_source: string
    sort_order: number
    is_visible: boolean
    listings_count: number
    created_at: string
    updated_at: string
  }
  created_at: string
  updated_at: string
  usage_count?: number
}

export interface FeatureFormData {
  category_id: number
  name: {
    ar: string
    en: string
  }
  description?: {
    ar: string
    en: string
  }
  icon?: string
  sort_order: number
}

