/**
 * ViewerStorage - Manages listing views tracking in session storage
 * Prevents duplicate views within the same session
 */

const VIEWER_STORAGE_KEY = 'ajar_viewed_listings'
const VIEWER_TIMESTAMP_KEY = 'ajar_viewer_timestamp'

interface ViewedListing {
  id: number
  viewed_at: string
  count: number
}

/**
 * Get all viewed listings from session storage
 */
export function getViewedListings(): ViewedListing[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = sessionStorage.getItem(VIEWER_STORAGE_KEY)
    if (!stored) return []
    
    const parsed = JSON.parse(stored) as ViewedListing[]
    return Array.isArray(parsed) ? parsed : []
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
 */
export function markListingAsViewed(listingId: number): boolean {
  if (typeof window === 'undefined') return false
  
  // Check if already viewed
  if (hasViewedListing(listingId)) {
    return false // Already viewed in this session
  }
  
  try {
    const viewed = getViewedListings()
    const newView: ViewedListing = {
      id: listingId,
      viewed_at: new Date().toISOString(),
      count: 1
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
      viewed[index].count = count
      viewed[index].viewed_at = new Date().toISOString()
      sessionStorage.setItem(VIEWER_STORAGE_KEY, JSON.stringify(viewed))
    }
  } catch (error) {
    console.error('Error updating view count:', error)
  }
}

/**
 * Get viewed listings ready for API submission
 * Returns array of {id, count, viewed_at}
 */
export function getViewedListingsForAPI(): Array<{ id: number; count: number; viewed_at: string }> {
  return getViewedListings().map(item => ({
    id: item.id,
    count: item.count,
    viewed_at: item.viewed_at
  }))
}

/**
 * Clear all viewed listings (useful for testing or logout)
 */
export function clearViewedListings(): void {
  if (typeof window === 'undefined') return
  
  try {
    sessionStorage.removeItem(VIEWER_STORAGE_KEY)
    sessionStorage.removeItem(VIEWER_TIMESTAMP_KEY)
  } catch (error) {
    console.error('Error clearing viewed listings:', error)
  }
}

/**
 * Track listing view when it enters viewport (for list pages)
 */
export function trackListingView(listingId: number): boolean {
  return markListingAsViewed(listingId)
}
