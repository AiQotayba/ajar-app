/**
 * إعدادات Tiptap Extensions
 * يتم استخدامها لإنشاء المحرر مع الميزات المطلوبة
 */
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import type { Extensions } from '@tiptap/react'

/**
 * الحصول على Extensions بناءً على نوع المحرر
 * @param mode - نوع المحرر: 'html' للميزات الكاملة، 'text' للمحرر المبسط
 * @param placeholder - نص توضيحي للمحرر
 * @returns مصفوفة Extensions
 */
export const getTiptapExtensions = (
  mode: 'html' | 'text' = 'text',
  placeholder: string = 'ابدأ الكتابة...'
): Extensions => {
  const baseExtensions: Extensions = [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      defaultAlignment: 'right', // RTL default
    }),
    Placeholder.configure({
      placeholder,
    }),
  ]

  // إضافة ميزات HTML فقط في وضع html
  if (mode === 'html') {
    return [
      ...baseExtensions,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
    ]
  }

  return baseExtensions
}

