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
  markListingsAsSent,
} from '@/lib/utils/viewer-storage'

interface UseListingViewsOptions {
  /**
   * Whether to automatically submit views on component unmount
   * @default true
   */
  autoSubmit?: boolean

  /**
   * Debounce delay for API submission (in milliseconds)
   * @default 3000 (3 seconds)
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
    debounceDelay = 3000, // 3 seconds default
    autoTrack = true,
  } = options

  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSubmittingRef = useRef(false)
  const submittedListingIdsRef = useRef<Set<number>>(new Set()) // Track submitted listing IDs in this hook instance

  /**
   * Submit viewed listings to API
   */
  const submitViews = useCallback(async () => {
    if (isSubmittingRef.current) {
      console.info('⏸️ Already submitting, skipping...')
      return
    }

    const listings = getViewedListingsForAPI()
    if (listings.length === 0) {
      console.info('⏸️ No listings to submit')
      return
    }

    // Filter out listings that were already submitted in this hook instance
    const newListings = listings.filter(item => !submittedListingIdsRef.current.has(item.id))
    if (newListings.length === 0) {
      console.info('⏸️ All listings already submitted in this session')
      return
    }

    // Ensure all dates are in correct format Y-m-d H:i:s
    // normalizeDateTime in getViewedListingsForAPI should handle this, but double-check
    const validatedListings = newListings.map(item => {
      // Check if already in correct format
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(item.viewed_at)) {
        return item
      }
      
      // Convert to correct format
      try {
        const date = new Date(item.viewed_at)
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          const seconds = String(date.getSeconds()).padStart(2, '0')
          return {
            ...item,
            viewed_at: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
          }
        }
      } catch (error) {
        console.error('Error formatting date:', item.viewed_at, error)
      }
      
      return item
    })

    isSubmittingRef.current = true

    try {
      console.info('📤 Sending views to API:', validatedListings.map(l => ({ id: l.id, viewed_at: l.viewed_at })))
      const response = await api.post('/user/listings/view', { listings: validatedListings })
      
      if (!response.isError) {
        // Mark listings as sent after successful submission
        const listingIds = validatedListings.map(item => item.id)
        markListingsAsSent(listingIds)
        // Track submitted IDs in this hook instance to prevent duplicate sends
        listingIds.forEach(id => submittedListingIdsRef.current.add(id))
        console.info('✅ Views submitted successfully', validatedListings.length)
      } else {
        console.error('❌ Error submitting views:', response.message)
      }
    } catch (error) {
      console.error('❌ Error submitting views:', error)
    } finally {
      isSubmittingRef.current = false
    }
  }, [])

  /**
   * Track a single listing view
   * @param listingId - The listing ID
   * @param viewsCount - Optional: The current views count from the listing (if available)
   */
  const trackView = useCallback((listingId: number, viewsCount?: number) => {
    const wasNew = trackListingView(listingId, 1)

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
    updateListingViewCount(listingId, 1)
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
