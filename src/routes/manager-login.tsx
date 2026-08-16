import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FolderPlus, LogIn, TriangleAlert, UserRound } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole } from "@/context/RoleContext";
import { fetchProjects, projectManagerName, setActiveProject, type Project } from "@/lib/project";
import { toPersianDateString } from "@/lib/persian";

export const Route = createFileRoute("/manager-login")({
  head: () => ({
    meta: [
      { title: "ورود مدیر پروژه | پروژه‌یار" },
      {
        name: "description",
        content: "ورود مدیر پروژه با انتخاب یکی از پروژه‌های ساخته‌شده، بدون نیاز به کد پروژه.",
      },
      { property: "og:title", content: "ورود مدیر پروژه | پروژه‌یار" },
      { property: "og:description", content: "انتخاب پروژه و ورود به داشبورد کنترل پروژه." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ManagerLogin,
});

function ManagerLogin() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  const { data, isPending, error } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 30_000,
  });

  const enter = (project: Project) => {
    setActiveProject(project);
    setRole("pm");
    navigate({ to: "/pm/dashboard" });
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-16">
      <Link
        to="/role-select"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowRight className="h-4 w-4" aria-hidden />
        بازگشت به صفحه ورود
      </Link>

      <header className="mt-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-[2rem]">ورود مدیر پروژه</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          یکی از پروژه‌های ساخته‌شده را انتخاب کنید تا بدون وارد کردن کد، وارد داشبورد آن شوید.
        </p>
      </header>

      <section className="mt-10 space-y-3">
        {isPending &&
          [0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="mt-3 h-4 w-64" />
            </div>
          ))}

        {error && (
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" aria-hidden />
            <AlertTitle>خطا در خواندن پروژه‌ها</AlertTitle>
            <AlertDescription>
              فهرست پروژه‌ها خوانده نشد. اتصال اینترنت را بررسی کنید.
            </AlertDescription>
          </Alert>
        )}

        {!isPending && !error && (data?.length ?? 0) === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">هنوز پروژه‌ای ساخته نشده است.</p>
            <Link
              to="/project-new"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <FolderPlus className="h-4 w-4" aria-hidden />
              ایجاد پروژه جدید
            </Link>
          </div>
        )}

        {data?.map((project) => (
          <button
            key={project.id || project.project_code}
            type="button"
            onClick={() => enter(project)}
            className="flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 text-start transition-colors hover:border-primary hover:bg-muted"
          >
            <span className="min-w-0">
              <span className="block truncate text-base font-bold">{project.project_name}</span>
              <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5" aria-hidden />
                  مدیر پروژه: {projectManagerName(project)}
                </span>
                <span dir="ltr" className="font-mono">
                  {project.project_code}
                </span>
                {project.created_at && <span>{toPersianDateString(project.created_at)}</span>}
              </span>
            </span>
            <LogIn className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          </button>
        ))}
      </section>
    </main>
  );
}
