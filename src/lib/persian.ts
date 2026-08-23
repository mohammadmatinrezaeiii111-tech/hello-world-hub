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

/** تبدیل تاریخ شمسی به timestamp میلادی (میلی‌ثانیه) */
export function jalaliToTimestamp(jy: number, jm: number, jd: number): number | null {
  if (![jy, jm, jd].every(Number.isFinite)) return null;
  // الگوریتم استاندارد تبدیل جلالی به میلادی
  let gy = jy > 979 ? 1600 : 621;
  const jyAdj = jy - (jy > 979 ? 979 : 0);
  let days =
    365 * jyAdj +
    Math.floor(jyAdj / 33) * 8 +
    Math.floor(((jyAdj % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  const monthDays = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (gm = 1; gm <= 12; gm++) {
    if (gd <= monthDays[gm]!) break;
    gd -= monthDays[gm]!;
  }
  const ts = Date.UTC(gy, gm - 1, gd);
  return Number.isFinite(ts) ? ts : null;
}
