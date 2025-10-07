بناءً على ملف Postman Collection المرفق، إليك جميع روابط الـ API مصنفة حسب الفئات:
[API-docx.json](API-docx.json)

## 🔐 Authentication APIs
- `POST` {{base_url}}/auth/register ⏳
- `POST` {{base_url}}/auth/verify-otp ⏳
- `POST` {{base_url}}/auth/login ⏳
- `POST` {{base_url}}/auth/forgot-password ⏳
- `POST` {{base_url}}/auth/reset-password ⏳
- `POST` {{base_url}}/auth/logout ⏳

## 👤 User Public APIs
### 🏠 Home
- `GET` {{base_url}}/user/home ✅

### 📂 Categories & Properties
- `GET` {{base_url}}/user/categories
- `GET` {{base_url}}/user/categories/1
- `GET` {{base_url}}/user/properties
- `GET` {{base_url}}/user/features

### 📋 Listings & Reviews
- `GET` {{base_url}}/user/listings 
- `GET` {{base_url}}/user/listings/1 ✅
- `GET` {{base_url}}/user/listings/1/reviews

### 🌍 Location
- `GET` {{base_url}}/user/governorates
- `GET` {{base_url}}/user/governorates/1
- `GET` {{base_url}}/user/cities
- `GET` {{base_url}}/user/cities/1

### 🎚️ Sliders
- `GET` {{base_url}}/user/sliders/active ❌
- `POST` {{base_url}}/user/sliders/1/click ⏳

### 📐 Settings
- `GET` {{base_url}}/user/settings/public

## 👤 User Authenticated APIs
### 📋 Listings
- `POST` {{base_url}}/user/listings
- `PUT` {{base_url}}/user/listings/1
- `DELETE` {{base_url}}/user/listings/1
- `POST` {{base_url}}/user/listings/1/toggle-favorite

### 🔔 Notifications
- `GET` {{base_url}}/user/notifications
- `POST` {{base_url}}/user/notifications/1/read

### 📋 Reviews
- `POST` {{base_url}}/user/reviews
- `PUT` {{base_url}}/user/reviews/1
- `DELETE` {{base_url}}/user/reviews/1

## 👨‍💼 Admin APIs
### 📂 Categories Management
- `GET` {{base_url}}/admin/categories
- `GET` {{base_url}}/admin/categories/1
- `POST` {{base_url}}/admin/categories
- `PUT` {{base_url}}/admin/categories/1
- `DELETE` {{base_url}}/admin/categories/1
- `PUT` {{base_url}}/admin/categories/1/reorder

### 🏠 Properties Management
- `GET` {{base_url}}/admin/properties
- `POST` {{base_url}}/admin/properties
- `PUT` {{base_url}}/admin/properties/1
- `DELETE` {{base_url}}/admin/properties/1

### ⭐ Features Management
- `GET` {{base_url}}/admin/features
- `POST` {{base_url}}/admin/features
- `PUT` {{base_url}}/admin/features/1
- `DELETE` {{base_url}}/admin/features/1

### 🌍 Location Management
- `GET` {{base_url}}/admin/governorates
- `POST` {{base_url}}/admin/governorates
- `GET` {{base_url}}/admin/cities
- `POST` {{base_url}}/admin/cities

### 🎚️ Sliders Management
- `GET` {{base_url}}/admin/sliders
- `POST` {{base_url}}/admin/sliders

### 📋 Listings & Reviews Management
- `GET` {{base_url}}/admin/listings
- `POST` {{base_url}}/admin/listings
- `GET` {{base_url}}/admin/reviews

### 🔔 Notifications Management
- `GET` {{base_url}}/admin/notifications
- `POST` {{base_url}}/admin/notifications

### 📐 Settings Management
- `GET` {{base_url}}/admin/settings
- `POST` {{base_url}}/admin/settings
- `PUT` {{base_url}}/admin/settings
