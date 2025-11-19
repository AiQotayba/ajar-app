#!/bin/bash

# سكربت نشر لمونوربّو فيه nextjs (apps/web apps/admin) مع pnpm و pm2

set -e

echo "⬇️ جلب آخر تحديثات من Git..."
git pull origin main

echo "📦 تثبيت جميع الحزم..."
pnpm install

echo "⚒️ بناء مشروع web..."
pnpm --filter web build

echo "⚒️ بناء مشروع admin..."
pnpm --filter admin build

echo "🟢 تشغيل web عن طريق pm2..."
if pm2 list | grep -qw "web"; then
    pm2 reload web
else
    pm2 start "pnpm --filter web start" --name web
fi

echo "🟢 تشغيل admin عن طريق pm2..."
if pm2 list | grep -qw "admin"; then
    pm2 reload admin
else
    pm2 start "pnpm --filter admin start" --name admin
fi

echo "✅ تم النشر بنجاح!"
