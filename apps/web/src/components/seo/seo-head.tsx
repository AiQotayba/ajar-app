'use client';

import { SEOConfig, generateLocalBusinessStructuredData, generateMetadata, generateOrganizationStructuredData } from '@/lib/seo';
import Head from 'next/head';
import { JsonLd } from './json-ld';

interface SEOHeadProps {
    config: SEOConfig;
    includeOrganization?: boolean;
    includeLocalBusiness?: boolean;
}

export function SEOHead({
    config,
    includeOrganization = true,
    includeLocalBusiness = true
}: SEOHeadProps) {
    const metadata = generateMetadata(config);
    const isArabic = config.locale === 'ar';

    return (
        <Head>
            {/* Basic Meta Tags */}
            <title>{metadata.title}</title>
            <meta name="description" content={metadata.description} />
            <meta name="keywords" content={metadata.keywords} />
            <meta name="author" content={metadata.authors?.[0]?.name} />
            <meta name="robots" content="index, follow" />

            {/* Language and Direction */}
            <meta httpEquiv="content-language" content={config.locale} />
            <html dir={isArabic ? 'rtl' : 'ltr'} lang={config.locale} />

            {/* Open Graph */}
            <meta property="og:title" content={metadata.openGraph?.title} />
            <meta property="og:description" content={metadata.openGraph?.description} />
            <meta property="og:url" content={metadata.openGraph?.url} />
            <meta property="og:type" content={metadata.openGraph?.type} />
            <meta property="og:site_name" content={metadata.openGraph?.siteName} />
            <meta property="og:locale" content={metadata.openGraph?.locale} />
            {metadata.openGraph?.images?.[0] && (
                <>
                    <meta property="og:image" content={metadata.openGraph.images[0].url} />
                    <meta property="og:image:width" content={metadata.openGraph.images[0].width?.toString()} />
                    <meta property="og:image:height" content={metadata.openGraph.images[0].height?.toString()} />
                    <meta property="og:image:alt" content={metadata.openGraph.images[0].alt} />
                </>
            )}

            {/* Twitter Card */}
            <meta name="twitter:card" content={metadata.twitter?.card} />
            <meta name="twitter:title" content={metadata.twitter?.title} />
            <meta name="twitter:description" content={metadata.twitter?.description} />
            <meta name="twitter:image" content={metadata.twitter?.images?.[0]} />
            <meta name="twitter:site" content={metadata.twitter?.site} />
            <meta name="twitter:creator" content={metadata.twitter?.creator} />

            {/* Canonical URL */}
            <link rel="canonical" href={metadata.alternates?.canonical} />

            {/* Alternate Languages */}
            {metadata.alternates?.languages && Object.entries(metadata.alternates.languages).map(([lang, url]) => (
                <link key={lang} rel="alternate" hrefLang={lang} href={url} />
            ))}

            {/* Theme and PWA */}
            <meta name="theme-color" content="#2563eb" />
            <meta name="color-scheme" content="light dark" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="أجار" />
            <meta name="application-name" content="أجار" />

            {/* Microsoft Tiles */}
            <meta name="msapplication-TileColor" content="#2563eb" />
            <meta name="msapplication-config" content="/browserconfig.xml" />

            {/* Favicon */}
            <link rel="icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <link rel="manifest" href="/manifest.json" />

            {/* Preconnect to external domains */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

            {/* Structured Data */}
            {includeOrganization && <JsonLd data={generateOrganizationStructuredData()} />}
            {includeLocalBusiness && <JsonLd data={generateLocalBusinessStructuredData()} />}
        </Head>
    );
}
