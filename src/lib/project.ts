import { supabase } from "@/lib/supabase";
import { setProjectCode } from "@/lib/n8n";

/** کلید ذخیره‌سازی محلی پروژه فعال */
export const ACTIVE_PROJECT_STORAGE_KEY = "active_project";

/** شکل رکورد پروژه؛ ستون مدیر پروژه ممکن است در پایگاه‌داده موجود نباشد. */
export type Project = {
  id: string;
  project_name: string;
  client_name: string | null;
  project_code: string;
  manager_code?: string | null;
  manager_name?: string | null;
  created_at?: string | null;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function toProject(row: Record<string, unknown>): Project {
  const str = (v: unknown) => (typeof v === "string" ? v : null);
  return {
    id: str(row["id"]) ?? "",
    project_name: str(row["project_name"]) ?? "",
    client_name: str(row["client_name"]),
    project_code: str(row["project_code"]) ?? "",
    manager_code: str(row["manager_code"]),
    manager_name: str(row["manager_name"]),
    created_at: str(row["created_at"]),
  };
}

/** نام مدیر پروژه به‌صورت داینامیک؛ در نبود ستون مدیر، نام ثبت‌شده کارفرما/مسئول */
export function projectManagerName(project: Project | null | undefined): string {
  if (!project) return "—";
  return project.manager_name?.trim() || project.client_name?.trim() || "—";
}

/** ساخت کد یکتای پروژه، مثل PRJ-A1B2C3 */
export function createProjectCode() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `PRJ-${Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 6)
    .toUpperCase()}`;
}

/** خواندن پروژه با کد پروژه */
export async function fetchProjectByCode(code: string): Promise<Project | null> {
  const { data, error } = await supabase
    .rpc("get_project_by_code", {
      p_code: code.trim().toUpperCase(),
    })
    .single();

  if (error) throw new Error("خواندن اطلاعات پروژه از پایگاه‌داده انجام نشد.");
  if (!data) return null;
  return toProject(data as Record<string, unknown>);
}

/** خواندن پروژه با کد مدیریتی (فقط مدیر) */
export async function fetchProjectByManagerCode(code: string): Promise<Project | null> {
  const { data, error } = await supabase
    .rpc("get_project_by_manager_code", {
      p_code: code.trim().toUpperCase(),
    })
    .single();

  if (error) return null;
  if (!data) return null;
  return toProject(data as Record<string, unknown>);
}

/** شکل تنظیمات یادآوری روزانه پروژه */
export type ProjectReminderSettings = {
  reminder_time: string | null;
  reminder_frequency: "daily" | "weekly" | "monthly" | null;
  reminder_day_of_week: number | null;
  reminder_day_of_month: number | null;
};

/** خواندن تنظیمات یادآوری پروژه با کد مدیر */
export async function fetchProjectReminderSettings(
  managerCode: string,
): Promise<ProjectReminderSettings | null> {
  const { data, error } = await supabase
    .rpc("get_project_by_manager_code", {
      p_code: managerCode.trim().toUpperCase(),
    })
    .single();

  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v : null);
  const num = (v: unknown) => {
    if (v == null) return null;
    const parsed = Number(v);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const freq = str(row["reminder_frequency"]);
  return {
    reminder_time: str(row["reminder_time"]),
    reminder_frequency:
      freq === "daily" || freq === "weekly" || freq === "monthly" ? freq : null,
    reminder_day_of_week: num(row["reminder_day_of_week"]),
    reminder_day_of_month: num(row["reminder_day_of_month"]),
  };
}

/** ذخیره تنظیمات یادآوری پروژه با کد مدیر */
export async function updateProjectReminder(input: {
  managerCode: string;
  reminderTime: string;
  reminderFrequency: "daily" | "weekly" | "monthly";
  reminderDayOfWeek: number | null;
  reminderDayOfMonth: number | null;
}): Promise<void> {
  const { error } = await supabase.rpc("update_project_reminder", {
    p_manager_code: input.managerCode.trim().toUpperCase(),
    p_reminder_time: input.reminderTime,
    p_reminder_frequency: input.reminderFrequency,
    p_reminder_day_of_week: input.reminderDayOfWeek,
    p_reminder_day_of_month: input.reminderDayOfMonth,
  });
  if (error) throw new Error("ذخیره تنظیمات یادآوری انجام نشد. لطفاً دوباره تلاش کنید.");
}


/** ثبت پروژه جدید؛ در نبود ستون مدیر پروژه، نام مدیر در فیلد مسئول ذخیره می‌شود. */
export async function createProject(input: {
  projectName: string;
  managerName: string;
  clientName?: string;
}): Promise<Project> {
  const project_code = createProjectCode();
  const { data, error } = await supabase
    .rpc("create_project", {
      p_project_name: input.projectName.trim(),
      p_client_name: input.clientName?.trim() || input.managerName.trim(),
      p_project_code: project_code,
    })
    .single();

  if (error || !data) {
    const isRls =
      error?.code === "42501" || /row-level security|policy/i.test(error?.message ?? "");
    throw new Error(
      isRls
        ? "به‌دلیل محدودیت‌های امنیتی پایگاه‌داده، ثبت پروژه انجام نشد."
        : error?.message || "ثبت پروژه انجام نشد. لطفاً دوباره تلاش کنید.",
    );
  }

  return toProject(data as Record<string, unknown>);
}

/** ذخیره پروژه فعال در حافظه مرورگر */
export function setActiveProject(project: Project) {
  setProjectCode(project.project_code);
  if (!isBrowser()) return;
  localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, JSON.stringify(project));
}

/** خواندن پروژه فعال از حافظه مرورگر */
export function getActiveProject(): Project | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const project = toProject(parsed);
    return project.project_code ? project : null;
  } catch {
    return null;
  }
}

export function clearActiveProject() {
  if (!isBrowser()) return;
  localStorage.removeItem(ACTIVE_PROJECT_STORAGE_KEY);
}
