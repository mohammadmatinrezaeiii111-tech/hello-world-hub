import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BrainCircuit, FileText, Loader as Loader2, RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/pm/PmShell";
import { EmptyState } from "@/components/pm/EmptyState";
import { Markdown } from "@/components/pm/Markdown";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getAnalysis,
  getProjectCode,
  getVariance,
  getWebhookUrl,
  normalizeFlexibleAnalysis,
  saveVariance,
  type N8nAnalysis,
  postToN8n,
  sanitizeWebhookUrl,
} from "@/lib/n8n";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/pm/analysis")({
  head: () => ({
    meta: [
      { title: "تحلیل انحرافات و AI | پروژه‌یار" },
      { name: "description", content: "تحلیل هوشمند انحرافات زمان‌بندی و ارزیابی مخاطرات." },
      { property: "og:title", content: "تحلیل انحرافات و AI | پروژه‌یار" },
      { property: "og:description", content: "تحلیل هوشمند انحرافات و مخاطرات زمان‌بندی." },
    ],
  }),
  component: PmAnalysis,
});

/** آدرس وب‌هوک تولید گزارش انحرافات (پاک‌سازی‌شده) */
function resolveVarianceWebhook() {
  const fromEnv = import.meta.env["VITE_N8N_WEBHOOK_URL"] as string | undefined;
  if (fromEnv) return sanitizeWebhookUrl(fromEnv);
  const stored = getWebhookUrl();
  if (!stored) return null;
  const clean = sanitizeWebhookUrl(stored);
  if (!clean) return null;
  try {
    const url = new URL(clean);
    return `${url.origin}/webhook/generate-variance-report`;
  } catch {
    return null;
  }
}

function hasContent(analysis: N8nAnalysis | null): analysis is N8nAnalysis {
  if (!analysis) return false;
  return Boolean(analysis.single_page_summary?.trim() || analysis.detailed_report?.trim());
}

async function fetchLatestReport(projectCode: string): Promise<N8nAnalysis | null> {
  const { data, error } = await supabase
    .from("analysis_reports")
    .select("*")
    .eq("project_code", projectCode)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error("خواندن گزارش تحلیل از پایگاه‌داده انجام نشد.");
  if (!data) return null;

  return {
    single_page_summary: String((data as Record<string, unknown>)["single_page_summary"] ?? ""),
    detailed_report: String((data as Record<string, unknown>)["detailed_report"] ?? ""),
  };
}

/** نمایش دو بخش خلاصه و گزارش تفصیلی به صورت مارک‌داون */
function AnalysisSections({ analysis }: { analysis: N8nAnalysis }) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <BrainCircuit className="h-5 w-5" aria-hidden />
          </span>
          <h2 className="text-lg font-bold tracking-tight">خلاصه یک‌صفحه‌ای</h2>
        </div>
        <div className="mt-5">
          <Markdown>{analysis.single_page_summary}</Markdown>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-5 w-5" aria-hidden />
          </span>
          <h2 className="text-lg font-bold tracking-tight">گزارش تفصیلی</h2>
        </div>
        <div className="mt-5">
          <Markdown>{analysis.detailed_report}</Markdown>
        </div>
      </section>
    </div>
  );
}

function PmAnalysis() {
  const queryClient = useQueryClient();
  const [baseline, setBaseline] = useState<N8nAnalysis | null>(null);
  const [variance, setVariance] = useState<N8nAnalysis | null>(null);
  const [tab, setTab] = useState<"baseline" | "variance">("baseline");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [projectCode, setProjectCodeState] = useState<string | null>(null);

  const {
    data: fetchedVariance,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["variance-report", projectCode],
    queryFn: async () => {
      if (!projectCode) return null;
      return fetchLatestReport(projectCode);
    },
    enabled: Boolean(projectCode),
    initialData: () => {
      const stored = getVariance();
      return hasContent(stored) ? stored : null;
    },
    staleTime: 0,
  });

  useEffect(() => {
    if (hasContent(fetchedVariance)) {
      setVariance(fetchedVariance);
      saveVariance(fetchedVariance);
      setErrorMessage(null);
    }
  }, [fetchedVariance]);

  useEffect(() => {
    if (error) {
      setErrorMessage(error instanceof Error ? error.message : "خطای نامشخص در دریافت گزارش.");
    }
  }, [error]);

  useEffect(() => {
    // تحلیل مبنا از پاسخ n8n که در مرحله آپلود ذخیره شده است
    const stored = getAnalysis();
    if (hasContent(stored)) {
      setBaseline(stored);
      setTab("baseline");
    }

    // آخرین گزارش انحرافات ذخیره‌شده در مرورگر
    const storedVariance = getVariance();
    if (hasContent(storedVariance)) setVariance(storedVariance);

    const code = getProjectCode();
    setProjectCodeState(code);
    if (!code) {
      if (!hasContent(stored)) {
        setErrorMessage("کد پروژه یافت نشد. ابتدا از صفحه انتخاب نقش کد پروژه را وارد کنید.");
      }
    }
  }, []);

  const requestNewAnalysis = async () => {
    if (!projectCode) {
      setErrorMessage("کد پروژه یافت نشد. ابتدا از صفحه انتخاب نقش کد پروژه را وارد کنید.");
      return;
    }
    const webhook = resolveVarianceWebhook();
    if (!webhook) {
      const message =
        "آدرس وب‌هوک n8n تنظیم نشده است. ابتدا در «تنظیمات یکپارچه‌سازی» آدرس وب‌هوک را وارد و تست کنید.";
      setErrorMessage(message);
      toast.error("وب‌هوک تنظیم نشده است", { description: message });
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const result = await postToN8n(
        webhook,
        JSON.stringify({ project_code: projectCode }),
        "application/json",
      );
      if (!result.ok) {
        throw new Error(`n8n با خطا پاسخ داد (کد ${result.status}). workflow را بررسی کنید.`);
      }

      // اگر پاسخ خودِ وب‌هوک شامل تحلیل بود، فوراً نمایش بده و ذخیره کن
      let direct: N8nAnalysis | null = null;
      try {
        direct = normalizeFlexibleAnalysis(JSON.parse(result.text));
      } catch {
        direct = normalizeFlexibleAnalysis(result.text);
      }

      if (hasContent(direct)) {
        setVariance(direct);
        saveVariance(direct);
      }

      // بازخوانی خودکار دیتای Supabase با invalidate + refetch
      await queryClient.invalidateQueries({ queryKey: ["variance-report"] });
      const { data: refreshed } = await refetch();
      const latest = refreshed ?? null;
      if (hasContent(latest)) {
        setVariance(latest);
        saveVariance(latest);
      } else if (!hasContent(direct)) {
        toast.info("پاسخ دریافت شد اما گزارشی برای این پروژه ثبت نشده است.");
      }

      setTab("variance");
      toast.success("تحلیل جدید انحرافات دریافت شد");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "ارتباط با n8n برقرار نشد. آدرس وب‌هوک و روشن بودن سرویس n8n را بررسی کنید.";
      console.error("[n8n] variance request failed", error);
      setErrorMessage(message);
      toast.error("درخواست تحلیل ناموفق بود", { description: message });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="تحلیل انحرافات و AI"
        subtitle="نتیجه تحلیل برنامه مبنا و آخرین گزارش انحرافات این پروژه."
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button size="lg" className="rounded-xl" onClick={requestNewAnalysis} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              در حال تحلیل انحرافات توسط AI...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" aria-hidden />
              درخواست تحلیل انحرافات جدید
            </>
          )}
        </Button>
        {isGenerating && (
          <span className="text-sm text-muted-foreground">این فرآیند ممکن است چند لحظه طول بکشد.</span>
        )}
      </div>

      {errorMessage && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p className="leading-7">{errorMessage}</p>
        </div>
      )}

      {isLoading ? (
        <div className="mt-10 flex items-center justify-center gap-3 rounded-2xl border border-border bg-card p-10 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          در حال دریافت آخرین گزارش...
        </div>
      ) : (
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as "baseline" | "variance")}
          className="mt-8"
          dir="rtl"
        >
          <TabsList className="rounded-xl">
            <TabsTrigger value="baseline" className="rounded-lg">
              تحلیل مبنا
            </TabsTrigger>
            <TabsTrigger value="variance" className="rounded-lg">
              تحلیل انحرافات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="baseline" className="mt-6">
            {hasContent(baseline) ? (
              <AnalysisSections analysis={baseline} />
            ) : (
              <EmptyState
                icon={BrainCircuit}
                title="تحلیل مبنا ثبت نشده است"
                description="ابتدا از صفحه آپلود، فایل اکسل برنامه مبنا را بارگذاری کنید تا تحلیل آن اینجا نمایش داده شود."
              />
            )}
          </TabsContent>

          <TabsContent value="variance" className="mt-6">
            {hasContent(variance) ? (
              <AnalysisSections analysis={variance} />
            ) : (
              <EmptyState
                icon={BrainCircuit}
                title="گزارشی ثبت نشده است"
                description="هنوز تحلیلی برای این پروژه ثبت نشده است. جهت بررسی انحرافات واقعی، روی دکمه تولید تحلیل جدید کلیک کنید."
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
