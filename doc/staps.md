# new report

**web**
 ء
- إضافة رابط صورة خارجي قصدي تضمين
- الرفع على السيرفر

**admin**

- تحديث صور التصنيف
  - عم بيصير في مشكلة بتحديث الصورة عم ينرسل الصورة لحتى توصل الى السيرفر "https://ajar-backend.mystore.social/storage/https://ajar-backend.mystore.social/storage/https://ajar-backend.mystore.social/storage/listings/69298938ef630.webp" وهيك تعتبر مشكلة
- الضغط على التصنيف لاضهاره وتعديله
- الرفع على السيرفر

# next

- dashboard integration api من احمد
- dashboard listings
  - form
    - sorting images
    - update listing images
# reposrt
/api/v1/admin/properties
{
  "name": { "ar": "الاسم بالعربية", "en": "الاسم بالانجليزية" }, 
  "description": { "ar": "الوصف بالعربية", "en": "الوصف بالانجليزية" },
  "category_id": 522,
  "icon": "properties/694e45e3d69a4.webp",
  "type": "enum",
  "is_filter": false,
  "options": [
    "q1",
    "a1"
  ]
}

{
  "message": "الحقل type المحدد غير صالح.",
  "errors": {
    "type": [
      "الحقل type المحدد غير صالح."
    ]
  }
}