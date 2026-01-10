import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{
        locale: string
        page: string
    }>
}

interface SettingData {
    id: number
    key: string
    value: string
    type: string
    is_settings: boolean
    created_at: string
    updated_at: string
}

interface SettingsResponse {
    success: boolean
    data: SettingData
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale, page } = await params

    const pageTitles: Record<string, { ar: string; en: string }> = {
        policy: {
            ar: 'سياسة الخصوصية',
            en: 'Privacy Policy'
        },
        terms: {
            ar: 'الشروط والأحكام',
            en: 'Terms and Conditions'
        }
    }

    const title = pageTitles[page]?.[locale as 'ar' | 'en'] || page
    const description = locale === 'ar'
        ? `${title} لتطبيق أجار - منصة الإعلانات`
        : `${title} for Ajar App - Classifieds Platform`

    return {
        title: `${title} | أجار`,
        description,
        openGraph: {
            title: `${title} | أجار`,
            description,
            type: 'website',
            locale: locale === 'ar' ? 'ar_SY' : 'en_SY',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | أجار`,
            description,
        },
        alternates: {
            canonical: `https://ajar.com/${locale}/${page}`,
        },
    }
}

/**
 * Unescape HTML string that has escaped quotes
 * Converts \" to " and \\ to \
 */
function unescapeHtml(html: string): string {
    if (!html) return ''

    // Replace escaped quotes and backslashes
    return html
        .replace(/\\"/g, '"')  // Replace \" with "
        .replace(/\\\\/g, '\\') // Replace \\ with \
        .replace(/\\n/g, '\n') // Replace \n with newline
        .replace(/\\t/g, '\t')  // Replace \t with tab
}

/**
 * Basic HTML sanitization to prevent XSS attacks
 * Removes dangerous script tags and event handlers
 * Note: For production, consider using isomorphic-dompurify for comprehensive sanitization
 */
function sanitizeHtml(html: string): string {
    if (!html) return ''

    // Remove script tags and their content
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

    // Remove event handlers (onclick, onerror, etc.)
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')

    // Remove javascript: protocol in href/src
    sanitized = sanitized.replace(/javascript:/gi, '')

    // Remove data: URLs that could contain scripts (allow images)
    sanitized = sanitized.replace(/data:text\/html/gi, '')

    return sanitized
}

/**
 * Server-side fetch function for page content
 */
async function fetchPageContent(page: string, locale: string): Promise<SettingData | null> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ajar-backend.mystore.social/api/v1'
    const settingKey = `${page}-${locale}`

    try {
        const response = await fetch(
            `${baseUrl}/general/settings/${settingKey}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                // next: {
                // revalidate: 60, // Revalidate every 1 minutes
                // },
            }
        )
        if (!response.ok) {
            console.error(`❌ Failed to fetch page content: ${response.status} ${response.statusText}`)
            return null
        }

        const data: SettingsResponse = await response.json()

        if (!data.success || !data.data) {
            console.error('❌ No page content found for key:', settingKey)
            return null
        }

        // Return the setting data
        return data.data
    } catch (error) {
        console.error('❌ Error fetching page content:', error)
        return null
    }
}

/**
 * Dynamic page component with Server-Side Rendering
 */
export default async function DynamicPage({ params }: PageProps) {
    const { locale, page } = await params

    // Fetch page content from API
    const pageContent = await fetchPageContent(page, locale)
    // Error state - return 404 if content not found
    if (!pageContent || !pageContent.value) {
        notFound()
    }

    // Unescape the HTML content (handles escaped quotes from API)
    const unescapedHtml = unescapeHtml(pageContent.value)

    // Sanitize HTML to prevent XSS attacks (defense in depth)
    // Even though content comes from admin panel, we sanitize on frontend too
    const sanitizedHtml = sanitizeHtml(unescapedHtml)

    // Render the HTML content
    // Note: HTML is sanitized to prevent XSS attacks
    // The value field contains HTML with escaped quotes that need to be unescaped
    return (
        <div
            className="min-h-screen/50 page-content px-4 md:px-8 lg:px-12 mx-auto max-w-4xl py-8 my-4 rounded-lg"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    )
}
