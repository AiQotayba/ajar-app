"use client"

import { toast } from "sonner"

interface ShareContentData {
  title: { ar: string; en: string } | string
  price?: number
  currency?: string
  type?: 'rent' | 'sale'
  category?: { name: { ar: string; en: string } }
  location?: string
  governorate?: { name: { ar: string; en: string } }
  city?: { name: { ar: string; en: string } } | null
  area?: number
  bedrooms?: number
  bathrooms?: number
  latitude?: string | number
  longitude?: string | number
  listingUrl: string
  imageUrl?: string
  locale?: string
}

interface ShareContentOptions {
  data: ShareContentData
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export async function shareContent({ data, onSuccess, onError }: ShareContentOptions) {
  const locale = data.locale || 'ar'
  const isArabic = locale === 'ar'

  // Helper to get localized text
  const getLocalizedText = (text: { ar: string; en: string } | string | undefined): string => {
    if (!text) return ''
    if (typeof text === 'string') return text
    return text[locale as keyof typeof text] || text.ar || ''
  }

  const displayTitle = getLocalizedText(data.title)
  const categoryName = data.category ? getLocalizedText(data.category.name) : ''
  const typeText = data.type === 'rent' ? (isArabic ? 'إيجار' : 'Rent') : (isArabic ? 'بيع' : 'Sale')
  
  // Build location string
  let location = data.location || ''
  if (!location && (data.city || data.governorate)) {
    if (data.city) {
      location = `${getLocalizedText(data.city.name)}, ${getLocalizedText(data.governorate?.name)}`
    } else {
      location = getLocalizedText(data.governorate?.name)
    }
  }

  // Build Google Maps URL if coordinates are available
  let mapsUrl = ''
  if (data.latitude && data.longitude) {
    mapsUrl = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`
  }

  // Build share text
  let shareText = ''
  if (isArabic) {
    shareText = `🏡 مشاركة من تطبيق أجار
━━━━━━━━━━━━━━━━━━━━

📋 ${displayTitle}${categoryName ? ` في ${categoryName}` : ''}
🏷 ${typeText}

${data.price ? `💰 السعر: ${data.price.toLocaleString()} ${data.currency || ''}

` : ''}${location ? `📍 موقع الإعلان: ${location}

` : ''}${(data.area || data.bedrooms || data.bathrooms) ? `✨ المواصفات:
${data.area ? `   • المساحة: ${data.area}` : ''}
${data.bedrooms ? `   • عدد الغرف: ${data.bedrooms}` : ''}
${data.bathrooms ? `   • عدد الحمامات: ${data.bathrooms}` : ''}

` : ''}━━━━━━━━━━━━━━━━━━━━

🔗 عرض التفاصيل:
${data.listingUrl}
${mapsUrl ? `\n📍 عرض على الخريطة:\n${mapsUrl}\n` : ''}━━━━━━━━━━━━━━━━━━━━
اكتشف المزيد من العقارات على تطبيق أجار
حمّل التطبيق الآن 📲

#أجار #عقارات #${typeText}`
  } else {
    shareText = `🏡 Share from Ajar App
━━━━━━━━━━━━━━━━━━━━

📋 ${displayTitle}${categoryName ? ` in ${categoryName}` : ''}
🏷 ${typeText}

${data.price ? `💰 Price: ${data.price.toLocaleString()} ${data.currency || ''}

` : ''}${location ? `📍 Location: ${location}

` : ''}${(data.area || data.bedrooms || data.bathrooms) ? `✨ Specifications:
${data.area ? `   • Area: ${data.area}` : ''}
${data.bedrooms ? `   • Bedrooms: ${data.bedrooms}` : ''}
${data.bathrooms ? `   • Bathrooms: ${data.bathrooms}` : ''}

` : ''}━━━━━━━━━━━━━━━━━━━━

🔗 View Details:
${data.listingUrl}
${mapsUrl ? `\n📍 View on Map:\n${mapsUrl}\n` : ''}━━━━━━━━━━━━━━━━━━━━
Discover more properties on Ajar App
Download the app now 📲

#Ajar #Properties #${typeText}`
  }

  // Check if Web Share API is available
  if (navigator.share) {
    try {
      // Share text only (no image)
      const shareData: ShareData = {
        title: displayTitle,
        text: shareText, // URL is already included in shareText
      }

      await navigator.share(shareData)
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      // If user cancels, don't show error
      if (error.name === 'AbortError') {
        return
      }
      
      console.error('Error sharing:', error)
      
      // Fallback to copying text
      try {
        await navigator.clipboard.writeText(shareText)
        toast.success(isArabic ? 'تم نسخ المحتوى' : 'Content copied')
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError)
        if (onError) {
          onError(error)
        } else {
          toast.error(isArabic ? 'حدث خطأ في المشاركة' : 'Error sharing')
        }
      }
    }
  } else {
    // Fallback to copying formatted text
    try {
      await navigator.clipboard.writeText(shareText)
      toast.success(isArabic ? 'تم نسخ المحتوى' : 'Content copied')
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      if (onError) {
        onError(error as Error)
      } else {
        toast.error(isArabic ? 'حدث خطأ في نسخ المحتوى' : 'Error copying content')
      }
    }
  }
}

