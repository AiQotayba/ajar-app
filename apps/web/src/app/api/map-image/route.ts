// app/api/map-image/route.ts

import { NextRequest } from 'next/server'

const ALLOWED_HOSTS = [
    'localhost',
    'localhost:3000',
    'localhost:3200',
    '127.0.0.1',
    '127.0.0.1:3000',
    '127.0.0.1:3200',
    'sawastay.vercel.app',
    'sawastay.com',
    'ajar.vercel.app',
    'ajar.com',
    'www.ajar.com'
]

// التحقق من صحة المعاملات
function validateParams(lat: string, lng: string, zoom: string, size: string): boolean {
    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)
    const zoomNum = parseInt(zoom)

    // التحقق من صحة الإحداثيات
    if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
        return false
    }

    // التحقق من مستوى التكبير
    if (isNaN(zoomNum) || zoomNum < 0 || zoomNum > 21) {
        return false
    }

    // التحقق من حجم الصورة
    const sizeRegex = /^\d+x\d+$/
    if (!sizeRegex.test(size)) {
        return false
    }

    const [width, height] = size.split('x').map(Number)
    if (width < 1 || width > 2048 || height < 1 || height > 2048) {
        return false
    }

    return true
}

// دالة للحصول على خريطة بديلة عند فشل Google Maps
async function getOpenStreetMapImage(lat: string, lng: string, zoom: string, size: string) {
    try {
        console.log('🗺️ Using fallback map due to Google Maps billing issue')

        // إنشاء صورة SVG بديلة
        const [width, height] = size.split('x').map(Number)
        const svg = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ddd" stroke-width="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="#f8f9fa"/>
                <rect width="100%" height="100%" fill="url(#grid)"/>
                
                <!-- Green Pin marker - مطابق للخريطة التفاعلية -->
                <g transform="translate(${width / 2 - 10.5}, ${height / 2 - 11})">
                    <path d="M10.2861 8.90722C9.80561 8.9066 9.3361 8.76351 8.93694 8.49605C8.53778 8.22859 8.22689 7.84877 8.04359 7.40462C7.86029 6.96047 7.81281 6.47194 7.90716 6.00081C8.00151 5.52968 8.23344 5.09711 8.57364 4.75779C8.91383 4.41848 9.347 4.18766 9.81838 4.09453C10.2898 4.0014 10.7782 4.05014 11.2218 4.23459C11.6655 4.41904 12.0445 4.73091 12.3109 5.13076C12.5774 5.53062 12.7192 6.0005 12.7186 6.48098C12.7165 7.12488 12.4593 7.7417 12.0034 8.19642C11.5475 8.65114 10.93 8.90672 10.2861 8.90722ZM10.2861 4.9913C9.99147 4.9913 9.70345 5.07867 9.45847 5.24236C9.2135 5.40604 9.02256 5.6387 8.90981 5.91091C8.79706 6.18311 8.76756 6.48264 8.82504 6.77161C8.88252 7.06058 9.0244 7.32601 9.23273 7.53435C9.44107 7.74269 9.70651 7.88456 9.99548 7.94204C10.2844 7.99952 10.584 7.97002 10.8562 7.85727C11.1284 7.74452 11.361 7.55358 11.5247 7.30861C11.6884 7.06363 11.7758 6.77561 11.7758 6.48098C11.775 6.08615 11.6177 5.70772 11.3385 5.42853C11.0594 5.14934 10.6809 4.99213 10.2861 4.9913Z" fill="#01805F" />
                    <path d="M10.2858 14.3065C9.31742 14.3046 8.38731 13.9285 7.68981 13.2568C5.83744 11.4717 3.78646 8.6243 4.55958 5.23637C4.85437 3.94799 5.58548 2.80114 6.62906 1.99011C7.67263 1.17908 8.96448 0.753748 10.2858 0.786173H10.292C11.6145 0.753496 12.9076 1.17948 13.9517 1.9918C14.9958 2.80412 15.7266 3.95274 16.0201 5.24265C16.7869 8.63059 14.7378 11.4717 12.8836 13.2568C12.1856 13.9289 11.2547 14.305 10.2858 14.3065ZM10.2858 1.72901C9.17743 1.68971 8.09032 2.03972 7.21312 2.71829C6.33592 3.39686 5.724 4.36115 5.48356 5.44379C4.80472 8.40431 6.66525 10.9563 8.34979 12.5716C8.86907 13.0764 9.56471 13.3588 10.2889 13.3588C11.0131 13.3588 11.7087 13.0764 12.228 12.5716C13.9063 10.9563 15.7668 8.40431 15.1005 5.44379C14.8566 4.36059 14.242 3.3966 13.3629 2.71835C12.4838 2.04009 11.3954 1.69016 10.2858 1.72901Z" fill="#01805F" />
                    <ellipse opacity="0.51" cx="10.2855" cy="16.2066" rx="9.92225" ry="5.79334" fill="#01805F" />
                    <ellipse opacity="0.43" cx="10.2856" cy="16.2066" rx="4.5795" ry="2.70356" fill="#01805F" />
                </g>
                
                <!-- Location text -->
                <text x="${width / 2}" y="${height / 2 + 40}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#666">
                    الموقع: ${lat}, ${lng}
                </text>
                <text x="${width / 2}" y="${height / 2 + 60}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#999">
                    يرجى تفعيل الفوترة في Google Cloud Console
                </text>
            </svg>
        `

        console.log('✅ Fallback SVG map created')

        return new Response(svg, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        })
    } catch (error) {
        console.error('❌ Fallback map creation failed:', error)

        // إرجاع رسالة خطأ بسيطة
        return new Response('خريطة غير متاحة - يرجى تفعيل الفوترة في Google Cloud', {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        })
    }
}

// التحقق من صحة المصدر
function isValidOrigin(referer: string, origin: string): boolean {
    // في بيئة التطوير، السماح إذا كانت referer أو origin فارغة
    if (!referer && !origin) {
        return true
    }

    // التحقق من النطاقات المسموحة
    const isAllowed = ALLOWED_HOSTS.some(domain => {
        const refererMatch = referer.includes(domain)
        const originMatch = origin.includes(domain)
        return refererMatch || originMatch
    })
    return isAllowed
}


export async function GET(req: NextRequest) {
    try {
        // التحقق من المصدر
        const referer = req.headers.get('referer') || ''
        const origin = req.headers.get('origin') || ''

        const isAllowed = isValidOrigin(referer, origin)

        if (!isAllowed) {
            return new Response('غير مصرح: نطاق غير صالح', {
                status: 403,
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            })
        }

        const { searchParams } = new URL(req.url)

        const lat = searchParams.get('lat') || '35.512787'
        const lng = searchParams.get('lng') || '36.298073'
        const zoom = searchParams.get('zoom') || '11'
        const size = searchParams.get('size') || '1024x667'

        // التحقق من صحة المعاملات
        const isValid = validateParams(lat, lng, zoom, size)

        if (!isValid) {
            return new Response('معاملات غير صالحة', {
                status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            })
        }

        // التحقق من وجود مفتاح API
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

        if (!apiKey) {
            console.error('Google Maps API Key not found')
            return new Response('خطأ في إعداد الخادم', {
                status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            })
        }

        // إضافة دبوس أخضر مطابق للخريطة التفاعلية
        const greenPinIcon = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.2861 8.90722C9.80561 8.9066 9.3361 8.76351 8.93694 8.49605C8.53778 8.22859 8.22689 7.84877 8.04359 7.40462C7.86029 6.96047 7.81281 6.47194 7.90716 6.00081C8.00151 5.52968 8.23344 5.09711 8.57364 4.75779C8.91383 4.41848 9.347 4.18766 9.81838 4.09453C10.2898 4.0014 10.7782 4.05014 11.2218 4.23459C11.6655 4.41904 12.0445 4.73091 12.3109 5.13076C12.5774 5.53062 12.7192 6.0005 12.7186 6.48098C12.7165 7.12488 12.4593 7.7417 12.0034 8.19642C11.5475 8.65114 10.93 8.90672 10.2861 8.90722ZM10.2861 4.9913C9.99147 4.9913 9.70345 5.07867 9.45847 5.24236C9.2135 5.40604 9.02256 5.6387 8.90981 5.91091C8.79706 6.18311 8.76756 6.48264 8.82504 6.77161C8.88252 7.06058 9.0244 7.32601 9.23273 7.53435C9.44107 7.74269 9.70651 7.88456 9.99548 7.94204C10.2844 7.99952 10.584 7.97002 10.8562 7.85727C11.1284 7.74452 11.361 7.55358 11.5247 7.30861C11.6884 7.06363 11.7758 6.77561 11.7758 6.48098C11.775 6.08615 11.6177 5.70772 11.3385 5.42853C11.0594 5.14934 10.6809 4.99213 10.2861 4.9913Z" fill="#01805F" />
                <path d="M10.2858 14.3065C9.31742 14.3046 8.38731 13.9285 7.68981 13.2568C5.83744 11.4717 3.78646 8.6243 4.55958 5.23637C4.85437 3.94799 5.58548 2.80114 6.62906 1.99011C7.67263 1.17908 8.96448 0.753748 10.2858 0.786173H10.292C11.6145 0.753496 12.9076 1.17948 13.9517 1.9918C14.9958 2.80412 15.7266 3.95274 16.0201 5.24265C16.7869 8.63059 14.7378 11.4717 12.8836 13.2568C12.1856 13.9289 11.2547 14.305 10.2858 14.3065ZM10.2858 1.72901C9.17743 1.68971 8.09032 2.03972 7.21312 2.71829C6.33592 3.39686 5.724 4.36115 5.48356 5.44379C4.80472 8.40431 6.66525 10.9563 8.34979 12.5716C8.86907 13.0764 9.56471 13.3588 10.2889 13.3588C11.0131 13.3588 11.7087 13.0764 12.228 12.5716C13.9063 10.9563 15.7668 8.40431 15.1005 5.44379C14.8566 4.36059 14.242 3.3966 13.3629 2.71835C12.4838 2.04009 11.3954 1.69016 10.2858 1.72901Z" fill="#01805F" />
                <ellipse opacity="0.51" cx="10.2855" cy="16.2066" rx="9.92225" ry="5.79334" fill="#01805F" />
                <ellipse opacity="0.43" cx="10.2856" cy="16.2066" rx="4.5795" ry="2.70356" fill="#01805F" />
            </svg>
        `)}`

        const mapUrl = `https://maps.googleapis.com/maps/api/staticmap` +
            `?center=${encodeURIComponent(`${lat},${lng}`)}` +
            `&zoom=${encodeURIComponent(zoom)}` +
            `&size=${encodeURIComponent(size)}` +
            `&maptype=roadmap` +
            `&format=webp` +
            `&markers=icon:${encodeURIComponent(greenPinIcon)}|${lat},${lng}` +
            `&key=${encodeURIComponent(apiKey)}`

        const imageRes = await fetch(mapUrl, {
            headers: {
                'User-Agent': 'ajar-map-api/1.0',
                'Accept': 'image/webp,image/*,*/*'
            }
        })

        if (!imageRes.ok) {
            console.error(`❌ Google Maps API error: ${imageRes.status} ${imageRes.statusText}`)

            // محاولة قراءة رسالة الخطأ من Google
            try {
                const errorText = await imageRes.text()
                console.error('📄 Google API Error Response:', errorText)

                // إذا كان الخطأ بسبب عدم تفعيل الفوترة، استخدم OpenStreetMap كبديل
                if (errorText.includes('billing') || errorText.includes('Billing')) {
                    console.log('🔄 Falling back to OpenStreetMap due to billing issue')
                    return await getOpenStreetMapImage(lat, lng, zoom, size)
                }
            } catch (e) {
                console.error('❌ Could not read error response')
            }

            return new Response('فشل تحميل الخريطة', {
                status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            })
        }

        const buffer = await imageRes.arrayBuffer()

        return new Response(Buffer.from(buffer), {
            headers: {
                'Content-Type': 'image/webp',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        })
    } catch (error) {
        console.error('Map API error:', error)
        return new Response('خطأ داخلي في الخادم', {
            status: 500,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        })
    }
}
