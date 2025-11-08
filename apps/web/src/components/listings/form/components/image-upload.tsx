"use client"

import * as React from "react"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  folder: "sliders" | "listings" | "users" | "properties" | "features"
  className?: string
  disabled?: boolean
  aspectRatio?: "square" | "video" | "portrait" | "landscape"
  maxSize?: number // in MB
}

export function ImageUpload({
  value,
  onChange,
  folder,
  className,
  disabled = false,
  aspectRatio = "landscape",
  maxSize = 5,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [preview, setPreview] = React.useState<string | null>(value || null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[16/9]",
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صالح")
      return
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      toast.error(`حجم الملف يجب أن يكون أقل من ${maxSize} ميجابايت`)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setIsUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('folder', folder)

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Get image_name (to save in DB) and build full URL for display
      const imageName = response.data?.image_name || response.data?.path
      
      if (!response.isError && imageName) {
        // Save the relative path (image_name) to form/database
        onChange(imageName)
        
        // Build full URL for preview display
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'
        const fullImageUrl = `${baseUrl}/storage/${imageName}`
        setPreview(fullImageUrl)
        
        toast.success("تم رفع الصورة بنجاح")
      } else {
        setPreview(null)
        toast.error(response.message || "فشل رفع الصورة")
      }
    } catch (error: any) {
      setPreview(null)
      toast.error(error?.message || "فشل رفع الصورة")
    } finally {
      setIsUploading(false)
      setProgress(0)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }

  React.useEffect(() => {
    if (value) {
      // If value is a full URL, use it directly
      if (value.startsWith('http://') || value.startsWith('https://')) {
        setPreview(value)
      } else {
        // If value is image_name (relative path), build full URL
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'
        setPreview(`${baseUrl}/storage/${value}`)
      }
    } else {
      setPreview(null)
    }
  }, [value])

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative w-full rounded-lg border-2 border-dashed transition-colors overflow-hidden",
          aspectRatioClasses[aspectRatio],
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-primary",
          !preview && "bg-muted",
        )}
        onClick={handleClick}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            {!disabled && !isUploading && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">جاري الرفع... {progress}%</p>
              </>
            ) : (
              <>
                <div className="rounded-full bg-primary/10 p-3">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">انقر لرفع صورة</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (حد أقصى {maxSize}MB)</p>
                </div>
              </>
            )}
          </div>
        )}

        {isUploading && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-background/80 backdrop-blur-sm">
            <Progress value={progress} className="h-1" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  )
}
