"use client"

import { AddReviewModal } from "@/components/property/add-review-modal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"
import { useState } from "react"

interface Review {
  id: number
  author?: string
  rating: number
  comment?: string
  date?: string
}

interface PropertyReviewsProps {
  rating: number
  reviews: Review[]
  reviewsCount: number
  propertyId: string
  locale?: string
}

export function PropertyReviews({ rating, reviews, reviewsCount, propertyId, locale = 'ar' }: PropertyReviewsProps) {
  const [showAddReview, setShowAddReview] = useState(false)

  const formatDate = (dateString?: string) => {
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
            {reviews.map((review) => (
              <div key={review.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {(review.author || 'مجهول')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground block">
                        {review.author || (locale === 'ar' ? 'مجهول' : 'Anonymous')}
                      </span>
                      {review.date && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.date)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {renderStars(review.rating)}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Review Button */}
        <Button
          onClick={() => setShowAddReview(true)}
          className="w-full h-12 text-base font-bold rounded-xl bg-primary hover:bg-primary/90"
        >
          {locale === 'ar' ? 'إضافة تقييم' : 'Add Review'}
        </Button>
      </div>

      <AddReviewModal
        open={showAddReview}
        onClose={() => setShowAddReview(false)}
        propertyId={propertyId}
        locale={locale}
      />
    </>
  )
}
