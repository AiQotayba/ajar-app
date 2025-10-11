import { MetadataRoute } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function manifest(props: Props): Promise<MetadataRoute.Manifest> {
  const params = await props.params
  const { locale } = params
  
  const isArabic = locale === 'ar'

  return {
    name: isArabic ? 'أجار - منصة العقارات' : 'Ajar - Real Estate Platform',
    short_name: isArabic ? 'أجار' : 'Ajar',
    description: isArabic 
      ? 'منصة شاملة للعقارات في سوريا'
      : 'Comprehensive real estate platform in Syria',
    start_url: `/${locale}`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    orientation: 'portrait',
    scope: `/${locale}`,
    lang: locale,
    dir: isArabic ? 'rtl' : 'ltr',
    categories: ['business', 'lifestyle', 'utilities'],
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: isArabic ? [
      {
        name: 'البحث عن عقار',
        short_name: 'بحث',
        description: 'ابحث عن العقارات المتاحة',
        url: `/${locale}/search`,
        icons: [{ src: '/icons/search.png', sizes: '96x96' }],
      },
      {
        name: 'إضافة إعلان',
        short_name: 'إضافة',
        description: 'أضف إعلان عقاري جديد',
        url: `/${locale}/listings/add`,
        icons: [{ src: '/icons/add.png', sizes: '96x96' }],
      },
    ] : [
      {
        name: 'Search Properties',
        short_name: 'Search',
        description: 'Search for available properties',
        url: `/${locale}/search`,
        icons: [{ src: '/icons/search.png', sizes: '96x96' }],
      },
      {
        name: 'Add Listing',
        short_name: 'Add',
        description: 'Add a new property listing',
        url: `/${locale}/listings/add`,
        icons: [{ src: '/icons/add.png', sizes: '96x96' }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  }
}

