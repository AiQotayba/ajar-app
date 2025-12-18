/**
 * ViewerStorage - Manages listing views tracking in session storage
 * Prevents duplicate views within the same session
 */

const VIEWER_STORAGE_KEY = 'ajar_viewed_listings'
const VIEWER_TIMESTAMP_KEY = 'ajar_viewer_timestamp'
const VIEWER_SENT_KEY = 'ajar_viewed_listings_sent'

interface ViewedListing {
  id: number
  viewed_at: string
  count: number
  sent?: boolean // Flag to track if already sent to API
}

/**
 * Format date to Y-m-d H:i:s format
 */
function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * Convert ISO date string to Y-m-d H:i:s format
 * Handles both ISO format and already formatted dates
 */
function normalizeDateTime(dateString: string): string {
  // If already in correct format, return as is
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
    return dateString
  }

  // If ISO format, convert it
  try {
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return formatDateTime(date)
    }
  } catch (error) {
    console.error('Error parsing date:', dateString, error)
  }

  // If all else fails, use current date
  return formatDateTime(new Date())
}

/**
 * Get all viewed listings from session storage
 * Normalizes date formats for backward compatibility
 */
export function getViewedListings(): ViewedListing[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = sessionStorage.getItem(VIEWER_STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored) as ViewedListing[]
    if (!Array.isArray(parsed)) return []

    // Normalize all date formats to ensure consistency
    return parsed.map(item => ({
      ...item,
      viewed_at: normalizeDateTime(item.viewed_at)
    }))
  } catch (error) {
    console.error('Error reading viewed listings from session storage:', error)
    return []
  }
}

/**
 * Check if a listing has been viewed in this session
 */
export function hasViewedListing(listingId: number): boolean {
  const viewed = getViewedListings()
  return viewed.some(item => item.id === listingId)
}

/**
 * Add a listing to viewed list (only once per session)
 * @param listingId - The listing ID
 * @param viewsCount - Optional: The current views count from the listing (if available)
 */
export function markListingAsViewed(listingId: number, viewsCount?: number): boolean {
  if (typeof window === 'undefined') return false

  // Check if already viewed
  if (hasViewedListing(listingId)) {
    return false // Already viewed in this session
  }

  try {
    const viewed = getViewedListings()
    const newView: ViewedListing = {
      id: listingId,
      viewed_at: formatDateTime(new Date()),
      count: 1, // Use provided count + 1, or default to 1
      sent: false // Not sent yet
    }

    viewed.push(newView)
    sessionStorage.setItem(VIEWER_STORAGE_KEY, JSON.stringify(viewed))

    // Update timestamp
    sessionStorage.setItem(VIEWER_TIMESTAMP_KEY, Date.now().toString())

    return true // Successfully marked as viewed
  } catch (error) {
    console.error('Error saving viewed listing to session storage:', error)
    return false
  }
}

/**
 * Update view count for a listing (if already viewed)
 */
export function updateListingViewCount(listingId: number, count: number): void {
  if (typeof window === 'undefined') return

  try {
    const viewed = getViewedListings()
    const index = viewed.findIndex(item => item.id === listingId)

    if (index !== -1) {
      viewed[index].count = 1
      viewed[index].viewed_at = formatDateTime(new Date())
      sessionStorage.setItem(VIEWER_STORAGE_KEY, JSON.stringify(viewed))
    }
  } catch (error) {
    console.error('Error updating view count:', error)
  }
}

/**
 * Get viewed listings ready for API submission
 * Returns only listings that haven't been sent yet
 * Returns array of {id, count, viewed_at}
 * Ensures all dates are in Y-m-d H:i:s format
 */
export function getViewedListingsForAPI(): Array<{ id: number; count: number; viewed_at: string }> {
  return getViewedListings()
    .filter(item => !item.sent) // Only get listings that haven't been sent
    .map(item => ({
      id: item.id,
      count: item.count,
      viewed_at: normalizeDateTime(item.viewed_at) // Normalize date format
    }))
}

/**
 * Mark listings as sent after successful API submission
 */
export function markListingsAsSent(listingIds: number[]): void {
  if (typeof window === 'undefined') return

  try {
    const viewed = getViewedListings()
    viewed.forEach(item => {
      if (listingIds.includes(item.id)) {
        item.sent = true
      }
    })
    sessionStorage.setItem(VIEWER_STORAGE_KEY, JSON.stringify(viewed))
  } catch (error) {
    console.error('Error marking listings as sent:', error)
  }
}

/**
 * Clear all viewed listings (useful for testing or logout)
 */
export function clearViewedListings(): void {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.removeItem(VIEWER_STORAGE_KEY)
    sessionStorage.removeItem(VIEWER_TIMESTAMP_KEY)
    sessionStorage.removeItem(VIEWER_SENT_KEY)
  } catch (error) {
    console.error('Error clearing viewed listings:', error)
  }
}

/**
 * Track listing view when it enters viewport (for list pages)
 * @param listingId - The listing ID
 * @param viewsCount - Optional: The current views count from the listing (if available)
 */
export function trackListingView(listingId: number, viewsCount?: number): boolean {
  return markListingAsViewed(listingId, viewsCount)
}
