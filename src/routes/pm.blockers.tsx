import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CalendarClock, CheckCircle2, Clock3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/pm/PmShell";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/persian";
import { EmptyState } from "@/components/pm/EmptyState";
import { CardsSkeleton } from "@/components/pm/Skeletons";
import { useActiveProject } from "@/hooks/use-active-project";
import { fetchProjectBlockers, type ProjectBlockerRow } from "@/lib/pm-data";

export const Route = createFileRoute("/pm/blockers")({
  head: () => ({
    meta: [
      { title: "موانع فعال | پروژه‌یار" },
      {
        name: "description",
        content: "پایش موانع ثبت‌شده توسط تیم و اقدام مدیریتی برای رفع آن‌ها.",
      },
      { property: "og:title", content: "موانع فعال | پروژه‌یار" },
      {
        property: "og:description",
        content: "فیلتر، بررسی و پیگیری موانع مسیر بحرانی پروژه.",
      },
    ],
  }),
  component: PmBlockers,
});

type ViewStatus = "critical" | "reviewing" | "resolved";

const statusLabels: Record<ViewStatus, string> = {
  critical: "بحرانی",
  reviewing: "در حال بررسی",
  resolved: "برطرف‌شده",
};

const severityStyles: Record<ProjectBlockerRow["severity"], string> = {
  High: "border-destructive/30 bg-destructive/10 text-destructive",
  Medium: "border-accent/40 bg-accent/15 text-warning",
  Low: "border-border bg-muted text-muted-foreground",
};

const statusStyles: Record<ViewStatus, string> = {
  critical: "border-destructive/40 bg-destructive/5",
  reviewing: "border-accent/40 bg-accent/5",
  resolved: "border-secondary/50 bg-secondary/10",
};

const ALL_FRONTS = "همه جبهه‌ها";

function viewStatus(raw: string): ViewStatus {
  const value = raw.trim().toLowerCase();
  if (value === "resolved" || value.includes("برطرف") || value.includes("closed")) return "resolved";
  if (
    value === "reviewing" ||
    value.includes("review") ||
    value.includes("progress") ||
    value.includes("بررسی") ||
    value.includes("حل")
  )
    return "reviewing";
  return "critical";
}

function PmBlockers() {
  const { project } = useActiveProject();
  const projectCode = project?.project_code ?? null;

  const [statusFilter, setStatusFilter] = useState<"all" | ViewStatus>("all");
  const [frontFilter, setFrontFilter] = useState<string>(ALL_FRONTS);

  const { data, isPending, isError } = useQuery({
    queryKey: ["project-blockers", projectCode],
    queryFn: () => fetchProjectBlockers(projectCode as string),
    enabled: Boolean(projectCode),
  });

  const blockers = data ?? [];

  const fronts = useMemo(() => {
    const codes = Array.from(
      new Set(blockers.map((item) => item.task_code.trim()).filter(Boolean)),
    ).sort();
    return [ALL_FRONTS, ...codes];
  }, [blockers]);

  useEffect(() => {
    if (frontFilter !== ALL_FRONTS && !fronts.includes(frontFilter)) setFrontFilter(ALL_FRONTS);
  }, [fronts, frontFilter]);

  const filtered = useMemo(
    () =>
      blockers.filter((blocker) => {
        const statusOk = statusFilter === "all" || viewStatus(blocker.status) === statusFilter;
        const frontOk = frontFilter === ALL_FRONTS || blocker.task_code.trim() === frontFilter;
        return statusOk && frontOk;
      }),
    [blockers, statusFilter, frontFilter],
  );

  const isLoading = Boolean(projectCode) && isPending;

  return (
    <div>
      <PageHeader
        title="موانع فعال پروژه"
        subtitle="پایش موانع ثبت‌شده توسط تیم و اقدام برای کاهش تاثیر روی تاریخ پایان پروژه."
      />

      <section className="mt-8 grid gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2 sm:p-5">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">وضعیت مانع</label>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as "all" | ViewStatus)}
          >
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="انتخاب وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              <SelectItem value="critical">بحرانی</SelectItem>
              <SelectItem value="reviewing">در حال بررسی</SelectItem>
              <SelectItem value="resolved">برطرف‌شده</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">جبهه کاری (کد فعالیت)</label>
          <Select value={frontFilter} onValueChange={setFrontFilter}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="انتخاب جبهه" />
            </SelectTrigger>
            <SelectContent>
              {fronts.map((front) => (
                <SelectItem key={front} value={front}>
                  {front}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <p className="mt-4 text-sm text-muted-foreground">
        {toPersianDigits(filtered.length)} مانع مطابق فیلترها
      </p>

      <div className="mt-6 space-y-5">
        {isLoading && <CardsSkeleton />}

        {!isLoading &&
          filtered.map((blocker) => {
            const status = viewStatus(blocker.status);
            return (
              <article
                key={blocker.id}
                className={cn("overflow-hidden rounded-xl border bg-card shadow-sm", statusStyles[status])}
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start gap-2">
                    <AlertTriangle
                      className={cn(
                        "mt-0.5 h-5 w-5 shrink-0",
                        status === "resolved" ? "text-secondary" : "text-destructive",
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold sm:text-lg">{blocker.title}</h2>
                        <Badge className={cn("rounded-lg border", severityStyles[blocker.severity])}>
                          {blocker.severity}
                        </Badge>
                        <Badge variant="secondary" className="rounded-lg">
                          {statusLabels[status]}
                        </Badge>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        {blocker.task_code && (
                          <span>
                            کد فعالیت:{" "}
                            <span className="font-medium text-foreground">{blocker.task_code}</span>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" aria-hidden />
                          ثبت: {toPersianDigits(blocker.reported_at || "—")}
                        </span>
                        {blocker.resolved_at && (
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                            رفع: {toPersianDigits(blocker.resolved_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {blocker.impact && (
                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-background/80 px-3 py-3 text-sm">
                      <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <p className="leading-7">{blocker.impact}</p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}

        {!isLoading && filtered.length === 0 && (
          <EmptyState
            icon={CheckCircle2}
            title={isError ? "خواندن موانع انجام نشد" : "هیچ مانعی ثبت نشده است"}
            description={
              isError
                ? "ارتباط با پایگاه‌داده برقرار نشد. کمی بعد دوباره تلاش کنید."
                : "با این فیلترها مانعی برای پروژه جاری ثبت نشده است."
            }
          />
        )}
      </div>
    </div>
  );
}
