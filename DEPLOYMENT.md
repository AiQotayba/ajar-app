# Deployment Guide

This guide covers deploying the Ajar Platform monorepo with Turbo.

## Prerequisites

- Node.js 22+ (see `.nvmrc`)
- pnpm 8+
- Turbo (installed automatically)
- Docker (optional, for containerized deployment)

## Local Development

### Quick Start

```bash
# Install dependencies
pnpm install

# Start all applications
pnpm dev

# Or use Makefile
make setup
make dev
```

### Individual Applications

```bash
# Web app (port 3000)
pnpm web:dev
make dev-web

# Admin app (port 3100)
pnpm admin:dev
make dev-admin
```

## Production Build

### Build All Applications

```bash
# Build everything
pnpm build

# Or use Makefile
make build
```

### Build Individual Applications

```bash
# Web app only
pnpm web:build
make build-web

# Admin app only
pnpm admin:build
make build-admin
```

## Vercel Deployment

### Automatic Deployment

The project is configured for Vercel with Turbo:

```json
{
  "buildCommand": "turbo run build --filter=web",
  "outputDirectory": "apps/web/.next",
  "installCommand": "pnpm install"
}
```

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy web app
cd apps/web
vercel --prod

# Deploy admin app
cd apps/admin
vercel --prod
```

### Environment Variables

Set these in Vercel dashboard:

```env
NEXT_PUBLIC_API_URL=https://api.ajar.com/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
NEXT_PUBLIC_DEFAULT_LOCALE=ar
NEXT_PUBLIC_SUPPORTED_LOCALES=en,ar
```

## Docker Deployment

### Build Images

```bash
# Build web app
docker build -f apps/web/Dockerfile -t ajar-web .

# Build admin app
docker build -f apps/admin/Dockerfile -t ajar-admin .
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Docker Compose

```yaml
version: '3.8'
services:
  web:
    image: ajar-web:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.ajar.com/v1
    restart: unless-stopped

  admin:
    image: ajar-admin:latest
    ports:
      - "3100:3100"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.ajar.com/v1
    restart: unless-stopped
```

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Build applications
        run: pnpm build
        
      - name: Run tests
        run: pnpm test
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: apps/web
```

## Performance Optimization

### Turbo Caching

Enable remote caching for faster builds:

```bash
# Set up Turbo token
export TURBO_TOKEN=your_token

# Build with remote cache
turbo run build --remote-cache
```

### Build Optimization

```bash
# Build with specific filters
turbo run build --filter=web
turbo run build --filter=admin

# Build with dependencies
turbo run build --filter=web^...
```

## Monitoring

### Health Checks

```bash
# Check application status
curl http://localhost:3000/api/health
curl http://localhost:3100/api/health

# Check build status
make status
```

### Logs

```bash
# View application logs
docker-compose logs -f web
docker-compose logs -f admin

# View build logs
turbo run build --verbose
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clean and rebuild
   pnpm clean
   pnpm install
   pnpm build
   ```

2. **Cache Issues**
   ```bash
   # Clear Turbo cache
   rm -rf .turbo
   turbo run build
   ```

3. **Dependency Issues**
   ```bash
   # Reinstall dependencies
   rm -rf node_modules
   pnpm install
   ```

### Performance Issues

1. **Slow Builds**
   - Enable remote caching
   - Use build filters
   - Optimize dependencies

2. **Memory Issues**
   - Increase Node.js memory limit
   - Use build filters
   - Optimize bundle size

## Security

### Environment Variables

- Never commit `.env` files
- Use secure secret management
- Rotate API keys regularly

### Docker Security

- Use non-root users
- Keep images updated
- Scan for vulnerabilities

### Network Security

- Use HTTPS in production
- Configure proper CORS
- Implement rate limiting

## Backup and Recovery

### Database Backups

```bash
# Backup database
pg_dump ajar_platform > backup.sql

# Restore database
psql ajar_platform < backup.sql
```

### Application Backups

```bash
# Backup application data
tar -czf app-backup.tar.gz apps/web/public apps/admin/public

# Restore application data
tar -xzf app-backup.tar.gz
```

## Scaling

### Horizontal Scaling

- Use load balancers
- Implement session management
- Configure CDN

### Vertical Scaling

- Increase server resources
- Optimize application code
- Use caching strategies

## Support

For deployment issues:

- Check logs: `make logs`
- Verify configuration: `make status`
- Review documentation: `TURBO.md`
- Contact support: support@ajar.com
