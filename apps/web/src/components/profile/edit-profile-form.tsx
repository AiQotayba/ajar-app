"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import '@/styles/phone-input.css'
import { Phone } from "lucide-react"

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
  const t = useTranslations('profile')
  const locale = useLocale()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  
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
        throw new Error(response.message || t('updateError'))
      }
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success(t('updateSuccess'))
      router.back()
    },
    onError: (error: Error) => {
      toast.error(error.message || t('updateError'))
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
      newErrors.first_name = t('firstNameRequired')
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = t('lastNameRequired')
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('phoneRequired')
    } else if (!isValidPhoneNumber(formData.phone)) {
      newErrors.phone = t('invalidPhone')
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalidEmail')
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
      <div className="min-h-screen bg-background" dir={direction}>
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
      <div className="min-h-screen bg-background" dir={direction}>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground mb-4">
              {error?.message || t('loadError')}
            </p>
            <Button onClick={() => router.back()}>
              {t('back')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto bg-background" dir={direction}>
      <form onSubmit={handleSubmit} className="p-6 space-y-6" dir={direction}>
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="first_name" className={direction === 'rtl' ? 'text-right block' : 'text-left block'}>
            {t('firstName')}
          </Label>
          <Input 
            id="first_name" 
            value={formData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            className={`h-14 rounded-2xl ${direction === 'rtl' ? 'text-right' : 'text-left'} ${errors.first_name ? 'border-destructive' : ''}`}
            placeholder={t('firstNamePlaceholder')}
          />
          {errors.first_name && (
            <p className={`text-sm text-destructive ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>{errors.first_name}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="last_name" className={direction === 'rtl' ? 'text-right block' : 'text-left block'}>
            {t('lastName')}
          </Label>
          <Input 
            id="last_name" 
            value={formData.last_name}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            className={`h-14 rounded-2xl ${direction === 'rtl' ? 'text-right' : 'text-left'} ${errors.last_name ? 'border-destructive' : ''}`}
            placeholder={t('lastNamePlaceholder')}
          />
          {errors.last_name && (
            <p className={`text-sm text-destructive ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>{errors.last_name}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className={direction === 'rtl' ? 'text-right block' : 'text-left block'}>
            {t('phone')}
          </Label>
          <div className="relative">
            <Phone className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <PhoneInput
              value={formData.phone}
              onChange={(value) => handleInputChange('phone', value || '')}
              international
              defaultCountry="SY"
              placeholder={t('phonePlaceholder')}
              className={`h-14 rtl:pl-10 ltr:pr-10 rounded-2xl border ${errors.phone ? 'border-destructive' : 'border-border'} focus-within:border-primary text-foreground [&_input]:h-14 [&_input]:rounded-2xl [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-4 [&_input]:text-foreground [&_input]:placeholder:text-muted-foreground [&_.PhoneInputCountry]:px-4`}
            />
          </div>
          {errors.phone && (
            <p className={`text-sm text-destructive ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className={direction === 'rtl' ? 'text-right block' : 'text-left block'}>
            {t('email')} ({t('optional')})
          </Label>
          <Input 
            id="email" 
            type="email" 
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`h-14 rounded-2xl ${direction === 'rtl' ? 'text-right' : 'text-left'} ${errors.email ? 'border-destructive' : ''}`}
            placeholder={t('emailPlaceholder')}
          />
          {errors.email && (
            <p className={`text-sm text-destructive ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>{errors.email}</p>
          )}
        </div>

        {/* Save Button */}
        <Button 
          type="submit"
          className="w-full h-14 text-lg rounded-2xl mt-8"
          disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? t('saving') : t('save')}
        </Button>
      </form>
    </div>
  )
}
