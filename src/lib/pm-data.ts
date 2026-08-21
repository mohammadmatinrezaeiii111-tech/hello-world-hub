import { supabase } from "@/lib/supabase";
import { jalaliKey, toLatinDigits, toPersianDateString, toPersianDigits } from "@/lib/persian";

/** ——— شکل داده‌ها (همان قرارداد قبلی صفحات) ——— */

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

/** رکورد خام گزارش تلگرامی */
export type ResponseRow = {
  id: string;
  created_at: string | null;
  telegram_id: string | null;
  username: string | null;
  message: string | null;
  task_code: string | null;
  percent_complete: number;
  ai_summary: string | null;
};

/** ——— ابزارهای کمکی ——— */

function pick(row: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    const match = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
    if (match !== undefined) {
      const value = row[match];
      if (value !== null && value !== undefined && String(value).trim() !== "") return value;
    }
  }
  return undefined;
}

function asText(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).trim();
}

function asNumber(value: unknown): number {
  const n = Number(toLatinDigits(asText(value)).replace(/[^\d.\-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** تاریخ ورودی می‌تواند شمسی («۱۴۰۴/۰۵/۱۵») یا میلادی (ISO) باشد. */
export function normalizeDate(value: unknown): { display: string; key: number | null } {
  const raw = asText(value);
  if (!raw) return { display: "—", key: null };

  const latin = toLatinDigits(raw);
  const jalaliMatch = latin.match(/^(1[34]\d{2})[/\-.](\d{1,2})[/\-.](\d{1,2})/);
  if (jalaliMatch) {
    const [, y, m, d] = jalaliMatch;
    const display = `${y}/${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}`;
    return { display: toPersianDigits(display), key: jalaliKey(display) };
  }

  const date = new Date(latin);
  if (!isNaN(date.getTime())) {
    const display = toPersianDateString(date);
    return { display, key: jalaliKey(display) };
  }

  return { display: raw, key: null };
}

function todayKey(): number {
  return jalaliKey(toPersianDateString(new Date())) ?? 0;
}

/** تعیین وضعیت بر اساس درصد پیشرفت و تاریخ پایان برنامه‌ای */
export function resolveStatus(percent: number, baselineEndKey: number | null): TaskStatus {
  if (percent >= 100) return "completed";
  if (baselineEndKey !== null && baselineEndKey < todayKey()) return "delayed";
  return "on-track";
}

/** ——— خواندن از پایگاه‌داده ——— */

async function fetchWbsRows(projectCode: string): Promise<Record<string, unknown>[]> {
  const { data, error } = await supabase
    .from("baselines")
    .select("wbs_data, created_at")
    .eq("project_code", projectCode)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error("خواندن برنامه بیس‌لاین از پایگاه‌داده انجام نشد.");
  if (!data) return [];

  const raw = (data as Record<string, unknown>)["wbs_data"];
  const parsed = typeof raw === "string" ? safeJson(raw) : raw;
  const list = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as Record<string, unknown> | null)?.["tasks"])
      ? ((parsed as Record<string, unknown>)["tasks"] as unknown[])
      : Array.isArray((parsed as Record<string, unknown> | null)?.["activities"])
        ? ((parsed as Record<string, unknown>)["activities"] as unknown[])
        : [];

  return list.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object");
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function fetchResponses(projectCode: string): Promise<ResponseRow[]> {
  const { data, error } = await supabase
    .from("responses")
    .select("*")
    .eq("Project_id", projectCode)
    .order("created_at", { ascending: true });

  if (error) throw new Error("خواندن گزارش‌های پیشرفت از پایگاه‌داده انجام نشد.");

  return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    id: asText(row["id"]),
    created_at: asText(row["created_at"]) || null,
    telegram_id: asText(row["telegram_id"]) || null,
    username: asText(row["username"]) || null,
    message: asText(row["message"]) || null,
    task_code: asText(row["task_code"]) || null,
    percent_complete: asNumber(row["percent_complete"]),
    ai_summary: asText(row["ai_summary"]) || null,
  }));
}

/** ساخت فهرست فعالیت‌ها با شکل PmTaskDetail از بیس‌لاین و گزارش‌ها */
export async function fetchProjectTasks(projectCode: string): Promise<PmTaskDetail[]> {
  const [wbsRows, responses] = await Promise.all([
    fetchWbsRows(projectCode),
    fetchResponses(projectCode),
  ]);

  const byTask = new Map<string, ResponseRow[]>();
  for (const response of responses) {
    const code = (response.task_code ?? "").trim().toUpperCase();
    if (!code) continue;
    const list = byTask.get(code) ?? [];
    list.push(response);
    byTask.set(code, list);
  }

  return wbsRows.map((row, index) => {
    const code =
      asText(pick(row, ["task_code", "activity_code", "code", "id", "کد فعالیت", "کد"])) ||
      `T-${index + 1}`;
    const title =
      asText(pick(row, ["title", "task_name", "activity_name", "description", "name", "شرح", "عنوان"])) ||
      code;
    const wbs = asText(pick(row, ["wbs", "wbs_code", "wbs_id", "ساختار شکست کار"])) || code;
    const weight = asNumber(pick(row, ["weight", "weight_pct", "وزن"]));
    const owner = asText(pick(row, ["owner", "responsible", "assignee", "مسئول"])) || "—";

    const baselineStart = normalizeDate(
      pick(row, ["baseline_start", "planned_start", "start_date", "start", "تاریخ شروع", "شروع برنامه‌ای"]),
    );
    const baselineEnd = normalizeDate(
      pick(row, ["baseline_finish", "baseline_end", "planned_finish", "planned_end", "end_date", "finish", "end", "تاریخ پایان", "پایان برنامه‌ای"]),
    );

    const taskResponses = (byTask.get(code.trim().toUpperCase()) ?? []).slice();
    const latest = taskResponses[taskResponses.length - 1];
    const percent = latest ? latest.percent_complete : 0;

    const reports: DailyReport[] = taskResponses.map((response, i) => ({
      id: response.id || `${code}-r${i + 1}`,
      date: normalizeDate(response.created_at).display,
      progressPct: response.percent_complete,
      note: response.ai_summary?.trim() || response.message?.trim() || "—",
      reporter: response.username?.trim() || response.telegram_id?.trim() || "—",
    }));

    return {
      id: code,
      title,
      wbs,
      weight,
      owner,
      status: resolveStatus(percent, baselineEnd.key),
      baselineStart: baselineStart.display,
      baselineEnd: baselineEnd.display,
      estimatedStart: baselineStart.display,
      estimatedEnd: baselineEnd.display,
      reports,
      blockers: [],
    } satisfies PmTaskDetail;
  });
}

/** درصد پیشرفت آخرین گزارش هر فعالیت */
export function taskPercent(task: PmTaskDetail): number {
  const last = task.reports[task.reports.length - 1];
  return last ? last.progressPct : 0;
}

/** میانگین وزنی پیشرفت کل پروژه */
export function weightedProgress(tasks: PmTaskDetail[]): number {
  const totalWeight = tasks.reduce((sum, task) => sum + (task.weight || 0), 0);
  if (totalWeight <= 0) {
    if (tasks.length === 0) return 0;
    return Math.round(tasks.reduce((sum, task) => sum + taskPercent(task), 0) / tasks.length);
  }
  const sum = tasks.reduce((acc, task) => acc + (task.weight || 0) * taskPercent(task), 0);
  return Math.round(sum / totalWeight);
}

/** فعالیت‌های دارای تاخیر: تاریخ پایان برنامه‌ای گذشته و پیشرفت زیر ۱۰۰٪ */
export function delayedTasks(tasks: PmTaskDetail[]): PmTaskDetail[] {
  const today = todayKey();
  return tasks.filter((task) => {
    const endKey = jalaliKey(task.baselineEnd);
    return endKey !== null && endKey < today && taskPercent(task) < 100;
  });
}

/** پیشرفت برنامه‌ای پروژه تا امروز (وزن فعالیت‌هایی که باید تمام شده باشند) */
export function plannedProgress(tasks: PmTaskDetail[]): number {
  const today = todayKey();
  const totalWeight = tasks.reduce((sum, task) => sum + (task.weight || 0), 0);
  if (totalWeight <= 0) return 0;
  const done = tasks.reduce((sum, task) => {
    const endKey = jalaliKey(task.baselineEnd);
    return endKey !== null && endKey <= today ? sum + (task.weight || 0) : sum;
  }, 0);
  return Math.round((done / totalWeight) * 100);
}

/** ماه شمسی یک کلید تاریخ (۱۴۰۴۰۵۱۵ → ۱۴۰۴۰۵) */
function monthOf(key: number): number {
  return Math.floor(key / 100);
}

const MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export type CurvePoint = { month: string; planned: number; actual: number | null };

/** منحنی S: پیشرفت تجمعی برنامه‌ای و واقعی به تفکیک ماه شمسی */
export function buildSCurve(tasks: PmTaskDetail[]): CurvePoint[] {
  const totalWeight = tasks.reduce((sum, task) => sum + (task.weight || 0), 0);
  if (totalWeight <= 0) return [];

  const months = new Set<number>();
  for (const task of tasks) {
    const endKey = jalaliKey(task.baselineEnd);
    if (endKey !== null) months.add(monthOf(endKey));
    for (const report of task.reports) {
      const key = jalaliKey(report.date);
      if (key !== null) months.add(monthOf(key));
    }
  }

  const sorted = Array.from(months).sort((a, b) => a - b);
  const currentMonth = monthOf(todayKey());

  return sorted.map((month) => {
    const plannedWeight = tasks.reduce((sum, task) => {
      const endKey = jalaliKey(task.baselineEnd);
      return endKey !== null && monthOf(endKey) <= month ? sum + (task.weight || 0) : sum;
    }, 0);

    const actualWeight = tasks.reduce((sum, task) => {
      const upTo = task.reports
        .filter((report) => {
          const key = jalaliKey(report.date);
          return key !== null && monthOf(key) <= month;
        })
        .pop();
      return upTo ? sum + ((task.weight || 0) * upTo.progressPct) / 100 : sum;
    }, 0);

    const label = `${MONTH_NAMES[(month % 100) - 1] ?? ""} ${toPersianDigits(String(Math.floor(month / 100)).slice(-2))}`;

    return {
      month: label.trim(),
      planned: Math.round((plannedWeight / totalWeight) * 100),
      actual: month <= currentMonth ? Math.round((actualWeight / totalWeight) * 100) : null,
    };
  });
}

/** شناسه تلگرام کاربر جاری (برای پنل فقط‌خواندنی کاربر) */
export const TELEGRAM_ID_STORAGE_KEY = "telegram_id";

export function getTelegramId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TELEGRAM_ID_STORAGE_KEY)?.trim() || null;
}

export function setTelegramId(value: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TELEGRAM_ID_STORAGE_KEY, value.trim());
}

/** فعالیت‌هایی که این کاربر (با telegram_id) برایشان گزارش داده است */
export async function fetchTasksForTelegramId(
  projectCode: string,
  telegramId: string,
): Promise<PmTaskDetail[]> {
  const id = telegramId.trim();
  if (!id) return [];
  const [tasks, responses] = await Promise.all([
    fetchProjectTasks(projectCode),
    fetchResponses(projectCode),
  ]);
  const codes = new Set(
    responses
      .filter((response) => (response.telegram_id ?? "").trim() === id)
      .map((response) => (response.task_code ?? "").trim().toUpperCase()),
  );
  return tasks.filter((task) => codes.has(task.id.trim().toUpperCase()));
}

