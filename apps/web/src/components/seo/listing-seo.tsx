import { generateBreadcrumbStructuredData, generateListingStructuredData, SEOConfig } from '@/lib/seo';
import { JsonLd } from './json-ld';
import { fetchListing } from '../listings/fatch';

interface ListingSEOProps {
    id: string;
    locale: string;
}

export async function ListingSEO({ id, locale }: ListingSEOProps) {
    try {
        const listing = await fetchListing(id, locale)

        const isArabic = locale === 'ar';
        const title = isArabic ? listing?.title?.ar : listing?.title?.en;
        const description = isArabic ? listing?.description?.ar : listing?.description?.en;
        const location = listing.city
            ? `${isArabic ? listing.city.name?.ar : listing.city.name?.en}, ${isArabic ? listing.governorate.name?.ar : listing.governorate.name?.en}`
            : isArabic ? listing.governorate.name?.ar : listing.governorate.name?.en;

        // Generate breadcrumb data
        const breadcrumbItems = [
            { name: isArabic ? 'الرئيسية' : 'Home', url: `/${locale}` },
            { name: isArabic ? 'الإعلانات' : 'Listings', url: `/${locale}/listings` },
            { name: title || '', url: `/${locale}/listings/${listing.id}` },
        ];

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
