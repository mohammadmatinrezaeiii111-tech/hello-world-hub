/** کلیدهای ذخیره‌سازی محلی برای اتصال n8n و کد پروژه */
export const WEBHOOK_STORAGE_KEY = "n8n_webhook_url";
export const PROJECT_CODE_STORAGE_KEY = "project_code";
export const ANALYSIS_STORAGE_KEY = "n8n_analysis_result";

/** مسیر پروکسی سمت سرور (بدون محدودیت CORS) */
export const N8N_PROXY_PATH = "/api/public/n8n-proxy";

/** هدرهای لازم برای عبور از صفحه هشدار ngrok */
export const N8N_COMMON_HEADERS: Record<string, string> = {
  "ngrok-skip-browser-warning": "true",
  "User-Agent": "ProjehYar-App",
};

/**
 * پاک‌سازی آدرس وب‌هوک: حذف فاصله‌های ابتدا/انتها و تبدیل فاصله‌های داخل
 * مسیر به خط تیره (مثلاً «generate-variance report» → «generate-variance-report»).
 * در صورت نامعتبر بودن، null برمی‌گرداند.
 */
export function sanitizeWebhookUrl(raw: string): string | null {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) return null;

  try {
    const url = new URL(trimmed);
    url.pathname = url.pathname
      .split("/")
      .map((segment) => segment.trim().replace(/\s+/g, "-"))
      .join("/");
    return url.toString().replace(/\/$/, url.pathname === "/" ? "/" : "");
  } catch {
    return null;
  }
}

export type N8nResult = { status: number; ok: boolean; text: string; viaProxy: boolean };

/** شکل تحلیل دریافتی از n8n؛ فیلدهای متادیتا اختیاری هستند. */
export type N8nAnalysis = {
  id?: string;
  project_code?: string;
  single_page_summary: string;
  detailed_report: string;
  created_at?: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

/**
 * ارسال درخواست به n8n؛ ابتدا مستقیم از مرورگر و در صورت خطای CORS/شبکه،
 * دوباره از طریق پروکسی سمت سرور.
 */
export async function postToN8n(
  rawUrl: string,
  body: BodyInit,
  contentType?: string,
): Promise<N8nResult> {
  const url = sanitizeWebhookUrl(rawUrl);
  if (!url) throw new Error("آدرس وب‌هوک نامعتبر است. آدرس را با http:// یا https:// وارد کنید.");

  const headers: Record<string, string> = { ...N8N_COMMON_HEADERS };
  if (contentType) headers["Content-Type"] = contentType;

  console.info("[n8n] direct request", { url, contentType });
  try {
    const response = await fetch(url, { method: "POST", headers, body });
    const text = await response.text();
    console.info("[n8n] direct response", { status: response.status, length: text.length });
    return { status: response.status, ok: response.ok, text, viaProxy: false };
  } catch (error) {
    console.warn("[n8n] direct request failed, falling back to server proxy", error);
  }

  const proxyHeaders: Record<string, string> = { "x-n8n-target": url };
  if (contentType) proxyHeaders["Content-Type"] = contentType;

  let response: Response;
  try {
    response = await fetch(N8N_PROXY_PATH, { method: "POST", headers: proxyHeaders, body });
  } catch (error) {
    console.error("[n8n] proxy request failed", error);
    throw new Error("ارتباط با n8n برقرار نشد؛ احتمالاً ngrok آفلاین است یا آدرس اشتباه است.");
  }

  const text = await response.text();
  console.info("[n8n] proxy response", { status: response.status, length: text.length });
  if (response.status === 502) {
    throw new Error("ngrok آفلاین است یا سرویس n8n پاسخ نمی‌دهد.");
  }
  return { status: response.status, ok: response.ok, text, viaProxy: true };
}

export const VARIANCE_STORAGE_KEY = "n8n_variance_result";

export function saveVariance(analysis: N8nAnalysis) {
  if (!isBrowser()) return;
  localStorage.setItem(VARIANCE_STORAGE_KEY, JSON.stringify(analysis));
}

export function getVariance(): N8nAnalysis | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(VARIANCE_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<N8nAnalysis>;
    return {
      id: typeof parsed.id === "string" ? parsed.id : undefined,
      project_code: typeof parsed.project_code === "string" ? parsed.project_code : undefined,
      single_page_summary: String(parsed.single_page_summary ?? ""),
      detailed_report: String(parsed.detailed_report ?? ""),
      created_at: typeof parsed.created_at === "string" ? parsed.created_at : undefined,
    };
  } catch {
    return null;
  }
}

export function saveAnalysis(analysis: N8nAnalysis) {
  if (!isBrowser()) return;
  localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(analysis));
}

export function getAnalysis(): N8nAnalysis | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(ANALYSIS_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<N8nAnalysis>;
    return {
      id: typeof parsed.id === "string" ? parsed.id : undefined,
      project_code: typeof parsed.project_code === "string" ? parsed.project_code : undefined,
      single_page_summary: String(parsed.single_page_summary ?? ""),
      detailed_report: String(parsed.detailed_report ?? ""),
      created_at: typeof parsed.created_at === "string" ? parsed.created_at : undefined,
    };
  } catch {
    return null;
  }
}

export function getWebhookUrl() {
  if (!isBrowser()) return null;
  return localStorage.getItem(WEBHOOK_STORAGE_KEY);
}

export function setWebhookUrl(url: string) {
  if (!isBrowser()) return;
  localStorage.setItem(WEBHOOK_STORAGE_KEY, sanitizeWebhookUrl(url) ?? url.trim());
}

export function getProjectCode() {
  if (!isBrowser()) return null;
  return localStorage.getItem(PROJECT_CODE_STORAGE_KEY);
}

export function setProjectCode(code: string) {
  if (!isBrowser()) return;
  localStorage.setItem(PROJECT_CODE_STORAGE_KEY, code.trim());
}

/** استخراج فیلدهای تحلیل از پاسخ n8n (آرایه یا آبجکت) */
export function normalizeAnalysisResponse(payload: unknown): N8nAnalysis | null {
  const candidate = Array.isArray(payload) ? payload[0] : payload;
  if (!candidate || typeof candidate !== "object") return null;
  const record = candidate as Record<string, unknown>;
  const inner =
    record["single_page_summary"] === undefined && record["json"] && typeof record["json"] === "object"
      ? (record["json"] as Record<string, unknown>)
      : record;

  const summary = inner["single_page_summary"];
  const detailed = inner["detailed_report"];
  if (summary === undefined && detailed === undefined) return null;

  const toText = (value: unknown) =>
    typeof value === "string" ? value : value == null ? "" : JSON.stringify(value, null, 2);

  return {
    id: typeof inner["id"] === "string" ? inner["id"] : undefined,
    project_code: typeof inner["project_code"] === "string" ? inner["project_code"] : undefined,
    single_page_summary: toText(summary),
    detailed_report: toText(detailed),
    created_at: typeof inner["created_at"] === "string" ? inner["created_at"] : undefined,
  };
}

/**
 * استخراج انعطاف‌پذیر تحلیل از پاسخ n8n؛ کلیدهای رایج مانند
 * result / output / text / message / analysis نیز پذیرفته می‌شوند.
 */
export function normalizeFlexibleAnalysis(payload: unknown): N8nAnalysis | null {
  const strict = normalizeAnalysisResponse(payload);
  if (strict) return strict;

  const candidate = Array.isArray(payload) ? payload[0] : payload;
  if (typeof candidate === "string") {
    const text = candidate.trim();
    return text ? { single_page_summary: text, detailed_report: text } : null;
  }
  if (!candidate || typeof candidate !== "object") return null;

  const record = candidate as Record<string, unknown>;
  const inner =
    record["json"] && typeof record["json"] === "object"
      ? (record["json"] as Record<string, unknown>)
      : record;

  const keys = ["result", "output", "text", "message", "analysis", "report", "data"];
  for (const key of keys) {
    const value = inner[key];
    if (value === undefined || value === null) continue;
    if (typeof value === "object") {
      const nested = normalizeFlexibleAnalysis(value);
      if (nested) return nested;
      continue;
    }
    const text = String(value).trim();
    if (text) return { single_page_summary: text, detailed_report: text };
  }
  return null;
}

/** ارسال فایل بیس‌لاین به وب‌هوک n8n و دریافت تحلیل */
export async function sendBaselineToN8n(file: File): Promise<N8nAnalysis> {
  const webhookUrl = getWebhookUrl();
  if (!webhookUrl) {
    throw new Error(
      "آدرس وب‌هوک n8n تنظیم نشده است. ابتدا در «تنظیمات یکپارچه‌سازی» آدرس وب‌هوک را وارد و تست کنید.",
    );
  }

  const projectCode = getProjectCode();
  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("project_code", projectCode ?? "");

  // برای multipart نباید Content-Type دستی ست شود (boundary لازم است).
  const result = await postToN8n(webhookUrl, formData);

  if (!result.ok) {
    throw new Error(`n8n با خطا پاسخ داد (کد ${result.status}). workflow را بررسی کنید.`);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(result.text);
  } catch {
    throw new Error("پاسخ n8n قابل خواندن نبود؛ خروجی workflow باید JSON باشد.");
  }

  const analysis = normalizeAnalysisResponse(payload);
  if (!analysis) {
    throw new Error(
      "پاسخ n8n شامل فیلدهای single_page_summary و detailed_report نبود.",
    );
  }
  return analysis;
}
