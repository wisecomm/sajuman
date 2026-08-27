import { LIFE_CATEGORY_ORDER, type LifeCategory } from "@/lib/saju-interpretation";

export default function CategoryBars({
  counts,
  order = LIFE_CATEGORY_ORDER,
}: {
  counts: Record<LifeCategory, number>;
  /** 나이대에 맞게 정렬된 순서. 앞쪽일수록 그 시기에 중요한 분야다. */
  order?: LifeCategory[];
}) {
  const max = Math.max(1, ...Object.values(counts));

  return (
    <div className="flex flex-col gap-3">
      {order.map((cat, i) => {
        const primary = i < 2;
        return (
          <div key={cat} className="flex items-center gap-3">
            <span
              className={`w-20 shrink-0 text-xs sm:w-24 ${primary ? "font-medium text-foreground/75" : "text-foreground/45"}`}
            >
              {cat}
            </span>
            <div className="h-2 flex-1 rounded-full bg-black/5 dark:bg-white/10">
              <div
                className="h-2 rounded-full bg-[var(--brand)] transition-all"
                style={{ width: `${(counts[cat] / max) * 100}%`, opacity: primary ? 1 : 0.45 }}
              />
            </div>
            <span className="w-4 shrink-0 text-right text-xs text-foreground/50">{counts[cat]}</span>
          </div>
        );
      })}
    </div>
  );
}
