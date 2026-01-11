import { api } from "../api"

export interface CreateListingRequest {
  title: {
    ar: string
    en?: string
  }
  description: {
    ar?: string
    en?: string
  }
  category_id: number
  governorate_id: number
  city_id?: number | null
  price: number
  currency: string
  latitude?: string | null
  longitude?: string | null
  type: "sale" | "rent"
  availability_status: "available" | "rented" | "sold" | "reserved"
  status: "draft" | "active" | "inactive" | "pending" | "rejected"
  properties: Array<{
    property_id: number
    value: string
    sort_order: number
  }>
  features: number[]
  media: Array<{
    type: "image"
    url: string
    source: "file" | "iframely"
    iframely?: any
    sort_order: number
  }>
}

export interface UpdateListingRequest extends CreateListingRequest {
  id?: number
}

export interface ListingResponse {
  id: number
  title: {
    ar: string
    en?: string
  }
  description: {
    ar?: string
    en?: string
  }
  category_id: number
  governorate_id: number
  city_id?: number | null
  price: number
  currency: string
  latitude?: string | null
  longitude?: string | null
  type: "sale" | "rent"
  availability_status: "available" | "rented" | "sold" | "reserved"
  status: "draft" | "active" | "inactive" | "pending" | "rejected"
  properties: Array<{
    property_id: number
    value: string
    sort_order: number
  }>
  features: number[]
  media: Array<{
    type: "image"
    url: string
    source: "file"
    sort_order: number
  }>
  created_at: string
  updated_at: string
}

/**
 * Create a new listing
 * POST /user/listings
 */
export const createListing = async (data: CreateListingRequest): Promise<ListingResponse> => {
  const response = await api.post("/user/listings", data)

  if (response.isError) {
    console.error("❌ Create listing error:", response.message)
    throw new Error(response.message)
  }

  return response.data
}

/**
 * Update an existing listing
 * PUT /user/listings/:id
 */
export const updateListing = async (id: number, data: UpdateListingRequest): Promise<ListingResponse> => {

  const response = await api.put(`/user/listings/${id}`, data)

  if (response.isError) {
    console.error("❌ Update listing error:", response.message)
    throw new Error(response.message)
  }

  return response.data
}

/**
 * Get a listing by ID
 * GET /user/listings/:id
 */
export const getListing = async (id: number): Promise<ListingResponse> => {
  const response = await api.get(`/user/listings/${id}`)

  if (response.isError) {
    console.error("❌ Get listing error:", response.message)
    throw new Error(response.message)
  }

  return response.data
}

/**
 * Get all user listings
 * GET /user/listings
 */
export const getUserListings = async (): Promise<ListingResponse[]> => {
  const response = await api.get("/user/listings")

  if (response.isError) {
    console.error("❌ Get user listings error:", response.message)
    throw new Error(response.message)
  }

  return response.data
}

/**
 * Delete a listing
 * DELETE /user/listings/:id
 */
export const deleteListing = async (id: number): Promise<void> => {
  const response = await api.delete(`/user/listings/${id}`)

  if (response.isError) {
    console.error("❌ Delete listing error:", response.message)
    throw new Error(response.message)
  }
}

/**
 * Upload image using direct fetch API
 * POST /general/upload-image
 */
export const uploadImageDirect = async (
  file: File,
  retryCount: number = 0
): Promise<{ url: string }> => {
  const maxRetries = 3
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ajar-backend.mystore.social/api/v1'

  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('folder', 'listings')

    // Get token for authentication
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')

    const response = await fetch(`${baseUrl}/general/upload-image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    // Return the correct format based on API response
    return {
      url: data.data?.image_url || data.image_url || data.url
    }

  } catch (error: any) {
    console.error(`❌ Upload attempt ${retryCount + 1} failed:`, error)

    // Retry logic for network errors
    if (retryCount < maxRetries && (
      error.message?.includes('timeout') ||
      error.message?.includes('network') ||
      error.message?.includes('Failed to fetch')
    )) { 
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
      return uploadImageDirect(file, retryCount + 1)
    }

    throw new Error(error.message || 'Failed to upload image')
  }
}

/**
 * Validate file before upload
 */
const validateFile = (file: File): void => {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    throw new Error('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت')
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('نوع الملف غير مدعوم. الأنواع المسموحة: JPG, PNG, GIF, WebP')
  }

  // Check if file is empty
  if (file.size === 0) {
    throw new Error('الملف فارغ')
  }
}

/**
 * Upload image to server
 * Uses direct fetch API for better reliability
 */
export const uploadImage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string }> => {
  // Validate file before upload
  validateFile(file)

  // Use direct fetch for better reliability
  return await uploadImageDirect(file)
}

/**
 * Upload multiple images to server
 */
export const uploadImages = async (
  files: File[]
): Promise<{ urls: string[] }> => {
  const uploadPromises = files.map(async (file, index) => {
    try {
      const result = await uploadImage(file)
      return result.url
    } catch (error) {
      console.error(`❌ Failed to upload file ${file.name}:`, error)
      throw error
    }
  })

  try {
    const urls = await Promise.all(uploadPromises)
    return { urls }
  } catch (error) {
    console.error("❌ Some images failed to upload:", error)
    throw error
  }
}

/**
 * Transform form data to API format
 */
export const transformFormDataToAPI = (formData: any): CreateListingRequest => {
  const transformedData: CreateListingRequest = {
    title: {
      ar: formData.title.ar,
      en: formData.title.en || ""
    },
    description: {
      ar: formData.description.ar || "",
      en: formData.description.en || ""
    },
    category_id: parseInt(formData.category_id),
    governorate_id: parseInt(formData.governorate_id),
    city_id: formData.city_id ? parseInt(formData.city_id) : null,
    price: formData.price,
    currency: "USD", // Default currency
    latitude: formData.latitude?.toString() || null,
    longitude: formData.longitude?.toString() || null,
    type: formData.type,
    availability_status: formData.availability_status,
    status: "draft", // Default status
    properties: formData.properties.map((prop: any, index: number) => ({
      property_id: prop.id,
      value: prop.value,
      sort_order: index + 1
    })),
    features: formData.features.map((id: string) => parseInt(id)),
    media: formData.media.map((mediaItem: any, index: number) => {
      // If the media item is a string (uploaded file URL)
      if (typeof mediaItem === 'string') {
        return {
          type: "image",
          url: mediaItem,
          source: "file",
          sort_order: index + 1
        }
      }

      // If frontend provided a full object
      const item: any = {}
      // Determine type: prefer provided type, otherwise default to image
      item.type = mediaItem.type || (mediaItem.iframely && mediaItem.iframely.meta && mediaItem.iframely.meta.medium === 'video' ? 'video' : 'image')
      item.url = mediaItem.url || mediaItem.image_url || ''

      // Preserve iframely payload if present
      if (mediaItem.iframely) {
        item.source = 'iframely'
        item.iframely = mediaItem.iframely
      } else {
        item.source = mediaItem.source || 'file'
      }

      item.sort_order = index + 1
      return item
    })
  }

  return transformedData
}

