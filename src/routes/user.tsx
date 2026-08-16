import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarRange, ListChecks, LogOut, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRole } from "@/context/RoleContext";
import { useActiveProject } from "@/hooks/use-active-project";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { clearActiveProject } from "@/lib/project";
import { jalaliKey, todayJalaliKey, toPersianDigits } from "@/lib/persian";
import { pmTaskList, type PmTaskDetail } from "@/mock/pm-tasks";
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
  const isLoading = useMockLoading();
  const { project } = useActiveProject();
  const { setRole } = useRole();

  const [owner, setOwner] = useState("all");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [range, setRange] = useState<RangeFilter>("all");

  const owners = useMemo(
    () => Array.from(new Set(pmTaskList.map((task) => task.owner))),
    [],
  );

  const rows = useMemo(
    () =>
      pmTaskList.filter(
        (task) =>
          (owner === "all" || task.owner === owner) &&
          (status === "all" || userStatus(task) === status) &&
          inRange(task, range),
      ),
    [owner, status, range],
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
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">فعالیت‌های برنامه</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              نمای فقط‌خواندنی از فعالیت‌های برنامه بیس‌لاین و وضعیت فعلی آن‌ها.
            </p>
          </div>
        </div>

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
                      مسئول: {task.owner} — بازه برنامه: {toPersianDigits(task.baselineStart)} تا{" "}
                      {toPersianDigits(task.baselineEnd)}
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
      </main>
    </div>
  );
}
