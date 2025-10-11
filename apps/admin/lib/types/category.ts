export interface CategoryName {
  ar: string
  en: string
}

export interface CategoryProperty {
  id: number
  category_id: number
  name: CategoryName
  description: CategoryName
  icon: string | null
  type: "int" | "float" | "bool" | "string" | "select"
  is_filter: boolean
  options: string[] | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CategoryFeature {
  id: number
  category_id: number
  name: CategoryName
  description: CategoryName | null
  icon: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: CategoryName
  description: CategoryName | null
  parent_id: number | null
  icon: string | null
  properties_source: "custom" | "parent" | "parent_and_custom"
  sort_order: number
  is_visible: boolean
  listings_count: number
  children: Category[]
  properties: CategoryProperty[]
  features: CategoryFeature[]
  created_at: string
  updated_at: string
}

export interface CategoriesResponse {
  success: boolean
  data: Category[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
