# Deployment Guide

## Vercel Deployment

This project is configured for deployment on Vercel with the following setup:

### Prerequisites

1. **Vercel CLI**: Install globally or use npx
   ```bash
   npm install -g vercel
   # or use npx vercel
   ```

2. **Environment Variables**: Set up the following environment variables in Vercel dashboard:
   - `SITE_URL`: Your production URL (e.g., https://ajar.com)
   - `NEXT_PUBLIC_SITE_URL`: Same as SITE_URL
   - `NEXT_PUBLIC_API_URL`: Your API endpoint
   - `NEXTAUTH_SECRET`: Random secret for authentication
   - `NEXTAUTH_URL`: Your production URL
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key
   - `DATABASE_URL`: Database connection string
   - `REDIS_URL`: Redis connection string (if using)

### Deployment Commands

```bash
# Deploy to production
pnpm run deploy

# Deploy preview
pnpm run deploy:preview

# Build locally
pnpm run build

# Start production server locally
pnpm run start
```

### Configuration Files

- `vercel.json`: Vercel deployment configuration
- `next-sitemap.config.js`: Sitemap generation configuration
- `next.config.mjs`: Next.js configuration with internationalization

### Features Included

- ✅ Internationalization (RTL/LTR support)
- ✅ SEO optimization with sitemap generation
- ✅ Security headers
- ✅ Image optimization
- ✅ Performance optimizations
- ✅ Analytics integration
- ✅ PWA support

### Build Process

1. Install dependencies with pnpm (including workspace packages)
2. Build workspace packages (@useApi, @ajar/seed)
3. Build the Next.js application
4. Deploy to Vercel

### Monorepo Configuration

This project uses a pnpm monorepo structure with workspace packages:
- `@useApi`: Custom API library
- `@ajar/seed`: Database seeding package
- The build process ensures workspace packages are built before the main app
- Vercel is configured to handle the pnpm monorepo structure correctly
- Uses pnpm with proper workspace configuration
- Workspace packages are properly linked using `workspace:*` syntax

### Vercel Configuration

The `vercel.json` file is configured for pnpm monorepo deployment:
- `installCommand`: Runs `pnpm install` from the root directory
- `buildCommand`: Runs `pnpm run vercel-build` which builds the web app
- Proper workspace handling ensures all dependencies are installed correctly

### Monitoring

- Vercel Analytics is included
- Performance monitoring
- Error tracking
- Real-time logs available in Vercel dashboard

### Custom Domain

To set up a custom domain:
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings > Domains
4. Add your custom domain
5. Configure DNS records as instructed
