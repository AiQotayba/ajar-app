# 🚀 Ajar - Technical Implementation Roadmap

## 🎯 Project Vision
A comprehensive real estate rental and sale platform with multi-language support (Arabic/English) and full administrative capabilities.

---

## 🛠️ Technical Stack

### Frontend Architecture
- **Framework**: Next.js latest (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript
- **State Management**: React Query (TanStack Query)
- **Internationalization**: next-intl
- **Maps Integration**: Google Maps API
- **Form Handling**: React Hook Form + Zod validation

### Backend Integration
- **API Client**: Fetch with interceptors
- **Authentication**: JWT with phone verification
- **File Upload**: Multi-part form data with cloud storage
- **Real-time Features**: WebSocket for notifications

### Development Tools
- **Package Manager**: pnpm (workspace)
- **Linting**: ESLint + Prettier
- **Monitoring**: Sentry for error tracking

---

## 🗃️ Database Schema Overview

### Core Entities
```sql
-- User Management
Users (id, phone, email, role, status, phone_verified, wallet_balance)
PersonalAccessTokens (tokenable_type, tokenable_id, token, abilities)

-- Property Listings
Listings (id, owner_id, category_id, title, price, type, status, availability_status)
Categories (id, name, parent_id, properties_source, sort_order)
Properties (id, category_id, name, type, options) 
ListingProperties (listing_id, property_id, value)
Features (id, category_id, name, icon)
ListingFeatures (listing_id, feature_id)

-- Location Management
Governorates (id, name, code, orders)
Cities (id, governorate_id, name, availability)

-- User Engagement
Views (listing_id, user_id, created_at)
Favorites (user_id, listing_id)
ListingReviews (listing_id, user_id, rating, comment, is_approved)

-- Content & System
Sliders (id, image_url, target_url, start_at, end_at, active, clicks)
Notifications (user_id, title, message, metadata)
Settings (key, value, type, is_settings)
Media (type, url, imageable_id, imageable_type, sort_order)
```

---

## 🌐 Multi-Language Implementation

### Internationalization Strategy
```typescript
// Structure for multi-language content
{
  "en": {
    "common": {
      "search": "Search",
      "filters": "Filters",
      "viewDetails": "View Details"
    },
    "listing": {
      "forRent": "For Rent",
      "forSale": "For Sale",
      "contactAgent": "Contact Agent"
    }
  },
  "ar": {
    "common": {
      "search": "بحث",
      "filters": "الفلاتر", 
      "viewDetails": "عرض التفاصيل"
    },
    "listing": {
      "forRent": "للإيجار",
      "forSale": "للبيع",
      "contactAgent": "الاتصال بالوسيط"
    }
  }
}
```

### RTL Support
- CSS logical properties for RTL/LTR switching
- Dynamic direction switching based on language
- Arabic font optimization (Google Fonts - Cairo, Tajawal)

---

## 📱 Application Architecture

### Monorepo Structure
```yaml
ajar-platform/
├── apps/
│   ├── web/                              # Public-facing Next.js application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── [locale]/             # Dynamic locale routing (ar, en)
│   │   │   │   │   ├── layout.tsx        # Root layout with locale context
│   │   │   │   │   ├── page.tsx          # Homepage with listings and search
│   │   │   │   │   ├── listings/         # Listing management routes
│   │   │   │   │   │   ├── page.tsx      # All listings with filters
│   │   │   │   │   │   ├── [id]/         # Single listing detail
│   │   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   │   ├── loading.tsx
│   │   │   │   │   │   │   └── error.tsx
│   │   │   │   │   │   └── create/       # Multi-step listing creation
│   │   │   │   │   │       ├── page.tsx
│   │   │   │   │   │       ├── step-1/
│   │   │   │   │   │       ├── step-2/
│   │   │   │   │   │       └── step-3/
│   │   │   │   │   ├── auth/             # Authentication routes
│   │   │   │   │   │   ├── login/
│   │   │   │   │   │   ├── register/
│   │   │   │   │   │   ├── verify-otp/
│   │   │   │   │   │   └── forgot-password/
│   │   │   │   │   ├── dashboard/        # User dashboard
│   │   │   │   │   │   ├── page.tsx      # Dashboard overview
│   │   │   │   │   │   ├── my-listings/  # User's listings management
│   │   │   │   │   │   ├── favorites/    # Saved listings
│   │   │   │   │   │   ├── profile/      # Profile settings
│   │   │   │   │   │   └── notifications/
│   │   │   │   │   ├── categories/       # Category browsing
│   │   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── search/           # Advanced search results
│   │   │   │   │   ├── map/              # Map view of listings
│   │   │   │   │   └── about/            # Static pages
│   │   │   │   ├── api/                  # Next.js API routes
│   │   │   │   │   ├── auth/
│   │   │   │   │   ├── listings/
│   │   │   │   │   ├── upload/
│   │   │   │   │   └── webhooks/
│   │   │   │   ├── globals.css           # Global styles
│   │   │   │   ├── layout.tsx            # Root layout
│   │   │   │   ├── sitemap.ts            # Dynamic sitemap generation
│   │   │   │   └── robots.ts             # SEO robots configuration
│   │   │   ├── components/               # React components
│   │   │   │   ├── ui/                   # shadcn/ui components
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── input.tsx
│   │   │   │   │   ├── dialog.tsx
│   │   │   │   │   ├── card.tsx
│   │   │   │   │   └── ...
│   │   │   │   ├── forms/                # Form components
│   │   │   │   │   ├── listing-form/
│   │   │   │   │   ├── search-form/
│   │   │   │   │   └── auth-forms/
│   │   │   │   ├── listing/              # Listing-specific components
│   │   │   │   │   ├── listing-card.tsx
│   │   │   │   │   ├── listing-grid.tsx
│   │   │   │   │   ├── listing-filters.tsx
│   │   │   │   │   └── gallery/
│   │   │   │   ├── layout/               # Layout components
│   │   │   │   │   ├── header.tsx
│   │   │   │   │   ├── footer.tsx
│   │   │   │   │   ├── navigation/
│   │   │   │   │   └── sidebar/
│   │   │   │   ├── auth/                 # Authentication components
│   │   │   │   ├── maps/                 # Map components
│   │   │   │   └── shared/               # Reusable utility components
│   │   │   ├── lib/                      # Utility libraries
│   │   │   │   ├── i18n/                 # Internationalization
│   │   │   │   │   ├── config.ts
│   │   │   │   │   ├── middleware.ts
│   │   │   │   │   └── routing.ts
│   │   │   │   ├── api/                  # API client
│   │   │   │   │   ├── client.ts
│   │   │   │   │   ├── endpoints.ts
│   │   │   │   │   └── interceptors.ts
│   │   │   │   ├── auth/                 # Authentication utilities
│   │   │   │   │   ├── session.ts
│   │   │   │   │   ├── providers.ts
│   │   │   │   │   └── middleware.ts
│   │   │   │   ├── utils/                # Helper functions
│   │   │   │   │   ├── formatters.ts
│   │   │   │   │   ├── validators.ts
│   │   │   │   │   └── constants.ts
│   │   │   │   └── hooks/                # Custom React hooks
│   │   │   │       ├── use-api.ts
│   │   │   │       ├── use-auth.ts
│   │   │   │       └── use-listings.ts
│   │   │   ├── styles/                   # CSS and styling
│   │   │   │   ├── globals.css
│   │   │   │   ├── components/
│   │   │   │   └── utils.css
│   │   │   ├── types/                    # TypeScript type definitions
│   │   │   │   ├── api.ts
│   │   │   │   ├── listing.ts
│   │   │   │   ├── auth.ts
│   │   │   │   └── i18n.ts
│   │   │   └── messages/                 # Translation files
│   │   │       ├── en.json
│   │   │       ├── ar.json
│   │   │       └── index.ts
│   │   ├── public/                       # Static assets
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── locales/
│   │   ├── next.config.js                # Next.js configuration
│   │   ├── tailwind.config.js            # Tailwind CSS configuration
│   │   ├── tsconfig.json                 # TypeScript configuration
│   │   └── package.json
│   │
│   └── admin/                            # Administrative dashboard (Next.js)
│       ├── src/
│       │   ├── app/
│       │   │   ├── [locale]/             # Localized admin routes
│       │   │   │   ├── admin/            # Admin route group
│       │   │   │   │   ├── layout.tsx    # Admin layout with sidebar
│       │   │   │   │   ├── dashboard/    # Admin dashboard
│       │   │   │   │   │   ├── page.tsx  # Analytics overview
│       │   │   │   │   │   └── components/
│       │   │   │   │   ├── listings/     # Listing management
│       │   │   │   │   │   ├── page.tsx  # All listings table
│       │   │   │   │   │   ├── [id]/     # Listing detail/edit
│       │   │   │   │   │   └── review/   # Listing approval workflow
│       │   │   │   │   ├── categories/   # Category management
│       │   │   │   │   │   ├── page.tsx
│       │   │   │   │   │   └── [id]/
│       │   │   │   │   ├── properties/   # Property attributes
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   ├── features/     # Feature management
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   ├── locations/    # Location management
│       │   │   │   │   │   ├── governorates/
│       │   │   │   │   │   └── cities/
│       │   │   │   │   ├── users/        # User management
│       │   │   │   │   │   ├── page.tsx
│       │   │   │   │   │   └── [id]/
│       │   │   │   │   ├── reviews/      # Review moderation
│       │   │   │   │   ├── sliders/      # Slider management
│       │   │   │   │   ├── notifications/# Notification system
│       │   │   │   │   ├── settings/     # System settings
│       │   │   │   │   └── reports/      # Analytics reports
│       │   │   │   ├── layout.tsx        # Root admin layout
│       │   │   │   └── page.tsx          # Admin landing/redirect
│       │   │   ├── api/                  # Admin API routes
│       │   │   │   ├── admin/
│       │   │   │   └── upload/
│       │   │   └── globals.css
│       │   ├── components/
│       │   │   ├── admin/                # Admin-specific components
│       │   │   │   ├── sidebar/
│       │   │   │   ├── data-tables/      # Data table components
│       │   │   │   ├── charts/           # Analytics charts
│       │   │   │   ├── forms/            # Admin form components
│       │   │   │   └── modals/           # Modal dialogs
│       │   │   └── shared/               # Shared with web app
│       │   ├── lib/                      # Admin utilities
│       │   │   ├── api/
│       │   │   ├── utils/
│       │   │   └── hooks/
│       │   └── types/
│       ├── public/
│       ├── next.config.js
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       └── package.json
│
├── packages/                             # Shared packages
│   ├── ui/                              # Shared UI components
│   │   ├── src/
│   │   │   ├── components/              # Reusable components
│   │   │   │   ├── button/
│   │   │   │   ├── input/
│   │   │   │   ├── modal/
│   │   │   │   ├── table/
│   │   │   │   └── form/
│   │   │   ├── styles/                  # Component styles
│   │   │   ├── hooks/                   # Component hooks
│   │   │   └── utils/                   # Component utilities
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── types/                           # Shared TypeScript definitions
│   │   ├── src/
│   │   │   ├── api/                     # API type definitions
│   │   │   │   ├── auth.ts
│   │   │   │   ├── listing.ts
│   │   │   │   ├── user.ts
│   │   │   │   └── common.ts
│   │   │   ├── components/              # Component prop types
│   │   │   └── utils/                   # Utility types
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── utils/                           # Utility functions
│   │   ├── src/
│   │   │   ├── validation/              # Validation schemas
│   │   │   │   ├── listing.ts
│   │   │   │   ├── auth.ts
│   │   │   │   └── common.ts
│   │   │   ├── format/                  # Formatting utilities
│   │   │   │   ├── date.ts
│   │   │   │   ├── currency.ts
│   │   │   │   └── text.ts
│   │   │   ├── constants/               # Application constants
│   │   │   │   ├── api.ts
│   │   │   │   ├── routes.ts
│   │   │   │   └── listing.ts
│   │   │   └── helpers/                 # Helper functions
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── config/                          # Shared configuration
│       ├── src/
│       │   ├── i18n/                    # i18n configuration
│       │   ├── api/                     # API configuration
│       │   └── env/                     # Environment validation
│       ├── package.json
│       └── tsconfig.json
│
├── infra/                               # Infrastructure configuration
│   ├── docker/
│   │   ├── web/
│   │   │   └── Dockerfile
│   │   ├── admin/
│   │   │   └── Dockerfile
│   │   └── nginx/
│   │       └── Dockerfile
│   ├── nginx/
│   │   ├── nginx.conf
│   │   ├── web.conf
│   │   └── admin.conf
│   ├── docker-compose.yml               # Local development
│   ├── docker-compose.prod.yml          # Production deployment
│   └── scripts/
│       ├── deploy.sh
│       └── setup.sh
│
├── docs/                                # Documentation
│   ├── api/                             # API documentation
│   ├── deployment/                      # Deployment guides
│   ├── development/                     # Development setup
│   └── architecture/                    # System architecture
│
├── scripts/                             # Build and utility scripts
│   ├── build.sh
│   ├── test.sh
│   └── deploy.sh
│
├── .github/                             # GitHub workflows
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── cd.yml
│   │   └── tests.yml
│   └── dependabot.yml
│
├── .husky/                              # Git hooks
├── .eslintrc.js                         # ESLint configuration
├── .prettierrc                          # Prettier configuration
├── tailwind.config.js                   # Root Tailwind config
├── tsconfig.json                        # Root TypeScript config
├── package.json                         # Root package.json
├── pnpm-workspace.yaml                  # pnpm workspace configuration
└── README.md
```
---

## 🔐 API Integration Architecture

### Authentication Flow
```typescript
// API Client Configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Request interceptor for authentication
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await refreshToken();
      return apiClient.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Multi-language API Headers
```typescript
// API calls with language support
const fetchListings = async (params: ListingParams, locale: string) => {
  const response = await apiClient.get('/listings', {
    params,
    headers: {
      'Accept-Language': locale,
    },
  });
  return response.data;
};
```

---

## 🎯 Implementation Phases

### Phase 1: Core Platform (Weeks 1-6)
- [ ] **Project Setup & Configuration**
  - Next.js monorepo setup with pnpm workspaces
  - Internationalization configuration (next-intl)
  - UI component library (shadcn/ui) with RTL support
  - API client setup with interceptors

- [ ] **Authentication System**
  - Phone-based registration with OTP verification
  - JWT token management with refresh logic
  - Protected route implementation
  - User profile management

- [ ] **Basic Listing Management**
  - CRUD operations for property listings
  - Multi-step listing creation form
  - Image upload with cloud storage integration
  - Basic search and filtering

### Phase 2: Enhanced Features (Weeks 7-12)
- [ ] **Advanced Search & Discovery**
  - Location-based search with Google Maps integration
  - Advanced filtering by price, category, features
  - Search results pagination and sorting
  - Saved searches functionality

- [ ] **User Engagement Features**
  - Favorites system with persistent storage
  - Property views tracking and analytics
  - Review and rating system with moderation
  - Notification system (in-app + email/SMS)

- [ ] **Admin Dashboard**
  - User management with role-based access
  - Listing moderation and approval workflow
  - Category and property attribute management
  - Basic analytics and reporting

### Phase 3: Advanced Capabilities (Weeks 13-18)
- [ ] **Multi-language Optimization**
  - Dynamic content translation
  - RTL layout switching
  - Language-specific SEO optimization
  - Localized date, number, and currency formatting

- [ ] **Performance & SEO**
  - Server-side rendering for listing pages
  - Image optimization with next/image
  - SEO metadata management
  - Performance monitoring with Core Web Vitals

- [ ] **Advanced Admin Features**
  - Comprehensive analytics dashboard
  - Bulk operations for content management
  - System settings configuration
  - Advanced user role permissions

---

## 🔧 Technical Specifications
 
### Environment Configuration
```env
# Environment variables
NEXT_PUBLIC_API_URL=https://api.ajar.com/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
NEXT_PUBLIC_DEFAULT_LOCALE=ar
NEXT_PUBLIC_SUPPORTED_LOCALES=en,ar

# Internationalization
I18N_DEFAULT_LOCALE=ar
I18N_SUPPORTED_LOCALES=en,ar
```

---

## 📊 Success Metrics & Monitoring

### Technical KPIs
- **Performance**: Core Web Vitals > 90% (LCP, FID, CLS)
- **SEO**: PageSpeed Insights score > 85
- **Accessibility**: WCAG 2.1 AA compliance
- **Internationalization**: 100% content coverage for both languages

### Business Metrics
- User registration and activation rates
- Listing creation and approval throughput
- Search-to-contact conversion rates
- User engagement (favorites, reviews, shares)

---

## 🔄 Continuous Improvement

### Iteration Cycles
- **Sprint Duration**: 2 weeks
- **Feature Flagging**: LaunchDarkly for controlled rollouts
- **A/B Testing**: Optimizely for UI/UX experiments
- **Feedback Loops**: Sentry for error tracking, Analytics for user behavior

This technical roadmap provides a comprehensive implementation plan for building a scalable, multi-language real estate platform with modern web technologies and best practices.