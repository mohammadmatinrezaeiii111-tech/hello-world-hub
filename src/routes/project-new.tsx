import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Clipboard,
  FolderPlus,
  Loader as Loader2,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRole } from "@/context/RoleContext";
import { createProject, setActiveProject, type Project } from "@/lib/project";
import { toast } from "sonner";

export const Route = createFileRoute("/project-new")({
  head: () => ({
    meta: [
      { title: "ایجاد پروژه جدید | پروژه‌یار" },
      {
        name: "description",
        content: "تعریف پروژه جدید با نام پروژه و نام مدیر پروژه و دریافت کد اختصاصی پروژه.",
      },
      { property: "og:title", content: "ایجاد پروژه جدید | پروژه‌یار" },
      { property: "og:description", content: "ثبت پروژه و دریافت کد اختصاصی پروژه." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewProject,
});

function NewProject() {
  const navigate = useNavigate();
  const { setRole } = useRole();
  const [projectName, setProjectName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [clientName, setClientName] = useState("");
  const [created, setCreated] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!projectName.trim() || !managerName.trim() || isSaving) return;

    setIsSaving(true);
    setErrorMessage(null);
    try {
      const project = await createProject({
        projectName,
        managerName,
        clientName,
      });
      setCreated(project);
      toast.success("پروژه با موفقیت ساخته شد");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "ثبت پروژه انجام نشد.");
    } finally {
      setIsSaving(false);
    }
  };

  const copyProjectCode = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(created.project_code);
    toast.success("کد پروژه کپی شد");
  };

  const enterDashboard = () => {
    if (!created) return;
    setActiveProject(created);
    setRole("pm");
    navigate({ to: "/pm/dashboard" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-xl">
        <Link
          to="/role-select"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" aria-hidden />
          بازگشت به صفحه ورود
        </Link>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-9">
          {created ? (
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary/20 text-success">
                <Check className="h-8 w-8" aria-hidden />
              </div>
              <h1 className="mt-6 text-2xl font-bold">پروژه با موفقیت ساخته شد</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                این کد اختصاصی را برای ورود اعضای تیم به پروژه در اختیار آن‌ها بگذارید.
              </p>
              <div className="mt-8 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                <code
                  dir="ltr"
                  className="flex-1 text-center text-xl font-bold tracking-[0.18em] text-primary"
                >
                  {created.project_code}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyProjectCode}
                  aria-label="کپی کد پروژه"
                >
                  <Clipboard className="h-4 w-4" aria-hidden />
                </Button>
              </div>
              <dl className="mt-6 space-y-2 rounded-xl border border-border p-4 text-start text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">نام پروژه</dt>
                  <dd className="min-w-0 truncate font-bold">{created.project_name}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">مدیر پروژه</dt>
                  <dd className="min-w-0 truncate font-bold">
                    {created.manager_name?.trim() || managerName.trim()}
                  </dd>
                </div>
              </dl>
              <Button
                type="button"
                size="lg"
                className="mt-8 h-12 w-full rounded-xl font-bold"
                onClick={enterDashboard}
              >
                ورود به داشبورد این پروژه
              </Button>
              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full"
                onClick={() => {
                  setCreated(null);
                  setProjectName("");
                  setManagerName("");
                  setClientName("");
                }}
              >
                ساخت پروژه دیگر
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <FolderPlus className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">ایجاد پروژه جدید</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    اطلاعات اولیه پروژه را وارد کنید تا کد اختصاصی آن ساخته شود.
                  </p>
                </div>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="project_name" className="text-sm font-bold">
                    نام پروژه
                  </label>
                  <Input
                    id="project_name"
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    placeholder="مثلاً احداث ساختمان اداری"
                    required
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <label htmlFor="manager_name" className="text-sm font-bold">
                    نام مدیر پروژه
                  </label>
                  <Input
                    id="manager_name"
                    value={managerName}
                    onChange={(event) => setManagerName(event.target.value)}
                    placeholder="مثلاً مریم رضایی"
                    required
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <label htmlFor="client_name" className="text-sm font-bold">
                    نام کارفرما یا سازمان <span className="text-muted-foreground">(اختیاری)</span>
                  </label>
                  <Input
                    id="client_name"
                    value={clientName}
                    onChange={(event) => setClientName(event.target.value)}
                    placeholder="مثلاً شرکت عمران پارس"
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                {errorMessage && (
                  <Alert variant="destructive">
                    <TriangleAlert className="h-4 w-4" aria-hidden />
                    <AlertTitle>خطا در ثبت پروژه</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full rounded-xl font-bold"
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
                  {isSaving ? "در حال ثبت پروژه..." : "ثبت و ساخت پروژه"}
                </Button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
