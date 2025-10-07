#!/bin/bash

# Vercel Build Script for Monorepo
# This script ensures that workspace packages are built before the main app

set -e

echo "🚀 Starting Vercel build process..."

# Navigate to project root
cd ../..

echo "📦 Installing dependencies..."
pnpm install

echo "🔨 Building workspace packages..."
# Build useApi package first
cd packages/useApi
pnpm build
cd ../..

echo "🏗️ Building web application..."
# Build the web app
cd apps/web
pnpm build

echo "✅ Build completed successfully!"
