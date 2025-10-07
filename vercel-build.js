#!/usr/bin/env node

/**
 * Simple Vercel Build Script for Ajar Platform
 * This script handles the build process for Vercel deployment using npm
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

try {
  // Navigate to web app directory
  process.chdir('apps/web');
  
  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    console.error('❌ package.json not found in apps/web directory.');
    process.exit(1);
  }

  // Copy the Vercel-specific package.json
  console.log('📦 Setting up package.json for Vercel...');
  if (fs.existsSync('package-vercel.json')) {
    fs.copyFileSync('package-vercel.json', 'package.json');
  }

  // Install dependencies using npm (Vercel's default)
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Build the application
  console.log('🔨 Building application...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
