import { Link } from "@tanstack/react-router";
import { toPersianDigits } from "@/lib/persian";

const links = [
  { label: "چطور کار می‌کند؟", href: "#how-it-works" },
  { label: "امکانات", href: "#features" },
  { label: "نمونه گزارش‌ها", href: "#features" },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="inline-block h-7 w-1.5 rounded-full bg-primary" aria-hidden />
          <span className="text-lg font-bold tracking-tight">پروژه‌یار</span>
        </Link>

        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          {links.map((l, i) => (
            <a
              key={i}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-6 py-6 text-xs text-muted-foreground">
          © {toPersianDigits(1405)} پروژه‌یار — تمامی حقوق محفوظ است.
        </p>
      </div>
    </footer>
  );
}