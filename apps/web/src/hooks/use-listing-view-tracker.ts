/**
 * Hook for tracking listing views in lists (home page, favorites)
 * Uses Intersection Observer to track when listings enter viewport
 */

import { useEffect, useRef } from 'react'
import { useListingViews } from './use-listing-views'
import { hasViewedListing } from '@/lib/utils/viewer-storage'

interface UseListingViewTrackerOptions {
  /**
   * Whether to enable view tracking
   * @default true
   */
  enabled?: boolean

  /**
   * Intersection Observer root margin
   * @default "0px" (track when fully visible)
   */
  rootMargin?: string

  /**
   * Intersection Observer threshold
   * @default 1.0 (100% - fully visible)
   */
  threshold?: number
}

/**
 * Hook to track listing view when it enters viewport
 * Used in listing cards in lists (home, favorites)
 */
export function useListingViewTracker(
  listingId: number,
  options: UseListingViewTrackerOptions = {}
) {
  // Track when listing is fully visible (100%) in viewport
  const { enabled = true, rootMargin = '0px', threshold = 1.0 } = options
  const elementRef = useRef<HTMLDivElement | null>(null)
  const hasTrackedRef = useRef(false)
  // Use 3 seconds debounce for list views (aggregate and send together)
  const { trackView } = useListingViews({ autoSubmit: true, debounceDelay: 3000 })

  useEffect(() => {
    if (!enabled || hasTrackedRef.current) return

    const element = elementRef.current
    if (!element) return

    // Check if already viewed in session
    if (hasViewedListing(listingId)) {
      hasTrackedRef.current = true
      return
    }

    // Create Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedRef.current) {
            // Track view when listing enters viewport
            const wasNew = trackView(listingId)
            if (wasNew) {
              hasTrackedRef.current = true
              console.info(`✅ Tracked view for listing ${listingId} in list`)
            }
          }
        })
      },
      {
        rootMargin,
        threshold,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [listingId, enabled, rootMargin, threshold, trackView])

  return elementRef
}

