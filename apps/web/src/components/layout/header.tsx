"use client"

import { Button } from '@/components/ui/button'
import { ArrowLeft, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  title: string
  showBack?: boolean
  showClose?: boolean
  onBack?: () => void
  onClose?: () => void
}

export function Header({ 
  title, 
  showBack = false, 
  showClose = false, 
  onBack, 
  onClose 
}: HeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      router.push('/')
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        <h1 className="text-lg font-semibold text-center flex-1">
          {title}
        </h1>

        <div className="flex items-center gap-2">
          {showClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}