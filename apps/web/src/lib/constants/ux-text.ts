/**
 * UX Text Constants
 * Centralized text content for consistent user experience
 */

export const UX_TEXT = {
  // Common Actions
  LOADING: {
    ar: 'جاري التحميل...',
    en: 'Loading...'
  },
  SUCCESS: {
    ar: 'تم بنجاح',
    en: 'Success'
  },
  ERROR: {
    ar: 'تعذر',
    en: 'Unable to'
  },
  DELETE: {
    ar: 'حذف',
    en: 'delete'
  },
  UPDATE: {
    ar: 'تحديث',
    en: 'update'
  },

  // Property Related
  PROPERTY: {
    FEATURED: {
      ar: 'مميز',
      en: 'Featured'
    },
    FURNISHED: {
      ar: 'مفروش',
      en: 'Furnished'
    },
    UNFURNISHED: {
      ar: 'غير مفروش',
      en: 'Unfurnished'
    },
    MONTHLY: {
      ar: 'شهرياً',
      en: 'monthly'
    },
    INSURANCE: {
      ar: 'تأمين',
      en: 'Insurance'
    },
    LOCATION: {
      ar: 'الموقع',
      en: 'Location'
    },
    NO_COORDINATES: {
      ar: 'لا توجد إحداثيات متاحة',
      en: 'No coordinates available'
    }
  },

  // Reviews
  REVIEWS: {
    TITLE: {
      ar: 'تقييمات العملاء',
      en: 'Customer Reviews'
    },
    SINGLE: {
      ar: 'تقييم',
      en: 'review'
    },
    PLURAL: {
      ar: 'تقييمات',
      en: 'reviews'
    },
    NO_REVIEWS: {
      ar: 'لا توجد تقييمات',
      en: 'No reviews yet'
    },
    BE_FIRST: {
      ar: 'كن أول من يقيم!',
      en: 'Be the first to review!'
    },
    SHARE_EXPERIENCE: {
      ar: 'شارك تجربتك',
      en: 'Share Your Experience'
    },
    VERIFIED: {
      ar: 'موثق',
      en: 'Verified'
    },
    HELPFUL: {
      ar: 'مفيد',
      en: 'Helpful'
    },
    SHARE: {
      ar: 'مشاركة',
      en: 'Share'
    },
    DELETE_CONFIRM: {
      ar: 'هل أنت متأكد من حذف هذا التقييم؟',
      en: 'Are you sure you want to delete this review?'
    }
  },

  // Stats
  STATS: {
    VIEWS: {
      ar: 'مشاهدة',
      en: 'view'
    },
    FAVORITES: {
      ar: 'إعجاب',
      en: 'favorite'
    }
  },

  // WhatsApp
  WHATSAPP: {
    CONTACT: {
      ar: 'تواصل واتساب',
      en: 'WhatsApp Contact'
    },
    MESSAGE: {
      ar: 'مرحباً، أود الاستفسار عن العقار',
      en: 'Hello, I would like to inquire about the property'
    }
  },

  // Images
  IMAGES: {
    NO_IMAGE: {
      ar: 'لا توجد صورة',
      en: 'No Image Available'
    },
    LOADING: {
      ar: 'جاري التحميل...',
      en: 'Loading...'
    },
    NO_IMAGES: {
      ar: 'لا توجد صور متاحة',
      en: 'No images available'
    }
  },

  // Actions
  ACTIONS: {
    EDIT: {
      ar: 'تعديل الإعلان',
      en: 'Edit Listing'
    },
    DELETE: {
      ar: 'حذف الإعلان',
      en: 'Delete Listing'
    },
    DELETING: {
      ar: 'جاري الحذف...',
      en: 'Deleting...'
    }
  }
} as const

/**
 * Helper function to get localized text
 */
export const getLocalizedText = (
  key: keyof typeof UX_TEXT,
  locale: 'ar' | 'en' = 'ar'
): string => {
  const text = UX_TEXT[key]
  if (typeof text === 'object' && 'ar' in text && 'en' in text) {
    return text[locale]
  }
  return String(text)
}

/**
 * Helper function to get nested localized text
 */
export const getNestedLocalizedText = (
  category: keyof typeof UX_TEXT,
  key: string,
  locale: 'ar' | 'en' = 'ar'
): string => {
  const categoryText = UX_TEXT[category] as any
  if (categoryText && categoryText[key]) {
    return categoryText[key][locale]
  }
  return key
}

/**
 * Helper function to get pluralized text
 */
export const getPluralizedText = (
  count: number,
  singular: { ar: string; en: string },
  plural: { ar: string; en: string },
  locale: 'ar' | 'en' = 'ar'
): string => {
  const text = count === 1 ? singular : plural
  return text[locale]
}
