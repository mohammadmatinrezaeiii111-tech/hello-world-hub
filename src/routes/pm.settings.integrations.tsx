import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  MessageSquare,
  Plug,
  Plus,
  Trash2,
  Webhook,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { PageHeader } from "@/components/pm/PmShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getWebhookUrl,
  setWebhookUrl as setWebhookUrlStorage,
  sanitizeWebhookUrl,
  postToN8n,
} from "@/lib/n8n";
import { toPersianDigits } from "@/lib/persian";

import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EmptyState } from "@/components/pm/EmptyState";
import {
  defaultWebhookUrl,
  initialApiKeys,
  messengerSteps,
  projectCode,
  sampleCurl,
  sampleJson,
  type ApiKeyRecord,
} from "@/mock/integrations";

export const Route = createFileRoute("/pm/settings/integrations")({
  head: () => ({
    meta: [
      { title: "تنظیمات یکپارچه‌سازی | پروژه‌یار" },
      {
        name: "description",
        content: "اتصال پروژه‌یار به n8n، ربات‌های پیام‌رسان و کلیدهای API.",
      },
      { property: "og:title", content: "تنظیمات یکپارچه‌سازی | پروژه‌یار" },
      {
        property: "og:description",
        content: "پیکربندی وب‌هوک n8n، ربات‌های پیام‌رسان و API Key.",
      },
    ],
  }),
  component: PmIntegrationsSettings,
});

type ConnectionStatus = "idle" | "testing" | "connected" | "failed";


function PmIntegrationsSettings() {
  const webhookId = useId();
  const keyNameId = useId();
  const [webhookUrl, setWebhookUrl] = useState(defaultWebhookUrl);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [copiedBlock, setCopiedBlock] = useState<"json" | "curl" | "project" | "apikey" | null>(
    null,
  );
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>(initialApiKeys);
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(true);
  const testTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = getWebhookUrl();
    if (stored) {
      setWebhookUrl(stored);
      setConnectionStatus("connected");
    }
    return () => {
      if (testTimerRef.current) clearTimeout(testTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const testConnection = async () => {
    if (connectionStatus === "testing") return;

    const url = sanitizeWebhookUrl(webhookUrl);
    if (!url) {
      setConnectionStatus("failed");
      setConnectionError("آدرس وب‌هوک نامعتبر است؛ باید با http:// یا https:// شروع شود.");
      toast.error("آدرس نامعتبر است");
      return;
    }
    setWebhookUrl(url);

    setConnectionStatus("testing");
    setConnectionError(null);

    try {
      const result = await postToN8n(
        url,
        JSON.stringify({ ping: true, source: "projectyar" }),
        "application/json",
      );
      setWebhookUrlStorage(url);
      setConnectionStatus("connected");
      toast.success("اتصال برقرار شد و آدرس ذخیره شد", {
        description: result.viaProxy
          ? "اتصال از طریق پروکسی سرور برقرار شد (دور زدن CORS)."
          : `وب‌هوک n8n آماده است (کد پاسخ ${result.status}).`,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "ارتباط با n8n برقرار نشد. روشن بودن سرویس n8n و آدرس ngrok را بررسی کنید.";
      setConnectionStatus("failed");
      setConnectionError(message);
      toast.error("اتصال به n8n ناموفق بود", { description: message });
    }
  };


  const copyText = async (
    text: string,
    block: "json" | "curl" | "project" | "apikey",
  ) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard may be unavailable; still show feedback for demo UX.
    }
    setCopiedBlock(block);
    toast.success("در کلیپ‌بورد کپی شد", {
      description:
        block === "apikey"
          ? "کلید API کپی شد؛ آن را در جای امن نگه دارید."
          : "محتوای انتخاب‌شده کپی شد.",
    });
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedBlock(null), 1800);
  };

  const createApiKey = () => {
    const name = newKeyName.trim() || `workflow-${toPersianDigits(apiKeys.length + 1)}`;
    const random = Math.random().toString(36).slice(2, 10);
    const secret = `py_live_${random}_${Math.random().toString(36).slice(2, 14)}`;
    const record: ApiKeyRecord = {
      id: `key_${Date.now()}`,
      name,
      prefix: secret.slice(0, 12),
      createdAt: "امروز",
      lastUsed: "هنوز استفاده نشده",
      secret,
    };
    setApiKeys((prev) => [record, ...prev]);
    setNewKeyName("");
    setRevealedKey(secret);
    setShowSecret(true);
    toast.success("کلید API جدید ساخته شد", {
      description: `کلید «${name}» ایجاد شد و فقط همین یک بار نمایش داده می‌شود.`,
    });
  };

  const revokeKey = (id: string) => {
    setApiKeys((prev) => prev.filter((key) => key.id !== id));
    toast.success("کلید API باطل شد.");
    if (revealedKey && apiKeys.find((k) => k.id === id)?.secret === revealedKey) {
      setRevealedKey(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="تنظیمات یکپارچه‌سازی"
        subtitle="اتصال پروژه‌یار به n8n، ربات‌های پیام‌رسان و کلیدهای API برای workflows."
      />

      <div className="mt-10 space-y-6">
        {/* n8n webhook */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Webhook className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold tracking-tight">اتصال به n8n Webhook</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                آدرس وب‌هوک n8n را وارد کنید تا گزارش‌های اتوماتیک روزانه دریافت شوند.
              </p>
            </div>
            {connectionStatus === "connected" && (
              <Badge className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="me-1 h-3.5 w-3.5" aria-hidden />
                متصل شد
              </Badge>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <label htmlFor={webhookId} className="text-xs font-medium text-muted-foreground">
              URL وب‌هوک n8n
            </label>
            <Input
              id={webhookId}
              dir="ltr"
              value={webhookUrl}
              onChange={(event) => {
                setWebhookUrl(event.target.value);
                if (connectionStatus === "connected" || connectionStatus === "failed") {
                  setConnectionStatus("idle");
                }
              }}
              placeholder="https://n8n.example.com/webhook/..."
              className="h-11 rounded-xl font-mono text-sm"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={testConnection}
              disabled={!webhookUrl.trim() || connectionStatus === "testing"}
              className="h-11 rounded-xl px-5 font-bold"
            >
              {connectionStatus === "testing" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Plug className="h-4 w-4" aria-hidden />
              )}
              تست اتصال
            </Button>
            {connectionStatus === "testing" && (
              <p className="text-sm text-muted-foreground">در حال ارسال پینگ آزمایشی...</p>
            )}
            {connectionStatus === "connected" && (
              <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                آدرس ذخیره شد — وب‌هوک آماده دریافت فایل بیس‌لاین است
              </p>
            )}
          </div>

          {connectionStatus === "failed" && connectionError && (
            <p className="mt-3 text-sm text-destructive">{connectionError}</p>
          )}

        </section>

        {/* Messenger bots */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold tracking-tight">
                ربات‌های پیام‌رسان (بله / تلگرام / ایتا)
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                راهنمای اتصال ربات برای دریافت گزارش روزانه از نیروهای میدانی پروژه.
              </p>
            </div>
          </div>

          <ol className="mt-6 space-y-3">
            {messengerSteps.map((step, index) => (
              <li
                key={step}
                className="flex gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm leading-7"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-muted text-xs font-bold text-primary">
                  {toPersianDigits(index + 1)}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
            <span className="text-xs text-muted-foreground">کد پروژه:</span>
            <code dir="ltr" className="rounded-md bg-muted px-2 py-1 font-mono text-sm">
              {projectCode}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ms-auto h-8 rounded-lg"
              onClick={() => copyText(projectCode, "project")}
            >
              <Copy className="h-3.5 w-3.5" aria-hidden />
              {copiedBlock === "project" ? "کپی شد" : "کپی"}
            </Button>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-bold">نمونه ارسال داده</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              از JSON یا cURL برای اتصال workflow و ربات‌ها استفاده کنید.
            </p>

            <Tabs defaultValue="json" className="mt-4">
              <TabsList className="h-10 rounded-xl p-1">
                <TabsTrigger value="json" className="rounded-lg px-4">
                  JSON
                </TabsTrigger>
                <TabsTrigger value="curl" className="rounded-lg px-4">
                  cURL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="json" className="mt-3">
                <CodeBlock
                  code={sampleJson}
                  onCopy={() => copyText(sampleJson, "json")}
                  copied={copiedBlock === "json"}
                />
              </TabsContent>
              <TabsContent value="curl" className="mt-3">
                <CodeBlock
                  code={sampleCurl}
                  onCopy={() => copyText(sampleCurl, "curl")}
                  copied={copiedBlock === "curl"}
                />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* API keys */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <KeyRound className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold tracking-tight">کلیدهای API پروژه‌یار</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                برای فراخوانی توسط workflows در n8n یا سرویس‌های خارجی، API Key بسازید.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="min-w-0 flex-1 space-y-2">
              <label htmlFor={keyNameId} className="text-xs font-medium text-muted-foreground">
                نام کلید
              </label>
              <Input
                id={keyNameId}
                value={newKeyName}
                onChange={(event) => setNewKeyName(event.target.value)}
                placeholder="مثلاً n8n staging"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={createApiKey}
                className="h-11 w-full rounded-xl px-5 font-bold sm:w-auto"
              >
                <Plus className="h-4 w-4" aria-hidden />
                ساخت API Key
              </Button>
            </div>
          </div>

          {revealedKey && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                کلید جدید ساخته شد — فقط یک‌بار نمایش داده می‌شود
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <code
                  dir="ltr"
                  className="min-w-0 flex-1 overflow-x-auto rounded-lg bg-background px-3 py-2 font-mono text-xs sm:text-sm"
                >
                  {showSecret ? revealedKey : "•".repeat(Math.min(revealedKey.length, 36))}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg"
                  onClick={() => setShowSecret((prev) => !prev)}
                >
                  {showSecret ? (
                    <EyeOff className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <Eye className="h-3.5 w-3.5" aria-hidden />
                  )}
                  {showSecret ? "مخفی" : "نمایش"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg"
                  aria-label="کپی کلید API"
                  onClick={() => copyText(revealedKey, "apikey")}
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden />
                  {copiedBlock === "apikey" ? "کپی شد" : "کپی"}
                </Button>
              </div>
            </div>
          )}

          <ul className="mt-6 space-y-3">
            {apiKeys.map((key) => (
              <li
                key={key.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold">{key.name}</p>
                    <Badge variant="outline" className="rounded-lg font-mono" dir="ltr">
                      {key.prefix}…
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    ساخته‌شده: {toPersianDigits(key.createdAt)} — آخرین استفاده:{" "}
                    {toPersianDigits(key.lastUsed)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`ابطال کلید ${key.name}`}
                  onClick={() => revokeKey(key.id)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  ابطال
                </Button>
              </li>
            ))}

            {apiKeys.length === 0 && (
              <li>
                <EmptyState
                  icon={KeyRound}
                  title="هنوز کلید API ندارید"
                  description="با ساخت اولین کلید، workflowهای n8n می‌توانند با اطمینان به پروژه‌یار متصل شوند."
                />
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

function CodeBlock({
  code,
  onCopy,
  copied,
}: {
  code: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-muted/40">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs text-muted-foreground">LTR</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg"
          onClick={onCopy}
        >
          <Copy className="h-3.5 w-3.5" aria-hidden />
          {copied ? "کپی شد" : "کپی"}
        </Button>
      </div>
      <pre
        dir="ltr"
        className={cn(
          "overflow-x-auto p-4 text-left font-mono text-xs leading-6 text-foreground sm:text-sm",
        )}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
