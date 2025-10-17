export interface User {
    id: number
    first_name: string
    last_name: string
    full_name: string
    phone: string
    email?: string
    avatar?: string // relative path for DB
    avatar_url?: string // full URL for display
    role: "admin" | "user"
    status: "active" | "banned"
    phone_verified: boolean
    language?: string
    created_at: string
    updated_at: string
    last_login?: string
}

