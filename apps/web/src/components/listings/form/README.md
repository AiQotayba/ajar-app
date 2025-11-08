# Listing Form Component

فورم متقدم لإنشاء وتعديل الإعلانات العقارية مع دعم التصنيفات المتدرجة والتحقق من البيانات.

## المميزات

- ✅ **React Hook Form** - إدارة حالة الفورم المتقدمة
- ✅ **Zod Validation** - التحقق من البيانات مع رسائل خطأ واضحة
- ✅ **TanStack Query** - إدارة البيانات والـ caching
- ✅ **Multi-step Form** - فورم متعدد الخطوات مع مؤشر التقدم
- ✅ **Category Hierarchy** - تصنيفات متدرجة (رئيسي → فرعي → فرعي للفرعي)
- ✅ **Dynamic Properties** - خصائص ديناميكية بناءً على التصنيف
- ✅ **Image Upload** - رفع صور متعدد مع معاينة
- ✅ **RTL Support** - دعم كامل للغة العربية
- ✅ **TypeScript** - كتابة آمنة مع TypeScript

## الهيكل

```
src/components/listings/form/
├── index.ts                    # ملف التصدير الرئيسي
├── types.ts                   # الأنواع والـ schemas
├── listing-form.tsx           # الفورم الرئيسي
├── example.tsx                # أمثلة الاستخدام
├── README.md                  # هذا الملف
├── components/
│   ├── step-indicator.tsx     # مؤشر الخطوات
│   ├── success-modal.tsx      # نافذة النجاح
│   └── image-upload.tsx       # مكون رفع الصور
└── steps/
    ├── basic-info-step.tsx    # الخطوة 1: البيانات الأساسية
    ├── location-step.tsx      # الخطوة 2: الموقع
    ├── images-step.tsx        # الخطوة 3: الصور
    ├── price-step.tsx         # الخطوة 4: السعر
    └── review-step.tsx        # الخطوة 5: المراجعة
```

## الاستخدام

### إنشاء إعلان جديد

```tsx
import { ListingForm } from "@/components/listings/form"

export function CreateListingPage() {
  const handleSuccess = (data: any) => { 
    // إعادة توجيه أو إظهار رسالة نجاح
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ListingForm
        isEditing={false}
        onSuccess={handleSuccess}
        onCancel={() => window.history.back()}
      />
    </div>
  )
}
```

### تعديل إعلان موجود

```tsx
import { ListingForm } from "@/components/listings/form"

export function EditListingPage({ listingId }: { listingId: string }) {
  const handleSuccess = (data: any) => { 
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ListingForm
        isEditing={true}
        listingId={listingId}
        onSuccess={handleSuccess}
        onCancel={() => window.history.back()}
      />
    </div>
  )
}
```

## الخطوات الخمس

### 1. البيانات الأساسية
- العنوان (عربي/إنجليزي)
- الوصف (عربي/إنجليزي)
- نوع العقار
- التصنيفات المتدرجة
- خصائص العقار (ديناميكية)
- مميزات العقار (ديناميكية)

### 2. الموقع
- المحافظة
- المدينة
- الإحداثيات (خط العرض/الطول)

### 3. الصور
- رفع صور متعدد (حد أقصى 20)
- اختيار صورة الغلاف
- معاينة فورية

### 4. السعر والتوفر
- السعر
- العملة
- حالة التوفر
- حالة الإعلان

### 5. المراجعة
- عرض جميع البيانات
- إمكانية التعديل على خطوات محددة
- إرسال النهائي

## APIs المطلوبة

```typescript
// التصنيفات
GET /user/categories                    // التصنيفات الرئيسية
GET /user/categories?parent_id={id}     // التصنيفات الفرعية
GET /user/categories/{id}               // تفاصيل التصنيف مع الخصائص

// المحافظات والمدن
GET /user/governorates                  // المحافظات
GET /user/cities?governorate_id={id}    // المدن

// الإعلانات
POST /user/listings                     // إنشاء إعلان
PUT /user/listings/{id}                 // تحديث إعلان
GET /user/listings/{id}                 // جلب إعلان للتعديل

// رفع الصور
POST /upload/image                      // رفع صورة
```

## التكوين

### Environment Variables

```env
NEXT_PUBLIC_API_URL=https://ajar-backend.mystore.social/api/v1
```

### Dependencies المطلوبة

```json
{
  "react-hook-form": "^7.x",
  "@hookform/resolvers": "^3.x",
  "zod": "^3.x",
  "@tanstack/react-query": "^5.x",
  "sonner": "^1.x"
}
```

## التخصيص

### إضافة حقول جديدة

1. أضف الحقل إلى `ListingFormData` في `types.ts`
2. أضف التحقق في `listingFormSchema`
3. أضف الحقل إلى الخطوة المناسبة
4. أضف الحقل إلى `ReviewStep` للعرض

### إضافة خطوة جديدة

1. أضف الخطوة إلى `FORM_STEPS` في `types.ts`
2. أنشئ مكون الخطوة في `steps/`
3. أضف الخطوة إلى `listing-form.tsx`
4. حدث `StepIndicator` إذا لزم الأمر

## أمثلة متقدمة

### مع البيانات الأولية

```tsx
const initialData = {
  title_ar: "شقة فاخرة",
  type: "apartment",
  price: "5000",
  currency: "USD",
  // ... باقي البيانات
}

<ListingForm
  initialData={initialData}
  isEditing={true}
  listingId="123"
  onSuccess={handleSuccess}
/>
```

### مع معالج الأخطاء المخصص

```tsx
const handleError = (error: any) => {
  console.error("Form error:", error)
  toast.error("حدث خطأ في النموذج")
}

<ListingForm
  onError={handleError}
  // ... باقي الخصائص
/>
```

## الدعم

للمساعدة أو الإبلاغ عن مشاكل، يرجى فتح issue في المستودع.
