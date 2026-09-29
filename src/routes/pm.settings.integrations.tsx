import { createFileRoute } from "@tanstack/react-router";
import { Bell, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TimePicker } from "@/components/pm/TimePicker";
import { PageHeader } from "@/components/pm/PmShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchProjectReminderSettings,
  getActiveProject,
  updateProjectReminder,
  type ProjectReminderSettings,
} from "@/lib/project";

export const Route = createFileRoute("/pm/settings/integrations")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "زمان‌بندی یادآوری | پروژه‌یار" },
      {
        name: "description",
        content: "تنظیم زمان و تناوب گزارش‌خواهی از اعضای تیم پروژه.",
      },
      { property: "og:title", content: "زمان‌بندی یادآوری | پروژه‌یار" },
      {
        property: "og:description",
        content: "تنظیم زمان و تناوب گزارش‌خواهی از اعضای تیم پروژه.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReminderScheduleSettings,
});

function ReminderScheduleSettings() {
  const [managerCode, setManagerCode] = useState<string | null>(null);
  const [reminderLoading, setReminderLoading] = useState(true);
  const [reminderLoadError, setReminderLoadError] = useState<string | null>(null);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [reminderFrequency, setReminderFrequency] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  const [reminderDayOfWeek, setReminderDayOfWeek] = useState(6);
  const [reminderDayOfMonth, setReminderDayOfMonth] = useState(1);
  const [isSavingReminder, setIsSavingReminder] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const project = getActiveProject();
      const code = project?.manager_code?.trim();
      if (!code) {
        console.log(
          "[reminder] manager_code missing. localStorage.active_project =",
          localStorage.getItem("active_project"),
        );
        if (!cancelled) {
          setReminderLoading(false);
          setReminderLoadError(
            "برای تنظیم یادآوری، یک بار از پنل خارج شوید و دوباره با کد مدیر (MGR-...) وارد شوید.",
          );
        }
        return;
      }
      setManagerCode(code);
      try {
        const settings: ProjectReminderSettings | null = await fetchProjectReminderSettings(code);
        if (cancelled) return;
        if (settings) {
          if (settings.reminder_time) setReminderTime(settings.reminder_time.slice(0, 5));
          if (settings.reminder_frequency) setReminderFrequency(settings.reminder_frequency);
          if (settings.reminder_day_of_week != null)
            setReminderDayOfWeek(settings.reminder_day_of_week);
          if (settings.reminder_day_of_month != null)
            setReminderDayOfMonth(settings.reminder_day_of_month);
        }
        setReminderLoading(false);
      } catch {
        if (!cancelled) {
          setReminderLoading(false);
          setReminderLoadError("خواندن تنظیمات یادآوری انجام نشد.");
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveReminder = async () => {
    if (!managerCode || isSavingReminder) return;
    setIsSavingReminder(true);
    try {
      await updateProjectReminder({
        managerCode,
        reminderTime,
        reminderFrequency,
        reminderDayOfWeek: reminderFrequency === "weekly" ? reminderDayOfWeek : null,
        reminderDayOfMonth: reminderFrequency === "monthly" ? reminderDayOfMonth : null,
      });
      toast.success("زمان‌بندی یادآوری ذخیره شد", {
        description:
          reminderFrequency === "daily"
            ? "یادآوری روزانه در ساعت انتخاب‌شده ارسال می‌شود."
            : reminderFrequency === "weekly"
              ? "یادآوری هفتگی در روز و ساعت انتخاب‌شده ارسال می‌شود."
              : "یادآوری ماهانه در روز و ساعت انتخاب‌شده ارسال می‌شود.",
      });
    } catch (error) {
      toast.error("ذخیره تنظیمات یادآوری انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsSavingReminder(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="زمان‌بندی یادآوری"
        subtitle="تعیین کن گزارش‌خواهی از اعضای تیم چه زمانی و با چه تناوبی ارسال شود."
      />

      <div className="mt-10">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Bell className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold tracking-tight">زمان‌بندی یادآوری روزانه</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                زمان و تناوب ارسال یادآوری‌های گزارش‌دهی نیروهای پروژه را تنظیم کنید.
              </p>
            </div>
          </div>

          {reminderLoading ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              در حال خواندن تنظیمات فعلی...
            </div>
          ) : reminderLoadError ? (
            <p className="mt-6 text-sm text-destructive">{reminderLoadError}</p>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="reminder_frequency" className="text-xs font-medium text-muted-foreground">
                  تکرار
                </label>
                <Select
                  value={reminderFrequency}
                  onValueChange={(value) =>
                    setReminderFrequency(value as "daily" | "weekly" | "monthly")
                  }
                >
                  <SelectTrigger id="reminder_frequency" className="h-11 w-full rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">روزانه</SelectItem>
                    <SelectItem value="weekly">هفتگی</SelectItem>
                    <SelectItem value="monthly">ماهانه</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="reminder_time" className="text-xs font-medium text-muted-foreground">
                  ساعت ارسال
                </label>
                <TimePicker id="reminder_time" value={reminderTime} onChange={setReminderTime} />
              </div>

              {reminderFrequency === "weekly" && (
                <div className="space-y-2">
                  <label htmlFor="reminder_day_of_week" className="text-xs font-medium text-muted-foreground">
                    روز هفته
                  </label>
                  <Select
                    value={String(reminderDayOfWeek)}
                    onValueChange={(value) => setReminderDayOfWeek(Number(value))}
                  >
                    <SelectTrigger id="reminder_day_of_week" className="h-11 w-full rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">شنبه</SelectItem>
                      <SelectItem value="0">یکشنبه</SelectItem>
                      <SelectItem value="1">دوشنبه</SelectItem>
                      <SelectItem value="2">سه‌شنبه</SelectItem>
                      <SelectItem value="3">چهارشنبه</SelectItem>
                      <SelectItem value="4">پنج‌شنبه</SelectItem>
                      <SelectItem value="5">جمعه</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {reminderFrequency === "monthly" && (
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="reminder_day_of_month" className="text-xs font-medium text-muted-foreground">
                    روز ماه
                  </label>
                  <Input
                    id="reminder_day_of_month"
                    type="number"
                    dir="ltr"
                    min={1}
                    max={31}
                    value={reminderDayOfMonth}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setReminderDayOfMonth(
                        Number.isFinite(value) ? Math.min(31, Math.max(1, value)) : 1,
                      );
                    }}
                    className="h-11 rounded-xl sm:max-w-40"
                  />
                  <p className="text-xs leading-6 text-muted-foreground">
                    اگه ماهی این روز رو نداشته باشه (مثلاً ۳۱ام در ماه‌های ۳۰روزه)، یادآوری در
                    آخرین روز همون ماه فرستاده می‌شه.
                  </p>
                </div>
              )}

              <div className="sm:col-span-2">
                <Button
                  type="button"
                  onClick={saveReminder}
                  disabled={!reminderTime || isSavingReminder}
                  className="h-11 rounded-xl px-6 font-bold"
                >
                  {isSavingReminder && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  ذخیره
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}