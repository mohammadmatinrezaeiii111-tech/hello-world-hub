import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, FileSpreadsheet, FileUp, Loader as Loader2, Trash2, TriangleAlert, CloudUpload as UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/pm/PmShell";
import { toPersianDigits } from "@/lib/persian";
import { getWebhookUrl, saveAnalysis, sendBaselineToN8n } from "@/lib/n8n";
import { toast } from "sonner";


export const Route = createFileRoute("/pm/upload")({
  head: () => ({
    meta: [
      { title: "آپلود بیس‌لاین | پروژه‌یار" },
      { name: "description", content: "بارگذاری فایل اکسل برنامه زمان‌بندی پایه پروژه." },
      { property: "og:title", content: "آپلود بیس‌لاین | پروژه‌یار" },
      { property: "og:description", content: "بارگذاری برنامه زمان‌بندی پایه در پروژه‌یار." },
    ],
  }),
  component: PmUpload,
});

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${toPersianDigits(Math.max(1, Math.round(bytes / 1024)))} کیلوبایت`;
  return `${toPersianDigits((bytes / (1024 * 1024)).toFixed(1))} مگابایت`;
}

function isAllowedFile(file: File) {
  return /\.(xlsx|csv)$/i.test(file.name);
}

function PmUpload() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectFile = (nextFile: File | undefined) => {
    if (!nextFile || !isAllowedFile(nextFile) || isProcessing) return;
    setFile(nextFile);
    setErrorMessage(null);
    toast.success("فایل انتخاب شد", { description: nextFile.name });
  };

  const handleProcess = async () => {
    if (!file || isProcessing) return;

    setErrorMessage(null);

    if (!getWebhookUrl()) {
      const message =
        "آدرس وب‌هوک n8n تنظیم نشده است. ابتدا در «تنظیمات یکپارچه‌سازی» آدرس وب‌هوک (ngrok) را وارد و تست کنید.";
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    setIsProcessing(true);
    try {
      const analysis = await sendBaselineToN8n(file);
      saveAnalysis(analysis);
      toast.success("تحلیل با موفقیت از n8n دریافت شد");
      navigate({ to: "/pm/analysis" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ارسال فایل به n8n با خطا مواجه شد.";
      setErrorMessage(message);
      toast.error("ارسال به n8n ناموفق بود", { description: message });
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div>
      <PageHeader
        title="آپلود برنامه زمان‌بندی (بیس‌لاین)"
        subtitle="نسخه پایه برنامه زمان‌بندی پروژه را بارگذاری کنید تا برای تحلیل‌های بعدی آماده شود."
      />

      <div className="mx-auto mt-10 max-w-3xl">
        {errorMessage && !isProcessing && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p className="leading-6">{errorMessage}</p>
          </div>
        )}

        {!isProcessing ? (
          <>
            {!file ? (
              <div
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => {
                  event.preventDefault();
                  if (event.currentTarget === event.target) setIsDragging(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  selectFile(event.dataTransfer.files[0]);
                }}
                className={`flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-150 ${
                  isDragging
                    ? "border-primary bg-primary/5 shadow-[0_0_0_5px_color-mix(in_oklab,var(--color-primary)_10%,transparent)]"
                    : "border-border bg-card hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                <div className={`grid h-16 w-16 place-items-center rounded-2xl transition-colors duration-150 ${isDragging ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                  <UploadCloud className="h-8 w-8" aria-hidden />
                </div>
                <h2 className="mt-6 text-lg font-bold">فایل اکسل بیس‌لاین را اینجا رها کنید</h2>
                <p className="mt-2 text-sm text-muted-foreground">فایل اکسل بیس‌لاین (.xlsx یا .csv) را اینجا رها کنید</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.csv"
                  className="hidden"
                  onChange={(event) => selectFile(event.target.files?.[0])}
                />
                <Button type="button" size="lg" className="mt-7" onClick={() => inputRef.current?.click()}>
                  <FileUp className="h-5 w-5" aria-hidden />
                  انتخاب فایل از سیستم
                </Button>
                <p className="mt-5 text-xs text-muted-foreground">فرمت‌های مجاز: .xlsx و .csv</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
                      <FileSpreadsheet className="h-7 w-7" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{file.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="حذف فایل"
                    onClick={() => setFile(null)}
                    className="self-end text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:self-auto"
                  >
                    <Trash2 className="h-5 w-5" aria-hidden />
                  </Button>
                </div>
                <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">فایل برای پردازش آماده است.</p>
                  <Button type="button" size="lg" onClick={handleProcess}>
                    <Check className="h-5 w-5" aria-hidden />
                    تأیید و پردازش بیس‌لاین
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
                <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
              </div>
              <h2 className="mt-5 text-xl font-bold">در حال تحلیل برنامه زمان‌بندی توسط n8n...</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                فایل بیس‌لاین برای workflow ارسال شد؛ لطفاً تا دریافت پاسخ منتظر بمانید.
              </p>
              <div className="mx-auto mt-6 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-muted">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
              </div>
            </div>
          </div>

        )}
      </div>
    </div>
  );
}
