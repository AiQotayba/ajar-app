import { QueryProvider } from "@/components/QueryProvider";
import { ReduxProvider } from "@/components/ReduxProvider";
import { JsonLd } from "@/components/seo/json-ld";
import { LocaleSaver } from "@/components/locale-saver";
import { routing } from '@/lib/i18n/routing';
import { generateLocalBusinessStructuredData, generateOrganizationStructuredData, generateMetadata as generateSEOMetadata, SEO_CONSTANTS } from '@/lib/seo';
import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type React from "react";
import { Toaster } from "sonner";
import "../globals.css";
import { MainLayout } from "@/components/layout";

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isArabic = locale === 'ar';

    return generateSEOMetadata({
        title: isArabic ? 'أجار - منصة العقارات في سوريا' : 'Ajar - Syrian Real Estate Platform',
        description: isArabic ? SEO_CONSTANTS.DEFAULT_DESCRIPTION_AR : SEO_CONSTANTS.DEFAULT_DESCRIPTION_EN,
        keywords: isArabic ? SEO_CONSTANTS.DEFAULT_KEYWORDS_AR : SEO_CONSTANTS.DEFAULT_KEYWORDS_EN,
        locale,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ajar.com'}/${locale}`,
        type: 'website',
        siteName: isArabic ? SEO_CONSTANTS.SITE_NAME : SEO_CONSTANTS.SITE_NAME_EN,
        image: '/og-image.jpg',
    });
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {

    const { locale } = await params;
    // Validate that the incoming `locale` parameter is valid
    // if (!routing.locales.includes(locale as any)) {
    //     throw new Error(`Invalid locale: ${locale}`);
    // }

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages({ locale });

    // Determine text direction based on locale
    const isRTL = locale === 'ar';
    const dir = isRTL ? 'rtl' : 'ltr';
    const lang = locale;

    return (
        <html lang={lang} dir={dir}>
            <head>
                {/* Structured Data */}
                <JsonLd data={generateOrganizationStructuredData()} />
                <JsonLd data={generateLocalBusinessStructuredData()} />

                {/* Additional SEO Meta Tags */}
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="theme-color" content="#2563eb" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="أجار" />

                {/* Favicon */}
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/manifest.json" />

            </head>
            <body className="antialiased">
                <ReduxProvider>
                    <QueryProvider>
                        <NextIntlClientProvider locale={locale} messages={messages}>
                            <LocaleSaver />
                            <MainLayout>
                                <main className="min-h-screen">{children}</main>
                            </MainLayout>
                            {/* <BottomNav /> */}
                            <Toaster position="top-center" richColors />
                        </NextIntlClientProvider>
                    </QueryProvider>
                </ReduxProvider>
            </body>
        </html>
    );
}
