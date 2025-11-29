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
import { Phone, Camera } from "lucide-react"
import { ImageUpload } from "@/components/listings/form/components/image-upload"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"

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
  const { refreshUser } = useAuth()
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    avatar: ''
  })

  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    avatar: ''
  })

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

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
        email: userData.email || '',
        avatar: userData.avatar || ''
      })

      // Set avatar preview
      if (userData.avatar_url) {
        setAvatarPreview(userData.avatar_url)
      } else if (userData.avatar) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'
        setAvatarPreview(`${baseUrl}/storage/${userData.avatar}`)
      }
    }
  }, [userData])

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.put('/user/me', data)
      if (response.isError) {
        throw new Error(response.message || t('updateError'))
      }
      return response
    },
    onSuccess: (data: any) => {
      console.log(data);

      refreshUser()
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      router.back()
      window.location.href = "/profile"
    },
    onError: (error: Error) => {
      toast.error(error.message || t('updateError'))
    }
  })

  // Handle avatar change
  const handleAvatarChange = (imageName: string) => {
    setFormData(prev => ({ ...prev, avatar: imageName }))
    // Update preview
    if (imageName) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'
      setAvatarPreview(`${baseUrl}/storage/${imageName}`)
    } else {
      setAvatarPreview(null)
    }
  }

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

    setErrors({ ...newErrors, avatar: '' })
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

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    if (!name) return locale === 'ar' ? 'م' : 'U'
    const words = name.trim().split(' ')
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase()
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
  }
  const openFileInput = () => {
    const fileInput = document.querySelector('[type="file"]') as HTMLInputElement
    if (fileInput) {
      fileInput.click()
    }
  }
  console.log(userData);
  return (
    <div className="min-h-screen max-w-2xl mx-auto bg-background" dir={direction}>
      <form onSubmit={handleSubmit} className="p-6 space-y-6" dir={direction}>
        {/* Avatar Upload */}
        <div className="flex flex-col items-center space-y-4 pb-6 border-b">
          <Label className="text-base font-semibold mb-2">
            {t('clickToAdd')}
          </Label>
          <div className="relative group *:cursor-pointer">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 transition-all group-hover:border-primary/40">
              {avatarPreview && userData?.avatar !== "avatars/default_avatar.jpg" ? (
                <Image
                  src={avatarPreview}
                  alt={userData?.full_name || 'User'}
                  width={128}
                  height={128}
                  onClick={openFileInput}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary-foreground">
                    {getInitials(userData?.full_name || '')}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-background transition-all group-hover:scale-110">
              <Camera className="h-5 w-5 text-primary-foreground" onClick={openFileInput} />
            </div>
          </div>
          <div className="w-full max-w-xs">
            <ImageUpload
              value={formData.avatar}
              onChange={handleAvatarChange}
              folder="listings"
              aspectRatio="square"
              maxSize={5}
              className="w-full hidden"
            />
          </div>
        </div>

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
