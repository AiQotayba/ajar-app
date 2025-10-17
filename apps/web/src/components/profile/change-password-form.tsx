"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock } from "lucide-react"
import { useState } from "react"
import { Header } from "../layout/header"
import { api } from "@/lib/api"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ChangePasswordForm() {
  const router = useRouter()
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
        throw new Error(response.message || 'حدث خطأ في تغيير كلمة المرور')
      }
      return response.data
    },
    onSuccess: () => {
      toast.success('تم تغيير كلمة المرور بنجاح')
      router.push('/profile')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ في تغيير كلمة المرور')
    }
  })

  // Validation function
  const validateForm = () => {
    const newErrors = {
      newPassword: '',
      confirmPassword: ''
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة مطلوبة'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة'
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header title="تغيير كلمة المرور" showBack />

      <form onSubmit={handleSubmit} className="p-6 space-y-6"> 
        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-right block">
            كلمة المرور الجديدة
          </Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              placeholder="**************"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className={`h-14 pr-12 pl-12 rounded-2xl text-right ${errors.newPassword ? 'border-destructive' : ''
                }`}
            />
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2"
            >
              {showNewPassword ? (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-sm text-destructive text-right">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-right block">
            تأكيد كلمة المرور الجديدة
          </Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="**************"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`h-14 pr-12 pl-12 rounded-2xl text-right ${errors.confirmPassword ? 'border-destructive' : ''
                }`}
            />
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive text-right">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Save Button */}
        <Button
          type="submit"
          className="w-full h-14 text-lg rounded-2xl mt-8"
          disabled={resetPasswordMutation.isPending}
        >
          {resetPasswordMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
        </Button>
      </form>
    </div>
  )
}
