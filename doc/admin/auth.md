# Authentication ✅ 😎
@project: [apps/admin](/apps/admin)
@reference: [API docs](/doc/API-docx.json)
- integration with `useApi`  
    - verify-otp
    - login
    - forgot-password
    - reset-password
    - logout

- layout Auth Page
    - return to auth page
- lib
    - isAuthenticated
    - getToken
    - storeToken in cookies

# كيف يعمل otp
- Verify Otp بترجع توكن بنخزنه مؤقتا بي لحتى نقدر نغير كلمة المرور
- وادارة التوجيه تبع otp 
نضيف قيمة في localstorge تشير الى اننا نقوم بتفعيل الحساب مكان تخزينها في تسجيل الدخول والتسجيل قبل اعادة التوجيه للتمييز بين تفعيل الحساب واستعادة كلمة المرور
- الخطوة السابقة لا تلزم في otp للوحة التحكم
- طبعا التوكن المؤقت نستخدمه فقط لتغيير كلمة المرور ثم نقوم بتسجيل الدخول تلقائيا وحذف التوكل المؤقت
 