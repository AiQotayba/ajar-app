# new report

**web**

- صورة التصنيف عكس لونها لتكون بيضاء
- الموقع هو ليس للعقارات
  - الموقع هو موقع اعلانات وليس موقع عقارات
  - عمل بحث شامل بصفتك ux writer ليكون ضمن هذا السياق
  - قم باصلاح النصوص وتحديثه بصفتك ux writer
- المشاهدات
  - عمل viewerStorage للمشاهدات لاجل الاستخدام المتكرر في نفس الجلسة
    - خلال الجلسة الواحدة يمكن استخدام عرض واحد مشان ما بيصير عرض كثير
  - details listing
    - عمل كاش على السيرفر لمدة 5 دقائق
    - استخدم كاش محلي للاستخدام مع الكلاينت
    - استخدام api POST `/user/listings/view` [{id, count, viewed_at}]
  - list listings
    - استخدام api POST `/user/listings/view` [{id, count, viewed_at}]
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
