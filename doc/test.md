# test
- pnpm audit
## apps desktop web
```yaml     
[locale]/
├── (public)/ 
      - @nav ✅
      - @langs ✅
      - @filter
      - @menu
      - @footer
      - @SEO ✅
      - @content
        - @catagory ✅
          # Skeleton ✅
          # data ✅
        - @listings ✅
          # Skeleton ✅
          # data ✅
│   ├── (auth)/
│   │   ├── forgot-password 
│   │   ├── login 
│   │   ├── register 
│   │   ├── reset-password 
│   │   ├── verify-otp 
│   ├── (pages)/ 
│   │   ├── [page] 
│   ├── listings/[id]/ 
│   ├── map/
├── (isAuth)/         # is login
│   ├── favorites
│   ├── my-listings
│   │   ├── [id]
│   │   ├── create
│   ├── notifications
│   ├── profile
│   │   ├── chanage-password
│   │   ├── edit                    # @SEO, ui, apis
├── rebots.ts 
├── sitemap.ts 
```
## apps desktop admin
```yaml      
├── (auth)/
│   ├── forgot-password         # @SEO, ui, apis
│   ├── login                   # @SEO, ui, apis 
│   ├── reset-password          # @SEO, ui, apis
│   ├── verify-otp              # @SEO, ui, apis
├── (dashboard)/ 
│   ├── dashboard/   
│   ├── categories/
│   │   ├── properties/ 
│   │   ├── features/ 
│   ├── listings/
│   │   ├── [id]/ 
│   │   │   ├── edit/ 
│   │   ├── create/ 
│   ├── locations/ 
│   │   ├── governorates/
│   │   └── cities/
│   ├── notifications/  
│   ├── profile/
│   ├── reviews/       
│   ├── settings/
│   ├── sliders/
│   ├── users/ 
```

## apps mobile
