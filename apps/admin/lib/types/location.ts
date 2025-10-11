export interface Governorate {
  id: number
  name: {
    ar: string
    en: string
  }
  code?: string
  sort_order: number
  is_active?: boolean
  cities_count?: number
  listings_count?: number
  created_at: string
  updated_at: string
}

export interface City {
  id: number
  governorate_id: number
  name: {
    ar: string
    en: string
  }
  code?: string
  sort_order: number
  is_active?: boolean
  listings_count?: number
  governorate?: {
    id: number
    name: {
      ar: string
      en: string
    }
  }
  created_at: string
  updated_at: string
}

export interface GovernorateFormData {
  name: {
    ar: string
    en: string
  }
  code?: string
  sort_order: number
  is_active?: boolean
}

export interface CityFormData {
  governorate_id: number
  name: {
    ar: string
    en: string
  }
  code?: string
  sort_order: number
  is_active?: boolean
}

