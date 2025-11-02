import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ajar.com'

  // Static pages
  const staticPages = [
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
    },
    {
      url: `${baseUrl}/ar/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]

  // Categories pages (you'll need to fetch these from your API)
  const categories = [
    { id: 1, slug: 'apartments' },
    { id: 2, slug: 'villas' },
    { id: 3, slug: 'land' },
    { id: 4, slug: 'offices' },
    { id: 5, slug: 'shops' },
  ]

  const categoryPages = categories.flatMap(category => [
    {
      url: `${baseUrl}/ar/categories/${category.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/en/categories/${category.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ])


  return [
    ...staticPages,
  ]
}
