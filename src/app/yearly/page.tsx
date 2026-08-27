"use client";

import { useMemo, useState } from "react";
import BirthForm from "@/components/BirthForm";
import { useMyBirthInfo } from "@/lib/use-birth-info";
import {
  getBranchTenGod,
  getEarthlyBranchElement,
  getHeavenlyStemElement,
  getTenGod,
  HEAVENLY_STEMS,
  HEAVENLY_STEMS_HANJA,
  EARTHLY_BRANCHES,
  EARTHLY_BRANCHES_HANJA,
} from "@/lib/manseryeok";
import { ELEMENT_BG, ELEMENT_COLOR, getYearPillar, safeCalculateFourPillars } from "@/lib/saju-utils";
import { describePillarInfluence, getAgeBracket, tenGodText, TEN_GOD_MEANING } from "@/lib/saju-interpretation";
import { formatKst, getIpchun, getSajuYear } from "@/lib/saju-time";
import { toDate, useToday } from "@/lib/use-today";

export default function YearlyPage() {
  const { info, update, loaded } = useMyBirthInfo();
  const today = useToday();
  // 세운은 1월 1일이 아니라 입춘에 바뀐다 — 1~2월 초는 아직 전년도 세운이다
  const thisYear = useMemo(() => getSajuYear(toDate(today)), [today]);
  const [pickedYear, setPickedYear] = useState<number | null>(null);
  const targetYear = pickedYear ?? thisYear;
  const setTargetYear = setPickedYear;

  const { dayMaster, error } = useMemo(() => {
    if (!loaded) return { dayMaster: null, error: null };
    const { detail, error } = safeCalculateFourPillars({
      year: info.year, month: info.month, day: info.day, hour: info.hour, minute: info.minute,
      isLunar: info.isLunar, isLeapMonth: info.isLeapMonth,
    });
    return { dayMaster: detail?.day.heavenlyStem ?? null, error };
  }, [info, loaded]);

  const years = useMemo(() => Array.from({ length: 12 }, (_, i) => thisYear - 1 + i), [thisYear]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--brand)]">년도별 운세</h1>
        <p className="mt-1 text-sm text-foreground/60">특정 해의 세운(歲運) 간지가 나의 일간과 어떤 관계인지 확인합니다.</p>
      </div>

      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <BirthForm value={info} onChange={update} showGender={false} idPrefix="yearly" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {dayMaster && (
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <label className="mb-2 block text-xs font-medium text-foreground/50" htmlFor="target-year">
              확인할 연도
            </label>
            <input
              id="target-year"
              type="number"
              className="w-32 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:bg-white/5 dark:border-white/15"
              value={targetYear}
              onChange={(e) => setTargetYear(Number(e.target.value))}
            />
          </section>

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {years.map((y) => {
              const p = getYearPillar(y);
              const stemGod = getTenGod(dayMaster, p.heavenlyStem);
              const stemEl = getHeavenlyStemElement(p.heavenlyStem);
              const isTarget = y === targetYear;
              return (
                <button
                  key={y}
                  onClick={() => setTargetYear(y)}
                  className="flex flex-col items-center gap-1 rounded-xl border p-3 text-left transition-colors"
                  style={{
                    backgroundColor: isTarget ? ELEMENT_BG[stemEl] : "transparent",
                    borderColor: isTarget ? ELEMENT_COLOR[stemEl] : "var(--card-border)",
                    borderWidth: isTarget ? 2 : 1,
                  }}
                >
                  <span className="text-[11px] text-foreground/45">{y}년</span>
                  <span className="text-base font-bold" style={{ color: ELEMENT_COLOR[stemEl] }}>
                    {p.heavenlyStem}
                    {p.earthlyBranch}
                  </span>
                  <span className="text-[10px] text-foreground/40">{stemGod}</span>
                </button>
              );
            })}
          </section>

          <YearDetail dayMaster={dayMaster} year={targetYear} birthYear={info.year} />
        </div>
      )}
    </div>
  );
}

function YearDetail({
  dayMaster,
  year,
  birthYear,
}: {
  dayMaster: ReturnType<typeof getYearPillar>["heavenlyStem"];
  year: number;
  birthYear: number;
}) {
  const p = getYearPillar(year);
  const stemGod = getTenGod(dayMaster, p.heavenlyStem);
  const branchGod = getBranchTenGod(dayMaster, p.earthlyBranch);
  const stemEl = getHeavenlyStemElement(p.heavenlyStem);
  const branchEl = getEarthlyBranchElement(p.earthlyBranch);
  const si = HEAVENLY_STEMS.indexOf(p.heavenlyStem);
  const bi = EARTHLY_BRANCHES.indexOf(p.earthlyBranch);
  // 그 해에 몇 살인지로 풀이 어휘를 고른다 — 미래 연도는 그때의 나이대로 읽힌다
  const ageThatYear = Math.max(year - birthYear, 0);
  const bracket = getAgeBracket(ageThatYear);
  const influence = describePillarInfluence(dayMaster, p, `${year}년`, bracket);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
      <h2 className="text-sm font-semibold text-foreground/60">
        {year}년 세운 — {p.heavenlyStem}{HEAVENLY_STEMS_HANJA[si]}{p.earthlyBranch}{EARTHLY_BRANCHES_HANJA[bi]}년
        <span className="ml-2 text-xs font-normal text-foreground/40">
          이 해에 {ageThatYear}세 · {bracket}기 기준 풀이
        </span>
      </h2>

      <p className="rounded-lg bg-black/5 px-3 py-2 text-xs text-foreground/50 dark:bg-white/5">
        이 세운은 <b className="text-foreground/70">{formatKst(getIpchun(year))} 입춘</b>부터 시작해서{" "}
        {formatKst(getIpchun(year + 1))} 입춘 직전까지예요. 사주에서 해는 1월 1일이 아니라 입춘에 바뀝니다.
      </p>

      <p className="rounded-xl bg-[var(--brand-soft)] p-4 text-sm leading-relaxed text-foreground/80">
        {influence.summary}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--card-border)] p-4">
          <p className="mb-1 text-xs font-medium text-[var(--brand)]">
            천간 {p.heavenlyStem}({stemEl}) — {stemGod} ({TEN_GOD_MEANING[stemGod].group})
          </p>
          <p className="text-sm text-foreground/70">{tenGodText(stemGod, bracket)}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] p-4">
          <p className="mb-1 text-xs font-medium text-[var(--brand)]">
            지지 {p.earthlyBranch}({branchEl}) — {branchGod} ({TEN_GOD_MEANING[branchGod].group})
          </p>
          <p className="text-sm text-foreground/70">{tenGodText(branchGod, bracket)}</p>
        </div>
      </div>
    </section>
  );
}
