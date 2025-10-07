#!/bin/bash

# Simple Vercel Build Script for Ajar Platform
set -e

echo "🚀 Starting Vercel build process..."

# Navigate to web app directory
cd apps/web

# Copy the Vercel-specific package.json
echo "📦 Setting up package.json for Vercel..."
cp package-vercel.json package.json

# Install dependencies using npm (Vercel's default)
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"
