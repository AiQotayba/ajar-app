"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock } from "lucide-react"
import { useState } from "react"
import { api } from "@/lib/api"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"

export function ChangePasswordForm() {
  const router = useRouter()
  const t = useTranslations('profile')
  const locale = useLocale()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { password: string; password_confirmation: string }) => {
      const response = await api.post('/auth/reset-password', data)
      if (response.isError) {
        throw new Error(response.message || t('changePasswordError'))
      }
      return response.data
    },
    onSuccess: () => {
      toast.success(t('changePasswordSuccess'))
      router.push('/profile')
    },
    onError: (error: Error) => {
      toast.error(error.message || t('changePasswordError'))
    }
  })

  // Validation function
  const validateForm = () => {
    const newErrors = {
      newPassword: '',
      confirmPassword: ''
    }

    if (!formData.newPassword) {
      newErrors.newPassword = t('newPasswordRequired')
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = t('passwordMinLength')
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('confirmPasswordRequired')
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordMismatch')
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

    resetPasswordMutation.mutate({
      password: formData.newPassword,
      password_confirmation: formData.confirmPassword
    })
  }

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto bg-background" dir={direction}>
      <form onSubmit={handleSubmit} className="p-6 space-y-6" dir={direction}> 
        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="new-password" className={direction === 'rtl' ? 'text-right block' : 'text-left block'}>
            {t('newPassword')}
          </Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              placeholder="**************"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className={`h-14 ${direction === 'rtl' ? 'pr-12 pl-12' : 'pl-12 pr-12'} rounded-2xl ${direction === 'rtl' ? 'text-right' : 'text-left'} ${errors.newPassword ? 'border-destructive' : ''}`}
            />
            <Lock className={`absolute ${direction === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className={`absolute ${direction === 'rtl' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2`}
            >
              {showNewPassword ? (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className={`text-sm text-destructive ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className={direction === 'rtl' ? 'text-right block' : 'text-left block'}>
            {t('confirmNewPassword')}
          </Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="**************"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`h-14 ${direction === 'rtl' ? 'pr-12 pl-12' : 'pl-12 pr-12'} rounded-2xl ${direction === 'rtl' ? 'text-right' : 'text-left'} ${errors.confirmPassword ? 'border-destructive' : ''}`}
            />
            <Lock className={`absolute ${direction === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`absolute ${direction === 'rtl' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2`}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className={`text-sm text-destructive ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>{errors.confirmPassword}</p>
          )}
        </div>

        {/* Save Button */}
        <Button
          type="submit"
          className="w-full h-14 text-lg rounded-2xl mt-8"
          disabled={resetPasswordMutation.isPending}
        >
          {resetPasswordMutation.isPending ? t('saving') : t('save')}
        </Button>
      </form>
    </div>
  )
}
