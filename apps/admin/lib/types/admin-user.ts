export interface AdminUser {
  id: number
  first_name: string
  last_name: string
  full_name: string
  phone: string
  email: string
  role: "admin" | "manager" | "user"
  status: "active" | "inactive" | "blocked"
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

export interface UpdateProfileData {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  language?: string
}

export interface ResetPasswordData {
  new_password: string
  new_password_confirmation: string
}

