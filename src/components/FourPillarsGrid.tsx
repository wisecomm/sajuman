import { HEAVENLY_STEMS, HEAVENLY_STEMS_HANJA, EARTHLY_BRANCHES, EARTHLY_BRANCHES_HANJA } from "@/lib/manseryeok";
import { ELEMENT_BG, ELEMENT_COLOR, type FourPillarsDetail } from "@/lib/saju-utils";

const stemHanja = (stem: string) => HEAVENLY_STEMS_HANJA[HEAVENLY_STEMS.indexOf(stem as never)];
const branchHanja = (branch: string) => EARTHLY_BRANCHES_HANJA[EARTHLY_BRANCHES.indexOf(branch as never)];

function Cell({
  hangul,
  hanja,
  element,
  god,
}: {
  hangul: string;
  hanja: string;
  element: string;
  god?: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-0.5 rounded-lg border py-3"
      style={{ backgroundColor: ELEMENT_BG[element as never], borderColor: ELEMENT_COLOR[element as never] + "40" }}
    >
      {god && <span className="text-[10px] text-black/45 dark:text-white/45">{god}</span>}
      <span className="text-2xl font-bold" style={{ color: ELEMENT_COLOR[element as never] }}>
        {hangul}
      </span>
      <span className="text-xs text-black/40 dark:text-white/40">{hanja}</span>
    </div>
  );
}

export default function FourPillarsGrid({ detail }: { detail: FourPillarsDetail }) {
  const columns = [
    { label: "년주", pillar: detail.year, stemEl: detail.yearElement.stem, branchEl: detail.yearElement.branch, stemGod: detail.tenGods.year.stem, branchGod: detail.tenGods.year.branch },
    { label: "월주", pillar: detail.month, stemEl: detail.monthElement.stem, branchEl: detail.monthElement.branch, stemGod: detail.tenGods.month.stem, branchGod: detail.tenGods.month.branch },
    { label: "일주", pillar: detail.day, stemEl: detail.dayElement.stem, branchEl: detail.dayElement.branch, stemGod: detail.tenGods.day.stem, branchGod: detail.tenGods.day.branch },
    { label: "시주", pillar: detail.hour, stemEl: detail.hourElement.stem, branchEl: detail.hourElement.branch, stemGod: detail.tenGods.hour.stem, branchGod: detail.tenGods.hour.branch },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {columns.map((c) => (
        <div key={c.label} className="flex flex-col gap-2">
          <div className="text-center text-xs font-medium text-black/50 dark:text-white/50">{c.label}</div>
          <Cell
            hangul={c.pillar.heavenlyStem}
            hanja={stemHanja(c.pillar.heavenlyStem)}
            element={c.stemEl}
            god={c.stemGod}
          />
          <Cell
            hangul={c.pillar.earthlyBranch}
            hanja={branchHanja(c.pillar.earthlyBranch)}
            element={c.branchEl}
            god={c.branchGod}
          />
        </div>
      ))}
    </div>
  );
}
