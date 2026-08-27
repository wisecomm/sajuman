import { ELEMENT_COLOR } from "@/lib/saju-utils";
import type { FiveElement } from "@/lib/manseryeok";

const ORDER: FiveElement[] = ["목", "화", "토", "금", "수"];

export default function ElementBars({ counts }: { counts: Record<FiveElement, number> }) {
  const max = Math.max(1, ...Object.values(counts));
  return (
    <div className="flex items-end gap-3">
      {ORDER.map((el) => (
        <div key={el} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs text-foreground/50">{counts[el]}</span>
          <div className="flex h-24 w-full items-end rounded-md bg-black/5 dark:bg-white/10">
            <div
              className="w-full rounded-md transition-all"
              style={{ height: `${(counts[el] / max) * 100}%`, backgroundColor: ELEMENT_COLOR[el] }}
            />
          </div>
          <span className="text-sm font-medium" style={{ color: ELEMENT_COLOR[el] }}>
            {el}
          </span>
        </div>
      ))}
    </div>
  );
}
