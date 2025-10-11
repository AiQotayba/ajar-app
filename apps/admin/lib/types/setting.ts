export interface Setting {
  id: number
  key: string
  value: string
  type: "text" | "number" | "boolean" | "json"
  is_settings: boolean
  created_at: string
  updated_at: string
}

