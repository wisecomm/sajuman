import type { YinYang } from "@/lib/manseryeok";

const YANG_COLOR = "#d99a3f";
const YIN_COLOR = "#3b4a6b";

export default function YinYangBars({ counts }: { counts: Record<YinYang, number> }) {
  const total = counts.양 + counts.음 || 1;
  const yangPct = (counts.양 / total) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <div style={{ width: `${yangPct}%`, backgroundColor: YANG_COLOR }} />
        <div style={{ width: `${100 - yangPct}%`, backgroundColor: YIN_COLOR }} />
      </div>
      <div className="flex justify-between text-sm">
        <span style={{ color: YANG_COLOR }} className="font-medium">
          양(陽) {counts.양}
        </span>
        <span style={{ color: YIN_COLOR }} className="font-medium">
          음(陰) {counts.음}
        </span>
      </div>
    </div>
  );
}
