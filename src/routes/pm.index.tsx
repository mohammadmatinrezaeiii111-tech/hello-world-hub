import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/pm/PmShell";
import { Skeleton } from "@/components/ui/skeleton";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { overviewStats } from "@/mock/dashboard";

export const Route = createFileRoute("/pm/")({
  head: () => ({
    meta: [
      { title: "خلاصه وضعیت پروژه | پروژه‌یار" },
      { name: "description", content: "نمای کلی پیشرفت پروژه، انحرافات و وضعیت فعالیت‌ها." },
      { property: "og:title", content: "خلاصه وضعیت پروژه | پروژه‌یار" },
      { property: "og:description", content: "نمای کلی پیشرفت پروژه و انحرافات زمان‌بندی." },
    ],
  }),
  component: PmOverview,
});

function PmOverview() {
  const isLoading = useMockLoading();

  return (
    <div>
      <PageHeader
        title="خلاصه وضعیت پروژه"
        subtitle="نمای کلی از پیشرفت، انحرافات و گزارش‌های روزانه تیم."
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat) =>
          isLoading ? (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-4 h-7 w-16" />
            </div>
          ) : (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-3 text-2xl font-bold">{stat.value}</p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}