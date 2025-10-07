#!/bin/bash

# Vercel Build Script for Web App
set -e

echo "🚀 Starting Vercel build process..."

# Copy the Vercel-specific package.json
echo "📦 Setting up package.json for Vercel..."
cp package-vercel.json package.json

# Copy the Vercel-specific next.config
echo "📦 Setting up next.config.mjs for Vercel..."
cp next.config.vercel.mjs next.config.mjs

# Remove .npmrc to avoid workspace conflicts
echo "📦 Removing .npmrc to avoid workspace conflicts..."
rm -f .npmrc

# Install dependencies using npm (Vercel's default)
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"
