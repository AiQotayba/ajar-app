"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { User, Mail, Phone, Lock, Save, X, Edit, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { profileApi } from "@/lib/api/profile"
import type { AdminUser, UpdateProfileData, ResetPasswordData } from "@/lib/types/admin-user"
import { PageHeader } from "@/components/dashboard/page-header"
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input"
import { cn } from "@/lib/utils"
import "react-phone-number-input/style.css"
import "@/styles/phone-input.css"

export default function MyAccountPage() {
  const queryClient = useQueryClient()
  const [isEditingProfile, setIsEditingProfile] = React.useState(false)
  const [isEditingPassword, setIsEditingPassword] = React.useState(false)

  // Fetch profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: profileApi.getMe,
  })

  const profile = profileData?.data as AdminUser | undefined

  // Profile form state
  const [profileForm, setProfileForm] = React.useState<UpdateProfileData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  })

  // Password form state
  const [passwordForm, setPasswordForm] = React.useState<ResetPasswordData>({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  })

  // Initialize form when profile loads
  React.useEffect(() => {
    if (profile) {
      setProfileForm({
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone ? (profile.phone.startsWith('+') ? profile.phone : `+${profile.phone}`) : "",
      })
    }
  }, [profile])

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => profileApi.updateProfile(data),
    onSuccess: (response: any) => {
      console.info("📥 Update Profile Response:", response)
      
      // Check if response indicates an error
      if (response?.isError || (response?.status && response.status >= 400)) {
        console.error("❌ Update Profile Failed:", response)
        
        // Handle validation errors
        if (response?.errors) {
          const firstError = Object.values(response.errors)[0]
          const errorMessage = Array.isArray(firstError) ? firstError[0] : response.message
          toast.error(errorMessage)
        } else {
          toast.error(response?.message || "فشل تحديث الملف الشخصي")
        }
        return
      }
      
      console.info("✅ Update Profile Success")
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      toast.success(response?.message || "تم تحديث الملف الشخصي بنجاح")
      setIsEditingProfile(false)
    },
    onError: (error: any) => {
      console.error("❌ Update Profile Error:", error)
      const errorMessage = error?.response?.data?.message || error?.message || "فشل تحديث الملف الشخصي"
      toast.error(errorMessage)
    },
  })

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordData) => profileApi.resetPassword(data),
    onSuccess: (response: any) => {
      console.info("📥 Reset Password Response:", response)
      
      // Check if response indicates an error
      if (response?.isError || (response?.status && response.status >= 400)) {
        console.error("❌ Reset Password Failed:", response)
        
        // Handle validation errors
        if (response?.errors) {
          const firstError = Object.values(response.errors)[0]
          const errorMessage = Array.isArray(firstError) ? firstError[0] : response.message
          toast.error(errorMessage)
        } else {
          toast.error(response?.message || "فشل تغيير كلمة المرور")
        }
        return
      }
      
      console.info("✅ Reset Password Success")
      toast.success(response?.message || "تم تغيير كلمة المرور بنجاح")
      setPasswordForm({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      })
      setIsEditingPassword(false)
    },
    onError: (error: any) => {
      console.error("❌ Reset Password Error:", error)
      const errorMessage = error?.response?.data?.message || error?.message || "فشل تغيير كلمة المرور"
      toast.error(errorMessage)
    },
  })

  // Handle profile update
  const handleUpdateProfile = () => {
    // Validate phone number
    if (profileForm.phone && !isValidPhoneNumber(profileForm.phone)) {
      toast.error("رقم الهاتف غير صحيح")
      return
    }
    
    // Ensure phone number starts with +
    const submitData = {
      ...profileForm,
      phone: profileForm.phone && !profileForm.phone.startsWith('+') 
        ? `+${profileForm.phone}` 
        : profileForm.phone
    }
    
    console.info("📤 Updating Profile:", submitData)
    updateProfileMutation.mutate(submitData)
  }

  // Handle password reset
  const handleResetPassword = () => {
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast.error("كلمة المرور الجديدة غير متطابقة")
      return
    }
    if (passwordForm.new_password.length < 8) {
      toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل")
      return
    }
    
    console.info("📤 Resetting Password")
    resetPasswordMutation.mutate(passwordForm)
  }

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="حسابي"
        description="إدارة معلومات الملف الشخصي وكلمة المرور"
        icon={User}
      />

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1 border border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5 text-primary" />
              المعلومات الشخصية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:border-primary/40">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-3xl font-semibold">
                    {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2 shadow-md">
                  <Shield className="h-4 w-4" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-semibold">{profile?.full_name}</h3>
                <p className="text-sm text-muted-foreground">{profile?.email || profile?.phone}</p>
              </div>
              <Badge className="bg-primary text-primary-foreground shadow-sm">
                <Shield className="h-3 w-3 mr-1" />
                {profile?.role === "admin" ? "مدير نظام" : profile?.role === "manager" ? "مدير" : "مستخدم"}
              </Badge>
            </div>

            <Separator className="my-4" />

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200">
                <span className="text-sm font-medium text-foreground">الإعلانات</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold">{profile?.listings_count || 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200">
                <span className="text-sm font-medium text-foreground">الإشعارات غير المقروءة</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold">{profile?.notifications_unread_count || 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200">
                <span className="text-sm font-medium text-foreground">اللغة</span>
                <Badge variant="outline" className="font-medium">{profile?.language === "ar" ? "العربية" : "English"}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile & Password */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Edit Profile */}
          <Card className="border border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Edit className="h-5 w-5 text-primary" />
                    تعديل الملف الشخصي
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">قم بتحديث معلوماتك الشخصية</CardDescription>
                </div>
                {!isEditingProfile ? (
                  <Button 
                    onClick={() => setIsEditingProfile(true)} 
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    تعديل
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={updateProfileMutation.isPending}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProfileMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                    </Button>
                    <Button
                      onClick={() => setIsEditingProfile(false)}
                      variant="outline"
                      disabled={updateProfileMutation.isPending}
                      className="transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <X className="h-4 w-4 mr-2" />
                      إلغاء
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium">الاسم الأول</Label>
                  <Input
                    id="first_name"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                    disabled={!isEditingProfile}
                    className={cn(
                      "transition-all duration-200",
                      !isEditingProfile ? "bg-muted cursor-not-allowed" : "hover:border-primary/50 focus:border-primary"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium">الاسم الأخير</Label>
                  <Input
                    id="last_name"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                    disabled={!isEditingProfile}
                    className={cn(
                      "transition-all duration-200",
                      !isEditingProfile ? "bg-muted cursor-not-allowed" : "hover:border-primary/50 focus:border-primary"
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    disabled={!isEditingProfile}
                    className={cn(
                      "transition-all duration-200 pr-10",
                      !isEditingProfile ? "bg-muted cursor-not-allowed" : "hover:border-primary/50 focus:border-primary"
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">رقم الهاتف</Label>
                <div className="relative">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                  <PhoneInput
                    id="phone"
                    value={profileForm.phone}
                    onChange={(value) => setProfileForm({ ...profileForm, phone: value || "" })}
                    international
                    defaultCountry="SY"
                    placeholder="رقم الهاتف"
                    disabled={!isEditingProfile}
                    className={cn(
                      "h-10 pl-4 pr-12 rounded-lg border border-border focus-within:border-primary text-foreground transition-all duration-200",
                      "[&_input]:h-10 [&_input]:rounded-lg [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-4 [&_input]:text-foreground [&_input]:placeholder:text-muted-foreground [&_.PhoneInputCountry]:px-4",
                      !isEditingProfile ? "[&_input]:bg-muted [&_input]:cursor-not-allowed" : "[&_input]:hover:bg-muted/50"
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reset Password */}
          <Card className="border border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Lock className="h-5 w-5 text-primary" />
                    تغيير كلمة المرور
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">قم بتحديث كلمة المرور الخاصة بك</CardDescription>
                </div>
                {!isEditingPassword ? (
                  <Button 
                    onClick={() => setIsEditingPassword(true)} 
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    تغيير
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleResetPassword}
                      disabled={resetPasswordMutation.isPending}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {resetPasswordMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditingPassword(false)
                        setPasswordForm({
                          current_password: "",
                          new_password: "",
                          new_password_confirmation: "",
                        })
                      }}
                      variant="outline"
                      disabled={resetPasswordMutation.isPending}
                      className="transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <X className="h-4 w-4 mr-2" />
                      إلغاء
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingPassword ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="current_password" className="text-sm font-medium">كلمة المرور الحالية</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="current_password"
                        type="password"
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                        className="pr-10 transition-all duration-200 hover:border-primary/50 focus:border-primary"
                        placeholder="أدخل كلمة المرور الحالية"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password" className="text-sm font-medium">كلمة المرور الجديدة</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new_password"
                        type="password"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        className="pr-10 transition-all duration-200 hover:border-primary/50 focus:border-primary"
                        placeholder="أدخل كلمة المرور الجديدة (8 أحرف على الأقل)"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password_confirmation" className="text-sm font-medium">تأكيد كلمة المرور الجديدة</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new_password_confirmation"
                        type="password"
                        value={passwordForm.new_password_confirmation}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                        className="pr-10 transition-all duration-200 hover:border-primary/50 focus:border-primary"
                        placeholder="أعد إدخال كلمة المرور الجديدة"
                      />
                    </div>
                  </div>

                  {passwordForm.new_password && passwordForm.new_password_confirmation && (
                    <div className={cn(
                      "text-sm p-3 rounded-lg transition-colors duration-200",
                      passwordForm.new_password === passwordForm.new_password_confirmation 
                        ? "bg-primary/10 text-primary" 
                        : "bg-destructive/10 text-destructive"
                    )}>
                      {passwordForm.new_password === passwordForm.new_password_confirmation ? (
                        <p className="font-medium">✓ كلمات المرور متطابقة</p>
                      ) : (
                        <p className="font-medium">✗ كلمات المرور غير متطابقة</p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center bg-muted/30 rounded-lg border border-border/50 transition-all duration-300 hover:bg-muted/50">
                  <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    انقر على زر "تغيير" لتحديث كلمة المرور
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

