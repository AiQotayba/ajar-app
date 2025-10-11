# 🚀 Ajar Admin Panel - Technical Roadmap

## 🎯 رؤية المشروع

لوحة تحكم إدارية لإدارة العقارات والمستخدمين والمحتوى، سهلة الاستخدام، آمنة، وقابلة للتوسع لاحقًا في حال إضافة واجهة مستخدم عامة.

---

## 🛠️ التقنيات المستخدمة

### Frontend

* **Framework**: Next.js (App Router) + TypeScript
* **Styling**: Tailwind CSS + shadcn/ui
* **State Management**: React Query (TanStack Query)
* **Forms & Validation**: React Hook Form + Zod

### Backend / API

* **API Layer**: Next.js API routes
* **Authentication**: Session-based HttpOnly cookies
* **Database**: MongoDB أو PostgreSQL حسب الحاجة
* **File Uploads**: Cloud Storage (AWS S3 / Supabase R2) مع Presigned URLs
* **Real-time Features**: (اختياري) Socket.io أو Pusher لو احتجت notifications

### Tools

* **Package Manager**: pnpm
* **Linting & Formatting**: ESLint + Prettier
* **Monitoring**: Sentry

---

## 🗄️ Database Schema - Core Entities
في الملف المرفق [DB.sql](./DB.sql) 

---

## 🔐 API 

في الملف المرفق [apiClient.ts](./apiClient.ts)

- 🔐 Authentication APIs
  - `POST` {{base_url}}/auth/register ⏳
  - `POST` {{base_url}}/auth/verify-otp ⏳
  - `POST` {{base_url}}/auth/login ⏳
  - `POST` {{base_url}}/auth/forgot-password ⏳
  - `POST` {{base_url}}/auth/reset-password ⏳
  - `POST` {{base_url}}/auth/logout ⏳
- 👨‍💼 Admin APIs
  - 📂 Categories Management
    - `GET` {{base_url}}/admin/categories
    - `GET` {{base_url}}/admin/categories/1
    - `POST` {{base_url}}/admin/categories
    - `PUT` {{base_url}}/admin/categories/1
    - `DELETE` {{base_url}}/admin/categories/1
    - `PUT` {{base_url}}/admin/categories/1/reorder
  - 🏠 Properties Management
    - `GET` {{base_url}}/admin/properties
    - `POST` {{base_url}}/admin/properties
    - `PUT` {{base_url}}/admin/properties/1
    - `DELETE` {{base_url}}/admin/properties/1
  - ⭐ Features Management
    - `GET` {{base_url}}/admin/features
    - `POST` {{base_url}}/admin/features
    - `PUT` {{base_url}}/admin/features/1
    - `DELETE` {{base_url}}/admin/features/1
  - 🌍 Location Management
    - `GET` {{base_url}}/admin/governorates
    - `POST` {{base_url}}/admin/governorates
    - `GET` {{base_url}}/admin/cities
    - `POST` {{base_url}}/admin/cities
  - 🎚️ Sliders Management
    - `GET` {{base_url}}/admin/sliders
    - `POST` {{base_url}}/admin/sliders
  - 📋 Listings & Reviews Management
    - `GET` {{base_url}}/admin/listings
    - `POST` {{base_url}}/admin/listings
    - `GET` {{base_url}}/admin/reviews
  - 🔔 Notifications Management
    - `GET` {{base_url}}/admin/notifications
    - `POST` {{base_url}}/admin/notifications
  - 📐 Settings Management
    - `GET` {{base_url}}/admin/settings
    - `POST` {{base_url}}/admin/settings
    - `PUT` {{base_url}}/admin/settings

## 📦 Folder Structure - Admin Only

\`\`\`yaml
ajar-admin:
  app:
    dashboard:
      page: page.tsx
      features:
        - count_listings_published
        - count_listings_pending_review
        - count_new_users
        - average_rating
        - count_whatsapp_clicks
        - view_trends_graphs
      api:
        - GET: /admin/dashboard/summary
    listings:
      page: page.tsx
      features:
        - filter_by_status: [draft, pending, published, rejected, hidden, rented]
        - view_details
        - approve_reject_with_reason
        - reorder_drag_drop
        - change_status_directly
      api:
        - GET: /admin/listings
        - POST: /admin/listings
        - PUT: /admin/listings/{id}
        - DELETE: /admin/listings/{id}
        - PUT: /admin/listings/{id}/status
        - PUT: /admin/listings/reorder
      details[id]:
        page: page.tsx
        features:
          - view_details
          - approve_reject_with_reason
          - reorder_drag_drop
          - change_status_directly
        api:
          - GET: /admin/listings/{id}
          - PUT: /admin/listings/{id}
          - DELETE: /admin/listings/{id}
          - PUT: /admin/listings/{id}/status
          - PUT: /admin/listings/reorder
    users:
      page: page.tsx
      features:
        - change_role: [user, manager]
        - block_activate_account
        - view_user_ads
        - view_user_ratings
      api:
        - GET: /admin/users
        - POST: /admin/users
        - PUT: /admin/users/{id}
        - DELETE: /admin/users/{id}
      details[id]:
        page: page.tsx
        features:
          - view_details
          - change_role: [user, manager]
          - block_activate_account
          - view_user_ads
          - view_user_ratings
        api:
          - GET: /admin/users/{id}
          - PUT: /admin/users/{id}
          - DELETE: /admin/users/{id}
    categories:
      page: page.tsx
      features:
        - data_types: [integer, decimal, yes/no, date, list_of_values]
        - edit_delete_categories
      api:
        - GET: /admin/categories
        - GET: /admin/categories/{id}
        - POST: /admin/categories
        - PUT: /admin/categories/{id}
        - DELETE: /admin/categories/{id}
        - PUT: /admin/categories/{id}/reorder
      details[id]:
        page: page.tsx
        features:
          - data_types: [integer, decimal, yes/no, date, list_of_values]
          - edit_delete_categories
        api:
          - GET: /admin/categories/{id}
          - PUT: /admin/categories/{id}
          - DELETE: /admin/categories/{id}
          - PUT: /admin/categories/{id}/reorder
    properties:
      page: page.tsx
      features:
        - data_types: [integer, decimal, yes/no, date, list_of_values]
        - edit_delete_properties
      api:
        - GET: /admin/properties
        - POST: /admin/properties
        - PUT: /admin/properties/{id}
        - DELETE: /admin/properties/{id}
      details[id]:
        page: page.tsx
        features:
          - data_types: [integer, decimal, yes/no, date, list_of_values]
          - edit_delete_properties
        api:
          - GET: /admin/properties/{id}
          - PUT: /admin/properties/{id}
          - DELETE: /admin/properties/{id}
    features:
      page: page.tsx
      features:
        - link_to_categories
        - reorder_drag_drop
        - edit_delete_features
      api:
        - GET: /admin/features
        - POST: /admin/features
        - PUT: /admin/features/{id}
        - DELETE: /admin/features/{id}
      details[id]:
        page: page.tsx
        features:
          - link_to_categories
          - reorder_drag_drop
          - edit_delete_features
        api:
          - GET: /admin/features/{id}
          - PUT: /admin/features/{id}
          - DELETE: /admin/features/{id}
    locations:
      page: page.tsx
      features:
        - modify_order
        - activate_deactivate
      api:
        - GET: /admin/governorates
        - POST: /admin/governorates
        - GET: /admin/cities
        - POST: /admin/cities
      details[id]:
        page: page.tsx
        features:
          - modify_order
          - activate_deactivate
        api:
          - GET: /admin/governorates/{id}
          - POST: /admin/governorates/{id}
          - GET: /admin/cities/{id}
          - POST: /admin/cities/{id}
    sliders:
      page: page.tsx
      features:
        - edit_delete_sliders
        - set_image_links: [internal, external]
        - set_display_duration_and_date
        - reorder_drag_drop
      api:
        - GET: /admin/sliders
        - POST: /admin/sliders
        - PUT: /admin/sliders/{id}
        - DELETE: /admin/sliders/{id}
      details[id]:
        page: page.tsx
        features:
          - edit_delete_sliders
          - set_image_links: [internal, external]
          - set_display_duration_and_date
          - reorder_drag_drop
        api:
          - GET: /admin/sliders/{id}
          - PUT: /admin/sliders/{id}
          - DELETE: /admin/sliders/{id}
    notifications:
      page: page.tsx
      features:
        - select_recipients: [all_users, selected_users]
        - set_offer_period
        - track_reads
      api:
        - GET: /admin/notifications
        - POST: /admin/notifications
        - PUT: /admin/notifications/{id}
        - DELETE: /admin/notifications/{id}
    reviews:
      page: page.tsx
      features:
        - approve_withhold
        - display_reviewer_name_comment_stars_time
      api:
        - GET: /admin/reviews
        - PUT: /admin/reviews/{id}
        - DELETE: /admin/reviews/{id}
      details[id]:
        page: page.tsx
        features:
          - approve_withhold
          - display_reviewer_name_comment_stars_time
        api:
          - GET: /admin/reviews/{id}
          - PUT: /admin/reviews/{id}
          - DELETE: /admin/reviews/{id}
    settings:
      page: page.tsx
      features:
        - edit_texts
        - edit_currency
        - edit_external_links
        - add_modify_languages_translations
      api:
        - GET: /admin/settings
        - POST: /admin/settings
        - PUT: /admin/settings/{id}
      details[id]:
        page: page.tsx
        features:
          - edit_texts
          - edit_currency
          - edit_external_links
          - add_modify_languages_translations
        api:
          - GET: /admin/settings/{id}
          - PUT: /admin/settings/{id}
    reports:
      page: page.tsx
      features:
        - interactive_reports
        - view_graphs_charts
      api:
        - GET: /admin/reports
      details[id]:
        page: page.tsx
        features:
          - interactive_reports
          - view_graphs_charts
        api:
          - GET: /admin/reports/{id}
    my-account:
      page: page.tsx
      features:
        - view_edit_profile
        - view_ads
        - view_ratings
        - view_notifications
        - view_reviews
      api:
        - GET: /user/me
        - PUT: /user/me
        - GET: /user/me/ads
        - GET: /user/me/reviews
        - GET: /user/me/notifications
      
\`\`\`
---
## 📑 Table Core Components 
* **غرضه**: جدول **مرن وقابل لإعادة الاستخدام** لإدارة البيانات في لوحة التحكم.
* **Rendering**: **Client-Side فقط (CSR)** مع **Skeleton loading** افتراضي.
* **Data**: يربط مباشرة مع **API** عبر **React Query** لدعم:

  * **Fetch / Search / Filtering**
  * **Delete / Update (CRUD)**
* **Columns & Rows**: configurable بالكامل عبر props (`columns`, `filters`, `data rows`)
* **Drag & Drop**:

  * **اختياري** (`draggable=true`)
  * يمكن تفعيل/إيقاف عبر زر (`enableDragToggle`)
  * يدعم إعادة ترتيب الصفوف وإرسال الترتيب الجديد للـ API
* **CRUD & Actions**:

  * Delete / Edit / Custom actions عبر cell renderers
  * Feedback للمستخدم بعد أي عملية باستخدام Toasts
* **Pagination**: CSR، مع إمكانية التوسع لاحقًا للسيرفر سايد.
* **Flexibility**: يمكن تمرير أي API endpoint وأي config للـ columns وfilters دون تعديل المكتبة نفسها.
* **Styling**: Tailwind CSS + shadcn/ui، responsive وmodern UI و Framer Motion بشكل بسيط 

---

إذا تحبين، أقدر أرسم لك **مخطط بصري سريع للـ Table Core مع كل الخصائص والـ props** لتفهمين الربط بين Drag&Drop، Filtering، وCRUD.

هل أعمله لك؟

## 💡 Best Practices & Improvements

1. **Sessions via HttpOnly cookie** لتقليل خطر XSS. 
3. **Uploads مع Presigned URLs**: أسرع وأكثر أمانًا عند رفع الصور والفيديوهات. 
5. **Scalability**: تصميم الـ DB والموديلات يسمح بإضافة واجهة مستخدم عامة لاحقًا بسهولة.

---

## 📊 Success Metrics (Admin Panel)

* **Technical KPIs**:

  * سرعة التحميل < 2 ثانية
  * Monitoring errors < 1% عبر Sentry
  * Security: جميع الـ routes محمية
* **Business KPIs**:

  * إدارة فعّالة للإعلانات والمستخدمين
  * نسبة الموافقة على الإعلانات
  * تقليل الأخطاء اليدوية في الـ Admin panel
