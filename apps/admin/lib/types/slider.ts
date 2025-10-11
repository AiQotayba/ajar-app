export interface Slider {
  id: number
  title: {
    ar: string
    en: string
  }
  description: {
    ar: string
    en: string
  }
  image_url: string
  target_url: string
  start_at: string
  end_at: string
  active: boolean
  clicks: number
  sort_order: number
  user?: {
    id: number
    first_name: string
    last_name: string
    full_name: string
    phone: string
    email: string
    role: string
    status: string
    phone_verified: boolean
    avatar: string | null
    avatar_url: string | null
    language: string
    wallet_balance: number
    notifications_unread_count: number
    listings_count: number
    created_at: string
    updated_at: string
  }
  created_at: string
  updated_at: string
}

