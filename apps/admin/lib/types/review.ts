export interface Review {
  id: number
  rating: number
  comment: string
  is_approved: boolean
  user: {
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
  listing: {
    id: number
    title: {
      ar: string
      en: string
    }
    ribon_text: {
      ar: string | null
      en: string | null
    }
    ribon_color: string | null
    description: {
      ar: string
      en: string
    }
    price: number
    currency: string
    latitude: string
    longitude: string
    status: string
    available_from: string
    available_until: string
    type: string
    pay_every: string | null
    insurance: number | null
    is_featured: boolean
    views_count: number
    is_favorite: boolean
    favorites_count: number
    average_rating: number
    reviews_count: number
    cover_image: string
    whatsapp_url: string
    owner: any | null
    images: any[]
    created_at: string
    updated_at: string
  }
  created_at: string
}

