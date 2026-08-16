import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FolderPlus, KeyRound, Loader as Loader2, LogIn, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchProjectByCode, setActiveProject } from "@/lib/project";
import { toast } from "sonner";

export const Route = createFileRoute("/role-select")({
  head: () => ({
    meta: [
      { title: "ورود به پروژه‌یار | ورود با کد پروژه یا پنل مدیران" },
      {
        name: "description",
        content:
          "با کد پروژه وارد داشبورد اختصاصی شوید یا از پنل مدیران، پروژه جدید بسازید و به پروژه‌های خود وارد شوید.",
      },
      { property: "og:title", content: "ورود به پروژه‌یار" },
      {
        property: "og:description",
        content: "ورود با کد پروژه یا از طریق پنل مدیران پروژه.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthEntry,
});

function AuthEntry() {
  const { setRole } = useRole();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submitCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || isChecking) return;

    setIsChecking(true);
    setErrorMessage(null);

    try {
      const project = await fetchProjectByCode(trimmed);
      if (!project) {
        setErrorMessage("کد پروژه یافت نشد. کد دریافتی را دوباره بررسی کنید.");
        return;
      }

      setActiveProject(project);
      setRole("user");
      toast.success("کد پروژه تأیید شد", { description: `پروژه: ${project.project_name}` });
      navigate({ to: "/user" });
    } catch {
      setErrorMessage("بررسی کد پروژه انجام نشد. اتصال اینترنت را بررسی کنید.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-20">
      <div className="w-full max-w-5xl">
        <header className="text-center">
          <h1 className="text-[1.75rem] font-bold tracking-tight sm:text-[2.25rem]">
            ورود به پروژه‌یار
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            اگر کد پروژه دارید با آن وارد شوید؛ مدیران پروژه از پنل مدیریت، پروژه می‌سازند یا با کد پروژه وارد داشبورد مدیریتی می‌شوند.
          </p>
        </header>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* بخش اول: ورود با کد پروژه */}
          <section className="flex flex-col rounded-2xl border border-primary/25 bg-card p-7 shadow-sm sm:p-9">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <KeyRound className="h-6 w-6" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="text-xl font-bold sm:text-2xl">ورود به پروژه با کد</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  مخصوص اعضای تیم و کاربرانی که کد پروژه را دریافت کرده‌اند.
                </p>
              </div>
            </div>

            <form onSubmit={submitCode} className="mt-8 space-y-4">
              <div>
                <label htmlFor="project_code" className="text-sm font-bold">
                  کد پروژه
                </label>
                <Input
                  id="project_code"
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
                {isChecking ? "در حال بررسی..." : "ورود به پنل فعالیت‌ها"}
              </Button>
            </form>
          </section>

          {/* بخش دوم: پنل مدیران پروژه */}
          <section className="flex flex-col rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-9">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary/20 text-success">
                <ShieldCheck className="h-6 w-6" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="text-xl font-bold sm:text-2xl">پنل مدیران پروژه</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  ساخت پروژه جدید یا ورود مدیر با کد اختصاصی پروژه.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                to="/project-new"
                className="flex items-center justify-between gap-4 rounded-xl border border-border px-5 py-4 transition-colors hover:border-primary hover:bg-muted"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-bold">ایجاد پروژه جدید</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    تعریف پروژه و دریافت کد اختصاصی (مثل PRJ-102)
                  </span>
                </span>
                <FolderPlus className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              </Link>

              <Link
                to="/manager-login"
                className="flex items-center justify-between gap-4 rounded-xl border border-border px-5 py-4 transition-colors hover:border-primary hover:bg-muted"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-bold">ورود مدیر</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    ورود با کد اختصاصی پروژه به داشبورد مدیریتی
                  </span>
                </span>
                <LogIn className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
