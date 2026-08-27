"use client";

import { useMemo, useState } from "react";
import BirthForm from "@/components/BirthForm";
import { useMyBirthInfo } from "@/lib/use-birth-info";
import { useToday, toDate } from "@/lib/use-today";
import {
  getHeavenlyStemElement,
  HEAVENLY_STEMS,
  HEAVENLY_STEMS_HANJA,
  EARTHLY_BRANCHES,
  EARTHLY_BRANCHES_HANJA,
} from "@/lib/manseryeok";
import { ELEMENT_BG, ELEMENT_COLOR, safeCalculateFourPillars } from "@/lib/saju-utils";
import {
  currentApproxAge,
  describePillarInfluence,
  getAgeBracket,
  tenGodText,
  TEN_GOD_MEANING,
} from "@/lib/saju-interpretation";
import { getLifeStage, LIFE_STAGE_HANJA, LIFE_STAGE_TEXT } from "@/lib/saju-advanced";
import { findCurrentMonthIndex, formatKst, getMonthPillars, getSajuYear, toKstParts } from "@/lib/saju-time";

export default function MonthlyPage() {
  const { info, update, loaded } = useMyBirthInfo();
  const today = useToday();
  const [selected, setSelected] = useState<number | null>(null);

  const { detail, error } = useMemo(() => {
    if (!loaded) return { detail: null, error: null };
    return safeCalculateFourPillars({
      year: info.year, month: info.month, day: info.day, hour: info.hour, minute: info.minute,
      isLunar: info.isLunar, isLeapMonth: info.isLeapMonth,
    });
  }, [info, loaded]);

  // 오늘이 바뀌면 사주 연도와 절기월도 다시 계산된다
  const now = useMemo(() => toDate(today), [today]);
  const sajuYear = useMemo(() => getSajuYear(now), [now]);
  const months = useMemo(() => getMonthPillars(sajuYear), [sajuYear]);
  const currentIndex = useMemo(() => findCurrentMonthIndex(months, now), [months, now]);

  const activeIndex = selected ?? (currentIndex >= 0 ? currentIndex : 0);
  const active = months[activeIndex];

  const dayMaster = detail?.day.heavenlyStem;
  const bracket = getAgeBracket(currentApproxAge(info.year, info.month, info.day));
  const influence =
    dayMaster && active
      ? describePillarInfluence(dayMaster, active.pillar, `${active.termName} 이후 이 달`, bracket)
      : null;
  const stage = dayMaster && active ? getLifeStage(dayMaster, active.pillar.earthlyBranch) : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--brand)]">월운(月運)</h1>
        <p className="mt-1 text-sm text-foreground/60">
          사주의 달은 달력이 아니라 절기로 바뀌어요. 입춘·경칩처럼 절(節)이 드는 순간부터 다음 달이 시작됩니다.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <BirthForm value={info} onChange={update} showGender={false} idPrefix="monthly" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {dayMaster && (
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 text-sm text-foreground/70">
            <p>
              <span className="font-semibold text-[var(--brand)]">{sajuYear}년 사주해</span>의 12개 절기월이에요.
              {" "}입춘({formatKst(months[0].start)})부터 다음 입춘 전까지가 한 해로 묶여요.
            </p>
          </section>

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {months.map((m, i) => {
              const isCurrent = i === currentIndex;
              const isActive = i === activeIndex;
              const stemEl = getHeavenlyStemElement(m.pillar.heavenlyStem);
              const startKst = toKstParts(m.start);
              return (
                <button
                  key={m.order}
                  onClick={() => setSelected(i)}
                  className="flex flex-col items-center gap-1 rounded-xl border p-3"
                  style={{
                    backgroundColor: isCurrent ? ELEMENT_BG[stemEl] : "transparent",
                    borderColor: isActive ? "var(--brand)" : isCurrent ? ELEMENT_COLOR[stemEl] : "var(--card-border)",
                    borderWidth: isActive || isCurrent ? 2 : 1,
                  }}
                >
                  <span className="text-[11px] text-foreground/45">
                    {startKst.month}/{startKst.day}~
                  </span>
                  <span className="text-base font-bold" style={{ color: ELEMENT_COLOR[stemEl] }}>
                    {m.pillar.heavenlyStem}
                    {m.pillar.earthlyBranch}
                  </span>
                  <span className="text-[10px] text-foreground/40">{m.termName}</span>
                  {isCurrent && <span className="text-[10px] font-medium text-[var(--brand)]">이번 달</span>}
                </button>
              );
            })}
          </section>

          {influence && active && (
            <section className="flex flex-col gap-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
              <div>
                <h2 className="text-sm font-semibold text-foreground/60">
                  {active.pillar.heavenlyStem}
                  {HEAVENLY_STEMS_HANJA[HEAVENLY_STEMS.indexOf(active.pillar.heavenlyStem)]}
                  {active.pillar.earthlyBranch}
                  {EARTHLY_BRANCHES_HANJA[EARTHLY_BRANCHES.indexOf(active.pillar.earthlyBranch)]}월 풀이
                </h2>
                <p className="mt-1 text-xs text-foreground/40">
                  {formatKst(active.start)} {active.termName}({active.termHanja}) 절입 ~ {formatKst(active.end)}
                </p>
              </div>

              <p className="rounded-xl bg-[var(--brand-soft)] p-4 text-sm leading-relaxed text-foreground/80">
                {influence.summary}
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--card-border)] p-4">
                  <p className="mb-1 text-xs font-medium text-[var(--brand)]">
                    천간 {active.pillar.heavenlyStem} — {influence.stemGod} ({TEN_GOD_MEANING[influence.stemGod].group})
                  </p>
                  <p className="text-sm text-foreground/70">{tenGodText(influence.stemGod, bracket)}</p>
                </div>
                <div className="rounded-xl border border-[var(--card-border)] p-4">
                  <p className="mb-1 text-xs font-medium text-[var(--brand)]">
                    지지 {active.pillar.earthlyBranch} — {influence.branchGod} (
                    {TEN_GOD_MEANING[influence.branchGod].group})
                  </p>
                  <p className="text-sm text-foreground/70">{tenGodText(influence.branchGod, bracket)}</p>
                </div>
                {stage && (
                  <div className="rounded-xl border border-[var(--card-border)] p-4 sm:col-span-2">
                    <p className="mb-1 text-xs font-medium text-[var(--brand)]">
                      십이운성 — {stage}({LIFE_STAGE_HANJA[stage]})
                      <span className="ml-1 font-normal text-foreground/40">
                        (내 일간 {dayMaster} + 이 달 지지 {active.pillar.earthlyBranch})
                      </span>
                    </p>
                    <p className="text-sm text-foreground/70">{LIFE_STAGE_TEXT[stage]}</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
