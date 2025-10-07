# SEO Configuration for Ajar Real Estate Platform

## Overview
This document outlines the comprehensive SEO setup for the Ajar real estate platform, supporting both Arabic and English languages with RTL/LTR support.

## Features Implemented

### 🔍 Meta Tags & SEO
- ✅ Dynamic meta titles and descriptions
- ✅ Open Graph tags for social media
- ✅ Twitter Card support
- ✅ Canonical URLs
- ✅ Language alternates (hreflang)
- ✅ Robots directives
- ✅ Viewport and mobile optimization

### 📊 Structured Data (JSON-LD)
- ✅ Organization schema
- ✅ Local Business schema
- ✅ Real Estate Listing schema
- ✅ Breadcrumb schema
- ✅ FAQ schema (ready for implementation)

### 🗺️ Sitemap & Robots
- ✅ Dynamic sitemap generation
- ✅ Robots.txt configuration
- ✅ Search engine directives

### 📱 PWA Support
- ✅ Web App Manifest
- ✅ Service Worker ready
- ✅ Apple Touch Icons
- ✅ Microsoft Tiles

### 🌐 Internationalization
- ✅ Arabic (RTL) and English (LTR) support
- ✅ Locale-specific URLs
- ✅ Language-specific meta tags
- ✅ Proper lang and dir attributes

## File Structure

```
src/
├── lib/
│   └── seo.ts                 # SEO utilities and configuration
├── components/
│   └── seo/
│       ├── json-ld.tsx        # JSON-LD structured data component
│       ├── seo-head.tsx       # Comprehensive SEO head component
│       └── listing-seo.tsx    # Listing-specific SEO
├── app/
│   ├── sitemap.ts            # Dynamic sitemap generation
│   ├── robots.ts             # Robots.txt configuration
│   └── manifest.ts           # PWA manifest
public/
├── robots.txt                # Static robots file
├── browserconfig.xml         # Microsoft tiles configuration
└── manifest.json            # PWA manifest
```

## Usage Examples

### Basic SEO for Pages
```typescript
import { generateMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  return generateMetadata({
    title: 'Page Title',
    description: 'Page description',
    keywords: ['keyword1', 'keyword2'],
    locale: 'ar',
    url: 'https://ajar.com/ar/page',
  });
}
```

### Listing SEO
```typescript
import { ListingSEO } from '@/components/seo/listing-seo';

export default function ListingPage({ listing, locale }) {
  return (
    <>
      <ListingSEO listing={listing} locale={locale} />
      {/* Page content */}
    </>
  );
}
```

### Structured Data
```typescript
import { JsonLd } from '@/components/seo/json-ld';
import { generateOrganizationStructuredData } from '@/lib/seo';

export default function Page() {
  return (
    <>
      <JsonLd data={generateOrganizationStructuredData()} />
      {/* Page content */}
    </>
  );
}
```

## SEO Constants

The platform includes predefined SEO constants for:
- Default titles and descriptions
- Keywords for Syria and real estate
- Contact information
- Social media links
- Governorate names in Arabic and English

## Performance Optimizations

- ✅ Image optimization with WebP/AVIF support
- ✅ Font optimization with Google Fonts
- ✅ Compression enabled
- ✅ Security headers
- ✅ DNS prefetch control

## Security Features

- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: origin-when-cross-origin
- ✅ CSP ready for implementation

## Environment Variables

Required environment variables for SEO:
```env
NEXT_PUBLIC_SITE_URL=https://ajar.com
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA_ID
NEXT_PUBLIC_CONTACT_PHONE=+963-XXX-XXXXXX
NEXT_PUBLIC_CONTACT_EMAIL=info@ajar.com
```

## Testing SEO

### Tools to Use
1. **Google Search Console** - Monitor search performance
2. **Google Rich Results Test** - Test structured data
3. **PageSpeed Insights** - Performance testing
4. **Lighthouse** - Comprehensive SEO audit
5. **Screaming Frog** - Technical SEO analysis

### Key Metrics to Monitor
- Core Web Vitals (LCP, FID, CLS)
- Mobile usability
- Structured data errors
- Index coverage
- Search performance

## Future Enhancements

- [ ] FAQ structured data implementation
- [ ] Review/Rating schema
- [ ] Event schema for property viewings
- [ ] Video structured data for property tours
- [ ] Advanced analytics integration
- [ ] A/B testing for meta descriptions

## Best Practices

1. **Content Quality**: Ensure all content is unique and valuable
2. **Keyword Research**: Use relevant Arabic and English keywords
3. **Local SEO**: Optimize for Syrian locations and governorates
4. **Mobile First**: Ensure mobile-friendly design
5. **Page Speed**: Optimize images and minimize JavaScript
6. **User Experience**: Focus on user engagement metrics
7. **Regular Updates**: Keep content fresh and relevant

## Monitoring & Maintenance

- Regular SEO audits (monthly)
- Monitor search console for errors
- Update structured data as needed
- Track performance metrics
- Keep content updated and relevant
