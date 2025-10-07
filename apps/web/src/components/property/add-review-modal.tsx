"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Star, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface AddReviewModalProps {
  open: boolean
  onClose: () => void
  propertyId: string
  locale?: string
}

export function AddReviewModal({ open, onClose, propertyId, locale = 'ar' }: AddReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async () => {
    if (rating === 0 || !comment.trim()) {
      toast.error(locale === 'ar' ? 'يرجى اختيار تقييم وكتابة تعليق' : 'Please select a rating and write a comment')
      return
    }

    setIsLoading(true)
    try {
      const { isError, data } = await api.post('/user/reviews', {
        listing_id: parseInt(propertyId),
        rating,
        comment: comment.trim()
      })

      if (!isError && data.success) {
        toast.success(data.message || (locale === 'ar' ? 'تم إرسال التقييم بنجاح' : 'Review submitted successfully'))
        // Reset form
        setRating(0)
        setComment("")
        setHoveredRating(0)
        onClose()
        // You might want to refresh the reviews here
        window.location.reload() // Simple refresh for now
      } else {
        toast.error(data.message || (locale === 'ar' ? 'حدث خطأ في إرسال التقييم' : 'Error submitting review'))
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error(locale === 'ar' ? 'حدث خطأ في إرسال التقييم' : 'Error submitting review')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    // Reset form when closing
    setRating(0)
    setComment("")
    setHoveredRating(0)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-background rounded-3xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 rtl:right-4 ltr:left-4 w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-center pt-8">
          {locale === 'ar' ? 'إضافة تقييم' : 'Add Review'}
        </h2>

        {/* Star Rating */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110 cursor-pointer"
            >
              <Star
                className={cn(
                  "h-12 w-12 transition-colors",
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-none text-gray-300 stroke-2",
                )}
              />
            </button>
          ))}
        </div>

        {/* Comment Textarea */}
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={locale === 'ar' 
            ? "الشقة واسعة ومميزة، الأثاث بحالة جيدة جداً، والمكان هادئ ومناسب للعائلات."
            : "The apartment is spacious and excellent, the furniture is in very good condition, and the place is quiet and suitable for families."
          }
          className="min-h-32 text-base rounded-2xl border-border resize-none"
        />

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || !comment.trim() || isLoading}
          className="w-full h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading 
            ? (locale === 'ar' ? 'جاري الإرسال...' : 'Sending...')
            : (locale === 'ar' ? 'إرسال' : 'Submit')
          }
        </Button>
      </div>
    </div>
  )
}
