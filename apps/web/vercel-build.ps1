# Vercel Build Script for Web App (PowerShell)
Write-Host "Starting Vercel build process..." -ForegroundColor Green

# Copy the Vercel-specific package.json
Write-Host "Setting up package.json for Vercel..." -ForegroundColor Yellow
Copy-Item "package-vercel.json" "package.json" -Force

# Copy the Vercel-specific next.config
Write-Host "Setting up next.config.mjs for Vercel..." -ForegroundColor Yellow
Copy-Item "next.config.vercel.mjs" "next.config.mjs" -Force

# Remove .npmrc to avoid workspace conflicts
Write-Host "Removing .npmrc to avoid workspace conflicts..." -ForegroundColor Yellow
if (Test-Path ".npmrc") {
    Remove-Item ".npmrc" -Force
}

# Install dependencies using npm (Vercel's default)
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Build the application
Write-Host "Building application..." -ForegroundColor Yellow
npm run build

Write-Host "Build completed successfully!" -ForegroundColor Green
