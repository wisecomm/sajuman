"use client";

import { useMemo, useState } from "react";
import BirthForm from "@/components/BirthForm";
import { useMyBirthInfo } from "@/lib/use-birth-info";
import { sameDate, useToday, type DateParts } from "@/lib/use-today";
import {
  getEarthlyBranchElement,
  getHeavenlyStemElement,
  getVoidBranches,
  HEAVENLY_STEMS,
  HEAVENLY_STEMS_HANJA,
  EARTHLY_BRANCHES,
  EARTHLY_BRANCHES_HANJA,
} from "@/lib/manseryeok";
import { BRANCH_CLASH, BRANCH_UNION, ELEMENT_BG, ELEMENT_COLOR, getDayPillar, safeCalculateFourPillars } from "@/lib/saju-utils";
import {
  currentApproxAge,
  dailyCategoryScores,
  describePillarInfluence,
  getAgeBracket,
  tenGodText,
  TEN_GOD_MEANING,
} from "@/lib/saju-interpretation";
import { findSinsal, getLifeStage, LIFE_STAGE_HANJA, LIFE_STAGE_TEXT } from "@/lib/saju-advanced";

export default function DailyPage() {
  const { info, update, loaded } = useMyBirthInfo();
  const today = useToday();
  // 사용자가 날짜를 직접 고르기 전까지는 항상 '오늘'을 따라간다 (자정을 넘겨도 갱신됨)
  const [picked, setPicked] = useState<DateParts | null>(null);
  const target = picked ?? today;
  const isToday = sameDate(target, today);

  const { detail: mySaju, error } = useMemo(() => {
    if (!loaded) return { detail: null, error: null };
    return safeCalculateFourPillars({
      year: info.year, month: info.month, day: info.day, hour: info.hour, minute: info.minute,
      isLunar: info.isLunar, isLeapMonth: info.isLeapMonth,
    });
  }, [info, loaded]);

  const dayResult = useMemo(() => {
    if (!mySaju) return null;
    try {
      const pillar = getDayPillar(target.year, target.month, target.day);
      const dayMaster = mySaju.day.heavenlyStem;
      const myVoid = getVoidBranches(dayMaster, mySaju.day.earthlyBranch);
      const bracket = getAgeBracket(currentApproxAge(info.year, info.month, info.day));
      const influence = describePillarInfluence(dayMaster, pillar, "이 날", bracket);
      const isVoid = myVoid.includes(pillar.earthlyBranch);
      const isClash = BRANCH_CLASH[mySaju.day.earthlyBranch] === pillar.earthlyBranch;
      const isUnion = BRANCH_UNION[mySaju.day.earthlyBranch] === pillar.earthlyBranch;
      return {
        pillar,
        stemGod: influence.stemGod,
        branchGod: influence.branchGod,
        summary: influence.summary,
        stemEl: getHeavenlyStemElement(pillar.heavenlyStem),
        branchEl: getEarthlyBranchElement(pillar.earthlyBranch),
        isVoid,
        isClash,
        isUnion,
        bracket,
        scores: dailyCategoryScores(influence.stemGod, influence.branchGod, { isVoid, isClash, isUnion }, bracket),
        lifeStage: getLifeStage(dayMaster, pillar.earthlyBranch),
        sinsal: findSinsal(dayMaster, mySaju.year.earthlyBranch, mySaju.day.earthlyBranch, [pillar.earthlyBranch]),
      };
    } catch {
      return null;
    }
  }, [mySaju, target, info.year, info.month, info.day]);

  const si = dayResult ? HEAVENLY_STEMS.indexOf(dayResult.pillar.heavenlyStem) : -1;
  const bi = dayResult ? EARTHLY_BRANCHES.indexOf(dayResult.pillar.earthlyBranch) : -1;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--brand)]">일일 운세</h1>
        <p className="mt-1 text-sm text-foreground/60">특정 날짜의 일진(日辰)이 나의 일간과 어떤 관계인지 확인합니다.</p>
      </div>

      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <BirthForm value={info} onChange={update} showGender={false} idPrefix="daily" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {mySaju && (
        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <label className="mb-2 block text-xs font-medium text-foreground/50">확인할 날짜</label>
          <div className="flex gap-2">
            <input
              type="number"
              className="w-24 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:bg-white/5 dark:border-white/15"
              value={target.year}
              onChange={(e) => setPicked({ ...target, year: Number(e.target.value) })}
            />
            <input
              type="number"
              min={1}
              max={12}
              className="w-20 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:bg-white/5 dark:border-white/15"
              value={target.month}
              onChange={(e) => setPicked({ ...target, month: Number(e.target.value) })}
            />
            <input
              type="number"
              min={1}
              max={31}
              className="w-20 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:bg-white/5 dark:border-white/15"
              value={target.day}
              onChange={(e) => setPicked({ ...target, day: Number(e.target.value) })}
            />
            <button
              onClick={() => setPicked(null)}
              disabled={isToday}
              className="rounded-lg bg-[var(--brand-soft)] px-3 py-2 text-xs font-medium text-[var(--brand)] disabled:opacity-40"
            >
              오늘
            </button>
          </div>
        </section>
      )}

      {dayResult && (
        <div className="flex flex-col gap-6">
          <section
            className="flex flex-col items-center gap-2 rounded-2xl border p-6 text-center"
            style={{ backgroundColor: ELEMENT_BG[dayResult.stemEl], borderColor: ELEMENT_COLOR[dayResult.stemEl] }}
          >
            <span className="text-xs text-foreground/50">
              {target.year}. {target.month}. {target.day}. 일진(日辰)
            </span>
            <span className="text-3xl font-bold" style={{ color: ELEMENT_COLOR[dayResult.stemEl] }}>
              {dayResult.pillar.heavenlyStem}
              {dayResult.pillar.earthlyBranch}
            </span>
            <span className="text-xs text-foreground/40">
              {HEAVENLY_STEMS_HANJA[si]}
              {EARTHLY_BRANCHES_HANJA[bi]}
            </span>
          </section>

          <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground/60">분야별 운세</h2>
              <p className="mt-1 text-xs text-foreground/40">별점 옆에 그 점수가 나온 근거를 함께 표시합니다.</p>
            </div>
            <div className="flex flex-col gap-3">
              {dayResult.scores.map((s) => (
                <div key={s.category} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="w-20 shrink-0 text-xs text-foreground/60 sm:w-24">{s.category}</span>
                  <span
                    className="shrink-0 tracking-widest text-[var(--brand)]"
                    aria-label={`5점 만점에 ${s.stars}점`}
                  >
                    {"★".repeat(s.stars)}
                    <span className="text-foreground/25">{"☆".repeat(5 - s.stars)}</span>
                  </span>
                  {s.reasons.length > 0 && (
                    <span className="text-xs text-foreground/40">{s.reasons.join(" · ")}</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <p className="rounded-xl bg-[var(--brand-soft)] p-4 text-sm leading-relaxed text-foreground/80">
              {dayResult.summary}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--card-border)] p-4">
                <p className="mb-1 text-xs font-medium text-[var(--brand)]">
                  천간 십신 — {dayResult.stemGod} ({TEN_GOD_MEANING[dayResult.stemGod].group})
                </p>
                <p className="text-sm text-foreground/70">{tenGodText(dayResult.stemGod, dayResult.bracket)}</p>
              </div>
              <div className="rounded-xl border border-[var(--card-border)] p-4">
                <p className="mb-1 text-xs font-medium text-[var(--brand)]">
                  지지 십신 — {dayResult.branchGod} ({TEN_GOD_MEANING[dayResult.branchGod].group})
                </p>
                <p className="text-sm text-foreground/70">{tenGodText(dayResult.branchGod, dayResult.bracket)}</p>
              </div>
              <div className="rounded-xl border border-[var(--card-border)] p-4 sm:col-span-2">
                <p className="mb-1 text-xs font-medium text-[var(--brand)]">
                  십이운성 — {dayResult.lifeStage}({LIFE_STAGE_HANJA[dayResult.lifeStage]})
                  <span className="ml-1 font-normal text-foreground/40">
                    (내 일간 {mySaju?.day.heavenlyStem} + 이 날 지지 {dayResult.pillar.earthlyBranch})
                  </span>
                </p>
                <p className="text-sm text-foreground/70">{LIFE_STAGE_TEXT[dayResult.lifeStage]}</p>
              </div>
              {dayResult.sinsal.map((s) => (
                <div key={s.name} className="rounded-xl border border-[var(--card-border)] p-4 sm:col-span-2">
                  <p className="mb-1 text-xs font-medium text-[var(--brand)]">
                    이 날의 신살 — {s.name} <span className="text-foreground/40">{s.hanja}</span>
                  </p>
                  <p className="text-sm text-foreground/70">{s.text}</p>
                  <p className="mt-1 text-xs text-foreground/40">
                    <span className="mr-1 rounded bg-black/5 px-1.5 py-0.5 dark:bg-white/10">근거</span>
                    {s.evidence}
                  </p>
                </div>
              ))}
            </div>

            {(dayResult.isVoid || dayResult.isClash || dayResult.isUnion) && (
              <ul className="flex flex-col gap-1.5 text-sm">
                {dayResult.isVoid && <li className="text-amber-600">이 날은 나의 공망일(空亡日)입니다 — 무리한 결정은 피하는 게 좋습니다.</li>}
                {dayResult.isClash && <li className="text-red-600">나의 일지와 충(沖)이 되는 날입니다 — 감정 기복에 유의하세요.</li>}
                {dayResult.isUnion && <li className="text-emerald-600">나의 일지와 합(合)이 되는 날입니다 — 관계·협업에 좋은 기운입니다.</li>}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
