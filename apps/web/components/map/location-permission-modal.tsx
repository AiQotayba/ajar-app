"use client"

import { X, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface LocationPermissionModalProps {
  open: boolean
  onAllow: () => void
  onDeny: () => void
}

export function LocationPermissionModal({ open, onAllow, onDeny }: LocationPermissionModalProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onDeny()}>
      <DialogContent className="max-w-md p-0 gap-0 bg-white rounded-3xl">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onDeny}
          className="absolute top-4 left-4 h-10 w-10 rounded-full bg-muted hover:bg-muted/80 z-10"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Content */}
        <div className="flex flex-col items-center px-8 py-12">
          {/* Location Icon Illustration */}
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Decorative elements */}
              <div className="absolute top-2 right-8 w-2 h-2 bg-primary rounded-full animate-pulse" />
              <div className="absolute top-4 left-12 w-1.5 h-4 bg-primary/60 rounded-full" />

              {/* Main Location Pin */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-muted flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-primary fill-primary" />
                </div>
                {/* Shadow/Platform */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-primary/20 rounded-full blur-sm" />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <p className="text-base text-foreground text-center text-balance leading-relaxed mb-8">
            للحصول على نتائج دقيقة بالقرب منك، يحتاج التطبيق للوصول إلى موقعك الحالي.
          </p>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            <Button onClick={onAllow} className="w-full h-14 rounded-2xl text-base font-semibold">
              السماح بالوصول إلى الموقع
            </Button>
            <Button
              variant="ghost"
              onClick={onDeny}
              className="w-full text-base font-medium text-muted-foreground hover:text-foreground"
            >
              عدم السماح بالوصول
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
