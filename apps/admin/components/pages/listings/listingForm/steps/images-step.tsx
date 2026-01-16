"use client"

import { useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X, Upload, Star, Loader2, GripVertical, Link, Trash } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import type { ListingFormData } from "../types"
import Images from "@/components/ui/image"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

  // Validate URL and check supported domains (simple check)
  const validateExternalUrl = (url: string): { valid: boolean; error?: string } => {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()
      const domain = hostname.replace(/^www\./, '')
      const supportedDomains = [
        'facebook.com',
        'youtube.com',
        'youtu.be',
        'twitter.com',
        'x.com',
        'instagram.com',
        'tiktok.com'
      ]
      const isSupported = supportedDomains.some(supported => domain === supported || domain.endsWith('.' + supported))
      if (!isSupported) {
        return { valid: false, error: 'الدومين غير مدعوم' }
      }
      return { valid: true }
    } catch (error) {
      return { valid: false, error: 'رابط غير صالح' }
    }
  }

  // Handle adding external link via backend fetch-media endpoint
  const handleAddExternalLink = async () => {
    const trimmedUrl = externalLinkUrl.trim()
    if (!trimmedUrl) {
      toast.error('الرجاء إدخال رابط صالح')
      return
    }

    const validation = validateExternalUrl(trimmedUrl)
    if (!validation.valid) {
      toast.error(validation.error || 'رابط غير صالح')
      return
    }

    if (media.length >= 20) {
      toast.error('يمكن رفع 20 صورة كحد أقصى')
      return
    }

    setFetchingMetadata(true)
    try {
      const response = await api.post('/general/fetch-media', { url: trimmedUrl })

      if (response.isError) {
        throw new Error(response.message || 'فشل جلب البيانات')
      }

      const iframelyData = response.data?.data || response.data || response
      // const iframelyData = {
      //   "success": true,
      //   "data": {
      //     "url": "https://www.facebook.com/photo/?fbid=1404888200997431&set=a.283037039849225",
      //     "meta": {
      //       "site": "Facebook",
      //       "title": "الدكتور - اللهم تقبل عبدك #صالح_الجعفراوي اللهم اغفر له وارحمه وعافه...",
      //       "description": "اللهم تقبل عبدك #صالح_الجعفراوي اللهم اغفر له وارحمه وعافه واعف عنه وأكرم نزله ووسع مدخله واغسله بالماء والثلج والبرد  اللهم انتقم من قاتليه وممن...",
      //       "canonical": "https://www.facebook.com/photo.php?fbid=1404888200997431&set=a.283037039849225&id=100044287936733"
      //     },
      //     "links": {
      //       "app": [
      //         {
      //           "type": "text/html",
      //           "rel": [
      //             "app",
      //             "ssl",
      //             "html5"
      //           ],
      //           "html": "<div id=\"fb-root\"></div>\n<script async=\"1\" defer=\"1\" crossorigin=\"anonymous\" src=\"https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v24.0\"></script><div class=\"fb-post\" data-href=\"https://www.facebook.com/photo/?fbid=1404888200997431&set=a.283037039849225\" data-width=\"640\"></div>",
      //           "options": {
      //             "_hide_text": {
      //               "label": "Hide author's text caption",
      //               "value": false
      //             }
      //           },
      //           "media": {
      //             "max-width": 640
      //           }
      //         }
      //       ],
      //       "thumbnail": [
      //         {
      //           "href": "https://scontent-iad3-1.xx.fbcdn.net/v/t39.30808-6/561626111_1404888204330764_4604097061219869956_n.jpg?stp=cp0_dst-jpg_e15_fr_q65_tt6&_nc_cat=107&ccb=1-7&_nc_sid=e21142&_nc_ohc=15X1oila8I4Q7kNvwE4Text&_nc_oc=AdnASo1aZIaXLJksqJyoF9162QJihOdkANybGdWptIdRMFfuXyXfzPZ7jeIDhCKj-bU&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_rml=0&_nc_ht=scontent-iad3-1.xx&_nc_gid=xc0rsFJsfsBKGGPi7a8UKA&oh=00_AfojY5fqncxexKgJJLb3ECzWnHf-wm9rPi1Q6thld8aeoA&oe=6968716D",
      //           "type": "image/jpg",
      //           "rel": [
      //             "thumbnail",
      //             "ssl"
      //           ],
      //           "content_length": 41722,
      //           "media": {
      //             "width": 1080,
      //             "height": 599
      //           }
      //         }
      //       ],
      //       "icon": [
      //         {
      //           "href": "https://static.xx.fbcdn.net/rsrc.php/yB/r/2sFJRNmJ5OP.ico",
      //           "rel": [
      //             "icon",
      //             "ssl"
      //           ],
      //           "type": "image/icon"
      //         }
      //       ]
      //     },
      //     "messages": [
      //       "Facebook has retired automated page embeds on November 3, 2025."
      //     ],
      //     "rel": [
      //       "app",
      //       "inline",
      //       "html5",
      //       "ssl",
      //       "hosted"
      //     ],
      //     "html": "<div class=\"iframely-embed\" style=\"max-width: 640px;\"><div class=\"iframely-responsive\" style=\"padding-bottom: 55.463%;\"><a href=\"https://www.facebook.com/photo.php?fbid=1404888200997431&set=a.283037039849225&id=100044287936733\" data-iframely-url=\"https://cdn.iframe.ly/api/iframe?url=https%3A%2F%2Fwww.facebook.com%2Fphoto%2F%3Ffbid%3D1404888200997431%26set%3Da.283037039849225&key=3906e9589bd2ee8d96ec9673748849cf\"></a></div></div><script async src=\"https://cdn.iframe.ly/embed.js\" charset=\"utf-8\"></script>",
      //     "options": {
      //       "_hide_text": {
      //         "label": "Hide author's text caption",
      //         "value": false
      //       }
      //     },
      //     "message": "Facebook has retired automated page embeds on November 3, 2025."
      //   },
      //   "message": "تم جلب الميديا بنجاح"
      // }.data
      // Validate required iframely fields
      const hasMeta = !!iframelyData.meta
      const thumbCandidate = iframelyData.links?.thumbnail?.[0]
      // some iframely responses may include `thumbnail_url` at top-level; cast to any to avoid TS type errors
      const hasThumbnail = !!thumbCandidate?.href || !!(iframelyData as any).thumbnail_url

      if (!hasMeta || !hasThumbnail) {
        console.error('❌ Missing required iframely fields', { iframelyData })
        toast.error('فشلت عملية جلب بيانات الوسائط: بيانات iframely ناقصة (meta أو thumbnail)')
        setFetchingMetadata(false)
        return
      }

      const thumbnailUrl = thumbCandidate?.href || (iframelyData as any).thumbnail_url || trimmedUrl

      // Decide media type based on meta.medium 
      const determinedType = 'video'

      // Build thumbnail object
      const thumbnail = thumbCandidate ? {
        href: thumbCandidate.href,
        type: thumbCandidate.type,
        content_length: thumbCandidate.content_length,
        media: thumbCandidate.media,
      } : (thumbnailUrl ? { href: thumbnailUrl } : undefined)

      const mediaObject = {
        type: determinedType,
        url: thumbnailUrl,
        source: 'iframely',
        iframely: {
          url: trimmedUrl,
          meta: iframelyData.meta || {},
          thumbnail,
          links: iframelyData.links || {},
          html: iframelyData.html || '',
          rel: iframelyData.rel || [],
          options: iframelyData.options || {}
        }
      }
      console.log(mediaObject);

      const newMedia = [...media, mediaObject]
      setValue('images', newMedia as any)
      setPreviewUrls([...previewUrls, thumbnailUrl])

      setExternalLinkUrl('')
      setExternalLinkDialogOpen(false)
      toast.success('تم إضافة الرابط بنجاح')
    } catch (error: any) {
      console.error('❌ Error fetching external media:', error)
      toast.error('فشل جلب بيانات الوسائط')
    } finally {
      setFetchingMetadata(false)
    }
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
          <div className="flex gap-3 justify-center mt-4">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
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

            <Button
              type="button"
              onClick={() => setExternalLinkDialogOpen(true)}
              variant="outline"
              disabled={uploading || media.length >= 20}
              className="gap-2"
            >
              <Link className="h-4 w-4" />
              إضافة رابط خارجي
            </Button>
          </div>

          {/* External Link Dialog */}
          <Dialog open={externalLinkDialogOpen} onOpenChange={setExternalLinkDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة رابط خارجي</DialogTitle>
                <DialogDescription>
                  أدخل رابط فيديو أو صورة من مواقع مدعومة (يوتيوب، فيسبوك، تيك توك...)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="external-link-url">الرابط الخارجي</Label>
                  <Input
                    id="external-link-url"
                    type="url"
                    placeholder="https://"
                    value={externalLinkUrl}
                    onChange={(e) => setExternalLinkUrl(e.target.value)}
                    disabled={fetchingMetadata}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !fetchingMetadata) {
                        handleAddExternalLink()
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">الدومينات المدعومة: YouTube, Facebook, Instagram, TikTok, X</p>
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
                  إلغاء
                </Button>
                <Button
                  type="button"
                  onClick={handleAddExternalLink}
                  disabled={fetchingMetadata || !externalLinkUrl.trim()}
                >
                  {fetchingMetadata ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جلب البيانات...
                    </>
                  ) : (
                    'إضافة'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                {/* Delete Button (text) - appears on hover, for clearer action */}
                <Button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  variant="destructive"
                  size="sm"
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 rounded"
                >
                  <Trash className="h-3 w-3 mr-1 inline" />
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
            type="button"
            onClick={onNext}
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

