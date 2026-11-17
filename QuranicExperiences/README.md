# صفحه فعالیت‌های قرآنی علی اسماعیل‌پور

## ساختار
- `index.html`: صفحه اصلی
- `assets/css/style.css`: طراحی و واکنش‌گرایی
- `assets/js/app.js`: فیلتر، پخش و دانلود آرشیو
- `assets/voices.js`: اطلاعات تلاوت‌ها
- `assets/videos.js`: اطلاعات ویدئوها
- `assets/img/recitation-hero.webp`: تصویر شاخص تلاوت
- `assets/img/ali-portrait.webp`: پرتره
- `Voices/`: فایل‌های صوتی
- `Videos/`: فایل‌های ویدئویی

## افزودن تلاوت
فایل MP3 را داخل `Voices/` قرار دهید و یک شیء با مشخصات آن به آرایه `window.QURAN_VOICES` در `assets/voices.js` اضافه کنید. مسیر فایل را از ریشه پوشه `quran` بنویسید؛ مانند `Voices/example.mp3`.

فیلدهای قابل استفاده: `id`, `city`, `type`, `surah`, `ayah`, `place`, `duration`, `file`.

## افزودن ویدئو
فایل MP4 را در `Videos/` قرار دهید و مشخصات آن را به آرایه `window.QURAN_VIDEOS` در `assets/videos.js` اضافه کنید.

## انتشار
کل پوشه `quran` را با همین ساختار روی وب‌سرور قرار دهید. صفحه را با آدرس وب باز کنید، نه با دوبار کلیک روی فایل HTML. متاتگ `noindex, follow` حفظ شده است.
