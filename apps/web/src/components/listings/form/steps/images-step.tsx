"use client"

import { useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X, Upload, Star, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { uploadImage } from "@/lib/api/listings"
import type { ListingFormData } from "../types"

interface ImagesStepProps {
  onNext: () => void
  onPrevious: () => void
  showNavigation?: boolean
  previewUrls?: string[]
  setPreviewUrls?: (urls: string[]) => void
}

export function ImagesStep({
  onNext,
  onPrevious,
  showNavigation = true,
  previewUrls: externalPreviewUrls,
  setPreviewUrls: setExternalPreviewUrls
}: ImagesStepProps) {
  const { watch, setValue, formState: { errors } } = useFormContext<ListingFormData>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [internalPreviewUrls, setInternalPreviewUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadErrors, setUploadErrors] = useState<{ [key: number]: string }>({})
  const [uploadingFiles, setUploadingFiles] = useState<Set<number>>(new Set())

  // Use external preview URLs if provided, otherwise use internal state
  const previewUrls = externalPreviewUrls || internalPreviewUrls
  const setPreviewUrls = setExternalPreviewUrls || setInternalPreviewUrls

  const media: any = watch("media") || []
  const coverImageIndex = watch("cover_image_index") || 0
  console.log(media);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check if adding these files would exceed the limit
    if (media.length + files.length > 20) {
      toast.error("يمكن رفع 20 صورة كحد أقصى")
      return
    }

    setUploading(true)
    setUploadErrors({})

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
          const result = await uploadImage(file)

          // Remove from uploading set
          setUploadingFiles(prev => {
            const newSet = new Set(prev)
            newSet.delete(fileIndex)
            return newSet
          })

          return { url: result.url, file, index: fileIndex }
        } catch (error: any) {
          console.error(`❌ Error uploading file ${file.name}:`, error)

          // Track error for this specific file
          setUploadErrors(prev => ({
            ...prev,
            [fileIndex]: error.message || 'فشل في رفع الصورة'
          }))

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

      // Update media with successfully uploaded URLs
      if (successfulUploads.length > 0) {
        const newMedia = [...media, ...successfulUploads.map(result => result.url)]
        setValue("media", newMedia as any)
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

      // Remove all preview URLs on general error
      setPreviewUrls(previewUrls)
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

    setValue("media", newImages)
    setValue("cover_image_index",
      coverImageIndex === index
        ? 0
        : coverImageIndex > index
          ? coverImageIndex - 1
          : coverImageIndex
    )
    setPreviewUrls(newUrls)

    // Revoke the object URL to free memory
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index])
    }
  }

  const handleSetCoverImage = (index: number) => {
    setValue("cover_image_index", index)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload */}
      <div className="space-y-4">
        <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${uploading
          ? 'border-primary bg-primary/5'
          : 'border-gray-300 hover:border-gray-400'
          }`}>
          {uploading ? (
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
          ) : (
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
          )}
          <div className="mt-4">
            <Label htmlFor="file-upload" className={`cursor-pointer flex-col ${uploading ? 'pointer-events-none' : ''}`}>
              <span className="mt-2 block text-sm font-medium text-gray-900">
                {uploading ? 'جاري رفع الصور...' : 'اضغط لرفع الصور أو اسحبها هنا'}
              </span>
              <span className="mt-1 block text-sm text-gray-500">
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
        <div className="space-y-4">
          <Label className="text-right block text-lg font-semibold">
            الصور المرفوعة ({media.length}/20)
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {media.map((mediaItem: any, index: any) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={media[index]?.full_url || (typeof mediaItem === 'string' ? mediaItem : '')}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Cover Image Badge */}
                {index === coverImageIndex && (
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

                {/* Set Cover Button */}
                {index !== coverImageIndex && (
                  <Button
                    type="button"
                    onClick={() => handleSetCoverImage(index)}
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    غلاف
                  </Button>
                )}
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
    </form>
  )
}
