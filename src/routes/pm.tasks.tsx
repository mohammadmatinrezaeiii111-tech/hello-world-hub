import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";
import { EmptyState } from "@/components/pm/EmptyState";
import { PageHeader } from "@/components/pm/PmShell";
import { ListSkeleton } from "@/components/pm/Skeletons";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { Badge } from "@/components/ui/badge";
import { pmTaskList, taskStatusLabels, type TaskStatus } from "@/mock/pm-tasks";
import { toPersianDigits } from "@/lib/persian";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pm/tasks")({
  head: () => ({
    meta: [
      { title: "مدیریت فعالیت‌ها | پروژه‌یار" },
      { name: "description", content: "پایش و مدیریت فعالیت‌های پروژه و مسئولان آن‌ها." },
      { property: "og:title", content: "مدیریت فعالیت‌ها | پروژه‌یار" },
      { property: "og:description", content: "پایش و مدیریت فعالیت‌های پروژه." },
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

function PmTasks() {
  const isLoading = useMockLoading();

  return (
    <div>
      <PageHeader
        title="مدیریت فعالیت‌ها"
        subtitle="فهرست فعالیت‌های پروژه، مسئولان و وضعیت پیشرفت."
      />

      {isLoading ? (
        <div className="mt-10">
          <ListSkeleton rows={5} />
        </div>
      ) : pmTaskList.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={ClipboardCheck}
            title="هنوز فعالیتی ثبت نشده است"
            description="با آپلود برنامه زمان‌بندی بیس‌لاین، فعالیت‌های پروژه به‌صورت خودکار اینجا نمایش داده می‌شوند."
          />
        </div>
      ) : (
      <ul className="mt-10 space-y-3">
        {pmTaskList.map((task) => (
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
                  {toPersianDigits(task.weight)}٪
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
