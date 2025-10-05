"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock } from "lucide-react"
import { useState } from "react"
import { Header } from "../layout/header"

export function ChangePasswordForm() {
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header title="تغيير كلمة المرور" showBack />

      <div className="p-6 space-y-6">
        {/* Old Password */}
        <div className="space-y-2">
          <Label htmlFor="old-password" className="text-right block">
            كلمة المرور القديمة
          </Label>
          <div className="relative">
            <Input
              id="old-password"
              type={showOldPassword ? "text" : "password"}
              placeholder="**************"
              className="h-14 pr-12 pl-12 rounded-2xl border-primary/30 bg-primary/5 text-right"
            />
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2"
            >
              {showOldPassword
                ? <EyeOff className="h-5 w-5 text-muted-foreground" />
                : <Eye className="h-5 w-5 text-muted-foreground" />
              }
            </button>
          </div>
        </div>

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
              className="h-14 pr-12 pl-12 rounded-2xl text-right"
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
              className="h-14 pr-12 pl-12 rounded-2xl text-right"
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
        </div>

        {/* Save Button */}
        <Button className="w-full h-14 text-lg rounded-2xl mt-8">حفظ</Button>
      </div>
    </div>
  )
}
