"use client"

import { AddReviewModal } from "@/components/property/add-review-modal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Star, Trash2 } from "lucide-react"
import { useState } from "react"
import { api } from "@/lib/api"
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

interface ListingsReviewsProps {
  rating: number
  reviews: Review[]
  reviewsCount: number
  propertyId: string
  locale?: string
  currentUserId?: number
  onReviewAdded?: () => void
}

export function ListingsReviews({ rating, reviews, reviewsCount, propertyId, locale = 'ar', currentUserId, onReviewAdded }: ListingsReviewsProps) {
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
        toast.success(response.message || (locale === 'ar' ? 'تم حذف التقييم' : 'Review deleted'))
        // Call parent callback to refresh property data
        if (onReviewAdded) {
          onReviewAdded()
        }
      } else {
        toast.error(response.message || (locale === 'ar' ? 'تعذر حذف التقييم' : 'Unable to delete review'))
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      toast.error(locale === 'ar' ? 'تعذر حذف التقييم' : 'Unable to delete review')
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
          star <= ratingValue ? "fill-yellow-400 text-yellow-400" : "fill-none text-gray-300 stroke-0",
        )}
      />
    ))
  }


  return (
    <>
      <div className="space-y-6">
        {/* Hero Section - Reviews Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-6 border border-primary/20">
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {locale === 'ar' ? 'تقييمات العملاء' : 'Customer Reviews'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar'
                    ? 'اكتشف آراء العملاء الآخرين حول هذا العقار'
                    : 'Discover what other customers think about this property'
                  }
                </p>
              </div>

              {/* Rating Badge */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {reviewsCount > 0 ? rating.toFixed(1) : '0.0'}
                      </div>
                      <div className="flex justify-center gap-0.5 mt-1">
                        {renderStars(reviewsCount > 0 ? Math.round(rating) : 0)}
                      </div>
                    </div>
                  </div>
                  {reviewsCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Star className="h-3 w-3 fill-white text-white" />
                    </div>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-xs font-medium text-muted-foreground">
                    {reviewsCount > 0
                      ? (locale === 'ar'
                        ? `${reviewsCount} ${reviewsCount === 1 ? 'تقييم' : 'تقييم'}`
                        : `${reviewsCount} ${reviewsCount === 1 ? 'review' : 'reviews'}`
                      )
                      : (locale === 'ar' ? 'لا توجد تقييمات' : 'No reviews yet')
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Breakdown - Only show if there are reviews */}
            {reviewsCount > 0 ? (
              <div className="flex lg:flex-row w-full gap-4 mt-4">
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {locale === 'ar' ? 'التقييم العام' : 'Overall Rating'}
                    </span>
                    <span className="font-semibold text-foreground">
                      {rating.toFixed(1)}/5
                    </span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(rating / 5) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2 w-[50vw]">
                  <div className="flex items-center justify-start gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {locale === 'ar' ? 'عدد التقييمات' : 'Total Reviews'}
                    </span>
                    <span className="font-semibold text-foreground">
                      {reviewsCount}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {locale === 'ar'
                      ? 'آخر تحديث اليوم'
                      : 'Updated today'
                    }
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div
                  onClick={() => {
                    if (currentUserId) {
                      setShowAddReview(true)
                    } else {
                      toast.error(locale === 'ar' ? 'الرجاء تسجيل الدخول لإضافة تقييم' : 'Please log in to add a review')
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center cursor-pointer hover:bg-muted/50 hover:scale-110 active:scale-95 transition-all duration-300"
                >
                  <Star className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {locale === 'ar' ? 'كن أول من يقيم!' : 'Be the first to review!'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  {locale === 'ar'
                    ? 'شاركنا تجربتك مع هذا العقار وساعد الآخرين في اتخاذ قرارهم'
                    : 'Share your experience with this property and help others make their decision'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/5 to-transparent rounded-full translate-y-12 -translate-x-12" />
        </div>

        {/* Reviews List */}
        {reviews.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {locale === 'ar' ? 'آراء العملاء' : 'Customer Feedback'}
              </h3>
              <div className="text-sm text-muted-foreground">
                {locale === 'ar'
                  ? `عرض ${reviews.length} من ${reviewsCount} تقييم`
                  : `Showing ${reviews.length} of ${reviewsCount} reviews`
                }
              </div>
            </div>

            <div className="lg:max-h-96 lg:overflow-y-auto lg:pr-2 space-y-4">
              {reviews.map((review: Review) => (
                <div key={review.id} className="group relative p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/20 hover:shadow-md transition-all duration-200">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/10">
                          <span className="text-lg font-bold text-primary">
                            {review.user.full_name[0].toUpperCase()}
                          </span>
                        </div>
                        {review.is_approved && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">
                            {review.user.full_name}
                          </span>
                          {review.is_approved && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              {locale === 'ar' ? 'موثق' : 'Verified'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rating Badge */}
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm font-semibold text-primary">
                        {review.rating}/5
                      </span>
                    </div>
                  </div>

                  {/* Review Content */}
                  {review.comment && (
                    <div className="mb-4">
                      <p className="text-sm text-foreground leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  )}

                  {/* Review Footer */}

                  {/* Delete button for current user's reviews */}
                  {currentUserId && review.user.id === currentUserId && (
                    // Footer is hidden by default and revealed when hovering the parent `.group` card
                    <div className="flex items-center justify-between pt-3 border-t border-border/30 max-h-0 overflow-hidden opacity-0 pointer-events-none group-hover:max-h-40 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
                      <div className="flex items-center gap-2 w-full justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={deletingReviewId === review.id}
                          className="h-8 w-8 p-0  text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          title={locale === 'ar' ? 'حذف التقييم' : 'Delete review'}
                        >
                          {deletingReviewId === review.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Review Button - Only show if user hasn't reviewed yet */}
        {currentUserId && !reviews.some(review => review.user.id === currentUserId) && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-sm" />
            <Button
              onClick={() => setShowAddReview(true)}
              className="relative w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Star className="h-4 w-4 fill-white text-white" />
                </div>
                <span>
                  {locale === 'ar' ? 'شارك تجربتك' : 'Share Your Experience'}
                </span>
              </div>
            </Button>
          </div>
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
