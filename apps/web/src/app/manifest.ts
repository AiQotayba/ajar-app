import type { MetadataRoute } from 'next'

type Props = {
  params: {
    locale: 'ar' | 'en'
  }
}

export default function manifest(): MetadataRoute.Manifest {
  const defaultLocale: 'ar' | 'en' = 'ar'
  const isArabic = defaultLocale === 'ar'

  return {
    name: isArabic
      ? 'أجار - منصة العقارات'
      : 'Ajar - Real Estate Platform',

    short_name: isArabic ? 'أجار' : 'Ajar',

    description: isArabic
      ? 'منصة شاملة للعقارات في سوريا'
      : 'Comprehensive real estate platform in Syria',

    start_url: '/',
    scope: '/',

    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',

    orientation: 'portrait-primary',

    lang: defaultLocale,
    dir: isArabic ? 'rtl' : 'ltr',

    categories: ['business', 'lifestyle', 'utilities'],

    icons: [
      { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],

    related_applications: [],
    prefer_related_applications: false,
  }
}
