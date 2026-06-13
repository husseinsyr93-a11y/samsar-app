# دليل بناء وتنزيل APK — سمسار

## المتطلبات الأساسية

- حساب GitHub مع المشروع مرفوع عليه
- لا تحتاج Android Studio محلياً — GitHub Actions يبني كل شيء في السحابة

---

## الخطوة 1: رفع المشروع إلى GitHub

إذا لم يكن المشروع على GitHub بعد:

```bash
git init
git add .
git commit -m "Initial commit: سمسار app"
git remote add origin https://github.com/YOUR_USERNAME/samsar.git
git push -u origin main
```

---

## الخطوة 2: تشغيل GitHub Actions

يعمل الـ Workflow **تلقائياً** عند كل Push إلى `main`. يمكنك أيضاً تشغيله يدوياً:

1. افتح المشروع على GitHub
2. انقر تبويب **Actions**
3. اختر **Build Android APK & AAB** من القائمة اليسرى
4. انقر **Run workflow** → **Run workflow**

---

## الخطوة 3: انتظر البناء

- وقت البناء المتوقع: **15–25 دقيقة** في أول مرة
- الزيارات التالية أسرع بسبب الـ Cache (~8–12 دقيقة)
- راقب التقدم في تبويب **Actions**

---

## الخطوة 4: تنزيل APK/AAB

بعد اكتمال البناء بنجاح (✅):

1. افتح الـ Workflow Run المكتمل
2. مرر للأسفل إلى قسم **Artifacts**
3. ستجد:
   - `samsar-apk-N` — ملف APK للتثبيت المباشر
   - `samsar-aab-N` — ملف AAB لرفعه على Google Play
4. انقر لتنزيله (ملف ZIP يحتوي APK/AAB)
5. فك ضغط الملف

---

## الخطوة 5: تثبيت APK على الهاتف

### طريقة 1: مباشرة عبر USB
```bash
adb install samsar-release-unsigned.apk
```

### طريقة 2: نقل الملف للهاتف
1. انقل ملف APK للهاتف (Bluetooth / USB / Google Drive)
2. افتح الملف من مدير الملفات
3. اسمح بتثبيت التطبيقات من مصادر غير معروفة عند الطلب
4. ثبّت التطبيق

> **ملاحظة:** الـ APK الأول unsigned (غير موقّع). يعمل على الأجهزة مباشرة لكن لا يُقبل على Google Play. راجع قسم التوقيع أدناه.

---

## إعداد API Backend (مطلوب للتطبيق الكامل)

ليتمكن التطبيق من الاتصال بالسيرفر:

### الخيار أ: استخدام URL ثابت
1. انشر API server على Replit أو أي خادم
2. في GitHub Repository: اذهب إلى **Settings → Secrets → Actions**
3. أضف Secret جديد:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://your-deployed-api.replit.app/api`

### الخيار ب: تعديل capacitor.config.ts
```typescript
server: {
  url: "https://your-api-domain.com",
  cleartext: false,
}
```

---

## توقيع APK للنشر على Google Play (اختياري)

### إنشاء Keystore
```bash
keytool -genkey -v \
  -keystore samsar-release.jks \
  -keyalg RSA -keysize 2048 \
  -validity 10000 \
  -alias samsar
```

### رفع Keystore كـ GitHub Secrets
في **Settings → Secrets → Actions**، أضف:

| Secret Name | القيمة |
|---|---|
| `KEYSTORE_BASE64` | `base64 -i samsar-release.jks` |
| `KEY_ALIAS` | `samsar` |
| `KEYSTORE_PASSWORD` | كلمة مرور الـ Keystore |
| `KEY_PASSWORD` | كلمة مرور المفتاح |

عند إضافة هذه الـ Secrets، يوقّع الـ Workflow الـ APK تلقائياً.

---

## معلومات التطبيق

| الخاصية | القيمة |
|---|---|
| اسم التطبيق | سمسار |
| Package Name | `de.samsar.app` |
| Version Code | `1` |
| Version Name | `1.0.0` |
| Min SDK | `24` (Android 7.0) |
| Target SDK | `35` (Android 15) |

---

## استكشاف الأخطاء

### ❌ Gradle Build Failed
- تحقق من أن `pnpm install` نجح
- راجع لوج الـ Step المشكلة في Actions

### ❌ White Screen بعد التثبيت
- تأكد أن `VITE_API_BASE_URL` يشير لخادم يعمل
- تحقق من `capacitor.config.ts` → `server.url`
- فعّل `android.webContentsDebuggingEnabled: true` للتشخيص

### ❌ Network Error داخل التطبيق
- أضف `android.allowMixedContent: true` في `capacitor.config.ts`
- تأكد من إضافة `INTERNET` permission في AndroidManifest.xml

### ❌ Routing Issues (صفحات لا تفتح)
- Capacitor يستخدم `wouter` بدون `base` → لا تحتاج BASE_PATH
- ملف `vite.config.capacitor.ts` يضبط `base: "/"` تلقائياً

---

## ملفات مهمة

```
artifacts/simsar/
├── capacitor.config.ts        ← إعدادات Capacitor
├── vite.config.capacitor.ts   ← Vite config للـ Android build
├── android/                   ← يُنشأ تلقائياً في CI
│   └── app/
│       └── build/outputs/
│           ├── apk/release/   ← APK هنا
│           └── bundle/release/ ← AAB هنا
└── dist/                      ← Web assets (مدخل Capacitor)

.github/workflows/
└── android-build.yml          ← GitHub Actions Workflow
```

---

## روابط مفيدة

- [Capacitor Docs](https://capacitorjs.com/docs/android)
- [GitHub Actions Artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
- [Android Signing](https://developer.android.com/studio/publish/app-signing)
