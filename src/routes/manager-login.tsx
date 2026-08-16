import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, FolderPlus, Loader as Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRole } from "@/context/RoleContext";
import { fetchProjectByCode, setActiveProject } from "@/lib/project";

export const Route = createFileRoute("/manager-login")({
  head: () => ({
    meta: [
      { title: "ورود مدیر پروژه | پروژه‌یار" },
      {
        name: "description",
        content: "ورود مدیر پروژه با کد اختصاصی پروژه (PRJ-XXXXXX) به داشبورد مدیریتی.",
      },
      { property: "og:title", content: "ورود مدیر پروژه | پروژه‌یار" },
      { property: "og:description", content: "ورود مدیر با کد پروژه به داشبورد کنترل پروژه." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ManagerLogin,
});

function ManagerLogin() {
  const navigate = useNavigate();
  const { setRole } = useRole();
  const [code, setCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || isChecking) return;

    setIsChecking(true);
    setErrorMessage(null);
    try {
      const project = await fetchProjectByCode(trimmed);
      if (!project) {
        setErrorMessage("کد پروژه یافت نشد. کد اختصاصی پروژه خود را بررسی کنید.");
        return;
      }
      setActiveProject(project);
      setRole("pm");
      toast.success("ورود مدیر تأیید شد", { description: `پروژه: ${project.project_name}` });
      navigate({ to: "/pm/dashboard" });
    } catch {
      setErrorMessage("بررسی کد پروژه انجام نشد. اتصال اینترنت را بررسی کنید.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-6 py-16">
      <Link
        to="/role-select"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowRight className="h-4 w-4" aria-hidden />
        بازگشت به صفحه ورود
      </Link>

      <section className="mt-8 rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-9">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary/20 text-success">
            <ShieldCheck className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-bold sm:text-2xl">ورود مدیر پروژه</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              کد اختصاصی پروژه خود را وارد کنید تا وارد داشبورد مدیریتی همان پروژه شوید.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="manager_project_code" className="text-sm font-bold">
              کد پروژه
            </label>
            <Input
              id="manager_project_code"
              dir="ltr"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="PRJ-XXXXXX"
              className="mt-2 h-12 rounded-xl font-mono"
            />
          </div>
          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
          <Button
            type="submit"
            size="lg"
            disabled={!code.trim() || isChecking}
            className="h-12 w-full rounded-xl font-bold"
          >
            {isChecking && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {isChecking ? "در حال بررسی..." : "ورود به داشبورد مدیریتی"}
          </Button>
        </form>

        <Link
          to="/project-new"
          className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-border px-5 py-4 transition-colors hover:border-primary hover:bg-muted"
        >
          <span className="min-w-0">
            <span className="block text-sm font-bold">کد پروژه ندارید؟</span>
            <span className="mt-1 block text-xs text-muted-foreground">
              پروژه جدید بسازید و کد اختصاصی دریافت کنید.
            </span>
          </span>
          <FolderPlus className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        </Link>
      </section>
    </main>
  );
}
