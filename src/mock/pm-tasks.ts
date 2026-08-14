export type TaskStatus = "on-track" | "delayed" | "blocked" | "completed";

export type DailyReport = {
  id: string;
  date: string;
  progressPct: number;
  note: string;
  reporter: string;
};

export type TaskBlockerRecord = {
  id: string;
  title: string;
  severity: "High" | "Medium" | "Low";
  reportedAt: string;
  resolvedAt: string | null;
  status: "open" | "resolved";
  impact: string;
};

export type PmTaskDetail = {
  id: string;
  title: string;
  wbs: string;
  weight: number;
  owner: string;
  status: TaskStatus;
  baselineStart: string;
  baselineEnd: string;
  estimatedStart: string;
  estimatedEnd: string;
  reports: DailyReport[];
  blockers: TaskBlockerRecord[];
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  "on-track": "مطابق برنامه",
  delayed: "دارای تاخیر",
  blocked: "متوقف / دارای مانع",
  completed: "تکمیل‌شده",
};

export const pmTasks: Record<string, PmTaskDetail> = {
  "A-214": {
    id: "A-214",
    title: "نصب تجهیزات مکانیکی واحد A",
    wbs: "۳.۲.۱",
    weight: 8.5,
    owner: "علی محمدی",
    status: "delayed",
    baselineStart: "۱۴۰۴/۰۴/۲۰",
    baselineEnd: "۱۴۰۴/۰۵/۱۵",
    estimatedStart: "۱۴۰۴/۰۴/۲۴",
    estimatedEnd: "۱۴۰۴/۰۶/۰۲",
    reports: [
      {
        id: "r1",
        date: "۱۴۰۴/۰۴/۲۴",
        progressPct: 5,
        note: "آماده‌سازی بستر نصب و جانمایی تجهیزات آغاز شد.",
        reporter: "علی محمدی",
      },
      {
        id: "r2",
        date: "۱۴۰۴/۰۴/۲۸",
        progressPct: 18,
        note: "تراز کردن شاسی پمپ‌ها انجام شد؛ منتظر فلنج‌های اتصال هستیم.",
        reporter: "علی محمدی",
      },
      {
        id: "r3",
        date: "۱۴۰۴/۰۵/۰۵",
        progressPct: 32,
        note: "نصب بدنه اصلی انجام شد. کمبود فلنج DN200 باعث توقف جزئی شده است.",
        reporter: "حسین رضایی",
      },
      {
        id: "r4",
        date: "۱۴۰۴/۰۵/۱۲",
        progressPct: 41,
        note: "کار روی مسیرهای فرعی ادامه دارد؛ مسیر بحرانی همچنان متوقف است.",
        reporter: "علی محمدی",
      },
      {
        id: "r5",
        date: "۱۴۰۴/۰۵/۲۰",
        progressPct: 48,
        note: "پیگیری تامین فلنج ادامه دارد. پیشرفت واقعی از برنامه عقب است.",
        reporter: "علی محمدی",
      },
    ],
    blockers: [
      {
        id: "B-041",
        title: "توقف نصب به‌دلیل نبود فلنج اتصال",
        severity: "High",
        reportedAt: "۱۴۰۴/۰۵/۲۰ — ۰۹:۱۵",
        resolvedAt: null,
        status: "open",
        impact: "تاخیر احتمالی ۳ روزه کل پروژه",
      },
      {
        id: "B-033",
        title: "کمبود نیروی جوشکار شیفت دوم",
        severity: "Medium",
        reportedAt: "۱۴۰۴/۰۵/۰۲ — ۱۴:۱۰",
        resolvedAt: "۱۴۰۴/۰۵/۰۶ — ۱۱:۳۰",
        status: "resolved",
        impact: "۱ روز تاخیر موضعی",
      },
    ],
  },
  "A-187": {
    id: "A-187",
    title: "تحویل و بازرسی پنل‌های الکتریکی",
    wbs: "۴.۱.۳",
    weight: 6.2,
    owner: "سارا کریمی",
    status: "blocked",
    baselineStart: "۱۴۰۴/۰۴/۲۸",
    baselineEnd: "۱۴۰۴/۰۵/۱۰",
    estimatedStart: "۱۴۰۴/۰۵/۰۱",
    estimatedEnd: "۱۴۰۴/۰۵/۲۴",
    reports: [
      {
        id: "r1",
        date: "۱۴۰۴/۰۵/۰۱",
        progressPct: 10,
        note: "پنل‌ها به سایت رسید و در انبار موقت دپو شد.",
        reporter: "سارا کریمی",
      },
      {
        id: "r2",
        date: "۱۴۰۴/۰۵/۰۸",
        progressPct: 35,
        note: "بازرسی ظاهری انجام شد؛ منتظر بازرس شخص ثالث هستیم.",
        reporter: "مریم اکبری",
      },
      {
        id: "r3",
        date: "۱۴۰۴/۰۵/۱۵",
        progressPct: 42,
        note: "هماهنگی بازرسی به تعویق افتاد.",
        reporter: "سارا کریمی",
      },
      {
        id: "r4",
        date: "۱۴۰۴/۰۵/۱۹",
        progressPct: 45,
        note: "بازرس حاضر نشد؛ energize پنل‌ها متوقف است.",
        reporter: "مریم اکبری",
      },
    ],
    blockers: [
      {
        id: "B-038",
        title: "تاخیر بازرسی پنل‌های الکتریکی",
        severity: "High",
        reportedAt: "۱۴۰۴/۰۵/۱۹ — ۱۶:۴۰",
        resolvedAt: null,
        status: "open",
        impact: "تاخیر احتمالی ۲ روزه کل پروژه",
      },
    ],
  },
  "A-156": {
    id: "A-156",
    title: "اجرای فونداسیون مخزن ذخیره",
    wbs: "۲.۴.۲",
    weight: 7.0,
    owner: "کاوه موسوی",
    status: "delayed",
    baselineStart: "۱۴۰۴/۰۴/۱۰",
    baselineEnd: "۱۴۰۴/۰۵/۰۵",
    estimatedStart: "۱۴۰۴/۰۴/۱۲",
    estimatedEnd: "۱۴۰۴/۰۵/۱۶",
    reports: [
      {
        id: "r1",
        date: "۱۴۰۴/۰۴/۱۲",
        progressPct: 8,
        note: "گودبرداری و آماده‌سازی آرماتور آغاز شد.",
        reporter: "کاوه موسوی",
      },
      {
        id: "r2",
        date: "۱۴۰۴/۰۴/۲۰",
        progressPct: 28,
        note: "قالب‌بندی بخش اول تکمیل شد.",
        reporter: "کاوه موسوی",
      },
      {
        id: "r3",
        date: "۱۴۰۴/۰۵/۰۱",
        progressPct: 50,
        note: "بتن‌ریزی نیمه‌کاره ماند به‌دلیل انسداد مسیر جرثقیل.",
        reporter: "کاوه موسوی",
      },
      {
        id: "r4",
        date: "۱۴۰۴/۰۵/۱۸",
        progressPct: 58,
        note: "هنوز مسیر حمل آزاد نشده؛ کار روی بخش‌های جانبی ادامه دارد.",
        reporter: "کاوه موسوی",
      },
    ],
    blockers: [
      {
        id: "B-035",
        title: "تداخل مسیر حمل با پیمانکار هم‌جوار",
        severity: "Medium",
        reportedAt: "۱۴۰۴/۰۵/۱۸ — ۱۱:۰۵",
        resolvedAt: null,
        status: "open",
        impact: "تاخیر احتمالی ۲ روزه کل پروژه",
      },
    ],
  },
  "A-132": {
    id: "A-132",
    title: "تست یکپارچگی سیستم کنترل",
    wbs: "۵.۳.۱",
    weight: 5.4,
    owner: "رضا نوری",
    status: "delayed",
    baselineStart: "۱۴۰۴/۰۵/۰۱",
    baselineEnd: "۱۴۰۴/۰۵/۲۰",
    estimatedStart: "۱۴۰۴/۰۵/۰۳",
    estimatedEnd: "۱۴۰۴/۰۵/۲۹",
    reports: [
      {
        id: "r1",
        date: "۱۴۰۴/۰۵/۰۳",
        progressPct: 12,
        note: "راه‌اندازی اولیه PLC و چک سیگنال‌های دیجیتال انجام شد.",
        reporter: "رضا نوری",
      },
      {
        id: "r2",
        date: "۱۴۰۴/۰۵/۱۰",
        progressPct: 30,
        note: "تست حلقه‌های آنالوگ با نویز غیرمجاز مواجه شد.",
        reporter: "الهام جعفری",
      },
      {
        id: "r3",
        date: "۱۴۰۴/۰۵/۱۷",
        progressPct: 44,
        note: "بررسی شیلد و ارتینگ در جریان است.",
        reporter: "رضا نوری",
      },
    ],
    blockers: [
      {
        id: "B-029",
        title: "نقص در سیگنال‌دهی حلقه کنترل",
        severity: "Medium",
        reportedAt: "۱۴۰۴/۰۵/۱۷ — ۱۴:۲۰",
        resolvedAt: null,
        status: "open",
        impact: "تاخیر احتمالی ۱ روزه کل پروژه",
      },
    ],
  },
  "A-118": {
    id: "A-118",
    title: "ساخت اسکلت نگهدارنده مخزن",
    wbs: "۲.۳.۴",
    weight: 4.8,
    owner: "امیر حسینی",
    status: "completed",
    baselineStart: "۱۴۰۴/۰۳/۲۰",
    baselineEnd: "۱۴۰۴/۰۴/۱۵",
    estimatedStart: "۱۴۰۴/۰۳/۲۰",
    estimatedEnd: "۱۴۰۴/۰۴/۱۸",
    reports: [
      {
        id: "r1",
        date: "۱۴۰۴/۰۳/۲۰",
        progressPct: 15,
        note: "برش و آماده‌سازی قطعات اسکلت آغاز شد.",
        reporter: "امیر حسینی",
      },
      {
        id: "r2",
        date: "۱۴۰۴/۰۴/۰۱",
        progressPct: 55,
        note: "مونتاژ شاسی اصلی انجام شد.",
        reporter: "امیر حسینی",
      },
      {
        id: "r3",
        date: "۱۴۰۴/۰۴/۱۰",
        progressPct: 85,
        note: "جوشکاری نهایی در حال تکمیل است.",
        reporter: "امیر حسینی",
      },
      {
        id: "r4",
        date: "۱۴۰۴/۰۴/۱۸",
        progressPct: 100,
        note: "اسکلت تکمیل و تحویل شد.",
        reporter: "امیر حسینی",
      },
    ],
    blockers: [
      {
        id: "B-021",
        title: "رفع کمبود نیروی جوشکار شیفت دوم",
        severity: "Low",
        reportedAt: "۱۴۰۴/۰۴/۰۸ — ۱۰:۳۰",
        resolvedAt: "۱۴۰۴/۰۴/۱۲ — ۱۷:۰۰",
        status: "resolved",
        impact: "بدون تاثیر روی تاریخ پایان پروژه",
      },
    ],
  },
};

export const pmTaskList = Object.values(pmTasks);

export function getPmTask(id: string): PmTaskDetail | undefined {
  return pmTasks[id];
}
