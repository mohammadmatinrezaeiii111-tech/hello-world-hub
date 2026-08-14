const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** تبدیل ارقام لاتین به ارقام فارسی */
export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]!);
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
