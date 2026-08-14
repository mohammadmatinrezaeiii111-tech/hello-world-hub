/** داده‌های نمونه موانع پروژه */
export type BlockerStatus = "critical" | "reviewing" | "resolved";
export type Severity = "High" | "Medium" | "Low";

export type Blocker = {
  id: string;
  title: string;
  task: string;
  taskId: string;
  front: string;
  reporter: string;
  reportedAt: string;
  severity: Severity;
  status: BlockerStatus;
  description: string;
  imageUrl: string;
  imageAlt: string;
  delayDays: number;
  assignee: string | null;
};

export const workFronts = ["همه جبهه‌ها", "مکانیکال", "الکتریکال", "عمران", "کنترل"] as const;

export const assignees = ["علی محمدی", "سارا کریمی", "رضا نوری", "نرگس احمدی"] as const;

export const initialBlockers: Blocker[] = [
  {
    id: "B-041",
    title: "توقف نصب به‌دلیل نبود فلنج اتصال",
    task: "نصب تجهیزات مکانیکی واحد A",
    taskId: "A-214",
    front: "مکانیکال",
    reporter: "حسین رضایی",
    reportedAt: "۱۴۰۴/۰۵/۲۰ — ۰۹:۱۵",
    severity: "High",
    status: "critical",
    description:
      "فلنج‌های DN200 مطابق مشخصات فنی در انبار موجود نیست و کار نصب پمپ متوقف شده است. تامین‌کننده اعلام کرده تحویل حداقل ۷۲ ساعت زمان می‌برد.",
    imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=640&q=80",
    imageAlt: "منطقه نصب تجهیزات مکانیکی",
    delayDays: 3,
    assignee: null,
  },
  {
    id: "B-038",
    title: "تاخیر بازرسی پنل‌های الکتریکی",
    task: "تحویل و بازرسی پنل‌های الکتریکی",
    taskId: "A-187",
    front: "الکتریکال",
    reporter: "مریم اکبری",
    reportedAt: "۱۴۰۴/۰۵/۱۹ — ۱۶:۴۰",
    severity: "High",
    status: "reviewing",
    description:
      "بازرس شخص ثالث امروز در سایت حاضر نشد. بدون تایید بازرسی، امکان energize پنل‌ها وجود ندارد و مسیر کابل‌کشی وابسته متوقف می‌ماند.",
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=640&q=80",
    imageAlt: "پنل‌های الکتریکی در محل پروژه",
    delayDays: 2,
    assignee: "سارا کریمی",
  },
  {
    id: "B-035",
    title: "تداخل مسیر حمل با پیمانکار هم‌جوار",
    task: "اجرای فونداسیون مخزن ذخیره",
    taskId: "A-156",
    front: "عمران",
    reporter: "کاوه موسوی",
    reportedAt: "۱۴۰۴/۰۵/۱۸ — ۱۱:۰۵",
    severity: "Medium",
    status: "critical",
    description:
      "مسیر دسترسی جرثقیل توسط دپوی مصالح پیمانکار هم‌جوار مسدود شده و بتن‌ریزی فونداسیون امکان‌پذیر نیست تا مسیر آزاد شود.",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=640&q=80",
    imageAlt: "مسیر دسترسی جبهه عمرانی",
    delayDays: 2,
    assignee: null,
  },
  {
    id: "B-029",
    title: "نقص در سیگنال‌دهی حلقه کنترل",
    task: "تست یکپارچگی سیستم کنترل",
    taskId: "A-132",
    front: "کنترل",
    reporter: "الهام جعفری",
    reportedAt: "۱۴۰۴/۰۵/۱۷ — ۱۴:۲۰",
    severity: "Medium",
    status: "reviewing",
    description:
      "در تست حلقه کنترل، نویز غیرمجاز روی سیگنال آنالوگ مشاهده شد. تیم ابزار دقیق در حال بررسی شیلد کابل و ارتینگ است.",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=640&q=80",
    imageAlt: "تجهیزات کنترل و ابزار دقیق",
    delayDays: 1,
    assignee: "رضا نوری",
  },
  {
    id: "B-021",
    title: "رفع کمبود نیروی جوشکار شیفت دوم",
    task: "ساخت اسکلت نگهدارنده مخزن",
    taskId: "A-118",
    front: "مکانیکال",
    reporter: "امیر حسینی",
    reportedAt: "۱۴۰۴/۰۵/۱۴ — ۱۰:۳۰",
    severity: "Low",
    status: "resolved",
    description:
      "کمبود جوشکار شیفت دوم با اعزام دو نیروی کمکی از پیمانکار فرعی برطرف شد و تولید اسکلت از سر گرفته شد.",
    imageUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=640&q=80",
    imageAlt: "کارگاه جوشکاری اسکلت فلزی",
    delayDays: 0,
    assignee: "علی محمدی",
  },
];
