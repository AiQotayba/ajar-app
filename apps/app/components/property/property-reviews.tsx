"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddReviewModal } from "@/components/property/add-review-modal"
import { cn } from "@/lib/utils"

interface Review {
  id: number
  author: string
  rating: number
  comment: string
  date: string
}

interface PropertyReviewsProps {
  rating: number
  reviews: Review[]
  propertyId: string
}

export function PropertyReviews({ rating, reviews, propertyId }: PropertyReviewsProps) {
  const [showAddReview, setShowAddReview] = useState(false)

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">التقييمات</h2>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-bold">
            <Star className="h-4 w-4 fill-current" />
            <span>{rating}</span>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 rounded-2xl border border-border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{review.author}</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-4 w-4",
                        star <= review.rating ? "fill-yellow-400 text-yellow-400" : "fill-none text-gray-300",
                      )}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>

        {/* Add Review Button */}
        <Button
          onClick={() => setShowAddReview(true)}
          className="w-full h-12 text-base font-bold rounded-2xl bg-primary hover:bg-primary/90"
        >
          إضافة تقييم
        </Button>
      </div>

      <AddReviewModal open={showAddReview} onClose={() => setShowAddReview(false)} propertyId={propertyId} />
    </>
  )
}
