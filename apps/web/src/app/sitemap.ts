import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ajar.com'
  const apiUrl = "https://backend.ajarsyria.com/api/v1"
  
  // جلب القوائم
  const listingResponse = await fetch(`${apiUrl}/user/listings?per_page=1000`)
  const listingData = await listingResponse.json()
  const listings = listingData.data || []
  
  // إنشاء مصفوفة لجميع الصفحات
  const allPages = []
  
  // الصفحات الثابتة
  allPages.push(
    {
      url: `${baseUrl}/ar`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    }
  )
  
  // صفحات القوائم
  listings.forEach((listing: any) => {
    const slug = listing.slug || listing.id
    allPages.push(
      {
        url: `${baseUrl}/ar/listings/${slug}`,
        lastModified: new Date(listing.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/en/listings/${slug}`,
        lastModified: new Date(listing.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }
    )
  })
  
  // صفحات إضافية
  // const additionalPaths = ['/home', '/about', '/contact', '/categories', '/blog']
  
  // additionalPaths.forEach((path) => {
  //   allPages.push(
  //     {
  //       url: `${baseUrl}/ar${path}`,
  //       lastModified: new Date(),
  //       changeFrequency: 'weekly' as const,
  //       priority: path === '/home' ? 0.9 : 0.7,
  //     },
  //     {
  //       url: `${baseUrl}/en${path}`,
  //       lastModified: new Date(),
  //       changeFrequency: 'weekly' as const,
  //       priority: path === '/home' ? 0.9 : 0.7,
  //     }
  //   )
  // })
  
  return allPages
}