# Authentication
@project: [apps/web](/apps/web)
@reference: [API docs](/doc/API-docx.json)
- integration with `useApi` 
    - register
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
 
# Stap 
كل بتحليل كل صفحلة لرد واحد والصحيحة قم بوضع صح عليها 
وسوف اتعامل مع كل صفحة واحدة على حدة
حدث هذه المهام
- [✔️] login form
    - [✔️] add phone input component in login form
    - [✔️] add validation for phone input
    - [✔️] add SEO 
    - [✔️] add translation
    - [✔️] support for direction rtl and ltr
    - [✔️] add masaege in response if phone is not found
        - [✔️] add toast message
        - [✔️] if account not found
        - [✔️] if account not active => redirect to verify otp page
            {
                "success": false,
                "message": "Your account is not verified.",
                "key": "auth.account_not_verified"
            }
        - [✔️] if account active 
            - [✔️] save access token in cookies
            - [✔️] save user in cookies
            - [✔️] redirect to home page 
    - reponse data login
```json
{
    "success": true,
    "access_token": "28|6L4CA6l6ZPVWThjSkWAR6jFEnLN19k0dJt19b8c447f38ef3",
    "message": "Login successful.",
    "key": "auth.login_success",
    "data": {
        "id": 1,
        "first_name": "ahmed",
        ...
    }
}
```
- [✔️] register form
    - [✔️] add phone input component in register form
    - [✔️] add translation
    - [✔️] add validation for phone input
    - [✔️] add SEO meta tags
    - [✔️] add translation
    - [✔️] support RTL/LTR
    - [✔️] success register => redirect to verify otp page
        - [✔️] store user data in sessionStorage
        - [✔️] store OTP info in sessionStorage
        - [✔️] redirect with phone, type, and expire params
        {
            "success": true,
            "message": "We have sent a verification code to your phone. Please check your SMS to activate your account.",
            "key": "auth.we_sent_verification_code_to_your_phone",
            "data": {
                "id": 10,
                "first_name": "Qotayba",
                ...
            },
            "info": {
                "code_duration": 5,
                "otp_expire_at": "2025-10-08T20:24:50.456599Z"
            }
        }
    - reponse data register
    - ...
```json
{
    "success": true,
    "message": "We have sent a verification code to your phone. Please check your SMS to activate your account.",
    "key": "auth.we_sent_verification_code_to_your_phone",
    "data": {
        "id": 10,
        "first_name": "Qotayba",
        "last_name": "Mohammad",
        "full_name": "Qotayba Mohammad",
        "phone": "96170723171",
        "email": "",
        "role": "user",
        "status": "active",
        "phone_verified": false,
        "avatar": "avatars\/default_avatar.jpg",
        "avatar_url": "https:\/\/ajar-backend.mystore.social\/storage\/avatars\/default_avatar.jpg",
        "language": null,
        "wallet_balance": 0,
        "notifications_unread_count": 0,
        "listings_count": 0,
        "created_at": "2025-10-08 20:19:50",
        "updated_at": "2025-10-08 20:19:50"
    },
    "info": {
        "code_duration": 5,
        "otp_expire_at": "2025-10-08T20:24:50.456599Z"
    }
}
```
- [✔️] verify otp form
    - [✔️] add translation
    - [✔️] add SEO metadata
    - [✔️] support 3 types: register, login, reset
    - [✔️] read data from URL params (phone, type, expire)
    - [✔️] read data from sessionStorage (temp_user_data, otp_info)
    - [✔️] OTP expiry timer display
    - [✔️] resend OTP functionality
    - [✔️] handle success response with access_token
    - [✔️] clear sessionStorage after verification
    - [✔️] redirect based on type
    - [ ] what this use OTP acive account or reset password
```json
{
    "success": true,
    "data": {
        "access_token": "1234567890",
        "token_type": "Bearer",
        "expires_in": 1800
    }
}
```
- [✔️] reset password form 
    - [✔️] add SEO metadata
    - [✔️] add translation
    - [✔️] support RTL/LTR
    - [✔️] password matching validation
    - [✔️] read phone from URL or sessionStorage
    - [✔️] use Authorization header with token
    - [✔️] clear sessionStorage after success
    - [✔️] redirect to login with locale
    - [✔️] response handling
```json
{
    "success": true,
    "data": {
        "access_token": "1234567890",
        "token_type": "Bearer",
        "expires_in": 1800
    }
}
```
- [✔️] forgot password form
    - [✔️] add PhoneInput component
    - [✔️] add phone validation
    - [✔️] add SEO meta tags
    - [✔️] add translation
    - [✔️] support RTL/LTR
    - [✔️] store OTP info in sessionStorage
    - [✔️] redirect with phone, type=reset, and expire params
    - [✔️] response handling
```json
{
    "success": true,
    "data": {
        "access_token": "1234567890",
        "token_type": "Bearer",
        "expires_in": 1800
    }
}
```

