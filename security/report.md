# تقرير أمني احترافي لمنصة **Ajar** (نظرة معمارية وتوصيات عملية)

**نطاق التقرير:** تحليل تصميمي ومخاطر أمنية مبني على وصف المشروع وبنية المونوربو (Next.js 14 frontend، Laravel backend API، JWT، رفع ملفات سحابي، Google Maps، real-time notifications). **لم يُجر فحص فعلي على بيئة حية أو ريبو** — هذا تقرير تقييمي يُظهر المخاطر المتوقعة، طرق الاستغلال النموذجية، وأولويات الإصلاح مع خطوات تنفيذية قابلة للتطبيق.

---

## ملخص تنفيذي

* **الحالة العامة:** بنية تقنية شائعة ومُنظمة، لكن تحتوي على مخاطر أمنية متوقعة تتعلق بإدارة الأسرار، رفع الملفات، إدارة الجلسات (JWT/Refresh tokens)، التحكم بالوصول (admin/IDOR)، وواجهات إدخال المستخدم (XSS/CSRF).
* **أعلى مخاطر ذات أولوية:**

  1. تسريب مفاتيح API (مثل Google Maps). — *HIGH*
  2. رفع ملفات غير مُعقّم أو قابل للتنفيذ. — *HIGH*
  3. إدارة JWT وعمليات الإبطال/تدوير الـ refresh tokens. — *HIGH*
  4. Broken Access Control / IDOR للوحات الإدارة وموارد المستخدم. — *HIGH*
  5. XSS عبر أوصاف العقارات والتعليقات. — *MEDIUM-HIGH*
* **خلاصة التوصية:** معالجة فورية للـ hotfixes (مفاتيح، رفع الملفات، TLS/headers، rate limiting)، ثم تحسينات هيكلية (token rotation، سياسات وصول، فحص تلقائي للاعتمادات)، وأخيراً اختبار اختراق شامل (DAST + manual pentest).

---

## تفاصيل نقاط الضعف، أثرها، واستراتيجية التصحيح

### 1. تسرب مفاتيح API / أسرار بيئة

* **الوصف:** متغيرات بيئة من نوع `NEXT_PUBLIC_*` أو `.env` قد تُرفع أو تُستخدم بشكل غير آمن في الواجهة.
* **الأثر:** استغلال خدمات خارجية باسم المشروع، استنزاف الحصص، فواتير غير متوقعة، الكشف عن بيانات حساسة.
* **تدابير عاجلة:**

  * قصر مفاتيح Google Maps على HTTP referrers في Google Cloud Console.
  * منع رفع ملفات `.env*` إلى الريبو؛ تشغيل secret scanning في CI (git-secrets/truffleHog).
  * نقل الأسرار إلى secret manager (Vault / AWS/GCP secret manager).

### 2. رفع ملفات (File Uploads)

* **الوصف:** استقبال ملفات للممتلكات والتحقّق غير كافٍ قد يسمح برفع ملفات خبيثة أو تنفيذية.
* **الأثر:** RCE مسارياً، XSS من SVGs، تسريب بيانات.
* **تدابير عاجلة:**

  * قبول امتدادات محددة فقط (jpg, png, webp, pdf)، فحص MIME وmagic bytes.
  * استخدام مساحة تخزين سحابي مع سياسات تمنع التنفيذ (S3/GCS) وتقديم الملفات عبر signed URLs.
  * إجراء virus-scan على الملفات قبل قبولها (ClamAV أو خدمات تجارية).
  * عند عرض SVG: تطهير (sanitize) قبل الإظهار وعدم الاعتماد على `dangerouslySetInnerHTML`.

### 3. إدارة المصادقة (JWT + Phone OTP)

* **الوصف:** مخاطر تدوير refresh tokens، ضعف التحكم في إبطال التوكنات، وغياب قيود على OTP.
* **الأثر:** اختطاف جلسات، محاولات brute-force على OTP، مصادقة مزورة.
* **توصيات:**

  * Access tokens قصيرة المدى (مثلاً 15–60 دقيقة)، وRefresh tokens مع تدوير (rotating tokens) وآلية إبطال.
  * وضع Refresh tokens في HttpOnly Secure cookies مع SameSite مناسب أو بدلاً من ذلك اعتماد آلية server-side revocation.
  * فرض rate limiting على OTP وعمليات الدخول، إضافة حظر مؤقت بعد N محاولات فاشلة، واستخدام reCAPTCHA عند الحاجة.

### 4. Broken Access Control / IDOR

* **الوصف:** عدم التحقق الخادمي من ملكية المورد عند CRUD على العقارات أو العمليات الحساسة في الـ Admin.
* **الأثر:** تعديل/حذف موارد لمستخدمين آخرين، كشف بيانات خاصة.
* **توصيات:**

  * تحقق Authorization على الخادم لكل endpoint (Policies/Gates في Laravel).
  * تنفيذ اختبارات وحدات تكاملية تغطي حالات الوصول (positive/negative).
  * تطبيق نموذج RBAC واضح مع أذونات CRUD محددة.

### 5. XSS و CSP

* **الوصف:** محتوى المستخدم (عناوين، أوصاف، تعليقات) قد يحتوي شفرات خبيثة.
* **الأثر:** سرقة جلسات، استهداف المستخدمين، تنفيذ إجراءات ضارة عبر المتصفح.
* **توصيات:**

  * استخدام escaping افتراضي في الواجهة (React) وتجنّب `dangerouslySetInnerHTML`. إن لزم، استخدم DOMPurify قبل الإدراج.
  * تطبيق Content-Security-Policy صارم لمنع تحميل سكربتات من مصادر غير موثوقة.

### 6. CSRF و CORS

* **الوصف:** إعداد غير صحيح قد يسمح بطلبات مزورة أو استدعاءات من مواقع خارجية.
* **التوصيات:**

  * إذا تُستخدم الكوكيز للمصادقة: نفّذ CSRF tokens أو double-submit cookie.
  * قصر `Access-Control-Allow-Origin` على نطاقات موثوقة وعدم استخدام `*` عند السماح بـ credentials.

### 7. الاعتمادات وسلسلة التوريد

* **الوصف:** ثغرات معروفة في حزم npm أو composer قد تتسلل للمشروع.
* **التوصيات:** تشغيل `pnpm audit` و`composer audit`، تفعيل Dependabot/Snyk، وضع CI يفشل على ثغرات حرجة.

### 8. الشبكة والرؤوس الأمنية (TLS + Headers)

* **توصيات:** فرض HTTPS، تفعيل HSTS، إضافة رؤوس أمان: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, وCSP كما سبق.

### 9. Logging & Monitoring

* **الوصف:** الحاجة لسجلات تدقيق (audit logs) وتنبيهات عند سلوك مشبوه.
* **توصيات:** سجل نشاطات حساسة (login failures، token revocations)، فعّل تنبيهات عند أنماط شاذة. احمِ السجلات من الوصول غير المصرح وحافظ على سياسة retention واضحة.

---

## خطة إصلاح مُوصى بها (مرتبة حسب الأولوية)

### Hotfixs — تنفيذ فوري (24–72 ساعة)

1. قصر Google Maps key على referrers وإنهاء أي مفاتيح مسربة.
2. فرض HTTPS + HSTS + رؤوس أمان أساسية.
3. حظر رفع ملفات تنفيذية وفحص الـ MIME & magic bytes.
4. إضافة rate-limiting على endpoints المصادقة وOTP.
5. إضافة فحص اعتمادات أساسي في CI (`pnpm audit`, `composer audit`).

### تحسينات قصيرة الأمد (1–3 أسابيع)

1. تنفيذ تدوير refresh tokens وآلية إبطال.
2. وضع server-side authorization لكل endpoint الحساس.
3. إضافة virus scanning للملفات المرفوعة.
4. تفعيل CSP تدريجيًا واختباره على Staging.

### تحسينات متوسطة/طويلة المدى (1–3 أشهر)

1. إجراء اختبار اختراق كامل (DAST + manual pentest بواسطة مختص).
2. تفعيل SCA/Dependabot + إدارة ثغرات مستمرة.
3. دمج secret manager في CI/CD، وحظر تسريب الأسرار من الـ history.
4. إعداد سياسة إدارة حوادث واستراتيجية استجابة للحوادث (IR plan).

---

## اختبارات وفحوصات مقترحة (Checklist للفحص الآلي واليدوي)

* Authentication: expiry, refresh rotation, replay prevention, brute force.
* Authorization: IDOR checks لكل موارد CRUD.
* File upload: content-type bypass, double extension, svg/script.
* XSS: reflected, stored, DOM-based.
* CSRF: endpoints التي تستخدم cookies.
* SSRF: أي endpoint يقوم بقراءة موارد خارجية.
* Injection: SQL/NoSQL fuzzing.
* Rate limiting: محاولة brute-force على OTP وAuth endpoints.
* Sensitive data exposure: search for `.env`, source maps، stack traces.
* Dependency scanning: CVE audit.

---

## أدوات مقترحة للتنفيذ والـ CI

* **DAST / Manual pentest:** OWASP ZAP, Burp Suite (محترف للاختبارات اليدوية).
* **SAST / قواعد:** Semgrep (قواعد OWASP).
* **Dependency scanning:** Snyk, Dependabot, `pnpm audit`, `composer audit`.
* **Secret scanning:** git-secrets, truffleHog.
* **Malware/antivirus on upload:** ClamAV أو API تجاري.
* **Container scanning:** Trivy.
* **WAF / Rate limiting:** Cloudflare / Nginx rate-limit / API gateway.
* **Monitoring:** Sentry + Prometheus/Datadog alerts.

---

## مقتطفات تنفيذية مُختصرة (أمثلة سريعة)

* **CSP & security headers (Next.js middleware)**

```ts
// apps/web/middleware.ts
import { NextResponse } from 'next/server';
export function middleware(req) {
  const res = NextResponse.next();
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; object-src 'none';");
  return res;
}
```

* **فحص نوع الملف بالـ magic bytes (Node/Next)**

```ts
import fileType from 'file-type';
const buffer = Buffer.from(await file.arrayBuffer());
const type = await fileType.fromBuffer(buffer);
if (!type || !['image/png','image/jpeg','application/pdf'].includes(type.mime)) {
  throw new Error('Unsupported file type');
}
```

* **مبدأ تدوير Refresh Token (ملاحظات):** عند كل استعمال للـ refresh token، اصدر refresh token جديد وسجل الإصدار السابق كملغى. خزّن version أو jti في DB للتحقق.

---

## مصفوفة مخاطر سريعة

| خطر                        |      أولوية | إجراء فوري                                    |
| -------------------------- | ----------: | --------------------------------------------- |
| تسريب مفاتيح API           |        HIGH | قصر referrers، نقل للأسرار إلى secret manager |
| رفع ملفات غير آمن          |        HIGH | فحص MIME, منع التنفيذ، signed URLs            |
| JWT / token management     |        HIGH | token rotation، blacklist                     |
| Broken ACL / IDOR          |        HIGH | server-side policies، اختبارات                |
| XSS                        | MEDIUM-HIGH | output encoding، CSP                          |
| Dependency vulnerabilities |      MEDIUM | SCA + CI checks                               |
| CORS misconfig             |      MEDIUM | whitelist origins                             |
| CSRF                       |      MEDIUM | CSRF tokens / SameSite cookies                |

---
 