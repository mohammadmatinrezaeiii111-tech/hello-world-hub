const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** تبدیل ارقام لاتین به ارقام فارسی */
export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]!);
}

/** تبدیل ارقام فارسی/عربی به لاتین */
export function toLatinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

/** تبدیل تاریخ ISO به رشته‌ی شمسی (مثلاً ۱۴۰۵/۰۵/۲۴) */
export function toPersianDateString(iso: string | Date | undefined | null): string {
  if (!iso) return "—";
  const date = typeof iso === "string" ? new Date(iso) : iso;
  if (isNaN(date.getTime())) return "—";

  try {
    const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return toPersianDigits(formatter.format(date));
  } catch {
    return "—";
  }
}

/**
 * تبدیل تاریخ شمسی «۱۴۰۴/۰۵/۱۵» به عددی قابل مقایسه (۱۴۰۴۰۵۱۵)
 * برای فیلترهای بازه زمانی.
 */
export function jalaliKey(persianDate: string | undefined | null): number | null {
  if (!persianDate) return null;
  const parts = toLatinDigits(persianDate).split("/").map((p) => Number(p.trim()));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  return parts[0]! * 10000 + parts[1]! * 100 + parts[2]!;
}

/** کلید شمسی تاریخ امروز (یا امروز + n روز) */
export function todayJalaliKey(offsetDays = 0): number {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return jalaliKey(toPersianDateString(date)) ?? 0;
}
