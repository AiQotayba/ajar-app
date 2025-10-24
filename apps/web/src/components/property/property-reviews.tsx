"use client"

import { AddReviewModal } from "@/components/property/add-review-modal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Star, Trash2 } from "lucide-react"
import { useState } from "react"
import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

interface Review {
  id: number
  rating: number
  comment?: string
  is_approved: boolean
  user: {
    id: number
    first_name: string
    last_name: string
    full_name: string
    phone: string
    email?: string
    role: string
    status: string
    phone_verified: boolean
    avatar?: string
    avatar_url?: string
    language?: string
    wallet_balance: number
    notifications_unread_count: number
    listings_count: number
    created_at: string
    updated_at: string
  }
  listing: {
    id: number
    title: {
      ar: string
      en: string
    }
  }
  created_at: string
}

interface PropertyReviewsProps {
  rating: number
  reviews: Review[]
  reviewsCount: number
  propertyId: string
  locale?: string
  currentUserId?: number
  onReviewAdded?: () => void
}

export function PropertyReviews({ rating, reviews, reviewsCount, propertyId, locale = 'ar', currentUserId, onReviewAdded }: PropertyReviewsProps) {
  const [showAddReview, setShowAddReview] = useState(false)
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null)

  // Function to delete a review
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذا التقييم؟' : 'Are you sure you want to delete this review?')) {
      return
    }

    setDeletingReviewId(reviewId)
    try {
      const response = await api.delete(`/user/reviews/${reviewId}`)

      if (!response.isError) {
        toast.success(response.message || (locale === 'ar' ? 'تم حذف التقييم بنجاح' : 'Review deleted successfully'))
        // Call parent callback to refresh property data
        if (onReviewAdded) {
          onReviewAdded()
        }
      } else {
        toast.error(response.message || (locale === 'ar' ? 'حدث خطأ في حذف التقييم' : 'Error deleting review'))
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      toast.error(locale === 'ar' ? 'حدث خطأ في حذف التقييم' : 'Error deleting review')
    } finally {
      setDeletingReviewId(null)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const renderStars = (ratingValue: number) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={cn(
          "h-4 w-4",
          star <= ratingValue ? "fill-yellow-400 text-yellow-400" : "fill-none text-gray-300",
        )}
      />
    ))
  }


  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {locale === 'ar' ? 'التقييمات' : 'Reviews'}
          </h2>
          {reviewsCount > 0 ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full font-bold bg-primary text-white">
              <span>{rating.toFixed(1)}</span>
              <Star className="h-4 w-4 fill-[#FFC32C]" />
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full  font-medium bg-primary text-white">
              <span>{locale === 'ar' ? '0.0' : '0.0'}</span>
              <Star className="h-5 w-5 fill-[#FFC32C] stroke-0" />
            </div>
          )}
        </div>

        {/* Rating Summary - Only show if there are reviews */}
        {reviewsCount > 0 ? (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{rating.toFixed(1)}</div>
              <div className="flex justify-center gap-0.5 mt-1">
                {renderStars(Math.round(rating))}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">
                {locale === 'ar'
                  ? `${reviewsCount} ${reviewsCount === 1 ? 'تقييم' : 'تقييم'}`
                  : `${reviewsCount} ${reviewsCount === 1 ? 'review' : 'reviews'}`
                }
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4 p-6 rounded-xl bg-muted/30">
            <div className="text-center">
              <div className="text-lg font-medium text-muted-foreground mb-2">
                {locale === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
              </div>
              <div className="text-sm text-muted-foreground">
                {locale === 'ar' ? 'كن أول من يقيم هذا العقار' : 'Be the first to review this property'}
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 && (
          <div className="space-y-3">
            {reviews.map((review: Review) => (
              <div key={review.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {review.user.full_name[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground block">
                        {review.user.full_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                )}

                {/* Delete button for current user's reviews */}
                {currentUserId && review.user.id === currentUserId && (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteReview(review.id)}
                      disabled={deletingReviewId === review.id}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                      title={locale === 'ar' ? 'حذف التقييم' : 'Delete review'}
                    >
                      {deletingReviewId === review.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Review Button - Only show if user hasn't reviewed yet */}
        {currentUserId && !reviews.some(review => review.user.id === currentUserId) && (
          <Button
            onClick={() => setShowAddReview(true)}
            className="w-full h-12 text-base font-bold rounded-xl bg-primary hover:bg-primary/90"
          >
            {locale === 'ar' ? 'إضافة تقييم' : 'Add Review'}
          </Button>
        )}
      </div>

      <AddReviewModal
        open={showAddReview}
        onClose={() => setShowAddReview(false)}
        propertyId={propertyId}
        locale={locale}
        onReviewAdded={() => {
          // Call parent callback to refresh property data
          if (onReviewAdded) {
            onReviewAdded()
          }
          setShowAddReview(false)
        }}
      />
    </>
  )
}
