"use client"

import { useState } from "react"
import { X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface AddReviewModalProps {
  open: boolean
  onClose: () => void
  propertyId: string
}

export function AddReviewModal({ open, onClose, propertyId }: AddReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")

  if (!open) return null

  const handleSubmit = () => {
    // Handle review submission
    console.log("[v0] Submitting review:", { propertyId, rating, comment })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-background rounded-3xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Star Rating */}
        <div className="flex justify-center gap-2 pt-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
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

        {/* Title */}
        <h2 className="text-xl font-bold text-center">إضافة تقييم</h2>

        {/* Comment Textarea */}
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="الشقة واسعة ومميزة، الأثاث بحالة جيدة جداً، والمكان هادئ ومناسب للعائلات."
          className="min-h-32 text-base rounded-2xl border-border resize-none"
        />

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || !comment.trim()}
          className="w-full h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 disabled:opacity-50"
        >
          إرسال
        </Button>
      </div>
    </div>
  )
}
