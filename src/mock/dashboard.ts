/** داده‌های نمونه داشبورد مدیر پروژه */
import { toPersianDigits } from "@/lib/persian";

export type KpiId = "progress" | "delay" | "blockers";

export const dashboardKpis = [
  {
    id: "progress" as KpiId,
    title: "پیشرفت برنامه‌ای vs واقعی",
    value: `${toPersianDigits(65)}٪ | ${toPersianDigits(52)}٪`,
    detail: "برنامه‌ای ۶۵٪ — واقعی ۵۲٪",
    tone: "text-destructive",
  },
  {
    id: "delay" as KpiId,
    title: "انحراف زمانی (Delay)",
    value: `${toPersianDigits(12)} روز تاخیر`,
    detail: "نسبت به برنامه پایه",
    tone: "text-warning",
  },
  {
    id: "blockers" as KpiId,
    title: "موانع فعال (Active Blockers)",
    value: `${toPersianDigits(3)} مانع بحرانی`,
    detail: "نیازمند اقدام فوری",
    tone: "text-destructive",
  },
];

export const sCurveData = [
  { month: "فروردین", planned: 8, actual: 6 },
  { month: "اردیبهشت", planned: 18, actual: 14 },
  { month: "خرداد", planned: 30, actual: 24 },
  { month: "تیر", planned: 42, actual: 33 },
  { month: "مرداد", planned: 54, actual: 42 },
  { month: "شهریور", planned: 65, actual: 52 },
  { month: "مهر", planned: 76, actual: null },
  { month: "آبان", planned: 86, actual: null },
  { month: "آذر", planned: 94, actual: null },
  { month: "دی", planned: 100, actual: null },
];

export const criticalDelayedTasks = [
  { id: "A-214", title: "نصب تجهیزات مکانیکی واحد A", wbs: "۳.۲.۱", delayDays: 18, variancePct: 24 },
  { id: "A-187", title: "تحویل و بازرسی پنل‌های الکتریکی", wbs: "۴.۱.۳", delayDays: 14, variancePct: 19 },
  { id: "A-156", title: "اجرای فونداسیون مخزن ذخیره", wbs: "۲.۴.۲", delayDays: 11, variancePct: 16 },
  { id: "A-132", title: "تست یکپارچگی سیستم کنترل", wbs: "۵.۳.۱", delayDays: 9, variancePct: 12 },
];

export const overviewStats = [
  { label: "پیشرفت واقعی", value: "۶۲٪" },
  { label: "پیشرفت برنامه‌ای", value: "۷۰٪" },
  { label: "فعالیت‌های دارای تاخیر", value: toPersianDigits(9) },
  { label: "گزارش‌های امروز", value: toPersianDigits(14) },
];
