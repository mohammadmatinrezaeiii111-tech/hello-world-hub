import { useEffect, useMemo, useRef } from "react";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toPersianDigits } from "@/lib/persian";
import { cn } from "@/lib/utils";

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const SPACER_HEIGHT = (LIST_HEIGHT - ITEM_HEIGHT) / 2;

interface WheelColumnProps {
  label: string;
  values: string[];
  value: string;
  onSelect: (value: string) => void;
  onStep: (direction: 1 | -1) => void;
  onClose: () => void;
}

/** یک ستون چرخ‌دنده‌ی عمودی با scroll-snap، فلش‌های بالا/پایین و پشتیبانی کیبورد */
function WheelColumn({ label, values, value, onSelect, onStep, onClose }: WheelColumnProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const index = Math.max(0, values.indexOf(value));

  // نگه‌داشتن آیتم انتخاب‌شده در وسط ستون
  useEffect(() => {
    listRef.current?.scrollTo({ top: index * ITEM_HEIGHT, behavior: "auto" });
  }, [index]);

  const handleScroll = () => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const el = listRef.current;
      if (!el) return;
      const i = Math.min(
        values.length - 1,
        Math.max(0, Math.round(el.scrollTop / ITEM_HEIGHT)),
      );
      if (values[i] !== value) onSelect(values[i]!);
    }, 120);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      onStep(-1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      onStep(1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        aria-label={`${label} - قبلی`}
        onClick={() => onStep(-1)}
        className="grid h-8 w-full place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ChevronUp className="h-4 w-4" aria-hidden />
      </button>

      <div
        ref={listRef}
        role="listbox"
        aria-label={label}
        tabIndex={0}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        className="w-14 snap-y snap-mandatory overflow-y-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ height: LIST_HEIGHT }}
      >
        <div style={{ height: SPACER_HEIGHT }} aria-hidden />
        {values.map((item) => {
          const selected = item === value;
          return (
            <div
              key={item}
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(item)}
              className={cn(
                "flex h-10 cursor-pointer snap-center touch-manipulation select-none items-center justify-center rounded-md text-base tabular-nums transition-colors",
                selected
                  ? "bg-primary/10 font-bold text-primary"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              {toPersianDigits(item)}
            </div>
          );
        })}
        <div style={{ height: SPACER_HEIGHT }} aria-hidden />
      </div>

      <button
        type="button"
        aria-label={`${label} - بعدی`}
        onClick={() => onStep(1)}
        className="grid h-8 w-full place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ChevronDown className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

interface TimePickerProps {
  value: string; // "HH:mm" انگلیسی
  onChange: (value: string) => void; // همیشه "HH:mm" انگلیسی
  id?: string;
  disabled?: boolean;
  className?: string;
}

function parseTime(value: string): { hour: number; minuteIndex: number } {
  const match = /^(\d{1,2}):(\d{1,2})$/.exec(value ?? "");
  const hour = match ? Math.min(23, Math.max(0, Number(match[1]))) : 8;
  const minute = match ? Math.min(59, Math.max(0, Number(match[2]))) : 0;
  const minuteIndex = Math.round(minute / 5) % 12;
  return { hour, minuteIndex };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function TimePicker({ value, onChange, id, disabled, className }: TimePickerProps) {
  const [openState, setOpenState] = useState<true | false>(false);
  const open = openState as boolean;

  const hours = useMemo(
    () => Array.from({ length: 24 }, (_, i) => pad(i)),
    [],
  );
  const minutes = useMemo(
    () => Array.from({ length: 12 }, (_, i) => pad(i * 5)),
    [],
  );

  const { hour, minuteIndex } = parseTime(value);
  const minute = minuteIndex * 5;

  const emit = (h: number, m: number) => onChange(`${pad(h)}:${pad(m)}`);
  const display = /^\d{1,2}:\d{1,2}$/.test(value ?? "") ? value : "08:00";

  return (
    <Popover open={open} onOpenChange={setOpenState}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          id={id}
          disabled={disabled}
          dir="ltr"
          aria-label="ساعت ارسال"
          className={cn(
            "h-11 w-full justify-start gap-2 rounded-xl border-input bg-transparent px-3 font-normal",
            className,
          )}
        >
          <Clock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="tabular-nums">{toPersianDigits(display)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        dir="ltr"
        className="w-auto p-3"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            setOpenState(false);
          }
        }}
      >
        <div className="flex items-start gap-2">
          <WheelColumn
            label="ساعت"
            values={hours}
            value={pad(hour)}
            onSelect={(v) => emit(Number(v), minute)}
            onStep={(dir) => emit((hour + dir + 24) % 24, minute)}
            onClose={() => setOpenState(false)}
          />
          <WheelColumn
            label="دقیقه"
            values={minutes}
            value={pad(minute)}
            onSelect={(v) => emit(hour, Number(v))}
            onStep={(dir) => emit(hour, ((minuteIndex + dir + 12) % 12) * 5)}
            onClose={() => setOpenState(false)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
