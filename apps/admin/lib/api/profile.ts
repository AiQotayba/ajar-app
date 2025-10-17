import { api } from "@/lib/api-client"
import type { AdminUser, UpdateProfileData, ResetPasswordData } from "@/lib/types/admin-user"

export const profileApi = {
  // Get current user profile
  getMe: () => {
    return api.get("/admin/me")
  },

  // Update profile
  updateProfile: (data: UpdateProfileData) => {
    return api.put("/admin/me", data)
  },

  // Reset password
  resetPassword: (data: ResetPasswordData) => {
    return api.post("/auth/reset-password", data)
  },

  // Upload avatar
  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append("avatar", file)
    return api.post("/user/me/avatar", formData)
  },

  // Get user's listings
  getMyListings: (params?: { page?: number; per_page?: number }) => {
    return api.get("/user/me/ads", { params })
  },

  // Get user's reviews
  getMyReviews: (params?: { page?: number; per_page?: number }) => {
    return api.get("/user/me/reviews", { params })
  },

  // Get user's notifications
  getMyNotifications: (params?: { page?: number; per_page?: number }) => {
    return api.get("/user/me/notifications", { params })
  },
}

