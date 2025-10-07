# حل مشكلة Vercel - pnpm Version

## المشكلة الأصلية
```
ERR_PNPM_UNSUPPORTED_ENGINE Unsupported environment (bad pnpm and/or Node.js version)
Your pnpm version is incompatible with "/vercel/path0".
Expected version: >=8.0.0
Got: 6.35.1
```

## الحل النهائي

### 1. ملف `vercel.json` محدث
```json
{
    "version": 2,
    "buildCommand": "cd apps/web && cp package-simple.json package.json && cp next.config.vercel.mjs next.config.mjs && rm -f .npmrc && npm install && npm run build",
    "outputDirectory": "apps/web/.next",
    "installCommand": "echo 'Using custom build process'",
    "framework": "nextjs",
    "builds": [
        {
            "src": "apps/web/package-simple.json",
            "use": "@vercel/next"
        }
    ],
    "routes": [
        {
            "src": "/(.*)",
            "dest": "apps/web/$1"
        }
    ]
}
```

### 2. ملف `apps/web/package-simple.json`
- نسخة مبسطة من package.json بدون قيود pnpm
- بدون `engines.pnpm` constraint
- بدون مراجع لـ `@useApi` package
- يستخدم npm بدلاً من pnpm

### 3. ملف `apps/web/next.config.vercel.mjs`
- نسخة مبسطة من next.config.mjs
- بدون `transpilePackages: ['@useApi']`
- بدون `outputFileTracingRoot` للـ monorepo

### 4. عملية البناء
1. **نسخ الملفات**: نسخ `package-simple.json` إلى `package.json`
2. **نسخ التكوين**: نسخ `next.config.vercel.mjs` إلى `next.config.mjs`
3. **حذف .npmrc**: إزالة ملف `.npmrc` لتجنب workspace conflicts
4. **تثبيت التبعيات**: استخدام `npm install`
5. **البناء**: استخدام `npm run build`

## الملفات المطلوبة

### في المجلد الرئيسي:
- `vercel.json` - إعدادات Vercel

### في `apps/web/`:
- `package-simple.json` - package.json مبسط للبناء
- `next.config.vercel.mjs` - next.config مبسط للبناء
- `.vercelignore` - ملفات مستبعدة من النشر

## خطوات النشر

### 1. النشر المحلي
```bash
# اختبار البناء
cd apps/web
cp package-simple.json package.json
cp next.config.vercel.mjs next.config.mjs
rm -f .npmrc
npm install
npm run build

# نشر على Vercel
vercel --prod
```

### 2. النشر التلقائي
- ربط المشروع بـ GitHub
- Vercel سيقوم بالبناء تلقائياً
- استخدام `buildCommand` المحدد في `vercel.json`

## المزايا

1. **تجنب مشاكل pnpm**: استخدام npm بدلاً من pnpm
2. **بناء مستقل**: لا يعتمد على monorepo structure
3. **ملفات منفصلة**: ملفات خاصة بالبناء على Vercel
4. **عملية مبسطة**: خطوات واضحة ومباشرة

## استكشاف الأخطاء

### إذا فشل البناء:
1. تأكد من وجود جميع الملفات المطلوبة
2. تحقق من صحة `package-simple.json`
3. تأكد من عدم وجود مراجع لـ `@useApi`
4. تحقق من logs في Vercel Dashboard

### إذا ظهرت أخطاء التبعيات:
1. تأكد من حذف `.npmrc`
2. تحقق من عدم وجود workspace references
3. استخدم `npm install` بدلاً من `pnpm install`

## النتيجة النهائية

✅ **تم حل المشكلة بنجاح!**
- البناء يعمل على Vercel
- لا توجد مشاكل pnpm
- العملية مبسطة وموثوقة
- يمكن النشر تلقائياً من GitHub
