import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  CircleDot,
  Scale,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/pm/EmptyState";
import { ListSkeleton } from "@/components/pm/Skeletons";
import { getProjectCode } from "@/lib/n8n";
import {
  fetchProjectTasks,
  taskPercent,
  taskStatusLabels,
  type PmTaskDetail,
  type TaskStatus,
} from "@/lib/pm-data";
import { toPersianDigits } from "@/lib/persian";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pm/task/$id")({
  head: () => ({
    meta: [
      { title: "جزئیات فعالیت | پروژه‌یار" },
      {
        name: "description",
        content: "تایم‌لاین گزارش‌های روزانه، موانع و مقایسه تاریخ‌های بیس‌لاین تسک.",
      },
      { property: "og:title", content: "جزئیات فعالیت | پروژه‌یار" },
      {
        property: "og:description",
        content: "گزارش‌های ثبت‌شده و زمان‌بندی برنامه‌ای این فعالیت.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PmTaskDetailPage,
});

const statusBadgeClass: Record<TaskStatus, string> = {
  "on-track": "border-secondary/40 bg-secondary/15 text-success",
  delayed: "border-destructive/30 bg-destructive/10 text-destructive",
  blocked: "border-accent/40 bg-accent/15 text-warning",
  completed: "border-border bg-muted text-muted-foreground",
};

const severityClass = {
  High: "border-destructive/30 bg-destructive/10 text-destructive",
  Medium: "border-accent/40 bg-accent/15 text-warning",
  Low: "border-border bg-muted text-muted-foreground",
} as const;

function BackLink() {
  return (
    <div className="mb-6">
      <Button asChild variant="ghost" className="h-9 rounded-xl px-2 text-muted-foreground">
        <Link to="/pm/tasks">
          <ArrowRight className="h-4 w-4" aria-hidden />
          بازگشت به مدیریت فعالیت‌ها
        </Link>
      </Button>
    </div>
  );
}

function PmTaskDetailPage() {
  const { id } = Route.useParams();
  const [projectCode, setProjectCode] = useState<string | null>(null);

  useEffect(() => {
    setProjectCode(getProjectCode());
  }, []);

  const { data, isPending, error } = useQuery({
    queryKey: ["pm-tasks", projectCode],
    queryFn: () => fetchProjectTasks(projectCode as string),
    enabled: Boolean(projectCode),
    staleTime: 30_000,
  });

  const isLoading = Boolean(projectCode) && isPending;
  const task =
    (data ?? []).find((item) => item.id.trim().toUpperCase() === id.trim().toUpperCase()) ?? null;

  if (!projectCode) {
    return (
      <div>
        <BackLink />
        <EmptyState
          icon={AlertTriangle}
          title="کد پروژه یافت نشد"
          description="ابتدا از صفحه ورود کد پروژه را وارد کنید تا جزئیات فعالیت نمایش داده شود."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <BackLink />
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "دریافت جزئیات فعالیت انجام نشد."}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <BackLink />
        <ListSkeleton rows={4} />
      </div>
    );
  }

  if (!task) {
    return (
      <div>
        <BackLink />
        <EmptyState
          icon={AlertTriangle}
          title="هنوز داده‌ای ثبت نشده"
          description="فعالیتی با این شناسه در برنامه بیس‌لاین این پروژه یافت نشد."
        />
      </div>
    );
  }

  return <TaskView task={task} />;
}

function TaskView({ task }: { task: PmTaskDetail }) {
  const reports = [...task.reports].reverse();
  const percent = taskPercent(task);

  return (
    <div>
      <BackLink />

      <header className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-[2rem]">{task.title}</h1>
              <Badge variant="outline" className="rounded-lg">
                {task.id}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              جزئیات پیشرفت، گزارش‌های روزانه و موانع مرتبط با این فعالیت
            </p>
          </div>
          <Badge className={cn("rounded-lg border px-3 py-1 text-sm", statusBadgeClass[task.status])}>
            {taskStatusLabels[task.status]}
          </Badge>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetaItem label="کد WBS" value={toPersianDigits(task.wbs)} />
          <MetaItem
            label="وزن تسک"
            value={`${toPersianDigits(task.weight)}٪`}
            icon={<Scale className="h-4 w-4" aria-hidden />}
          />
          <MetaItem
            label="مسئول"
            value={task.owner}
            icon={<UserRound className="h-4 w-4" aria-hidden />}
          />
          <MetaItem label="پیشرفت فعلی" value={`${toPersianDigits(percent)}٪`} />
        </dl>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold tracking-tight">تایم‌لاین تاریخچه تسک</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              گزارش‌های روزانه ثبت‌شده از ابتدا تا امروز
            </p>

            {reports.length === 0 ? (
              <p className="mt-6 rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                هنوز گزارشی برای این فعالیت ثبت نشده است.
              </p>
            ) : (
              <ol className="relative mt-8 space-y-0 border-s border-border ms-3">
                {reports.map((report, index) => (
                  <li key={report.id} className="relative pb-8 ps-8 last:pb-0">
                    <span
                      className={cn(
                        "absolute -start-[9px] top-1 grid h-4 w-4 place-items-center rounded-full border-2 bg-card",
                        index === 0 ? "border-primary" : "border-muted-foreground/40",
                      )}
                    >
                      <CircleDot
                        className={cn(
                          "h-2.5 w-2.5",
                          index === 0 ? "text-primary" : "text-muted-foreground",
                        )}
                        aria-hidden
                      />
                    </span>

                    <div className="rounded-xl border border-border bg-background p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <time className="text-sm font-bold">{toPersianDigits(report.date)}</time>
                        <Badge variant="secondary" className="rounded-lg">
                          پیشرفت {toPersianDigits(report.progressPct)}٪
                        </Badge>
                      </div>
                      {report.note && (
                        <p className="mt-3 text-sm leading-7 whitespace-pre-wrap text-foreground/90">
                          {report.note}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">مجری: {report.reporter}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold tracking-tight">انحرافات و موانع ثبت‌شده برای این تسک</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              تمام موانعی که روی این تسک افتاده‌اند و وضعیت حل آن‌ها
            </p>

            <ul className="mt-6 space-y-3">
              {task.blockers.map((blocker) => (
                <li key={blocker.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <AlertTriangle
                          className={cn(
                            "h-4 w-4 shrink-0",
                            blocker.status === "resolved" ? "text-secondary" : "text-destructive",
                          )}
                          aria-hidden
                        />
                        <p className="text-sm font-bold">{blocker.title}</p>
                        <Badge variant="outline" className="rounded-lg">
                          {blocker.id}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={cn("rounded-lg border", severityClass[blocker.severity])}>
                        {blocker.severity}
                      </Badge>
                      <Badge
                        variant={blocker.status === "resolved" ? "secondary" : "destructive"}
                        className="rounded-lg"
                      >
                        {blocker.status === "resolved" ? "برطرف‌شده" : "باز"}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                    <p>زمان ثبت: {toPersianDigits(blocker.reportedAt)}</p>
                    <p>
                      زمان حل:{" "}
                      {blocker.resolvedAt ? (
                        <span className="inline-flex items-center gap-1 text-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-secondary" aria-hidden />
                          {toPersianDigits(blocker.resolvedAt)}
                        </span>
                      ) : (
                        <span className="text-destructive">هنوز حل نشده</span>
                      )}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{blocker.impact}</p>
                </li>
              ))}

              {task.blockers.length === 0 && (
                <li className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                  مانعی برای این تسک ثبت نشده است.
                </li>
              )}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <CalendarRange className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <h2 className="text-sm font-bold">خلاصه زمان‌بندی</h2>
                <p className="text-xs text-muted-foreground">بیس‌لاین در برابر تخمین جدید</p>
              </div>
            </div>

            <div className="space-y-4">
              <ScheduleBlock
                title="بیس‌لاین"
                start={task.baselineStart}
                end={task.baselineEnd}
                tone="baseline"
              />
              <ScheduleBlock
                title="تخمین جدید"
                start={task.estimatedStart}
                end={task.estimatedEnd}
                tone="estimated"
              />
            </div>

            <p className="mt-5 rounded-xl border border-border bg-background px-3 py-3 text-xs leading-6 text-muted-foreground">
              تاریخ‌های بیس‌لاین از برنامه زمان‌بندی پروژه و درصد پیشرفت از گزارش‌های ثبت‌شده اعضای
              تیم استخراج می‌شود.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MetaItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 flex items-center gap-2 text-sm font-bold">
        {icon}
        {value}
      </dd>
    </div>
  );
}

function ScheduleBlock({
  title,
  start,
  end,
  tone,
}: {
  title: string;
  start: string;
  end: string;
  tone: "baseline" | "estimated";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        tone === "baseline" ? "border-border bg-background" : "border-primary/30 bg-primary/5",
      )}
    >
      <p className="text-xs font-bold text-muted-foreground">{title}</p>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">شروع</dt>
          <dd className="font-bold">{toPersianDigits(start)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">پایان</dt>
          <dd className="font-bold">{toPersianDigits(end)}</dd>
        </div>
      </dl>
    </div>
  );
}
