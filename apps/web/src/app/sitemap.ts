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

  // Governorates pages
  const governorates = [
    { id: 1, slug: 'damascus' },
    { id: 2, slug: 'aleppo' },
    { id: 3, slug: 'homs' },
    { id: 4, slug: 'hama' },
    { id: 5, slug: 'latakia' },
    { id: 6, slug: 'deir-ez-zor' },
    { id: 7, slug: 'raqqa' },
    { id: 8, slug: 'quneitra' },
    { id: 9, slug: 'sweida' },
    { id: 10, slug: 'tartous' },
    { id: 11, slug: 'idlib' },
    { id: 12, slug: 'daraa' },
    { id: 13, slug: 'qamishli' },
  ]

  const governoratePages = governorates.flatMap(governorate => [
    {
      url: `${baseUrl}/ar/governorates/${governorate.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/en/governorates/${governorate.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ])

  return [
    ...staticPages,
    ...categoryPages,
    ...governoratePages,
  ]
}
