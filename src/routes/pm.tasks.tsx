import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck } from "lucide-react";
import { EmptyState } from "@/components/pm/EmptyState";
import { PageHeader } from "@/components/pm/PmShell";
import { ListSkeleton } from "@/components/pm/Skeletons";
import { Badge } from "@/components/ui/badge";
import { getProjectCode } from "@/lib/n8n";
import { fetchProjectTasks, taskPercent, taskStatusLabels, type TaskStatus } from "@/lib/pm-data";
import { toPersianDigits } from "@/lib/persian";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pm/tasks")({
  head: () => ({
    meta: [
      { title: "مدیریت فعالیت‌ها | پروژه‌یار" },
      { name: "description", content: "پایش و مدیریت فعالیت‌های پروژه و مسئولان آن‌ها." },
      { property: "og:title", content: "مدیریت فعالیت‌ها | پروژه‌یار" },
      { property: "og:description", content: "پایش و مدیریت فعالیت‌های پروژه." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PmTasks,
});

const statusBadgeClass: Record<TaskStatus, string> = {
  "on-track": "border-secondary/40 bg-secondary/15 text-success",
  delayed: "border-destructive/30 bg-destructive/10 text-destructive",
  blocked: "border-accent/40 bg-accent/15 text-warning",
  completed: "border-border bg-muted text-muted-foreground",
};

const statusFilters = [
  { value: "all", label: "همه فعالیت‌ها" },
  { value: "completed", label: "تکمیل‌شده" },
  { value: "delayed", label: "دارای تاخیر" },
  { value: "on-track", label: "مطابق برنامه" },
] as const;

type StatusFilter = (typeof statusFilters)[number]["value"];

function PmTasks() {
  const [projectCode, setProjectCode] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

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
  const allTasks = data ?? [];
  const tasks =
    statusFilter === "all"
      ? allTasks
      : allTasks.filter((task) => task.status === statusFilter);

  return (
    <div>
      <PageHeader
        title="مدیریت فعالیت‌ها"
        subtitle="فهرست فعالیت‌های پروژه، مسئولان و وضعیت پیشرفت."
      />

      {allTasks.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {statusFilters.map((filter) => {
            const count =
              filter.value === "all"
                ? allTasks.length
                : allTasks.filter((task) => task.status === filter.value).length;
            const isActive = statusFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-xs font-bold transition-colors duration-150",
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40",
                )}
              >
                {filter.label} ({toPersianDigits(count)})
              </button>
            );
          })}
        </div>
      )}


      {error && (
        <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "دریافت فعالیت‌ها انجام نشد."}
        </p>
      )}

      {!projectCode ? (
        <div className="mt-10">
          <EmptyState
            icon={ClipboardCheck}
            title="کد پروژه یافت نشد"
            description="ابتدا از صفحه ورود کد پروژه را وارد کنید تا فعالیت‌های واقعی نمایش داده شوند."
          />
        </div>
      ) : isLoading ? (
        <div className="mt-10">
          <ListSkeleton rows={5} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={ClipboardCheck}
            title={
              allTasks.length === 0 ? "هنوز داده‌ای ثبت نشده" : "فعالیتی با این وضعیت یافت نشد"
            }
            description={
              allTasks.length === 0
                ? "برای این پروژه هیچ برنامه بیس‌لاینی ثبت نشده است؛ با آپلود برنامه زمان‌بندی، فعالیت‌ها اینجا نمایش داده می‌شوند."
                : "فیلتر وضعیت را تغییر دهید تا سایر فعالیت‌ها نمایش داده شوند."
            }
          />

        </div>
      ) : (
        <ul className="mt-10 space-y-3">
          {tasks.map((task) => (
            <li key={task.id}>
              <Link
                to="/pm/task/$id"
                params={{ id: task.id }}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors duration-150 hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold">{task.title}</span>
                    <Badge variant="outline" className="rounded-lg">
                      {task.id}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    WBS: {toPersianDigits(task.wbs)} — مسئول: {task.owner} — وزن:{" "}
                    {toPersianDigits(task.weight)}٪ — پیشرفت: {toPersianDigits(taskPercent(task))}٪
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    بازه برنامه: {task.baselineStart} تا {task.baselineEnd}
                  </p>
                </div>
                <Badge className={cn("w-fit rounded-lg border", statusBadgeClass[task.status])}>
                  {taskStatusLabels[task.status]}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
