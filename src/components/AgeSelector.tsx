"use client";

import { AGE_BRACKETS, type AgeBracket } from "@/lib/saju-interpretation";

export default function AgeSelector({
  value,
  autoValue,
  autoAge,
  onChange,
}: {
  value: AgeBracket;
  autoValue: AgeBracket;
  autoAge: number;
  onChange: (next: AgeBracket | null) => void;
}) {
  const isAuto = value === autoValue;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-foreground/50">풀이 기준 나이대</span>
        <span className="text-xs text-foreground/40">
          생년월일 기준 만 {autoAge}세 → {autoValue}기
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {AGE_BRACKETS.map((b) => (
          <button
            key={b.key}
            onClick={() => onChange(b.key === autoValue ? null : b.key)}
            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
              value === b.key
                ? "bg-[var(--brand)] text-white"
                : "bg-black/5 text-foreground/70 hover:bg-[var(--brand-soft)] dark:bg-white/10"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>
      {!isAuto && (
        <button onClick={() => onChange(null)} className="self-start text-xs text-[var(--brand)] underline">
          자동({autoValue}기)으로 되돌리기
        </button>
      )}
    </div>
  );
}
