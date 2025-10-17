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
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="حسابي"
        description="إدارة معلومات الملف الشخصي وكلمة المرور"
        icon={User}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              المعلومات الشخصية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-3xl font-bold">
                  {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-xl font-bold">{profile?.full_name}</h3>
                <p className="text-sm text-muted-foreground">{profile?.email || profile?.phone}</p>
              </div>
              <Badge className="bg-gradient-to-r from-primary to-primary/80">
                <Shield className="h-3 w-3 mr-1" />
                {profile?.role === "admin" ? "مدير نظام" : profile?.role === "manager" ? "مدير" : "مستخدم"}
              </Badge>
            </div>

            <Separator />

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">الإعلانات</span>
                <Badge variant="secondary">{profile?.listings_count || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">الإشعارات غير المقروءة</span>
                <Badge variant="secondary">{profile?.notifications_unread_count || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">اللغة</span>
                <Badge variant="outline">{profile?.language === "ar" ? "العربية" : "English"}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile & Password */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    تعديل الملف الشخصي
                  </CardTitle>
                  <CardDescription>قم بتحديث معلوماتك الشخصية</CardDescription>
                </div>
                {!isEditingProfile ? (
                  <Button onClick={() => setIsEditingProfile(true)} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    تعديل
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={updateProfileMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProfileMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                    </Button>
                    <Button
                      onClick={() => setIsEditingProfile(false)}
                      variant="outline"
                      disabled={updateProfileMutation.isPending}
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
                  <Label htmlFor="first_name">الاسم الأول</Label>
                  <Input
                    id="first_name"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                    disabled={!isEditingProfile}
                    className={!isEditingProfile ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">الاسم الأخير</Label>
                  <Input
                    id="last_name"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                    disabled={!isEditingProfile}
                    className={!isEditingProfile ? "bg-muted" : ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    disabled={!isEditingProfile}
                    className={!isEditingProfile ? "bg-muted pr-10" : "pr-10"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
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
                    className={`h-10 pl-4 pr-12 rounded-lg border border-border focus-within:border-primary text-foreground [&_input]:h-10 [&_input]:rounded-lg [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-4 [&_input]:text-foreground [&_input]:placeholder:text-muted-foreground [&_.PhoneInputCountry]:px-4 ${!isEditingProfile ? '[&_input]:bg-muted' : ''}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reset Password */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    تغيير كلمة المرور
                  </CardTitle>
                  <CardDescription>قم بتحديث كلمة المرور الخاصة بك</CardDescription>
                </div>
                {!isEditingPassword ? (
                  <Button onClick={() => setIsEditingPassword(true)} variant="outline">
                    <Lock className="h-4 w-4 mr-2" />
                    تغيير
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleResetPassword}
                      disabled={resetPasswordMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
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
                    <Label htmlFor="current_password">كلمة المرور الحالية</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="current_password"
                        type="password"
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                        className="pr-10"
                        placeholder="أدخل كلمة المرور الحالية"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password">كلمة المرور الجديدة</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new_password"
                        type="password"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        className="pr-10"
                        placeholder="أدخل كلمة المرور الجديدة (8 أحرف على الأقل)"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password_confirmation">تأكيد كلمة المرور الجديدة</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new_password_confirmation"
                        type="password"
                        value={passwordForm.new_password_confirmation}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                        className="pr-10"
                        placeholder="أعد إدخال كلمة المرور الجديدة"
                      />
                    </div>
                  </div>

                  {passwordForm.new_password && passwordForm.new_password_confirmation && (
                    <div className="text-sm">
                      {passwordForm.new_password === passwordForm.new_password_confirmation ? (
                        <p className="text-green-600">✓ كلمات المرور متطابقة</p>
                      ) : (
                        <p className="text-destructive">✗ كلمات المرور غير متطابقة</p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center bg-muted/30 rounded-lg">
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

