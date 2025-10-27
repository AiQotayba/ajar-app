"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface LocationPermissionModalProps {
  open: boolean
  onAllow: () => void
  onDeny: () => void
}

export function LocationPermissionModal({ open, onAllow, onDeny }: LocationPermissionModalProps) {
  const t = useTranslations('map.permission')
  
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-emerald-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center leading-relaxed">
            {t('description')}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span className="text-sm text-gray-700">بياناتك آمنة ومحمية</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span className="text-sm text-gray-700">نستخدم الموقع لعرض العقارات القريبة</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onDeny}
              className="flex-1"
            >
              {t('deny')}
            </Button>
            <Button
              onClick={onAllow}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {t('allow')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}