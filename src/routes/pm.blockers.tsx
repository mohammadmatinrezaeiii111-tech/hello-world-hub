import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ImageIcon,
  UserRound,
  UserRoundCog,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/pm/PmShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/persian";
import { toast } from "sonner";
import { EmptyState } from "@/components/pm/EmptyState";
import { CardsSkeleton } from "@/components/pm/Skeletons";
import { useMockLoading } from "@/hooks/use-mock-loading";
import {
  assignees,
  initialBlockers,
  workFronts,
  type Blocker,
  type BlockerStatus,
  type Severity,
} from "@/mock/blockers";

export const Route = createFileRoute("/pm/blockers")({
  head: () => ({
    meta: [
      { title: "موانع فعال | پروژه‌یار" },
      {
        name: "description",
        content: "پایش موانع ثبت‌شده توسط تیم و اقدام مدیریتی برای رفع آن‌ها.",
      },
      { property: "og:title", content: "موانع فعال | پروژه‌یار" },
      {
        property: "og:description",
        content: "فیلتر، بررسی و پیگیری موانع مسیر بحرانی پروژه.",
      },
    ],
  }),
  component: PmBlockers,
});

const statusLabels: Record<BlockerStatus, string> = {
  critical: "بحرانی",
  reviewing: "در حال بررسی",
  resolved: "برطرف‌شده",
};

const severityStyles: Record<Severity, string> = {
  High: "border-destructive/30 bg-destructive/10 text-destructive",
  Medium: "border-accent/40 bg-accent/15 text-warning",
  Low: "border-border bg-muted text-muted-foreground",
};

const statusStyles: Record<BlockerStatus, string> = {
  critical: "border-destructive/40 bg-destructive/5",
  reviewing: "border-accent/40 bg-accent/5",
  resolved: "border-secondary/50 bg-secondary/10",
};

function PmBlockers() {
  const isLoading = useMockLoading();
  const [blockers, setBlockers] = useState<Blocker[]>(initialBlockers);
  const [statusFilter, setStatusFilter] = useState<"all" | BlockerStatus>("all");
  const [frontFilter, setFrontFilter] = useState<string>(workFronts[0]);
  const [assignTarget, setAssignTarget] = useState<Blocker | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");

  const filtered = useMemo(
    () =>
      blockers.filter((blocker) => {
        const statusOk = statusFilter === "all" || blocker.status === statusFilter;
        const frontOk = frontFilter === "همه جبهه‌ها" || blocker.front === frontFilter;
        return statusOk && frontOk;
      }),
    [blockers, statusFilter, frontFilter],
  );

  const updateBlocker = (id: string, patch: Partial<Blocker>) => {
    setBlockers((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const openAssignDialog = (blocker: Blocker) => {
    setAssignTarget(blocker);
    setSelectedAssignee(blocker.assignee ?? assignees[0]);
  };

  const confirmAssign = () => {
    if (!assignTarget || !selectedAssignee) return;
    updateBlocker(assignTarget.id, { assignee: selectedAssignee });
    toast.success("مسئول پیگیری ثبت شد", {
      description: `«${selectedAssignee}» مسئول پیگیری مانع ${assignTarget.id} شد.`,
    });
    setAssignTarget(null);
  };

  return (
    <div>
      <PageHeader
        title="موانع فعال پروژه"
        subtitle="پایش موانع ثبت‌شده توسط تیم و اقدام برای کاهش تاثیر روی تاریخ پایان پروژه."
      />

      <section className="mt-8 grid gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2 sm:p-5">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">وضعیت مانع</label>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as "all" | BlockerStatus)}
          >
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="انتخاب وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              <SelectItem value="critical">بحرانی</SelectItem>
              <SelectItem value="reviewing">در حال بررسی</SelectItem>
              <SelectItem value="resolved">برطرف‌شده</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">جبهه کاری</label>
          <Select value={frontFilter} onValueChange={setFrontFilter}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="انتخاب جبهه" />
            </SelectTrigger>
            <SelectContent>
              {workFronts.map((front) => (
                <SelectItem key={front} value={front}>
                  {front}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <p className="mt-4 text-sm text-muted-foreground">
        {toPersianDigits(filtered.length)} مانع مطابق فیلترها
      </p>

      <div className="mt-6 space-y-5">
        {isLoading && <CardsSkeleton />}
        {!isLoading &&
          filtered.map((blocker) => (
            <article
              key={blocker.id}
              className={cn(
                "overflow-hidden rounded-xl border bg-card shadow-sm",
                statusStyles[blocker.status],
              )}
            >
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-start gap-2">
                    <AlertTriangle
                      className={cn(
                        "mt-0.5 h-5 w-5 shrink-0",
                        blocker.status === "resolved" ? "text-secondary" : "text-destructive",
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold sm:text-lg">{blocker.title}</h2>
                        <Badge variant="outline" className="rounded-lg">
                          {blocker.id}
                        </Badge>
                        <Badge
                          className={cn("rounded-lg border", severityStyles[blocker.severity])}
                        >
                          {blocker.severity}
                        </Badge>
                        <Badge variant="secondary" className="rounded-lg">
                          {statusLabels[blocker.status]}
                        </Badge>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <span>
                          تسک:{" "}
                          <span className="font-medium text-foreground">
                            {blocker.task} ({blocker.taskId})
                          </span>
                        </span>
                        <span>جبهه: {blocker.front}</span>
                        <span className="inline-flex items-center gap-1">
                          <UserRound className="h-3.5 w-3.5" aria-hidden />
                          ثبت‌کننده: {blocker.reporter}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" aria-hidden />
                          {toPersianDigits(blocker.reportedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-foreground/90">{blocker.description}</p>

                  {blocker.assignee && (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <UserRoundCog className="h-3.5 w-3.5" aria-hidden />
                      مسئول پیگیری:{" "}
                      <span className="font-medium text-foreground">{blocker.assignee}</span>
                    </p>
                  )}

                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-background/80 px-3 py-3 text-sm">
                    <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <p>
                      {blocker.status === "resolved" || blocker.delayDays === 0 ? (
                        <span>این مانع دیگر تاثیری روی تاریخ پایان پروژه ندارد.</span>
                      ) : (
                        <span>
                          تاثیر روی تاریخ پایان پروژه:{" "}
                          <span className="font-bold text-destructive">
                            تاخیر احتمالی {toPersianDigits(blocker.delayDays)} روزه کل پروژه
                          </span>
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded-xl"
                      onClick={() => openAssignDialog(blocker)}
                      disabled={blocker.status === "resolved"}
                    >
                      <UserRoundCog className="h-4 w-4" aria-hidden />
                      تعیین مسئول پیگیری
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-10 rounded-xl"
                      onClick={() => {
                        updateBlocker(blocker.id, { status: "reviewing" });
                        toast.success("وضعیت مانع به «در حال حل» تغییر کرد.");
                      }}
                      disabled={blocker.status === "reviewing" || blocker.status === "resolved"}
                    >
                      تغییر وضعیت به در حال حل
                    </Button>
                    <Button
                      type="button"
                      className="h-10 rounded-xl"
                      onClick={() => {
                        updateBlocker(blocker.id, { status: "resolved", delayDays: 0 });
                        toast.success("مانع برطرف شد", {
                          description: "این مانع دیگر تاثیری روی تاریخ پایان پروژه ندارد.",
                        });
                      }}
                      disabled={blocker.status === "resolved"}
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                      علامت‌گذاری به عنوان برطرف‌شده
                    </Button>
                  </div>
                </div>

                <figure className="overflow-hidden rounded-xl border border-border bg-muted">
                  <img
                    src={blocker.imageUrl}
                    alt={blocker.imageAlt}
                    className="h-44 w-full object-cover lg:h-full lg:min-h-[180px]"
                    loading="lazy"
                  />
                  <figcaption className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground">
                    <ImageIcon className="h-3.5 w-3.5" aria-hidden />
                    تصویر ضمیمه‌شده توسط تیم
                  </figcaption>
                </figure>
              </div>
            </article>
          ))}

        {!isLoading && filtered.length === 0 && (
          <EmptyState
            icon={CheckCircle2}
            title="هیچ مانع فعالی وجود ندارد"
            description="عالی است! با این فیلترها هیچ مانعی ثبت نشده و مسیر بحرانی پروژه بدون توقف پیش می‌رود."
          />
        )}
      </div>

      <Dialog open={!!assignTarget} onOpenChange={(open) => !open && setAssignTarget(null)}>
        <DialogContent className="rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعیین مسئول پیگیری</DialogTitle>
            <DialogDescription>
              {assignTarget
                ? `برای مانع «${assignTarget.title}» یک مسئول انتخاب کنید.`
                : "مسئول پیگیری را انتخاب کنید."}
            </DialogDescription>
          </DialogHeader>

          <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="انتخاب مسئول" />
            </SelectTrigger>
            <SelectContent>
              {assignees.map((person) => (
                <SelectItem key={person} value={person}>
                  {person}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setAssignTarget(null)}
            >
              انصراف
            </Button>
            <Button type="button" className="rounded-xl font-bold" onClick={confirmAssign}>
              ثبت مسئول
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
