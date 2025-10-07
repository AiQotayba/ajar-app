# Use Node.js 18 Alpine image
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.config.js ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/useApi/package.json ./packages/useApi/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build --filter=admin

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=base /app/apps/admin/.next/standalone ./
COPY --from=base /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=base /app/apps/admin/public ./apps/admin/public

# Set permissions
USER nextjs

# Expose port
EXPOSE 3100

# Set environment
ENV PORT 3100
ENV HOSTNAME "0.0.0.0"

# Start the application
CMD ["node", "apps/admin/server.js"]
