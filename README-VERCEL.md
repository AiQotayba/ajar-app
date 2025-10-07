# Vercel Deployment Guide

هذا الدليل يوضح كيفية نشر تطبيق Ajar Platform على Vercel.

## المشكلة الأصلية

كانت المشكلة أن Vercel يستخدم pnpm 6.35.1 بينما المشروع يتطلب pnpm >=8.0.0.

## الحلول المطبقة

### 1. ملف `package-vercel.json`
تم إنشاء ملف منفصل للبناء على Vercel بدون قيود pnpm:
- يحتوي على جميع التبعيات المطلوبة
- بدون `engines.pnpm` constraint
- يستخدم npm بدلاً من pnpm

### 2. ملف `vercel-build.js`
Script مبسط للبناء على Vercel:
- ينتقل إلى مجلد `apps/web`
- ينسخ `package-vercel.json` إلى `package.json`
- يستخدم npm للبناء
- يتجنب مشاكل pnpm

### 3. ملف `vercel.json` محدث
```json
{
  "version": 2,
  "buildCommand": "node vercel-build.js",
  "outputDirectory": "apps/web/.next",
  "installCommand": "echo 'Using custom build process'",
  "framework": "nextjs"
}
```

## خطوات النشر

### 1. النشر المحلي
```bash
# اختبار البناء محلياً
node vercel-build.js

# نشر على Vercel
vercel --prod
```

### 2. النشر التلقائي
- ربط المشروع بـ GitHub
- Vercel سيقوم بالبناء تلقائياً عند push
- استخدام `vercel-build.js` للبناء

## الملفات المهمة

- `vercel.json` - إعدادات Vercel
- `vercel-build.js` - Script البناء
- `apps/web/package-vercel.json` - package.json للبناء
- `apps/web/.vercelignore` - ملفات مستبعدة من النشر

## استكشاف الأخطاء

### مشكلة pnpm
إذا ظهرت رسالة خطأ حول pnpm:
```bash
ERR_PNPM_UNSUPPORTED_ENGINE Unsupported environment
```

الحل: استخدام `vercel-build.js` الذي يتجنب pnpm تماماً.

### مشكلة التبعيات
إذا فشل تثبيت التبعيات:
- تأكد من وجود `package-vercel.json`
- تأكد من صحة مسارات الملفات

### مشكلة البناء
إذا فشل البناء:
- تأكد من وجود `next.config.mjs`
- تأكد من صحة إعدادات Next.js

## نصائح للأداء

1. **استخدام .vercelignore**: استبعد الملفات غير الضرورية
2. **تحسين الصور**: استخدم `next/image` للصور
3. **Code Splitting**: Next.js يقوم به تلقائياً
4. **Caching**: Vercel يوفر caching تلقائي

## متغيرات البيئة

تأكد من إعداد المتغيرات التالية في Vercel:

```env
NEXT_PUBLIC_API_URL=https://api.ajar.com/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
NEXT_PUBLIC_DEFAULT_LOCALE=ar
NEXT_PUBLIC_SUPPORTED_LOCALES=en,ar
```

## الدعم

إذا واجهت مشاكل:
1. تحقق من logs في Vercel Dashboard
2. تأكد من صحة `vercel-build.js`
3. اختبر البناء محلياً أولاً
