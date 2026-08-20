import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlarmClock,
  BarChart3,
  BellRing,
  BrainCircuit,
  FileSpreadsheet,
  LineChart,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { toPersianDigits } from "@/lib/persian";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "پروژه‌یار | دستیار هوشمند کنترل پروژه" },
      {
        name: "description",
        content:
          "پروژه‌یار؛ دستیار هوشمند کنترل پروژه برای برنامه‌ریزی، پیگیری پیشرفت و گزارش‌گیری تیمی.",
      },
      { property: "og:title", content: "پروژه‌یار | دستیار هوشمند کنترل پروژه" },
      {
        property: "og:description",
        content: "برنامه‌ریزی، پیگیری پیشرفت و گزارش‌گیری تیمی در یک فضای ساده.",
      },
    ],
  }),
  component: Index,
});

const steps = [
  {
    n: 1,
    icon: FileSpreadsheet,
    title: "آپلود برنامه زمان‌بندی بیس‌لاین",
    body: "فایل اکسل برنامه زمان‌بندی پایه پروژه را بارگذاری کنید تا مبنای سنجش پیشرفت ساخته شود.",
  },
  {
    n: 2,
    icon: MessagesSquare,
    title: "دریافت خودکار گزارش پیشرفت روزانه",
    body: "پیشرفت کار اعضای تیم به‌صورت روزانه و از طریق کانال‌های ارتباطی جاری، خودکار جمع‌آوری می‌شود.",
  },
  {
    n: 3,
    icon: BrainCircuit,
    title: "تحلیل انحرافات با هوش مصنوعی",
    body: "انحراف از برنامه پایه شناسایی و مخاطرات زمان‌بندی پروژه ارزیابی و اولویت‌بندی می‌شود.",
  },
];

const featureCards = [
  {
    title: "کنترل دقیق تاخیرات و انحرافات",
    lead: "عقب‌ماندگی‌ها از برنامه زمان‌بندی پایه را پیش از بحرانی شدن ببینید.",
    accent: "bg-primary/10 text-primary",
    items: [
      { icon: LineChart, text: "مقایسه پیوسته پیشرفت واقعی با برنامه بیس‌لاین" },
      { icon: AlarmClock, text: "هشدار زودهنگام برای فعالیت‌های مسیر بحرانی" },
      { icon: ShieldCheck, text: "ارزیابی مخاطرات و اثر تاخیر بر تاریخ پایان پروژه" },
    ],
    cta: "شروع کنترل انحرافات",
  },
  {
    title: "حذف گزارش‌گیری‌های دستی",
    lead: "بدون تلف کردن وقت تیم، پیشرفت کارها ساختاریافته و خودکار ثبت می‌شود.",
    accent: "bg-secondary/20 text-success",
    items: [
      { icon: Workflow, text: "جمع‌آوری خودکار وضعیت کارها از اعضای تیم" },
      { icon: BarChart3, text: "گزارش مدیریتی روزانه، آماده ارائه به کارفرما" },
      { icon: BellRing, text: "یادآوری هوشمند برای گزارش‌های ثبت‌نشده" },
    ],
    cta: "مشاهده نمونه گزارش",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 text-accent" aria-hidden />
            دستیار هوشمند کنترل پروژه، مخصوص مدیران
          </span>
          <h1 className="mt-10 text-[2.25rem] font-bold leading-[1.5] tracking-tight sm:text-[3rem] lg:text-[3.75rem]">
            کنترل هوشمند پروژه‌ها
            <br />و شناسایی سریع انحرافات
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base text-muted-foreground sm:text-lg">
            برنامه بیس‌لاین پروژه را یک‌بار ثبت کنید و از آن پس، گزارش‌های پیشرفت روزانه به‌صورت
            خودکار برای شما جمع‌آوری، تحلیل و خلاصه می‌شود.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/role-select"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-primary-foreground transition-colors duration-150 hover:bg-primary/90 sm:w-auto"
            >
              آپلود برنامه بیس‌لاین
            </Link>
            <a
              href="#features"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-border px-8 text-sm font-bold text-foreground transition-colors duration-150 hover:bg-muted sm:w-auto"
            >
              مشاهده نمونه گزارش‌ها
            </a>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <h2 className="text-center text-[1.75rem] font-bold tracking-tight sm:text-[2rem]">
              چطور کار می‌کند؟
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-center text-muted-foreground">
              در سه گام ساده، کنترل پروژه از گزارش‌های پراکنده به یک تصویر شفاف تبدیل می‌شود.
            </p>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {steps.map((s) => (
                <div
                  key={s.n}
                  className="rounded-xl border border-border bg-card p-8 transition-colors duration-150 hover:border-primary/40"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-4xl font-bold text-primary/25">
                      {toPersianDigits(s.n)}
                    </span>
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                      <s.icon className="h-5 w-5" aria-hidden />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-bold">{s.title}</h3>
                  <p className="mt-4 text-sm text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key features */}
        <section id="features" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <h2 className="text-center text-[1.75rem] font-bold tracking-tight sm:text-[2rem]">
              ویژگی‌های کلیدی برای مدیر پروژه
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-center text-muted-foreground">
              پاسخی مستقیم به دو چالش همیشگی مدیران پروژه: تاخیرهای پنهان و گزارش‌گیری دستی.
            </p>

            <div className="mt-16 grid gap-6 lg:grid-cols-2">
              {featureCards.map((c) => (
                <div
                  key={c.title}
                  className="flex flex-col rounded-xl border border-border bg-card p-8 sm:p-10"
                >
                  <h3 className="text-xl font-bold sm:text-2xl">{c.title}</h3>
                  <p className="mt-4 text-sm text-muted-foreground sm:text-base">{c.lead}</p>

                  <ul className="mt-8 flex flex-col gap-5">
                    {c.items.map((it) => (
                      <li key={it.text} className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${c.accent}`}
                        >
                          <it.icon className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="min-w-0 text-sm text-foreground">{it.text}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/role-select"
                    className="mt-10 inline-flex h-11 items-center justify-center rounded-xl border border-border px-6 text-sm font-bold text-foreground transition-colors duration-150 hover:bg-muted"
                  >
                    {c.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
