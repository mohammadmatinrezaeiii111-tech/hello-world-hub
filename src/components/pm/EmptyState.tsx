import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary/15 text-success">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="text-base font-bold tracking-tight">{title}</h3>
      <p className="max-w-md text-sm leading-7 text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}
