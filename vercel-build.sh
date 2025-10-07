#!/bin/bash

# Vercel Build Script for Ajar Platform
# This script ensures the correct pnpm version is used

set -e

echo "🚀 Starting Vercel build process..."

# Install the latest pnpm version
echo "📦 Installing latest pnpm..."
npm install -g pnpm@latest

# Verify pnpm version
echo "✅ pnpm version: $(pnpm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build the web application
echo "🔨 Building web application..."
pnpm turbo run build --filter=web

echo "✅ Build completed successfully!"
