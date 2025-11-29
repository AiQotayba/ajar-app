import { fetchListing } from "@/components/listings/fatch"
import { PropertyDetails } from "@/components/property/property-details"
import { ListingSEO } from "@/components/seo/listing-seo"
import { generateMetadata as generateSEOMetadata, SEO_CONSTANTS } from '@/lib/seo'
import type { Metadata } from 'next'

interface PropertyPageProps {
  params: Promise<{
    id: string
    locale: string
  }>
}

// Generate SEO metadata for the listing page
export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { id, locale } = await params
  const isArabic = locale === 'ar'

  try {
    // Fetch listing data for SEO
    const listing = await fetchListing(id, locale)

    if (!listing) {
      return {
        title: isArabic ? 'صفحة غير موجودة' : 'Page Not Found',
        description: isArabic ? 'الصفحة المطلوبة غير موجودة' : 'The requested page was not found',
      }
    }

    const title = isArabic ? listing.title?.ar : listing.title?.en
    const description = isArabic ? listing.description?.ar : listing.description?.en
    const location = listing.city
      ? `${isArabic ? listing.city.name?.ar : listing.city.name?.en}, ${isArabic ? listing.governorate.name?.ar : listing.governorate.name?.en}`
      : isArabic ? listing.governorate.name?.ar : listing.governorate.name?.en

    return generateSEOMetadata({
      title: `${title} - ${location}`,
      description: description || `${title} في ${location}`,
      keywords: [
        isArabic ? 'عقارات سوريا' : 'syria real estate',
        isArabic ? 'شقق للبيع' : 'apartments for sale',
        isArabic ? 'فيلل للإيجار' : 'villas for rent',
        location,
        title,
      ],
      locale,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ajar.com'}/${locale}/listings/${id}`,
      image: listing.cover_image || listing.images?.[0]?.full_url,
      type: 'website',
      siteName: isArabic ? SEO_CONSTANTS.SITE_NAME : SEO_CONSTANTS.SITE_NAME_EN,
      publishedTime: listing.created_at,
      modifiedTime: listing.updated_at,
    })
  } catch (error) {
    console.warn('Error generating metadata:', error)
    return {
      title: isArabic ? 'حدث خطأ' : 'Something went wrong',
      description: isArabic ? 'تعذر تحميل البيانات' : 'Failed to load data',
      robots: { index: false, follow: false },
    }
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id, locale } = await params
  
  // Fetch listing data once (cached) and pass to both components
  const listing = await fetchListing(id, locale)
  
  return (
    <>
      {/* SEO Structured Data */}
      <ListingSEO id={id} locale={locale} />

      <PropertyDetails id={id} locale={locale} initialData={listing} />
    </>
  )
}
