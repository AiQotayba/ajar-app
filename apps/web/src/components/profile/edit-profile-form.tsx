"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "../layout/header"
import { api } from "@/lib/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  first_name: string
  last_name: string
  full_name: string
  phone: string
  email?: string
  avatar?: string
  avatar_url?: string
  role: string
  status: string
  phone_verified: boolean
  language?: string
  wallet_balance: number
  notifications_unread_count: number
  listings_count: number
  created_at: string
  updated_at: string
}

export function EditProfileForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: ''
  })
  
  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: ''
  })

  // Fetch user data
  const {
    data: userData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await api.get('/user/me')
      
      if (response.isError) {
        throw new Error(response.message || 'Failed to fetch user profile')
      }
      
      return response.data as User
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  // Update form data when user data is loaded
  useEffect(() => {
    if (userData) {
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone: userData.phone || '',
        email: userData.email || ''
      })
    }
  }, [userData])

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.put('/user/me', data)
      if (response.isError) {
        throw new Error(response.message || 'حدث خطأ في تحديث البيانات')
      }
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success('تم تحديث البيانات بنجاح')
      router.back()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ في تحديث البيانات')
    }
  })

  // Validation function
  const validateForm = () => {
    const newErrors = {
      first_name: '',
      last_name: '',
      phone: '',
      email: ''
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'الاسم الأول مطلوب'
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'الاسم الأخير مطلوب'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب'
    } else if (!/^\+?[0-9\s-]+$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف غير صحيح'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    updateProfileMutation.mutate(formData)
  }

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="تعديل بيانات الحساب" showBack />
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-14 bg-muted animate-pulse rounded-2xl" />
          </div>
          <div className="space-y-4">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-14 bg-muted animate-pulse rounded-2xl" />
          </div>
          <div className="space-y-4">
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            <div className="h-14 bg-muted animate-pulse rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="تعديل بيانات الحساب" showBack />
        <div className="p-6">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground mb-4">
              {error?.message || 'حدث خطأ في تحميل البيانات'}
            </p>
            <Button onClick={() => router.back()}>
              العودة
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header title="تعديل بيانات الحساب" showBack />
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="first_name" className="text-right block">
            الاسم الأول
          </Label>
          <Input 
            id="first_name" 
            value={formData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            className={`h-14 rounded-2xl text-right ${errors.first_name ? 'border-destructive' : ''}`}
            placeholder="الاسم الأول"
          />
          {errors.first_name && (
            <p className="text-sm text-destructive text-right">{errors.first_name}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="last_name" className="text-right block">
            الاسم الأخير
          </Label>
          <Input 
            id="last_name" 
            value={formData.last_name}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            className={`h-14 rounded-2xl text-right ${errors.last_name ? 'border-destructive' : ''}`}
            placeholder="الاسم الأخير"
          />
          {errors.last_name && (
            <p className="text-sm text-destructive text-right">{errors.last_name}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-right block">
            رقم الهاتف
          </Label>
          <Input 
            id="phone" 
            type="tel" 
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`h-14 rounded-2xl text-right ${errors.phone ? 'border-destructive' : ''}`}
            placeholder="+90 000 000 00 00"
          />
          {errors.phone && (
            <p className="text-sm text-destructive text-right">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-right block">
            البريد الإلكتروني (اختياري)
          </Label>
          <Input 
            id="email" 
            type="email" 
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`h-14 rounded-2xl text-right ${errors.email ? 'border-destructive' : ''}`}
            placeholder="example@email.com"
          />
          {errors.email && (
            <p className="text-sm text-destructive text-right">{errors.email}</p>
          )}
        </div>

        {/* Save Button */}
        <Button 
          type="submit"
          className="w-full h-14 text-lg rounded-2xl mt-8"
          disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
        </Button>
      </form>
    </div>
  )
}
