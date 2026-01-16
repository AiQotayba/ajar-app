import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ajar.com'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/admin/',
                '/private/',
                // صفحات إدارة اللغة
                '/ar/api/',
                '/en/api/',
            ],
        },
        sitemap: [
            `${baseUrl}/sitemap.xml`,
            `${baseUrl}/ar/sitemap.xml`,
            `${baseUrl}/en/sitemap.xml`,
        ],
        host: baseUrl,
    }
}