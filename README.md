# پروژه‌یار: دستیار هوشمند تیم

ما در حال ساخت یک اپلیکیشن وب به زبان فارسی با React ،TypeScript و Tailwind برای سرویس «تیم فلو» (دستیار هوشمند کنترل پروژه) هستیم. 

فعلاً هیچ دیتابیس یا بک‌اندی وصل نکن — فقط UI کامل با داده‌های نمونه (mock data).

قبل از ساخت هر صفحه‌ای، تنظیمات دیزاین سیستم را کامل تنظیم کن:

- زبان و جهت: کل سایت فارسی راست‌چین (RTL). در html باید lang="fa" و dir="rtl" داشته باشد.

- تمام کلاس‌های Tailwind منطبق با RTL باشد (استفاده از -ps-, -pe-, -ms-, -me-, -start-, -end به جای left/right).

- اعداد در رابط کاربری فارسی نمایش داده شوند. یک تابع کمکی toPersianDigits بساز و همه جا استفاده کن.

- فونت: فونت Estedad را از Google Fonts لود کن و به عنوان فونت پیش‌فرض Tailwind پروژه تنظیم کن (font-sans). وزن‌های ۴۰۰، ۵۰۰ و ۷۰۰ لود شوند.

- رنگ‌ها: CSS Variables در index.css تعریف کن و در tailwind.config اضافه کن:

  * primary: #170C79

  * secondary: #34D399

  * accent: #F59E0B

  برای سایر رنگ‌ها از رنگ‌های استاندارد Tailwind استفاده کن. هیچ کجا رنگ hex هاردکد نکن.

- دارک مود: با کلاس dark پیاده‌سازی شود. تمام متغیرهای CSS برای دو حالت light و dark تعریف شوند. یک کامپوننت ThemeToggle بساز که بین light / dark سوییچ کند و انتخاب کاربر را در localStorage نگه دارد.

- سبک طراحی: مینیمال، بدون سایه‌های سنگین، بدون گرادینت‌های شلوغ. فضاهای خالی (whitespace) زیاد، پدینگ حداقل py-24، فاصله بین بلوک‌ها زیاد.

- تایپوگرافی درشت: تیترهای اصلی حدود 3rem تا 4rem، تیتر بخش‌ها 2rem، line-height حدود ۱.۹ برای فارسی.

- فقط دو وزن فونت معمولی و بولد استفاده شود.

- بوردرها نازک و کم‌رنگ با border-radius ملایم (حدود 12px).

- کاملاً responsive با رویکرد mobile-first.

فعلاً فقط یک صفحه خالی با هدر ساده و ThemeToggle بساز تا این دیزاین سیستم را ببینیم.
در هدرِ صفحه، نام پروژه یعنی «پروژه‌یار» را با تایپوگرافی شیک قرار بده

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/91c221e2-b5df-45e9-90ae-f22b8c822d28).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
