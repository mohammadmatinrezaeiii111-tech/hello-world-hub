import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BrainCircuit, Clock3, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/pm/PmShell";
import { EmptyState } from "@/components/pm/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { toPersianDigits } from "@/lib/persian";
import { ChartSkeleton, KpiCardsSkeleton, ListSkeleton } from "@/components/pm/Skeletons";
import { getProjectCode } from "@/lib/n8n";
import {
  buildSCurve,
  delayedTasks,
  fetchProjectTasks,
  plannedProgress,
  taskPercent,
  weightedProgress,
} from "@/lib/pm-data";

export const Route = createFileRoute("/pm/dashboard")({
  head: () => ({
    meta: [
      { title: "داشبورد مدیریت پروژه | پروژه‌یار" },
      {
        name: "description",
        content: "شاخص‌های کلیدی، منحنی S-Curve و تسک‌های دارای تاخیر بحرانی.",
      },
      { property: "og:title", content: "داشبورد مدیریت پروژه | پروژه‌یار" },
      {
        property: "og:description",
        content: "نمای تحلیلی پیشرفت برنامه‌ای و واقعی پروژه.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PmDashboard,
});

const chartConfig = {
  planned: {
    label: "برنامه‌ای (Planned)",
    color: "var(--primary)",
  },
  actual: {
    label: "واقعی (Actual)",
    color: "var(--secondary)",
  },
} satisfies ChartConfig;

const kpiIcons: Record<string, LucideIcon> = {
  progress: TrendingDown,
  delay: Clock3,
  blockers: AlertTriangle,
};

function PmDashboard() {
  const [projectCode, setProjectCode] = useState<string | null>(null);

  useEffect(() => {
    setProjectCode(getProjectCode());
  }, []);

  const { data, isPending, error } = useQuery({
    queryKey: ["pm-dashboard-tasks", projectCode],
    queryFn: () => fetchProjectTasks(projectCode as string),
    enabled: Boolean(projectCode),
    staleTime: 30_000,
  });

  const isLoading = Boolean(projectCode) && isPending;
  const tasks = data ?? [];
  const actual = weightedProgress(tasks);
  const planned = plannedProgress(tasks);
  const delayed = delayedTasks(tasks)
    .slice()
    .sort((a, b) => taskPercent(a) - taskPercent(b));
  const curve = buildSCurve(tasks);

  console.log("[PmDashboard] tasks:", tasks);
  console.log("[PmDashboard] planned %:", planned, "actual %:", actual);
  console.log("[PmDashboard] delayed tasks:", delayed);
  console.log("[PmDashboard] S-Curve:", curve);

  const kpis = [
    {
      id: "progress",
      title: "پیشرفت برنامه‌ای vs واقعی",
      value: `${toPersianDigits(planned)}٪ | ${toPersianDigits(actual)}٪`,
      detail: `برنامه‌ای ${toPersianDigits(planned)}٪ — واقعی ${toPersianDigits(actual)}٪`,
      tone: actual < planned ? "text-destructive" : "text-success",
    },
    {
      id: "delay",
      title: "فعالیت‌های دارای تاخیر",
      value: `${toPersianDigits(delayed.length)} فعالیت`,
      detail: "تاریخ پایان برنامه‌ای گذشته و پیشرفت زیر ۱۰۰٪",
      tone: delayed.length > 0 ? "text-warning" : "text-success",
    },
    {
      id: "blockers",
      title: "کل فعالیت‌های بیس‌لاین",
      value: `${toPersianDigits(tasks.length)} فعالیت`,
      detail: "برگرفته از آخرین برنامه بیس‌لاین ثبت‌شده",
      tone: "text-foreground",
    },
  ];

  if (!projectCode) {
    return (
      <div>
        <PageHeader
          title="داشبورد مدیریت پروژه"
          subtitle="شاخص‌های کلیدی، منحنی پیشرفت و فعالیت‌های بحرانی دارای تاخیر."
        />
        <div className="mt-10">
          <EmptyState
            icon={AlertTriangle}
            title="کد پروژه یافت نشد"
            description="ابتدا از صفحه ورود، کد پروژه را وارد کنید تا داده‌های واقعی پروژه نمایش داده شود."
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="داشبورد مدیریت پروژه"
        subtitle="شاخص‌های کلیدی، منحنی پیشرفت و فعالیت‌های بحرانی دارای تاخیر."
      >
        <Button asChild className="h-11 rounded-xl px-5 font-bold">
          <Link to="/pm/ai-analysis">
            <BrainCircuit className="h-4 w-4" aria-hidden />
            تحلیل علل تاخیر با هوش مصنوعی
          </Link>
        </Button>
      </PageHeader>

      {error && (
        <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "دریافت داده‌های پروژه انجام نشد."}
        </p>
      )}

      {!isLoading && !error && tasks.length === 0 && (
        <div className="mt-10">
          <EmptyState
            icon={AlertTriangle}
            title="هنوز داده‌ای ثبت نشده"
            description="برای این پروژه برنامه بیس‌لاینی ثبت نشده است؛ پس از آپلود برنامه زمان‌بندی، شاخص‌ها و منحنی پیشرفت محاسبه می‌شوند."
          />
        </div>
      )}



      <section className="mt-10">
        {isLoading ? (
          <KpiCardsSkeleton />
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {kpis.map((kpi) => {
              const Icon = kpiIcons[kpi.id]!;
              return (
                <article
                  key={kpi.id}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted text-primary">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                  <p className={`mt-4 text-2xl font-bold tracking-tight ${kpi.tone}`}>
                    {kpi.value}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">{kpi.detail}</p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {isLoading ? (
        <div className="mt-10">
          <ChartSkeleton />
        </div>
      ) : curve.length > 0 ? (
        <section className="mt-10 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold tracking-tight">منحنی S-Curve</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              مقایسه پیشرفت تجمعی برنامه‌ای و واقعی در طول دوره پروژه
            </p>
          </div>

          <ChartContainer config={chartConfig} className="aspect-[2/1] w-full min-h-[280px]">
            <AreaChart data={curve} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillPlanned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-planned)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-planned)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-actual)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-actual)" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => String(value)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 100]}
                tickFormatter={(value) => toPersianDigits(`${value}٪`)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <span className="font-medium tabular-nums">
                        {toPersianDigits(Number(value))}٪
                        <span className="ms-2 text-muted-foreground">
                          {chartConfig[name as keyof typeof chartConfig]?.label}
                        </span>
                      </span>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="planned"
                stroke="var(--color-planned)"
                fill="url(#fillPlanned)"
                strokeWidth={2}
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="var(--color-actual)"
                fill="url(#fillActual)"
                strokeWidth={2.5}
                connectNulls={false}
              />
            </AreaChart>
          </ChartContainer>
        </section>
      ) : null}

      <section className="mt-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">تسک‌های دارای تاخیر بحرانی</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              فعالیت‌هایی با تاریخ پایان برنامه‌ای گذشته و پیشرفت کمتر از ۱۰۰٪
            </p>
          </div>
          <Button asChild variant="outline" className="h-10 rounded-xl font-bold">
            <Link to="/pm/ai-analysis">
              <BrainCircuit className="h-4 w-4" aria-hidden />
              تحلیل علل تاخیر با هوش مصنوعی
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <ListSkeleton />
        ) : delayed.length === 0 ? (
          <EmptyState
            icon={Clock3}
            title="فعالیت دارای تاخیری یافت نشد"
            description="در حال حاضر فعالیتی با تاریخ پایان گذشته و پیشرفت ناتمام ثبت نشده است."
          />
        ) : (
          <ul className="space-y-3">
            {delayed.map((task, index) => (
              <li key={task.id}>
                <Link
                  to="/pm/task/$id"
                  params={{ id: task.id }}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors duration-150 hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">
                        {toPersianDigits(index + 1)}.
                      </span>
                      <span className="text-sm font-bold">{task.title}</span>
                      <Badge variant="outline" className="rounded-lg font-normal">
                        {task.id}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      WBS: {toPersianDigits(task.wbs)} — پایان برنامه‌ای: {task.baselineEnd}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="destructive" className="rounded-lg">
                      پیشرفت {toPersianDigits(taskPercent(task))}٪
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="rounded-lg bg-accent/20 text-warning hover:bg-accent/30"
                    >
                      انحراف {toPersianDigits(100 - taskPercent(task))}٪
                    </Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
