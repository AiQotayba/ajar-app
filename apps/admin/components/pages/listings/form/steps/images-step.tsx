"use client"

import { useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X, Upload, Star, Loader2, GripVertical } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import type { ListingFormData } from "../types"
import Images from "@/components/ui/image"

interface ImagesStepProps {
  onNext: () => void
  onPrevious: () => void
  showNavigation?: boolean
  previewUrls?: string[]
  setPreviewUrls?: (urls: string[]) => void
  mode?: "create" | "update"
}

export function ImagesStep({
  onNext,
  onPrevious,
  showNavigation = true,
  previewUrls: externalPreviewUrls,
  setPreviewUrls: setExternalPreviewUrls,
  mode = "create"
}: ImagesStepProps) {
  const { watch, setValue, formState: { errors } } = useFormContext<ListingFormData>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [internalPreviewUrls, setInternalPreviewUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Set<number>>(new Set())
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Use external preview URLs if provided, otherwise use internal state
  const previewUrls = externalPreviewUrls || internalPreviewUrls
  const setPreviewUrls = setExternalPreviewUrls || setInternalPreviewUrls

  const media: any = watch("images") || []
  const isCreateMode = mode === "create"

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check if adding these files would exceed the limit
    if (media.length + files.length > 20) {
      toast.error("يمكن رفع 20 صورة كحد أقصى")
      return
    }

    setUploading(true)

    try {
      // Create preview URLs immediately for better UX
      const newPreviewUrls = files.map((file) => URL.createObjectURL(file))
      setPreviewUrls([...previewUrls, ...newPreviewUrls])

      // Track which files are being uploaded
      const fileIndices = Array.from({ length: files.length }, (_, i) => media.length + i)
      setUploadingFiles(new Set(fileIndices))

      // Upload files to server
      const uploadPromises = files.map(async (file, index) => {
        const fileIndex = media.length + index
        try {
          const response = await api.uploadImage(file, "listings", {
            showSuccessToast: false,
            showErrorToast: false,
          })

          if (response.isError || !response.data) {
            throw new Error(response.message || "فشل رفع الصورة")
          }

          // Get image URL from response
          const imageUrl = response.data.image_name || response.data.url || response.data.image_url
          
          if (!imageUrl) {
            throw new Error("لم يتم إرجاع رابط الصورة")
          }

          // Remove from uploading set
          setUploadingFiles(prev => {
            const newSet = new Set(prev)
            newSet.delete(fileIndex)
            return newSet
          })

          return { url: imageUrl, file, index: fileIndex }
        } catch (error: any) {
          console.error(`❌ Error uploading file ${file.name}:`, error)

          // Remove from uploading set
          setUploadingFiles(prev => {
            const newSet = new Set(prev)
            newSet.delete(fileIndex)
            return newSet
          })

          throw error
        }
      })

      const uploadResults = await Promise.allSettled(uploadPromises)

      // Separate successful and failed uploads
      const successfulUploads = uploadResults
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value)

      const failedUploads = uploadResults
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .length

      // Update images with successfully uploaded URLs
      if (successfulUploads.length > 0) {
        const newMedia = [...media, ...successfulUploads.map(result => result.url)]
        setValue("images", newMedia as any)
      }

      // Show appropriate messages
      if (successfulUploads.length > 0) {
        toast.success(`تم رفع ${successfulUploads.length} صورة بنجاح`)
      }

      if (failedUploads > 0) {
        toast.error(`فشل في رفع ${failedUploads} صورة. يرجى المحاولة مرة أخرى.`)

        // Remove preview URLs for failed uploads
        const failedIndices = uploadResults
          .map((result, index) => result.status === 'rejected' ? index : -1)
          .filter(index => index !== -1)

        const newPreviewUrls = previewUrls.filter((_, index) =>
          !failedIndices.includes(index - media.length)
        )
        setPreviewUrls(newPreviewUrls)
      }

    } catch (error: any) {
      console.error("❌ Error uploading images:", error)
      toast.error("حدث خطأ أثناء رفع الصور")
    } finally {
      setUploading(false)
      setUploadingFiles(new Set())

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = media.filter((_: any, i: any) => i !== index)
    const newUrls = previewUrls.filter((_, i) => i !== index)

    setValue("images", newImages)
    setPreviewUrls(newUrls)

    // Revoke the object URL to free memory
    if (previewUrls[index] && previewUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(previewUrls[index])
    }
  }

  // Drag and drop handlers (only in create mode)
  const handleDragStart = (index: number) => {
    if (!isCreateMode) return
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isCreateMode) return
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    if (!isCreateMode) return
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!isCreateMode) return
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    // Reorder images array
    const newMedia = [...media]
    const [reorderedItem] = newMedia.splice(draggedIndex, 1)
    newMedia.splice(dropIndex, 0, reorderedItem)

    // Reorder preview URLs
    const newPreviewUrls = [...previewUrls]
    const [reorderedPreview] = newPreviewUrls.splice(draggedIndex, 1)
    newPreviewUrls.splice(dropIndex, 0, reorderedPreview)

    // Update form values
    setValue("images", newMedia as any)
    setPreviewUrls(newPreviewUrls)

    setDraggedIndex(null)
    setDragOverIndex(null)
    toast.success("تم ترتيب الصور بنجاح")
  }

  const handleDragEnd = () => {
    if (!isCreateMode) return
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Helper to get image URL for display
  const getImageUrl = (mediaItem: any, index: number) => {
    if (typeof mediaItem === 'string') {
      // If it's a relative path, build full URL
      if (mediaItem.startsWith('http://') || mediaItem.startsWith('https://')) {
        return mediaItem
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'
      return `${baseUrl}/storage/${mediaItem}`
    }
    if (mediaItem && typeof mediaItem === 'object' && mediaItem.full_url) {
      return mediaItem.full_url
    }
    if (mediaItem && typeof mediaItem === 'object' && mediaItem.url) {
      return mediaItem.url
    }
    // Fallback to preview URL
    return previewUrls[index] || ''
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* File Upload */}
      <div className="space-y-3 sm:space-y-4">
        <div className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${uploading
          ? 'border-primary bg-primary/5'
          : 'border-gray-300 hover:border-gray-400'
          }`}>
          {uploading ? (
            <Loader2 className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-primary animate-spin" />
          ) : (
            <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
          )}
          <div className="mt-3 sm:mt-4">
            <Label htmlFor="file-upload" className={`cursor-pointer flex-col ${uploading ? 'pointer-events-none' : ''}`}>
              <span className="mt-2 block text-xs sm:text-sm font-medium text-gray-900">
                {uploading ? 'جاري رفع الصور...' : 'اضغط لرفع الصور أو اسحبها هنا'}
              </span>
              <span className="mt-1 block text-xs sm:text-sm text-gray-500">
                PNG, JPG, GIF حتى 10MB (حد أقصى 20 صورة)
              </span>
            </Label>
            <input
              ref={fileInputRef}
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </div>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="mt-4"
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                جاري الرفع...
              </>
            ) : (
              'اختيار الصور'
            )}
          </Button>
        </div>

        {media.length === 0 && (
          <p className="text-xs text-destructive text-right">
            يجب رفع صورة واحدة على الأقل
          </p>
        )}
      </div>

      {/* Image Previews */}
      {media.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <Label className="text-right block text-base sm:text-lg font-semibold">
            الصور المرفوعة ({media.length}/20)
            {isCreateMode && media.length > 1 && (
              <span className="block text-xs sm:text-sm font-normal text-muted-foreground mt-1">
                اسحب الصور لترتيبها
              </span>
            )}
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            {media.map((mediaItem: any, index: any) => (
              <div
                key={index}
                draggable={isCreateMode && media.length > 1}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "relative group transition-all duration-200",
                  isCreateMode && media.length > 1 && "cursor-move",
                  draggedIndex === index && "opacity-50 scale-95",
                  dragOverIndex === index && draggedIndex !== index && "ring-2 ring-primary ring-offset-2 scale-105"
                )}
              >
                {/* Drag Handle - Only in create mode */}
                {isCreateMode && media.length > 1 && (
                  <div className="absolute top-2 left-2 z-20 bg-background/80 backdrop-blur-sm rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}

                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Images
                    src={getImageUrl(mediaItem, index)}
                    alt={`Preview ${index + 1}`}
                    className="w-full select-none h-full object-cover pointer-events-none rounded-md"
                    draggable={false}
                    fill
                    onError={(e) => {
                      // Fallback to preview URL if image fails to load
                      if (previewUrls[index]) {
                        (e.target as HTMLImageElement).src = previewUrls[index]
                      }
                    }}
                  />
                </div>

                {/* Cover Image Badge - الصورة الأولى فقط */}
                {index === 0 && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Star className="h-3 w-3 fill-current" />
                  </div>
                )}

                {/* Remove Button */}
                <Button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 left-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons - Only show if navigation is enabled */}
      {showNavigation && (
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={onPrevious}
            variant="outline"
            className="flex-1 h-12 text-base font-bold rounded-xl bg-transparent"
          >
            السابق
          </Button>
          <Button
            type="submit"
            disabled={media.length === 0 || uploading}
            className="flex-1 h-12 text-base font-bold rounded-xl"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                جاري الرفع...
              </>
            ) : (
              'التالي'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

