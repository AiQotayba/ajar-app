/**
 * SEO Configuration and utilities for Ajar Real Estate Platform
 * Supports both Arabic and English with RTL/LTR support
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  locale: string;
  url: string;
  image?: string;
  type?: 'website' | 'article';
  siteName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

/**
 * Generate comprehensive metadata for pages
 */
export function generateMetadata(config: SEOConfig) {
  const isArabic = config.locale === 'ar';
  const direction = isArabic ? 'rtl' : 'ltr';
  
  return {
    title: `${config.title} | أجار`,
    description: config.description,
    keywords: config.keywords.join(', '),
    authors: [{ name: config.author || 'Ajar Team' }],
    creator: 'Ajar Real Estate Platform',
    publisher: 'Ajar',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: config.url,
      siteName: config.siteName || 'أجار - منصة العقارات',
      images: [
        {
          url: config.image || '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: config.title,
        },
      ],
      locale: isArabic ? 'ar_SY' : 'en_SY',
      type: (config.type && ['website', 'article'].includes(config.type)) ? config.type : 'website',
      publishedTime: config.publishedTime,
      modifiedTime: config.modifiedTime,
      section: config.section,
      tags: config.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [config.image || '/og-image.jpg'],
      creator: '@ajar_realestate',
      site: '@ajar_realestate',
    },
    alternates: {
      canonical: config.url,
      languages: {
        'ar': `${process.env.NEXT_PUBLIC_SITE_URL}/ar`,
        'en': `${process.env.NEXT_PUBLIC_SITE_URL}/en`,
      },
    },
    other: {
      'language': config.locale,
      'content-language': config.locale,
      'direction': direction,
      'theme-color': '#2563eb',
      'color-scheme': 'light dark',
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': 'أجار',
      'application-name': 'أجار',
      'msapplication-TileColor': '#2563eb',
      'msapplication-config': '/browserconfig.xml',
    },
  };
}

/**
 * Generate structured data for real estate listings
 */
export function generateListingStructuredData(listing: any, locale: string = 'ar'): StructuredData {
  const isArabic = locale === 'ar';
  const name = isArabic ? listing.title?.ar : listing.title?.en;
  const description = isArabic ? listing.description?.ar : listing.description?.en;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: name,
    description: description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/listings/${listing.id}`,
    image: listing.cover_image || listing.images?.[0]?.full_url,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: listing.currency,
      availability: listing.type === 'rent' ? 'https://schema.org/InStock' : 'https://schema.org/InStock',
      category: listing.type,
      validFrom: new Date().toISOString(),
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'SY',
      addressRegion: isArabic ? listing.governorate?.name?.ar : listing.governorate?.name?.en,
      addressLocality: isArabic ? listing.city?.name?.ar : listing.city?.name?.en,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: listing.latitude,
      longitude: listing.longitude,
    },
    floorSize: {
      '@type': 'QuantitativeValue',
      value: listing.properties?.find((p: any) => p.name?.ar?.includes('المساحة'))?.value,
      unitCode: 'MTK',
    },
    numberOfRooms: listing.properties?.find((p: any) => p.name?.ar?.includes('غرف'))?.value,
    numberOfBathroomsTotal: listing.properties?.find((p: any) => p.name?.ar?.includes('حمام'))?.value,
    datePosted: listing.created_at,
    dateModified: listing.updated_at,
    publisher: {
      '@type': 'Organization',
      name: 'أجار',
      url: process.env.NEXT_PUBLIC_SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
  };
}

/**
 * Generate structured data for organization
 */
export function generateOrganizationStructuredData(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'أجار',
    alternateName: 'Ajar',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    description: 'منصة شاملة للعقارات في سوريا',
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+963-XXX-XXXXXX',
      contactType: 'customer service',
      availableLanguage: ['Arabic', 'English'],
    },
    sameAs: [
      'https://facebook.com/ajar',
      'https://twitter.com/ajar',
      'https://instagram.com/ajar',
      'https://linkedin.com/company/ajar',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'SY',
      addressRegion: 'دمشق',
      addressLocality: 'دمشق',
    },
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(items: Array<{name: string, url: string}>): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(faqs: Array<{question: string, answer: string}>): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate local business structured data
 */
export function generateLocalBusinessStructuredData(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'أجار',
    description: 'وكيل عقاري في سوريا',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    telephone: '+963-XXX-XXXXXX',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'SY',
      addressRegion: 'دمشق',
      addressLocality: 'دمشق',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '33.5138',
      longitude: '36.2765',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00',
    },
    priceRange: '$$',
    paymentAccepted: 'Cash, Credit Card',
    currenciesAccepted: 'SYP, USD',
  };
}

/**
 * SEO constants for the platform
 */
export const SEO_CONSTANTS = {
  SITE_NAME: 'أجار - منصة العقارات',
  SITE_NAME_EN: 'Ajar - Real Estate Platform',
  DEFAULT_DESCRIPTION_AR: 'منصة شاملة للعقارات في سوريا. ابحث عن شقق، فيلل، مكاتب، محلات وأراضي للبيع والإيجار',
  DEFAULT_DESCRIPTION_EN: 'Comprehensive real estate platform in Syria. Find apartments, villas, offices, shops and land for sale and rent',
  DEFAULT_KEYWORDS_AR: [
    'عقارات سوريا',
    'شقق للبيع',
    'فيلل للإيجار',
    'مكاتب تجارية',
    'محلات',
    'أراضي',
    'دمشق',
    'حلب',
    'حمص',
    'حماة',
    'اللاذقية',
    'دير الزور',
    'الرقة',
    'القنيطرة',
    'السويداء',
    'طرطوس',
    'إدلب',
    'درعا',
    'القامشلي',
  ],
  DEFAULT_KEYWORDS_EN: [
    'syria real estate',
    'apartments for sale',
    'villas for rent',
    'commercial offices',
    'shops',
    'land',
    'damascus',
    'aleppo',
    'homs',
    'hama',
    'latakia',
    'deir ez-zor',
    'raqqa',
    'quneitra',
    'sweida',
    'tartous',
    'idlib',
    'daraa',
    'qamishli',
  ],
  CONTACT_INFO: {
    phone: '+963-XXX-XXXXXX',
    email: 'info@ajar.com',
    address: 'دمشق، سوريا',
  },
  SOCIAL_LINKS: {
    facebook: 'https://facebook.com/ajar',
    twitter: 'https://twitter.com/ajar',
    instagram: 'https://instagram.com/ajar',
    linkedin: 'https://linkedin.com/company/ajar',
    youtube: 'https://youtube.com/ajar',
  },
};
