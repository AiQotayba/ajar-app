#!/bin/bash

# سكربت نشر لمونوربّو فيه nextjs (apps/web apps/admin) مع pnpm و pm2

set -e
cd htdocs/dashboard.ajarsyria.com/
cd htdocs/ajarsyria.com/
git clone https://github.com/AiQotayba/ajar-app.git
cd ajar-app/apps/web
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc
pnpm install -g pnpm
pnpm install
npm install -g pm2
nano .env
pnpm build
pm2 start "pnpm start -p 3400" --name app
echo "⬇️ جلب آخر تحديثات من Git..."
git pull origin main

echo "📦 تثبيت جميع الحزم..."

echo "⚒️ بناء مشروع web..."
pnpm --filter web build

echo "⚒️ بناء مشروع admin..."
pnpm --filter admin build

echo "🟢 تشغيل web عن طريق pm2..."
if pm2 list | grep -qw "web"; then
    pm2 reload web
else
    pm2 start "pnpm --filter web start" --name web
    pm2 start "pnpm start" --name app

fi

echo "🟢 تشغيل admin عن طريق pm2..."
if pm2 list | grep -qw "admin"; then
    pm2 reload admin
else
    pm2 start "pnpm --filter admin start" --name admin
fi

echo "✅ تم النشر بنجاح!"
# ------------------------------------------------------------
cd htdocs/ajarsyria.com/ajar-app/
git pull  
cd apps/web
pnpm install
npm run build  
pm2 reload app 
# ------------------------------------------------------------
 cd htdocs/dashboard.ajarsyria.com/ajar-app/ ; git pull origin main ; cd apps/admin ; npm install ; npm run build ; pm2 reload app 
 cd htdocs/ajarsyria.com/ajar-app/ ; git pull origin main ; cd apps/web ; npm install ; npm run build ; pm2 reload app 
nano 

cd htdocs/ajarsyria.com/ajar-app/ 
git pull origin main 
cd apps/web 
npm install 
npm run build 
pm2 reload app 

ssh -t ajarsyria-dashboard@82.29.178.80
cd ~/htdocs/dashboard.ajarsyria.com/ajar-app ; git pull ; cd apps/admin ; pm2 stop app ; pnpm run build ; pm2 restart app

ssh -t ajarsyria@82.29.178.80
cd ~/htdocs/ajarsyria.com/ajar-app ; git pull ; cd apps/web ; pm2 stop app ; pnpm run build ; pm2 restart app