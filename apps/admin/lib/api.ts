import { toast } from "sonner"

import { createApi } from "./api-client"

// Create the default API instance
export const api = createApi({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://ajar-backend.mystore.social/api/v1",
  getLang: () => "ar",
  getToken: () => {
    // Use permanent admin token
    return "32|2pCkyXvH7k6IMLBSKNez5xeefrdvW54qq3RKbTwU7dc57518"
  },
  onUnauthorized: () => {
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  },
  defaultTimeout: 10000,
  credentials: "same-origin",
})