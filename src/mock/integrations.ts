/** داده‌های نمونه یکپارچه‌سازی */
export type ApiKeyRecord = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string;
  secret?: string;
};

export const projectCode = "PRJ-91C221";

export const defaultWebhookUrl =
  "https://n8n.example.com/webhook/projectyar-daily-reports";

export const initialApiKeys: ApiKeyRecord[] = [
  {
    id: "key_1",
    name: "n8n production",
    prefix: "py_live_8f3a",
    createdAt: "۱۴۰۴/۰۵/۰۱",
    lastUsed: "امروز — ۱۰:۱۲",
  },
];

export const sampleJson = `{
  "project_id": "prj_91c221",
  "task_id": "A-214",
  "reporter": "حسین رضایی",
  "progress_pct": 48,
  "note": "نصب تجهیزات ادامه دارد؛ منتظر فلنج DN200",
  "reported_at": "2026-08-11T09:15:00+03:30",
  "channel": "bale"
}`;

export const sampleCurl = `curl -X POST "https://api.projectyar.app/v1/field-reports" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "project_id": "prj_91c221",
    "task_id": "A-214",
    "reporter": "حسین رضایی",
    "progress_pct": 48,
    "note": "نصب تجهیزات ادامه دارد",
    "channel": "telegram"
  }'`;

export const messengerSteps = [
  "ربات رسمی پروژه‌یار را در بله، تلگرام یا ایتا پیدا و Start کنید.",
  "کد پروژه را از پنل زیر کپی کرده و برای ربات ارسال نمایید.",
  "نیروهای میدانی می‌توانند روزانه وضعیت تسک را با پیام متنی یا فرم کوتاه ارسال کنند.",
  "گزارش‌ها از طریق webhook به n8n و سپس به داشبورد پروژه‌یار منتقل می‌شوند.",
] as const;

