import { api } from "@/lib/api-client"
import type { User } from "@/lib/types/user"

export const usersApi = {
    // Get all users
    getAll: (params?: { page?: number; per_page?: number }) => {
        return api.get("/admin/users", { params })
    },

    // Get single user
    getById: (id: number) => {
        return api.get(`/admin/users/${id}`)
    },

    // Create user
    create: (data: Partial<User>) => {
        return api.post("/admin/users", data)
    },

    // Update user
    update: (id: number, data: Partial<User>) => {
        return api.put(`/admin/users/${id}`, data)
    },

    // Delete user
    delete: (id: number) => {
        return api.delete(`/admin/users/${id}`)
    },
}

