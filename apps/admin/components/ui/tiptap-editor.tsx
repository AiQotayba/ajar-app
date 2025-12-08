"use client"

import * as React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import { getTiptapExtensions } from "./tiptap-extensions"
import { TiptapToolbar } from "./tiptap-toolbar"
import { sanitizeHTML } from "@/lib/utils/sanitize-html"
import { cn } from "@/lib/utils"

export interface TiptapEditorProps {
  /**
   * القيمة الحالية للمحرر (HTML string)
   */
  value: string
  /**
   * Callback يتم استدعاؤه عند تغيير المحتوى
   */
  onChange: (value: string) => void
  /**
   * نص توضيحي يظهر عندما يكون المحرر فارغاً
   */
  placeholder?: string
  /**
   * نوع المحرر: 'html' للميزات الكاملة، 'text' للمحرر المبسط
   */
  mode?: 'html' | 'text'
  /**
   * ارتفاع المحرر
   */
  height?: string
  /**
   * تعطيل المحرر
   */
  disabled?: boolean
  /**
   * CSS classes إضافية
   */
  className?: string
}

export function TiptapEditor({
  value,
  onChange,
  placeholder = 'ابدأ الكتابة...',
  mode = 'text',
  height = '300px',
  disabled = false,
  className,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: getTiptapExtensions(mode, placeholder),
    content: value || '',
    editable: !disabled,
    immediatelyRender: false, // منع SSR hydration mismatch
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl',
          'max-w-none focus:outline-none',
          'min-h-[200px] p-4',
          'prose-headings:font-bold',
          'prose-p:my-2',
          'prose-ul:my-2',
          'prose-ol:my-2',
          'prose-li:my-1',
          'prose-blockquote:border-r-4 prose-blockquote:border-r-primary',
          'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
          'prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg',
          'prose-a:text-primary prose-a:underline',
          'prose-img:rounded-lg prose-img:max-w-full prose-img:h-auto',
          '[&_*]:text-right', // RTL support
        ),
        dir: 'rtl',
        style: `min-height: ${height}`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      // تنظيف HTML قبل الإرسال
      const sanitized = sanitizeHTML(html)
      onChange(sanitized)
    },
  })

  // تحديث المحتوى عند تغيير value من الخارج
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      const sanitized = sanitizeHTML(value || '')
      editor.commands.setContent(sanitized, { emitUpdate: false })
    }
  }, [value, editor])

  // تحديث حالة المحرر عند تغيير disabled
  React.useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  if (!editor) {
    return (
      <div className={cn(
        "border rounded-lg overflow-hidden",
        "min-h-[200px] flex items-center justify-center",
        "bg-muted/50",
        className
      )}>
        <p className="text-sm text-muted-foreground">جاري تحميل المحرر...</p>
      </div>
    )
  }

  return (
    <div className={cn(
      "border rounded-lg overflow-hidden",
      "bg-background",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}>
      <TiptapToolbar editor={editor} mode={mode} />
      <EditorContent
        editor={editor}
        className={cn(
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          "transition-all"
        )}
      />
    </div>
  )
}

