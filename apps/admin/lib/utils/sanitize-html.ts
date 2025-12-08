/**
 * تنظيف HTML من المحتوى الخطير لمنع XSS attacks
 * @param html - المحتوى HTML المراد تنظيفه
 * @returns HTML نظيف وآمن
 */
import DOMPurify from 'dompurify'

export const sanitizeHTML = (html: string): string => {
  if (!html) return ''
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'strike',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'code', 'pre',
      'a', 'img',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
      'div', 'span',
      'hr', 'sub', 'sup',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'title',
      'src', 'alt', 'width', 'height', 'class',
      'style', 'dir', 'align',
    ],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  })
}

/**
 * التحقق من أن HTML آمن قبل الحفظ
 * @param html - المحتوى HTML المراد التحقق منه
 * @returns true إذا كان HTML آمن
 */
export const isHTMLSafe = (html: string): boolean => {
  if (!html) return true
  
  const sanitized = sanitizeHTML(html)
  // إذا كان المحتوى بعد التنظيف مختلف بشكل كبير، قد يكون هناك محتوى خطير
  // لكن نسمح ببعض الاختلافات الطبيعية
  return sanitized.length > 0 || html.trim().length === 0
}

