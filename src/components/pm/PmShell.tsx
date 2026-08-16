import { useState, type ReactNode } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  BrainCircuit,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Settings2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole } from "@/context/RoleContext";
import { useActiveProject } from "@/hooks/use-active-project";
import { clearActiveProject, projectManagerName } from "@/lib/project";
import { cn } from "@/lib/utils";

const menu = [
  { title: "داشبورد پروژه", to: "/pm/dashboard", icon: LayoutDashboard },
  { title: "آپلود بیس‌لاین", to: "/pm/upload", icon: Upload },
  { title: "تحلیل انحرافات و AI", to: "/pm/analysis", icon: BrainCircuit },
  { title: "موانع فعال", to: "/pm/blockers", icon: AlertTriangle },
  { title: "مدیریت فعالیت‌ها", to: "/pm/tasks", icon: ListChecks },
  { title: "تنظیمات یکپارچه‌سازی", to: "/pm/settings/integrations", icon: Settings2 },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { setRole } = useRole();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-6 py-6">
        <Link to="/" className="text-xl font-bold tracking-tight text-foreground">
          پروژه‌یار
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menu.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors",
              isActive(item.to)
                ? "bg-primary/10 font-bold text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" aria-hidden />
            <span className="min-w-0 truncate">{item.title}</span>
          </Link>
        ))}
      </nav>

      <div className="space-y-4 border-t border-border p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">حالت نمایش</span>
          <ThemeToggle />
        </div>

        <div className="rounded-xl border border-border p-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          ) : (
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-primary">
                <UserRound className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">
                  {project?.project_name || "پروژه‌ای انتخاب نشده"}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  مدیر پروژه: {projectManagerName(project)}
                </span>
                {project?.project_code && (
                  <span
                    dir="ltr"
                    className="mt-1 block truncate font-mono text-[11px] text-muted-foreground"
                  >
                    {project.project_code}
                  </span>
                )}
              </span>
            </div>
          )}
          <Link
            to="/role-select"
            onClick={() => {
              setRole(null);
              clearActiveProject();
              onNavigate?.();
            }}
            className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl border border-border text-sm text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            خروج
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PmShell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background lg:flex lg:flex-row-reverse">
      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] shrink-0 border-s border-border bg-card lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="بستن منو"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/40"
          />
          <div className="absolute inset-y-0 end-0 w-[260px] border-s border-border bg-card">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-border px-6 py-4 lg:hidden">
          <span className="text-lg font-bold tracking-tight">پروژه‌یار</span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="باز کردن منو"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        <main className="mx-auto w-full max-w-[1200px] p-8 lg:p-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border pb-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight sm:text-[2rem]">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </header>
  );
}