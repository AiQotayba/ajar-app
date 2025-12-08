/**
 * Hook for tracking listing views
 * Handles view tracking and API submission
 */

import { useCallback, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import {
  getViewedListingsForAPI,
  markListingAsViewed,
  trackListingView,
  updateListingViewCount,
} from '@/lib/utils/viewer-storage'

interface UseListingViewsOptions {
  /**
   * Whether to automatically submit views on component unmount
   * @default true
   */
  autoSubmit?: boolean

  /**
   * Debounce delay for API submission (in milliseconds)
   * @default 2000
   */
  debounceDelay?: number

  /**
   * Whether to track views automatically
   * @default true
   */
  autoTrack?: boolean
}

/**
 * Hook to track listing views and submit them to the API
 */
export function useListingViews(options: UseListingViewsOptions = {}) {
  const {
    autoSubmit = true,
    debounceDelay = 2000,
    autoTrack = true,
  } = options

  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSubmittingRef = useRef(false)

  /**
   * Submit viewed listings to API
   */
  const submitViews = useCallback(async () => {
    if (isSubmittingRef.current) return

    const listings = getViewedListingsForAPI()
    if (listings.length === 0) return

    isSubmittingRef.current = true

    try {
      await api.post('/user/listings/view', { listings })
      console.info('✅ Views submitted successfully', listings.length)
    } catch (error) {
      console.error('❌ Error submitting views:', error)
    } finally {
      isSubmittingRef.current = false
    }
  }, [])

  /**
   * Track a single listing view
   */
  const trackView = useCallback((listingId: number) => {
    const wasNew = trackListingView(listingId)

    if (wasNew && autoSubmit) {
      // Clear existing timeout
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current)
      }

      // Set new timeout for debounced submission
      submitTimeoutRef.current = setTimeout(() => {
        submitViews()
      }, debounceDelay)
    }

    return wasNew
  }, [autoSubmit, debounceDelay, submitViews])

  /**
   * Update view count for a listing
   */
  const updateViewCount = useCallback((listingId: number, count: number) => {
    updateListingViewCount(listingId, count)
  }, [])

  /**
   * Manually submit views immediately
   */
  const submitViewsNow = useCallback(async () => {
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current)
      submitTimeoutRef.current = null
    }
    await submitViews()
  }, [submitViews])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current)
      }

      // Submit remaining views on unmount if autoSubmit is enabled
      if (autoSubmit && !isSubmittingRef.current) {
        submitViews()
      }
    }
  }, [autoSubmit, submitViews])

  return {
    trackView,
    updateViewCount,
    submitViews: submitViewsNow,
    getViewedListings: getViewedListingsForAPI,
  }
}
