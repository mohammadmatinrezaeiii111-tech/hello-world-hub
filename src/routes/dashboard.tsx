import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "پنل مدیریت | پروژه‌یار" },
      {
        name: "description",
        content: "پنل مدیریت پروژه‌یار برای آپلود برنامه بیس‌لاین و پیگیری انحرافات زمان‌بندی.",
      },
      { property: "og:title", content: "پنل مدیریت | پروژه‌یار" },
      {
        property: "og:description",
        content: "آپلود برنامه بیس‌لاین و پیگیری انحرافات زمان‌بندی پروژه.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div className="max-w-md">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">پنل مدیریت</h1>
        <p className="mt-6 text-muted-foreground">
          این بخش به‌زودی آماده می‌شود؛ فعلاً می‌توانید به صفحه اصلی بازگردید.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-xl border border-border px-6 text-sm font-bold text-foreground transition-colors duration-150 hover:bg-muted"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}