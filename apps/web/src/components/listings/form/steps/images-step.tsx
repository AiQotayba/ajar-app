"use client"

import { useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { X, Upload, Star, Loader2, GripVertical, Link } from "lucide-react"
import { toast } from "sonner"
import { uploadImage } from "@/lib/api/listings"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import type { ListingFormData } from "../types"
import Image from "next/image"

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
  const t = useTranslations('listingForm.images')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [internalPreviewUrls, setInternalPreviewUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Set<number>>(new Set())
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [externalLinkDialogOpen, setExternalLinkDialogOpen] = useState(false)
  const [externalLinkUrl, setExternalLinkUrl] = useState("")
  const [fetchingMetadata, setFetchingMetadata] = useState(false)

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
      toast.error(t('maxImagesError'))
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
          const result = await uploadImage(file)

          if (!result || !result.url) {
            throw new Error(t('imageUrlNotReturned'))
          }

          // Remove from uploading set
          setUploadingFiles(prev => {
            const newSet = new Set(prev)
            newSet.delete(fileIndex)
            return newSet
          })

          return { url: result.url, file, index: fileIndex }
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
        toast.success(t('uploadSuccess', { count: successfulUploads.length }))
      }

      if (failedUploads > 0) {
        toast.error(t('uploadError', { count: failedUploads }))

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
      toast.error(t('uploadGeneralError'))
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
    toast.success(t('reorderSuccess'))
  }

  const handleDragEnd = () => {
    if (!isCreateMode) return
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Validate URL and check if domain is supported
  const validateExternalUrl = (url: string): { valid: boolean; error?: string } => {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()

      // Remove www. prefix for comparison
      const domain = hostname.replace(/^www\./, '')

      // Supported domains
      const supportedDomains = [
        'facebook.com',
        'youtube.com',
        'youtu.be',
        'twitter.com',
        'x.com',
        'instagram.com',
        'tiktok.com'
      ]

      const isSupported = supportedDomains.some(supported =>
        domain === supported || domain.endsWith('.' + supported)
      )

      if (!isSupported) {
        return {
          valid: false,
          error: t('unsupportedDomain')
        }
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: t('invalidUrl')
      }
    }
  }

  // Handle adding external link with iframely metadata
  // ... (الكود السابق يبقى كما هو)

  // Handle adding external link with iframely metadata
  const handleAddExternalLink = async () => {
    const trimmedUrl = externalLinkUrl.trim()

    if (!trimmedUrl) {
      toast.error(t('invalidUrl'))
      return
    }

    // Validate URL
    const validation = validateExternalUrl(trimmedUrl)
    if (!validation.valid) {
      toast.error(validation.error || t('invalidUrl'))
      return
    }

    // Check if adding would exceed limit
    if (media.length >= 20) {
      toast.error(t('maxImagesError'))
      return
    }

    setFetchingMetadata(true)

    try {
      // Fetch metadata using backend endpoint which proxies Iframely
      const response = await api.post('/general/fetch-media', { url: trimmedUrl })

      if (response.isError) {
        throw new Error(response.message || 'Failed to fetch metadata')
      }

      // Extract iframely data - adjust based on your API response structure
      const iframelyData = response.data?.data || response.data || response

      // Validate required iframely fields
      if (!iframelyData?.meta || !iframelyData?.links?.thumbnail?.[0]) {
        console.error('❌ Missing required iframely fields', { iframelyData })
        toast.error(t('fetchError'))
        setFetchingMetadata(false)
        return
      }

      const thumbCandidate = iframelyData.links.thumbnail[0]
      const thumbnailUrl = thumbCandidate.href || iframelyData.thumbnail_url || trimmedUrl

      // Build media object matching Flutter structure
      const mediaObject = {
        type: iframelyData.meta.medium === 'video' ? 'video' : 'image',
        url: thumbnailUrl,
        source: "iframely",
        iframely: {
          url: trimmedUrl,
          meta: iframelyData.meta || {},
          thumbnail: {
            href: thumbCandidate.href,
            type: thumbCandidate.type,
            content_length: thumbCandidate.content_length,
            media: thumbCandidate.media,
          },
          links: iframelyData.links || {},
          html: iframelyData.html || '',
          rel: iframelyData.rel || [],
          options: iframelyData.options || {}
        }
      }

      // Add to media array
      const newMedia = [...media, mediaObject]
      setValue("images", newMedia as any)

      // Add preview URL
      setPreviewUrls([...previewUrls, thumbnailUrl])

      // Reset dialog
      setExternalLinkUrl("")
      setExternalLinkDialogOpen(false)

      toast.success(t('linkAddedSuccess'))
    } catch (error: any) {
      console.error("❌ Error fetching iframely metadata:", error)
      toast.error(t('fetchError'))
    } finally {
      setFetchingMetadata(false)
    }
  }

  // ... (باقي الكود يبقى كما هو)

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
    if (mediaItem && typeof mediaItem === 'object') {
      // Handle iframely objects
      if (mediaItem.iframely && mediaItem.iframely.links?.thumbnail?.[0]?.href) {
        return mediaItem.iframely.links.thumbnail[0].href
      }
      if (mediaItem.iframely && mediaItem.iframely.thumbnail_url) {
        return mediaItem.iframely.thumbnail_url
      }
      // Handle regular objects
      if (mediaItem.full_url) {
        return mediaItem.full_url
      }
      if (mediaItem.url) {
        return mediaItem.url
      }
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
                {uploading ? t('uploading') : t('uploadTitle')}
              </span>
              <span className="mt-1 block text-xs sm:text-sm text-gray-500">
                {t('fileTypes')}
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
          <div className="flex flex-col sm:flex-row gap-3 mt-4 justify-center">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('uploadingProgress')}
                </>
              ) : (
                t('selectImages')
              )}
            </Button>
            <Button
              type="button"
              onClick={() => setExternalLinkDialogOpen(true)}
              variant="outline"
              disabled={uploading || media.length >= 20}
              className="gap-2"
            >
              <Link className="h-4 w-4" />
              {t('addExternalLink')}
            </Button>
          </div>
        </div>

        {/* External Link Dialog */}
        <Dialog open={externalLinkDialogOpen} onOpenChange={setExternalLinkDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('externalLinkDialogTitle')}</DialogTitle>
              <DialogDescription>
                {t('externalLinkInputLabel')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="external-link-url">{t('externalLinkInputLabel')}</Label>
                <Input
                  id="external-link-url"
                  type="url"
                  placeholder={t('externalLinkInputPlaceholder')}
                  value={externalLinkUrl}
                  onChange={(e) => setExternalLinkUrl(e.target.value)}
                  disabled={fetchingMetadata}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !fetchingMetadata) {
                      handleAddExternalLink()
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {t('unsupportedDomain')}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setExternalLinkDialogOpen(false)
                  setExternalLinkUrl("")
                }}
                disabled={fetchingMetadata}
              >
                {t('cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleAddExternalLink}
                disabled={fetchingMetadata || !externalLinkUrl.trim()}
              >
                {fetchingMetadata ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('fetchingMetadata')}
                  </>
                ) : (
                  t('addLink')
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {media.length < 5 && (
          <p className="text-xs text-destructive text-start">
            {t('atLeastOneImage')}
          </p>
        )}
      </div>

      {/* Image Previews */}
      {media.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <Label className="text-start block text-base sm:text-lg font-semibold">
            {t('uploadedImages', { count: media.length })}
            {isCreateMode && media.length > 1 && (
              <span className="block text-xs sm:text-sm font-normal text-muted-foreground mt-1">
                {t('dragToReorder')}
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

                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                  <Image
                    src={getImageUrl(mediaItem, index)}
                    alt={`Preview ${index + 1}`}
                    className="w-full select-none h-full object-cover pointer-events-none rounded-md"
                    draggable={false}
                    fill
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
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
            {t('previous')}
          </Button>
          <Button
            type="button"
            onClick={onNext}
            disabled={media.length < 5 || uploading}
            className="flex-1 h-12 text-base font-bold rounded-xl"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('uploadingProgress')}
              </>
            ) : (
              t('next')
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
