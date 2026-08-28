"use client";


import { useMemo, useState } from "react";
import BirthForm from "@/components/BirthForm";
import { useMyBirthInfo } from "@/lib/use-birth-info";
import {
  getHeavenlyStemElement,
  HEAVENLY_STEMS,
  HEAVENLY_STEMS_HANJA,
  EARTHLY_BRANCHES,
  EARTHLY_BRANCHES_HANJA,
} from "@/lib/manseryeok";
import { ELEMENT_BG, ELEMENT_COLOR, safeCalculateFourPillars } from "@/lib/saju-utils";
import { currentApproxAge, describePillarInfluence, getAgeBracket } from "@/lib/saju-interpretation";
import { getLifeStage, LIFE_STAGE_HANJA, LIFE_STAGE_TEXT } from "@/lib/saju-advanced";
import LifeEnergyChart from "@/components/LifeEnergyChart";

export default function DaeunPage() {
  const { info, update, loaded } = useMyBirthInfo();
  const [selected, setSelected] = useState<number | null>(null);

  const { detail, error } = useMemo(() => {
    if (!loaded) return { detail: null, error: null };
    return safeCalculateFourPillars({
      year: info.year,
      month: info.month,
      day: info.day,
      hour: info.hour,
      minute: info.minute,
      isLunar: info.isLunar,
      isLeapMonth: info.isLeapMonth,
      gender: info.gender,
    });
  }, [info, loaded]);

  const luck = detail?.luckPillars;
  const age = currentApproxAge(info.year, info.month, info.day);
  const currentIndex = luck?.pillars.findIndex((p, i) => {
    const nextAge = luck.pillars[i + 1]?.age ?? Infinity;
    return age >= p.age && age < nextAge;
  }) ?? -1;

  const activeIndex = selected ?? (currentIndex >= 0 ? currentIndex : 0);
  const activePillar = luck?.pillars[activeIndex];
  // 선택한 대운이 걸쳐 있는 나이대로 풀이한다 — 68세 대운은 장년기 어휘로 읽힌다
  const influence =
    detail && activePillar
      ? describePillarInfluence(
        detail.day.heavenlyStem,
        activePillar.pillar,
        `${activePillar.age}세부터 시작하는 이 대운`,
        getAgeBracket(activePillar.age),
      )
      : null;

  const energyPoints =
    detail && luck
      ? luck.pillars.map((p) => ({
        age: p.age,
        stage: getLifeStage(detail.day.heavenlyStem, p.pillar.earthlyBranch),
        korean: p.korean,
      }))
      : [];
  const activeStage = activePillar && detail ? getLifeStage(detail.day.heavenlyStem, activePillar.pillar.earthlyBranch) : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--brand)]">대운(大運)</h1>
        <p className="mt-1 text-sm text-foreground/60">
          10년 주기로 바뀌는 대운의 흐름을 순서대로 보여줍니다. 카드를 눌러 각 시기의 풀이를 볼 수 있습니다.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <BirthForm value={info} onChange={update} idPrefix="daeun" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {luck && (
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 text-sm text-foreground/70">
            <p>
              <span className="font-semibold text-[var(--brand)]">{luck.forward ? "순행(順行)" : "역행(逆行)"}</span>
              {" · "}
              대운수 {luck.startAge}
              {" ("}
              {luck.startYears}년 {luck.startMonths}개월 {luck.startDays}일 후 첫 대운 시작{")"}
              {" · 현재 만 나이 약 "}
              {age}세
            </p>
          </section>

          <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <div className="mb-2">
              <h2 className="text-sm font-semibold text-foreground/60">인생 기운 흐름</h2>
              <p className="mt-1 text-xs text-foreground/40">
                일간 {detail?.day.heavenlyStem}이 각 대운의 지지에서 갖는 십이운성(十二運星)을 이어 그린 곡선입니다.
                점을 눌러 그 시기의 풀이를 볼 수 있습니다.
              </p>
            </div>
            <LifeEnergyChart points={energyPoints} activeIndex={activeIndex} onSelect={setSelected} />
          </section>

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {luck.pillars.map((p, i) => {
              const nextAge = luck.pillars[i + 1]?.age ?? Infinity;
              const isCurrent = age >= p.age && age < nextAge;
              const isActive = i === activeIndex;
              const stemEl = getHeavenlyStemElement(p.pillar.heavenlyStem);
              const si = HEAVENLY_STEMS.indexOf(p.pillar.heavenlyStem);
              const bi = EARTHLY_BRANCHES.indexOf(p.pillar.earthlyBranch);
              return (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className="flex flex-col items-center gap-1 rounded-xl border p-3 text-left transition-shadow"
                  style={{
                    backgroundColor: isCurrent ? ELEMENT_BG[stemEl] : "transparent",
                    borderColor: isActive ? "var(--brand)" : isCurrent ? ELEMENT_COLOR[stemEl] : "var(--card-border)",
                    borderWidth: isActive ? 2 : isCurrent ? 2 : 1,
                    boxShadow: isActive ? "0 0 0 2px var(--brand-soft)" : undefined,
                  }}
                >
                  <span className="text-[11px] text-foreground/45">{p.age}세~</span>
                  <span className="text-lg font-bold" style={{ color: ELEMENT_COLOR[stemEl] }}>
                    {p.korean}
                  </span>
                  <span className="text-[11px] text-foreground/40">
                    {HEAVENLY_STEMS_HANJA[si]}
                    {EARTHLY_BRANCHES_HANJA[bi]}
                  </span>
                  {isCurrent && <span className="text-[10px] font-medium text-[var(--brand)]">현재</span>}
                </button>
              );
            })}
          </section>

          {influence && activePillar && (
            <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
              <h2 className="mb-2 text-sm font-semibold text-foreground/60">
                {activePillar.age}세 ~ {luck.pillars[activeIndex + 1]?.age ?? "∞"}세 대운 풀이
              </h2>
              <p className="text-sm leading-relaxed text-foreground/80">{influence.summary}</p>
              {activeStage && (
                <div className="mt-3 rounded-xl border border-[var(--card-border)] p-4">
                  <p className="text-xs font-medium text-[var(--brand)]">
                    십이운성 — {activeStage}({LIFE_STAGE_HANJA[activeStage]})
                    <span className="ml-1 font-normal text-foreground/40">
                      (일간 {detail?.day.heavenlyStem} + 지지 {activePillar.pillar.earthlyBranch})
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-foreground/70">{LIFE_STAGE_TEXT[activeStage]}</p>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
