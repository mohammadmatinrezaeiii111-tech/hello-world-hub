import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Clipboard, FolderPlus, Loader as Loader2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/client/project-new")({
  head: () => ({
    meta: [
      { title: "ساخت پروژه جدید | پروژه‌یار" },
      { name: "description", content: "ثبت پروژه جدید و دریافت کد اختصاصی پروژه." },
    ],
  }),
  component: NewClientProject,
});

function createProjectCode() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `PRJ-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 6).toUpperCase()}`;
}

function NewClientProject() {
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [projectCode, setProjectCode] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedProjectName = projectName.trim();
    const trimmedClientName = clientName.trim();

    if (!trimmedProjectName || !trimmedClientName || isSaving) return;

    setIsSaving(true);
    setErrorMessage(null);
    const nextProjectCode = createProjectCode();

    const { data, error } = await supabase
      .from("projects")
      .insert({
        project_name: trimmedProjectName,
        client_name: trimmedClientName,
        project_code: nextProjectCode,
      })
      .select("project_code")
      .maybeSingle();

    setIsSaving(false);

    if (error || !data?.project_code) {
      const isRlsError =
        error?.code === "42501" ||
        /row-level security|policy/i.test(error?.message ?? "");
      const friendlyMessage = isRlsError
        ? "به‌دلیل محدودیت‌های امنیتی پایگاه‌داده (RLS)، ثبت پروژه انجام نشد."
        : error?.message ?? "ثبت پروژه انجام نشد. لطفاً دوباره تلاش کنید.";
      setErrorMessage(friendlyMessage);
      return;
    }

    setProjectCode(data.project_code);
    toast.success("پروژه با موفقیت ساخته شد");
  };

  const copyProjectCode = async () => {
    if (!projectCode) return;
    await navigator.clipboard.writeText(projectCode);
    toast.success("کد پروژه کپی شد");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-xl">
        <Link
          to="/role-select"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" aria-hidden />
          بازگشت به انتخاب نقش
        </Link>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-9">
          {projectCode ? (
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
                <Check className="h-8 w-8" aria-hidden />
              </div>
              <h1 className="mt-6 text-2xl font-bold">پروژه با موفقیت ساخته شد</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                این کد را برای پیگیری و ورود به پروژه نزد خود نگه دارید.
              </p>
              <div className="mt-8 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                <code dir="ltr" className="flex-1 text-center text-xl font-bold tracking-[0.18em] text-primary">
                  {projectCode}
                </code>
                <Button type="button" variant="outline" size="icon" onClick={copyProjectCode} aria-label="کپی کد پروژه">
                  <Clipboard className="h-4 w-4" aria-hidden />
                </Button>
              </div>
              <Button type="button" variant="outline" className="mt-8 w-full" onClick={() => setProjectCode(null)}>
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
                  <h1 className="text-2xl font-bold">ساخت پروژه جدید</h1>
                  <p className="mt-2 text-sm text-muted-foreground">اطلاعات پروژه را وارد کنید تا کد اختصاصی آن ساخته شود.</p>
                </div>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="project_name" className="text-sm font-bold">نام پروژه</label>
                  <input
                    id="project_name"
                    name="project_name"
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    placeholder="مثلاً احداث ساختمان اداری"
                    required
                    className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <div>
                  <label htmlFor="client_name" className="text-sm font-bold">نام کارفرما</label>
                  <input
                    id="client_name"
                    name="client_name"
                    value={clientName}
                    onChange={(event) => setClientName(event.target.value)}
                    placeholder="مثلاً شرکت عمران پارس"
                    required
                    className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                {errorMessage && (
                  <Alert variant="destructive">
                    <TriangleAlert className="h-4 w-4" aria-hidden />
                    <AlertTitle>خطا در ثبت پروژه</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" size="lg" className="h-12 w-full rounded-xl font-bold" disabled={isSaving}>
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
