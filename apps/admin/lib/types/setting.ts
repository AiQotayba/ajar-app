export interface Setting {
  id: number
  key: string
  value: string
  type: "text" | "long_text" | "int" | "float" | "bool" | "json" | "datetime" | "html"
  is_settings: boolean
  created_at: string
  updated_at: string
}

