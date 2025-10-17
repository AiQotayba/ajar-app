import { generateBreadcrumbStructuredData, generateListingStructuredData, SEOConfig } from '@/lib/seo';
import { JsonLd } from './json-ld';

interface ListingSEOProps {
    id: string;
    locale: string;
}

export async function ListingSEO({ id, locale }: ListingSEOProps) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
        const response = await fetch(`${apiUrl}/user/listings/${id}`, {
            headers: {
                'Accept-Language': locale,
                'Accept': 'application/json',
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
        
        const listing = data?.data
        const isArabic = locale === 'ar';
        const title = isArabic ? listing.title?.ar : listing.title?.en;
        const description = isArabic ? listing.description?.ar : listing.description?.en;
        const location = listing.city
            ? `${isArabic ? listing.city.name?.ar : listing.city.name?.en}, ${isArabic ? listing.governorate.name?.ar : listing.governorate.name?.en}`
            : isArabic ? listing.governorate.name?.ar : listing.governorate.name?.en;

        // Generate breadcrumb data
        const breadcrumbItems = [
            { name: isArabic ? 'الرئيسية' : 'Home', url: `/${locale}` },
            { name: isArabic ? 'الإعلانات' : 'Listings', url: `/${locale}/listings` },
            { name: title || '', url: `/${locale}/listings/${listing.id}` },
        ];

        const seoConfig: SEOConfig = {
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
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ajar.com'}/${locale}/listings/${listing.id}`,
            image: listing.cover_image || listing.images?.[0]?.full_url,
            type: 'website',    
            siteName: isArabic ? 'أجار - منصة العقارات' : 'Ajar - Real Estate Platform',
            publishedTime: listing.created_at,
            modifiedTime: listing.updated_at,
        };

        return (
            <>
                {/* Listing Structured Data */}
                <JsonLd data={generateListingStructuredData(listing, locale)} />

                {/* Breadcrumb Structured Data */}
                <JsonLd data={generateBreadcrumbStructuredData(breadcrumbItems)} />
            </>
        );
    } catch (error) {
        console.error('Error in ListingSEO:', error)
        return null
    }
}
