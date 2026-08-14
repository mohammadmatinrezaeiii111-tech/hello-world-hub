import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ClipboardList, FolderPlus, Loader as Loader2, X } from "lucide-react";
import { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { setProjectCode } from "@/lib/n8n";
import { toast } from "sonner";

export const Route = createFileRoute("/role-select")({
  head: () => ({
    meta: [
      { title: "انتخاب نقش | پروژه‌یار" },
      {
        name: "description",
        content: "نقش خود را انتخاب کنید تا فضای کاری مناسب در پروژه‌یار برای شما باز شود.",
      },
      { property: "og:title", content: "انتخاب نقش | پروژه‌یار" },
      {
        property: "og:description",
        content: "ورود به پروژه‌یار به عنوان مدیر پروژه و پایش انحرافات زمان‌بندی.",
      },
    ],
  }),
  component: RoleSelect,
});

function RoleSelect() {
  const { setRole } = useRole();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submitCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || isChecking) return;

    setIsChecking(true);
    setErrorMessage(null);

    const { data, error } = await supabase
      .from("projects")
      .select("project_code, project_name")
      .eq("project_code", trimmed)
      .maybeSingle();

    setIsChecking(false);

    if (error) {
      setErrorMessage("بررسی کد پروژه انجام نشد. اتصال اینترنت یا دسترسی پایگاه‌داده را بررسی کنید.");
      return;
    }

    if (!data?.project_code) {
      setErrorMessage("کد پروژه یافت نشد. کد دریافتی از کارفرما را دوباره بررسی کنید.");
      return;
    }

    setProjectCode(data.project_code);
    setRole("pm");
    toast.success("کد پروژه تأیید شد", {
      description: data.project_name ? `پروژه: ${data.project_name}` : undefined,
    });
    navigate({ to: "/pm/upload" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24">
      <h1 className="text-center text-[1.75rem] font-bold tracking-tight sm:text-[2.25rem]">
        به عنوان چه کسی وارد می‌شوید؟
      </h1>

      <div className="mt-16 grid w-full max-w-4xl gap-5 md:grid-cols-2">
        <Link
          to="/client/project-new"
          className="flex min-h-[280px] flex-col justify-center rounded-xl border border-border bg-card p-10 transition-colors duration-150 hover:border-primary sm:p-14"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-primary">
            <FolderPlus className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="mt-8 text-xl font-bold sm:text-2xl">کارفرما هستم</h2>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            پروژه جدید بسازید و کد اختصاصی آن را برای پیگیری دریافت کنید.
          </p>
        </Link>

        <button
          type="button"
          onClick={() => {
            setErrorMessage(null);
            setIsModalOpen(true);
          }}
          className="flex min-h-[280px] flex-col justify-center rounded-xl border border-border bg-card p-10 text-start transition-colors duration-150 hover:border-primary sm:p-14"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-primary">
            <ClipboardList className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="mt-8 text-xl font-bold sm:text-2xl">مدیر پروژه هستم</h2>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            با کد پروژه وارد شوید، برنامه بیس‌لاین را آپلود کنید و انحرافات را تحلیل نمایید.
          </p>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center px-6">
          <button
            type="button"
            aria-label="بستن"
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-foreground/50"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="ورود کد پروژه"
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-bold tracking-tight">کد پروژه را وارد کنید</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  کد اختصاصی پروژه را که کارفرما در اختیار شما گذاشته است وارد نمایید.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="بستن"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-5 w-5" aria-hidden />
              </Button>
            </div>

            <form onSubmit={submitCode} className="mt-6 space-y-4">
              <Input
                dir="ltr"
                autoFocus
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="PRJ-XXXXXX"
                className="h-12 rounded-xl font-mono"
              />
              {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
              <Button
                type="submit"
                size="lg"
                disabled={!code.trim() || isChecking}
                className="h-12 w-full rounded-xl font-bold"
              >
                {isChecking && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                {isChecking ? "در حال بررسی..." : "ورود به پروژه"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
