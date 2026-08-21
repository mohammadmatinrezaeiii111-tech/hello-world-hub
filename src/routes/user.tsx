import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarRange, ListChecks, LogOut, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRole } from "@/context/RoleContext";
import { useActiveProject } from "@/hooks/use-active-project";
import { clearActiveProject } from "@/lib/project";
import { getProjectCode } from "@/lib/n8n";
import {
  fetchTasksForTelegramId,
  getTelegramId,
  setTelegramId,
  taskPercent,
  type PmTaskDetail,
} from "@/lib/pm-data";
import { jalaliKey, todayJalaliKey } from "@/lib/persian";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/user")({
  head: () => ({
    meta: [
      { title: "پنل کاربر | فعالیت‌های من در پروژه‌یار" },
      {
        name: "description",
        content: "نمای ساده و فقط‌خواندنی از فعالیت‌های برنامه بیس‌لاین و وضعیت فعلی آن‌ها.",
      },
      { property: "og:title", content: "پنل کاربر | پروژه‌یار" },
      {
        property: "og:description",
        content: "فهرست ساده فعالیت‌ها با فیلتر مسئول، وضعیت و بازه زمانی.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UserPanel,
});

type UserStatus = "completed" | "in-progress" | "delayed" | "not-started";

const statusLabels: Record<UserStatus, string> = {
  completed: "تکمیل‌شده",
  "in-progress": "در حال انجام",
  delayed: "دارای تأخیر",
  "not-started": "شروع‌نشده",
};

const statusClass: Record<UserStatus, string> = {
  completed: "border-border bg-muted text-muted-foreground",
  "in-progress": "border-secondary/40 bg-secondary/15 text-success",
  delayed: "border-destructive/30 bg-destructive/10 text-destructive",
  "not-started": "border-border bg-card text-muted-foreground",
};

function userStatus(task: PmTaskDetail): UserStatus {
  if (task.status === "completed") return "completed";
  if (task.status === "delayed" || task.status === "blocked") return "delayed";
  return task.reports.length === 0 ? "not-started" : "in-progress";
}

type RangeFilter = "all" | "today" | "week";

function inRange(task: PmTaskDetail, range: RangeFilter) {
  if (range === "all") return true;
  const start = jalaliKey(task.baselineStart);
  const end = jalaliKey(task.baselineEnd);
  if (start === null || end === null) return false;
  const from = todayJalaliKey();
  const to = range === "today" ? from : todayJalaliKey(6);
  return start <= to && end >= from;
}

function UserPanel() {
  const { project } = useActiveProject();
  const { setRole } = useRole();

  const [owner, setOwner] = useState("all");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [range, setRange] = useState<RangeFilter>("all");

  const [projectCode, setProjectCodeState] = useState<string | null>(null);
  const [telegramId, setTelegramIdState] = useState<string | null>(null);
  const [idInput, setIdInput] = useState("");

  useEffect(() => {
    setProjectCodeState(getProjectCode());
    setTelegramIdState(getTelegramId());
  }, []);

  const code = projectCode ?? project?.project_code ?? null;

  const { data, isPending, error } = useQuery({
    queryKey: ["user-tasks", code, telegramId],
    queryFn: () => fetchTasksForTelegramId(code as string, telegramId as string),
    enabled: Boolean(code && telegramId),
    staleTime: 30_000,
  });

  const isLoading = Boolean(code && telegramId) && isPending;
  const tasks = data ?? [];

  const owners = useMemo(() => Array.from(new Set(tasks.map((task) => task.owner))), [tasks]);

  const rows = useMemo(
    () =>
      tasks.filter(
        (task) =>
          (owner === "all" || task.owner === owner) &&
          (status === "all" || userStatus(task) === status) &&
          inRange(task, range),
      ),
    [tasks, owner, status, range],
  );

  const selectClass =
    "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-[900px] items-center justify-between gap-4 px-6 py-5">
          <div className="min-w-0">
            <span className="block truncate text-base font-bold">
              {project?.project_name || "پنل کاربر"}
            </span>
            {project?.project_code && (
              <span dir="ltr" className="mt-1 block font-mono text-[11px] text-muted-foreground">
                {project.project_code}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/role-select"
              onClick={() => {
                setRole(null);
                clearActiveProject();
              }}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              خروج
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[900px] px-6 py-10">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <ListChecks className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">فعالیت‌های من</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              نمای فقط‌خواندنی از فعالیت‌هایی که برای آن‌ها گزارش پیشرفت ثبت کرده‌اید.
            </p>
          </div>
        </div>

        {!telegramId ? (
          <form
            className="mt-8 rounded-xl border border-border bg-card p-6"
            onSubmit={(event) => {
              event.preventDefault();
              const value = idInput.trim();
              if (!value) return;
              setTelegramId(value);
              setTelegramIdState(value);
            }}
          >
            <label className="block text-sm font-bold" htmlFor="telegram-id">
              شناسه تلگرام شما
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              برای نمایش فعالیت‌های خودتان، شناسه تلگرامی که با آن گزارش می‌دهید را وارد کنید.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                id="telegram-id"
                dir="ltr"
                value={idInput}
                onChange={(event) => setIdInput(event.target.value)}
                placeholder="123456789"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 font-mono text-sm"
              />
              <button
                type="submit"
                className="h-11 shrink-0 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
              >
                نمایش فعالیت‌های من
              </button>
            </div>
          </form>
        ) : !code ? (
          <p className="mt-8 rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            کد پروژه یافت نشد. ابتدا از صفحه ورود کد پروژه را وارد کنید.
          </p>
        ) : (
          <>
            {error && (
              <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error instanceof Error ? error.message : "دریافت فعالیت‌ها انجام نشد."}
              </p>
            )}

            {/* نوار فیلترها */}
            <div className="mt-8 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <UserRound className="h-3.5 w-3.5" aria-hidden />
                  مسئول فعالیت
                </span>
                <select
                  value={owner}
                  onChange={(event) => setOwner(event.target.value)}
                  className={selectClass}
                >
                  <option value="all">همه مسئولان</option>
                  {owners.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ListChecks className="h-3.5 w-3.5" aria-hidden />
                  وضعیت فعالیت
                </span>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as UserStatus | "all")}
                  className={selectClass}
                >
                  <option value="all">همه وضعیت‌ها</option>
                  {(Object.keys(statusLabels) as UserStatus[]).map((key) => (
                    <option key={key} value={key}>
                      {statusLabels[key]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarRange className="h-3.5 w-3.5" aria-hidden />
                  بازه زمانی
                </span>
                <select
                  value={range}
                  onChange={(event) => setRange(event.target.value as RangeFilter)}
                  className={selectClass}
                >
                  <option value="all">همه بازه‌ها</option>
                  <option value="today">فعالیت‌های امروز</option>
                  <option value="week">فعالیت‌های این هفته</option>
                </select>
              </label>
            </div>

            {/* جدول فعالیت‌ها */}
            {isLoading ? (
              <div className="mt-6 space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-5">
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="mt-3 h-3 w-40" />
                  </div>
                ))}
              </div>
            ) : rows.length === 0 ? (
              <p className="mt-6 rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                فعالیتی با این فیلترها یافت نشد.
              </p>
            ) : (
              <ul className="mt-6 space-y-3">
                {rows.map((task) => {
                  const state = userStatus(task);
                  return (
                    <li
                      key={task.id}
                      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <span className="block truncate text-sm font-bold">{task.title}</span>
                        <span className="mt-2 block text-xs text-muted-foreground">
                          مسئول: {task.owner} — بازه برنامه: {task.baselineStart} تا{" "}
                          {task.baselineEnd} — پیشرفت: {taskPercent(task)}٪
                        </span>
                      </div>
                      <Badge className={cn("w-fit rounded-lg border", statusClass[state])}>
                        {statusLabels[state]}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}
