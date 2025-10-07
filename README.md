# 🏠 Ajar - Real Estate Platform 

A comprehensive real estate rental and sale platform with multi-language support (Arabic/English) and full administrative capabilities.

## 🚀 Features

- **Multi-language Support**: Arabic and English with RTL support
- **Property Listings**: Create, manage, and search property listings
- **User Management**: Registration, authentication, and user profiles
- **Admin Dashboard**: Complete administrative interface
- **Advanced Search**: Filter by location, price, features, and more
- **Favorites System**: Save and manage favorite properties
- **Reviews & Ratings**: User reviews and rating system
- **Notifications**: Real-time notifications system
- **Responsive Design**: Mobile-first responsive design

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript
- **State Management**: React Query (TanStack Query)
- **Internationalization**: next-intl
- **Maps Integration**: Google Maps API
- **Form Handling**: React Hook Form + Zod validation

### Backend Integration
- **API Client**: Axios with interceptors
- **Authentication**: JWT with phone verification
- **File Upload**: Multi-part form data with cloud storage

### Development Tools
- **Package Manager**: pnpm (workspace)
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript

## 📁 Project Structure

```
ajar-platform/
├── apps/
│   ├── web/                    # Public-facing Next.js application
│   └── admin/                  # Administrative dashboard
├── packages/
│   ├── ui/                     # Shared UI components
│   ├── types/                  # Shared TypeScript definitions
│   ├── utils/                  # Utility functions
│   └── config/                 # Shared configuration
├── infra/                      # Infrastructure configuration
├── docs/                       # Documentation
└── scripts/                    # Build and utility scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ajar-platform
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local
```

4. Start development servers:
```bash
# Start all applications
pnpm dev

# Or start individually
pnpm web:dev      # Web app (port 3000)
pnpm admin:dev    # Admin app (port 3001)
```

## 🌐 Applications

### Web Application (Port 3000)
- Public-facing real estate platform
- Property listings and search
- User authentication and profiles
- Multi-language support

### Admin Dashboard (Port 3001)
- Administrative interface
- User and listing management
- Analytics and reporting
- System configuration

## 📝 Development

### Available Scripts

```bash
# Development
pnpm dev                 # Start all applications
pnpm web:dev            # Start web app only
pnpm admin:dev          # Start admin app only

# Building
pnpm build              # Build all applications
pnpm web:build          # Build web app only
pnpm admin:build        # Build admin app only

# Code Quality
pnpm lint               # Lint all packages
pnpm type-check         # Type check all packages
pnpm clean              # Clean all build artifacts
```

### Adding New Packages

To add a new package to the workspace:

1. Create the package directory:
```bash
mkdir packages/new-package
```

2. Initialize package.json:
```bash
cd packages/new-package
pnpm init
```

3. Add to workspace dependencies in other packages as needed.

## 🔧 Configuration

### Environment Variables

#### Web App (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_DEFAULT_LOCALE=ar
NEXT_PUBLIC_SUPPORTED_LOCALES=en,ar
```

#### Admin App (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
```

## 🌍 Internationalization

The platform supports Arabic and English with:
- Dynamic locale routing (`/en/`, `/ar/`)
- RTL/LTR layout switching
- Localized content and formatting
- SEO-friendly URLs

## 📱 API Integration

The platform integrates with a Laravel backend API:
- Authentication with JWT tokens
- RESTful API endpoints
- File upload handling
- Real-time notifications

## 🚀 Deployment

### Production Build

```bash
pnpm build
```

### Docker Support

```bash
docker-compose up -d
```

## 📊 Monitoring

- **Error Tracking**: Sentry integration
- **Analytics**: Google Analytics
- **Performance**: Core Web Vitals monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Email: support@ajar.com
- Documentation: [docs.ajar.com](https://docs.ajar.com)
- Issues: [GitHub Issues](https://github.com/ajar/platform/issues)
