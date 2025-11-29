import { unstable_cache } from 'next/cache'

async function fetchListingInternal(id: string, locale: string) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
        const response = await fetch(`${apiUrl}/user/listings/${id}`, {
            headers: {
                'Accept-Language': locale,
                'Accept': 'application/json',
            },
            cache: 'force-cache', // Cache the response
            next: { 
                revalidate: 5 // Revalidate every 10 seconds
            }
        })

        if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}`)
            return null
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            console.error('API returned non-JSON response:', contentType)
            return null
        }
        
        const data = await response.json()
        if (!data?.data) return null
        return data.data
    }
    catch (error) {
        console.error('Error fetching listing:', error)
        return null
    }
}

// Cache the function with a unique key based on id and locale
export async function fetchListing(id: string, locale: string) {
    return unstable_cache(
        async () => fetchListingInternal(id, locale),
        [`listing-${id}-${locale}`], // Unique cache key for each listing and locale
        {
            revalidate: 10, // Revalidate every 10 seconds
            tags: [`listing-${id}`, 'listings'] // Cache tags for manual revalidation
        }
    )()
}