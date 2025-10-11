export interface PropertyOption {
  ar: string
  en: string
}

export interface Property {
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
  data_type: 'string' | 'int' |'float' | 'bool' | 'select' | 'multi_select'
  options?: PropertyOption[] | null
  is_required: boolean
  is_filterable: boolean
  is_searchable: boolean
  is_visible: boolean
  sort_order: number
  validation_rules?: {
    min?: number
    max?: number
    pattern?: string
  } | null
  created_at: string
  updated_at: string
  category?: {
    id: number
    name: {
      ar: string
      en: string
    }
  }
  usage_count?: number
}

export interface PropertyFormData {
  category_id: number
  name: {
    ar: string
    en: string
  }
  description?: {
    ar: string
    en: string
  }
  data_type: Property['data_type']
  options?: PropertyOption[]
  is_required: boolean
  is_filterable: boolean
  is_searchable: boolean
  is_visible: boolean
  sort_order: number
  validation_rules?: Property['validation_rules']
}

