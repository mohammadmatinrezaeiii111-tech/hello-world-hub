import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, BrainCircuit, Clock3, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/pm/PmShell";
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
import { useMockLoading } from "@/hooks/use-mock-loading";
import { criticalDelayedTasks, dashboardKpis, sCurveData } from "@/mock/dashboard";

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
  const isLoading = useMockLoading();

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

      <section className="mt-10">
        {isLoading ? (
          <KpiCardsSkeleton />
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {dashboardKpis.map((kpi) => {
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
      ) : (
        <section className="mt-10 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold tracking-tight">منحنی S-Curve</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              مقایسه پیشرفت تجمعی برنامه‌ای و واقعی در طول دوره پروژه
            </p>
          </div>

          <ChartContainer config={chartConfig} className="aspect-[2/1] w-full min-h-[280px]">
            <AreaChart data={sCurveData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
      )}

      <section className="mt-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">تسک‌های دارای تاخیر بحرانی</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              چهار فعالیت با بیشترین تاثیر تاخیر روی مسیر بحرانی
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
        ) : (
          <ul className="space-y-3">
            {criticalDelayedTasks.map((task, index) => (
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
                      WBS: {toPersianDigits(task.wbs)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="destructive" className="rounded-lg">
                      {toPersianDigits(task.delayDays)} روز تاخیر
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="rounded-lg bg-accent/20 text-warning hover:bg-accent/30"
                    >
                      انحراف {toPersianDigits(task.variancePct)}٪
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
