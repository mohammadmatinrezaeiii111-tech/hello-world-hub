import { createFileRoute } from "@tanstack/react-router";
import {
  Bot,
  CheckCircle2,
  FileDown,
  Loader2,
  SendHorizontal,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { PageHeader } from "@/components/pm/PmShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/persian";

export const Route = createFileRoute("/pm/ai-analysis")({
  head: () => ({
    meta: [
      { title: "تحلیل علل تاخیر با هوش مصنوعی | پروژه‌یار" },
      {
        name: "description",
        content: "گفتگو با دستیار پروژه‌یار و بررسی سناریوهای جبرانی تاخیر.",
      },
      { property: "og:title", content: "تحلیل علل تاخیر با هوش مصنوعی | پروژه‌یار" },
      {
        property: "og:description",
        content: "تحلیل هوشمند علل تاخیر و پیشنهاد برنامه جبرانی.",
      },
    ],
  }),
  component: PmAiAnalysis,
});

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

const promptSuggestions = [
  "علت اصلی تاخیر در جبهه‌های کاری هفته اخیر چیست؟",
  "یک برنامه جبرانی (Catch-up plan) برای تسک‌های بحرانی پیشنهاد بده.",
  "گزارش تحلیلی برای ارائه به کارفرما آماده کن.",
] as const;

const delayRoots = [
  {
    id: "material",
    title: "عدم تامین به‌موقع متریال",
    detail: "تاخیر در تحویل پنل‌های الکتریکی و اتصالات مکانیکی واحد A",
    impact: "بالا",
    days: 8,
  },
  {
    id: "labor",
    title: "کمبود نیروی انسانی متخصص",
    detail: "کمبود تیم نصب مکانیکال در شیفت دوم و تعطیلات رسمی",
    impact: "متوسط",
    days: 5,
  },
  {
    id: "access",
    title: "محدودیت دسترسی جبهه کاری",
    detail: "تداخل با پیمانکار هم‌جوار در مسیر حمل و اسکلت فلزی",
    impact: "متوسط",
    days: 4,
  },
  {
    id: "approval",
    title: "تاخیر در تایید نقشه‌های اجرایی",
    detail: "بازگشت نقشه کنترل برای اصلاحات کارفرما (۲ دور ریویو)",
    impact: "پایین",
    days: 3,
  },
] as const;

const catchUpScenarios = [
  {
    id: "s1",
    title: "افزایش شیفت شب در مسیر بحرانی",
    summary:
      "فعال‌سازی شیفت شب برای نصب تجهیزات مکانیکی و تست کنترل، همراه با پشتیبانی تدارکات ۲۴ ساعته.",
    recoveryDays: 7,
    cost: "متوسط",
    risk: "کم",
  },
  {
    id: "s2",
    title: "تسریع تامین از تامین‌کننده جایگزین",
    summary:
      "سفارش اضطراری پنل‌های الکتریکی از تامین‌کننده دوم و موازی‌سازی بازرسی در محل پروژه.",
    recoveryDays: 5,
    cost: "بالا",
    risk: "متوسط",
  },
  {
    id: "s3",
    title: "بازچینش توالی فعالیت‌های غیر وابسته",
    summary:
      "جداسازی فعالیت‌های قابل هم‌پوشانی و آزادسازی مسیر حمل برای کاهش تداخل جبهه‌ها.",
    recoveryDays: 3,
    cost: "کم",
    risk: "کم",
  },
] as const;

const cannedReplies: Record<string, string> = {
  [promptSuggestions[0]]:
    "بر اساس داده‌های هفته اخیر، علت اصلی تاخیر در جبهه‌های کاری «عدم تامین به‌موقع متریال» است که حدود ۸ روز به مسیر بحرانی افزوده. کمبود نیروی متخصص نصب نیز به‌عنوان عامل دوم شناسایی شده است.",
  [promptSuggestions[1]]:
    "پیشنهاد Catch-up: ۱) شیفت شب برای فعالیت‌های A-214 و A-187، ۲) تامین اضطراری پنل الکتریکی از منبع جایگزین، ۳) بازچینش توالی فعالیت‌های غیر وابسته. با اجرای هم‌زمان این اقدامات، حدود ۷ تا ۱۰ روز از تاخیر قابل جبران است.",
  [promptSuggestions[2]]:
    "پیش‌نویس گزارش کارفرما آماده است: پیشرفت واقعی ۵۲٪ در برابر ۶۵٪ برنامه‌ای، انحراف زمانی ۱۲ روز، سه مانع بحرانی فعال، و سه سناریوی جبرانی با تخمین جبران ۳ تا ۷ روز. می‌توانید خروجی PDF را از پنل سمت چپ دریافت کنید.",
};

const defaultAssistantReply =
  "بر اساس وضعیت فعلی پروژه، عقب‌ماندگی عمدتاً ناشی از تامین متریال و ظرفیت نیروی متخصص است. پیشنهاد می‌کنم یکی از سناریوهای جبرانی پنل کناری را بررسی کنید یا یکی از پرامپت‌های آماده را انتخاب نمایید.";

const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    content:
      "سلام، من دستیار پروژه‌یار هستم. می‌توانم علل تاخیر مسیر بحرانی را تحلیل کنم، برنامه جبرانی پیشنهاد دهم یا گزارش مدیریتی آماده کنم.",
  },
  {
    id: "m2",
    role: "user",
    content: "وضعیت کلی تاخیرهای هفته اخیر را خلاصه کن.",
  },
  {
    id: "m3",
    role: "assistant",
    content:
      "در هفته اخیر، چهار فعالیت مسیر بحرانی مجموعاً حدود ۱۸ روز تاخیر انباشته ایجاد کرده‌اند. ریشه‌های غالب: تامین متریال، کمبود نیروی متخصص، و محدودیت دسترسی جبهه کاری.",
  },
];

function PmAiAnalysis() {
  const [mobileTab, setMobileTab] = useState("chat");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>("s1");
  const [pdfStatus, setPdfStatus] = useState<"idle" | "loading" | "done">("idle");
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pdfTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  useEffect(() => {
    return () => {
      if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
      if (pdfTimerRef.current) clearTimeout(pdfTimerRef.current);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  const sendMessage = (raw: string) => {
    const text = raw.trim();
    if (!text || isTyping) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    replyTimerRef.current = setTimeout(() => {
      const reply: string =
        cannedReplies[text] ??
        (text.includes("تاخیر")
          ? cannedReplies[promptSuggestions[0]]
          : text.includes("جبرانی") || text.toLowerCase().includes("catch")
            ? cannedReplies[promptSuggestions[1]]
            : text.includes("گزارش") || text.includes("کارفرما")
              ? cannedReplies[promptSuggestions[2]]
              : defaultAssistantReply) ??
        defaultAssistantReply;

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: reply,
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleExportPdf = () => {
    if (pdfStatus === "loading") return;
    setPdfStatus("loading");
    if (pdfTimerRef.current) clearTimeout(pdfTimerRef.current);
    pdfTimerRef.current = setTimeout(() => {
      setPdfStatus("done");
      pdfTimerRef.current = setTimeout(() => setPdfStatus("idle"), 3200);
    }, 1200);
  };

  const chatPanel = (
    <section className="flex h-full min-h-[540px] flex-col rounded-xl border border-border bg-card shadow-sm lg:min-h-[640px]">
      <header className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Bot className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold">دستیار پروژه‌یار</h2>
          <p className="text-xs text-muted-foreground">تحلیل تاخیر و سناریوهای جبرانی</p>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-2.5",
              message.role === "user" ? "flex-row-reverse" : "flex-row",
            )}
          >
            <span
              className={cn(
                "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                message.role === "assistant"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {message.role === "assistant" ? (
                <Bot className="h-4 w-4" aria-hidden />
              ) : (
                <User className="h-4 w-4" aria-hidden />
              )}
            </span>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-7",
                message.role === "assistant"
                  ? "rounded-ss-md bg-muted text-foreground"
                  : "rounded-se-md bg-primary text-primary-foreground",
              )}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Bot className="h-4 w-4" aria-hidden />
            </span>
            <div className="rounded-2xl rounded-ss-md bg-muted px-3.5 py-3 text-sm text-muted-foreground">
              در حال تحلیل...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-border p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {promptSuggestions.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={isTyping}
              onClick={() => sendMessage(prompt)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-start text-xs leading-5 text-muted-foreground transition-colors duration-150 hover:border-primary/40 hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="mb-1 inline-block h-3 w-3 text-primary" aria-hidden />{" "}
              {prompt}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor={inputId} className="sr-only">
            پیام به دستیار
          </label>
          <Textarea
            id={inputId}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="سوال خود را درباره تاخیرها بنویسید..."
            disabled={isTyping}
            className="min-h-[88px] resize-none rounded-xl"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage(input);
              }
            }}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="h-10 rounded-xl px-5 font-bold"
            >
              <SendHorizontal className="h-4 w-4" aria-hidden />
              ارسال
            </Button>
          </div>
        </form>
      </div>
    </section>
  );

  const insightsPanel = (
    <section className="flex h-full min-h-[540px] flex-col gap-6 lg:min-h-[640px]">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold tracking-tight">خلاصه تحلیل هوشمند</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            ریشه‌های اصلی تاخیر شناسایی‌شده در مسیر بحرانی
          </p>
        </div>

        <ul className="space-y-3">
          {delayRoots.map((root) => (
            <li
              key={root.id}
              className="rounded-xl border border-border bg-background p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-bold">{root.title}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={root.impact === "بالا" ? "destructive" : "secondary"}
                    className="rounded-lg"
                  >
                    اثر {root.impact}
                  </Badge>
                  <Badge variant="outline" className="rounded-lg">
                    {toPersianDigits(root.days)} روز
                  </Badge>
                </div>
              </div>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">{root.detail}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold tracking-tight">سناریوهای پیشنهادی جبرانی</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            کارت‌ها را بررسی کنید و بهترین گزینه را برای اجرا انتخاب نمایید
          </p>
        </div>

        <div className="space-y-3">
          {catchUpScenarios.map((scenario) => {
            const selected = selectedScenario === scenario.id;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => setSelectedScenario(scenario.id)}
                className={cn(
                  "w-full rounded-xl border p-4 text-start transition-colors",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/40 hover:bg-muted/40",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-bold">{scenario.title}</p>
                  <Badge className="rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary">
                    جبران حدود {toPersianDigits(scenario.recoveryDays)} روز
                  </Badge>
                </div>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">{scenario.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-lg bg-muted px-2.5 py-1">هزینه: {scenario.cost}</span>
                  <span className="rounded-lg bg-muted px-2.5 py-1">ریسک: {scenario.risk}</span>
                  {selected && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-primary">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      انتخاب‌شده
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <Button
            type="button"
            onClick={handleExportPdf}
            disabled={pdfStatus === "loading"}
            className="h-11 w-full rounded-xl font-bold sm:w-auto sm:px-6"
          >
            {pdfStatus === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <FileDown className="h-4 w-4" aria-hidden />
            )}
            خروجی گزارش مدیریتی (PDF)
          </Button>
          {pdfStatus === "done" && (
            <p className="mt-3 text-xs text-success">
              گزارش مدیریتی آماده شد و به‌صورت نمونه شبیه‌سازی گردید.
            </p>
          )}
        </div>
      </div>
    </section>
  );

  return (
    <div>
      <PageHeader
        title="تحلیل علل تاخیر با هوش مصنوعی"
        subtitle="گفتگو با دستیار پروژه‌یار، بررسی ریشه‌های تاخیر و انتخاب سناریوی جبرانی."
      />

      <div className="mt-8 lg:hidden">
        <Tabs value={mobileTab} onValueChange={setMobileTab}>
          <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl p-1">
            <TabsTrigger value="chat" className="rounded-lg">
              گفتگو با دستیار
            </TabsTrigger>
            <TabsTrigger value="insights" className="rounded-lg">
              پیشنهادات و سناریوها
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-6 grid gap-6 lg:mt-10 lg:grid-cols-[2fr_3fr]">
        <div className={cn(mobileTab !== "chat" && "hidden lg:block")}>{chatPanel}</div>
        <div className={cn(mobileTab !== "insights" && "hidden lg:block")}>{insightsPanel}</div>
      </div>
    </div>
  );
}
