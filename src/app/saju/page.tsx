"use client";

import { useMemo, useState } from "react";
import BirthForm from "@/components/BirthForm";
import FourPillarsGrid from "@/components/FourPillarsGrid";
import ElementBars from "@/components/ElementBars";
import YinYangBars from "@/components/YinYangBars";
import CategoryBars from "@/components/CategoryBars";
import AdvancedSaju from "@/components/AdvancedSaju";
import AgeSelector from "@/components/AgeSelector";
import { useMyBirthInfo } from "@/lib/use-birth-info";
import { HEAVENLY_STEMS_HANJA, HEAVENLY_STEMS, EARTHLY_BRANCHES, EARTHLY_BRANCHES_HANJA } from "@/lib/manseryeok";
import { convertCalendar, elementCounts, safeCalculateFourPillars, yinYangCounts } from "@/lib/saju-utils";
import {
  categoriesForAge,
  currentApproxAge,
  describePillarInfluence,
  ELEMENT_EXCESS_TEXT,
  ELEMENT_LACK_TEXT,
  getAgeBracket,
  interpretSaju,
  LIFE_CATEGORY_TEXT,
  tenGodText,
  TEN_GOD_MEANING,
  type AgeBracket,
} from "@/lib/saju-interpretation";
import { getLifeStage, LIFE_STAGE_HANJA, LIFE_STAGE_TEXT } from "@/lib/saju-advanced";

export default function SajuPage() {
  const { info, update, loaded } = useMyBirthInfo();
  const [bracketOverride, setBracketOverride] = useState<AgeBracket | null>(null);

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

  const dayStemIdx = detail ? HEAVENLY_STEMS.indexOf(detail.day.heavenlyStem) : -1;
  const dayBranchIdx = detail ? EARTHLY_BRANCHES.indexOf(detail.day.earthlyBranch) : -1;

  const age = currentApproxAge(info.year, info.month, info.day);
  const autoBracket = getAgeBracket(age);
  const bracket = bracketOverride ?? autoBracket;

  const counts = detail ? elementCounts(detail) : null;
  const yinYang = detail ? yinYangCounts(detail) : null;
  const interp = detail && counts ? interpretSaju(detail, counts, info.name, bracket, info.gender) : null;
  const calendarConversion = detail
    ? convertCalendar({ year: info.year, month: info.month, day: info.day, isLunar: info.isLunar, isLeapMonth: info.isLeapMonth })
    : null;

  // 현재 흐르는 대운 — 타고난 원국에 지금 시기를 겹쳐 본다
  const luck = detail?.luckPillars;
  const currentLuckIndex =
    luck?.pillars.findIndex((p, i) => {
      const nextAge = luck.pillars[i + 1]?.age ?? Infinity;
      return age >= p.age && age < nextAge;
    }) ?? -1;
  const currentLuck = currentLuckIndex >= 0 ? luck?.pillars[currentLuckIndex] : null;
  const luckInfluence =
    detail && currentLuck
      ? describePillarInfluence(detail.day.heavenlyStem, currentLuck.pillar, "지금 이 대운", bracket)
      : null;
  const luckStage = detail && currentLuck ? getLifeStage(detail.day.heavenlyStem, currentLuck.pillar.earthlyBranch) : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--brand)]">사주팔자</h1>
        <p className="mt-1 text-sm text-foreground/60">생년월일시를 입력하면 년·월·일·시주와 십신, 오행을 계산합니다.</p>
      </div>

      <div className="flex flex-col gap-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <BirthForm value={info} onChange={update} idPrefix="saju" />
        <div className="border-t border-[var(--card-border)] pt-4">
          <AgeSelector value={bracket} autoValue={autoBracket} autoAge={age} onChange={setBracketOverride} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {detail && (
        <div className="flex flex-col gap-8">
          <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground/60">
              {info.name ? `${info.name}님의 사주` : "사주 명식"}
              <span className="ml-2 text-xs font-normal text-foreground/40">
                일간(日干) {detail.day.heavenlyStem}({HEAVENLY_STEMS_HANJA[dayStemIdx]}) · 일지(日支) {detail.day.earthlyBranch}(
                {EARTHLY_BRANCHES_HANJA[dayBranchIdx]})
              </span>
            </h2>
            <FourPillarsGrid detail={detail} />
            <p className="mt-4 text-center text-sm text-foreground/70">{detail.toString()}</p>
            {calendarConversion && (
              <p className="mt-1 text-center text-xs text-foreground/40">
                {calendarConversion.error ? calendarConversion.error : `환산: ${calendarConversion.label}`}
              </p>
            )}
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground/60">오행 분포</h2>
              <ElementBars counts={counts!} />
            </div>
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground/60">음양 분포</h2>
              <YinYangBars counts={yinYang!} />
            </div>
          </section>

          {luckInfluence && currentLuck && (
            <section className="flex flex-col gap-3 rounded-2xl border-2 border-[var(--brand)] bg-[var(--card)] p-5">
              <div>
                <h2 className="text-sm font-semibold text-[var(--brand)]">
                  지금 만 {age}세 — {currentLuck.korean} 대운을 지나는 중
                </h2>
                <p className="mt-1 text-xs text-foreground/40">
                  타고난 사주(원국)에 지금 흐르는 10년 대운을 겹쳐 본 풀이예요.
                  {" "}
                  {currentLuck.age}세부터 {luck?.pillars[currentLuckIndex + 1]?.age ?? "이후"}
                  {luck?.pillars[currentLuckIndex + 1] ? "세까지" : "까지"} 이어져요.
                </p>
              </div>
              <p className="rounded-xl bg-[var(--brand-soft)] p-4 text-sm leading-relaxed text-foreground/80">
                {luckInfluence.summary}
              </p>
              {luckStage && (
                <p className="text-sm text-foreground/70">
                  <span className="font-medium text-[var(--brand)]">십이운성 {luckStage}({LIFE_STAGE_HANJA[luckStage]})</span> — {LIFE_STAGE_TEXT[luckStage]}
                </p>
              )}
            </section>
          )}

          {interp && (
            <section className="flex flex-col gap-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
              <h2 className="text-sm font-semibold text-foreground/60">사주 풀이</h2>

              <p className="rounded-xl bg-[var(--brand-soft)] p-4 text-sm leading-relaxed text-foreground/80">
                {interp.summary}
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--card-border)] p-4">
                  <p className="mb-1 text-xs font-medium text-[var(--brand)]">
                    일간 — {detail.day.heavenlyStem} {interp.dayMasterTitle}
                  </p>
                  <p className="text-sm text-foreground/70">{interp.dayMasterText}</p>
                </div>

                <div className="rounded-xl border border-[var(--card-border)] p-4">
                  <p className="mb-1 text-xs font-medium text-[var(--brand)]">신강/신약 — {interp.strength}</p>
                  <p className="text-sm text-foreground/70">{interp.strengthText}</p>
                </div>

                {interp.dominantElement && (
                  <div className="rounded-xl border border-[var(--card-border)] p-4">
                    <p className="mb-1 text-xs font-medium text-[var(--brand)]">
                      오행 특징 — {interp.dominantElement.element} 과다 ({interp.dominantElement.count}개)
                    </p>
                    <p className="text-sm text-foreground/70">
                      {ELEMENT_EXCESS_TEXT[interp.dominantElement.element]}
                    </p>
                  </div>
                )}

                {interp.lackingElements.length > 0 && (
                  <div className="rounded-xl border border-[var(--card-border)] p-4">
                    <p className="mb-1 text-xs font-medium text-[var(--brand)]">
                      부족한 오행 — {interp.lackingElements.join(", ")}
                    </p>
                    <p className="text-sm text-foreground/70">
                      {interp.lackingElements.map((el) => ELEMENT_LACK_TEXT[el]).join(" ")}
                    </p>
                  </div>
                )}

                {interp.dominantTenGod && (
                  <div className="rounded-xl border border-[var(--card-border)] p-4 sm:col-span-2">
                    <p className="mb-1 text-xs font-medium text-[var(--brand)]">
                      두드러진 십신 — {interp.dominantTenGod.god} ({TEN_GOD_MEANING[interp.dominantTenGod.god].group},{" "}
                      {interp.dominantTenGod.count}개)
                    </p>
                    <p className="text-sm text-foreground/70">{tenGodText(interp.dominantTenGod.god, bracket)}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {interp && (
            <section className="flex flex-col gap-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
              <div>
                <h2 className="text-sm font-semibold text-foreground/60">분야별 리포트</h2>
                <p className="mt-1 text-xs text-foreground/40">
                  십신을 다섯 분야로 나눠 집계했어요. {bracket}기에 관심이 큰 분야부터 위에 놓았습니다.
                </p>
              </div>

              <CategoryBars counts={interp.categoryCounts} order={categoriesForAge(bracket)} />

              {(interp.strongCategories.length > 0 || interp.weakCategories.length > 0) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {interp.strongCategories.map((cat) => (
                    <div key={cat} className="rounded-xl border border-[var(--card-border)] p-4">
                      <p className="mb-1 text-xs font-medium text-[var(--brand)]">{cat} — 강한 편</p>
                      <p className="text-sm text-foreground/70">{LIFE_CATEGORY_TEXT[cat].strong}</p>
                    </div>
                  ))}
                  {interp.weakCategories.map((cat) => (
                    <div key={cat} className="rounded-xl border border-[var(--card-border)] p-4">
                      <p className="mb-1 text-xs font-medium text-foreground/50">{cat} — 약한 편</p>
                      <p className="text-sm text-foreground/70">{LIFE_CATEGORY_TEXT[cat].weak}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {interp && (
            <section className="flex flex-col gap-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
              <div>
                <h2 className="text-sm font-semibold text-foreground/60">사람 관계 (육친)</h2>
                <p className="mt-1 text-xs text-foreground/40">
                  십신은 사람도 가리켜요. {bracket}기에 특히 마음이 가는 관계부터 보여드려요.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {interp.relatives.map((r) => (
                  <div key={r.group} className="rounded-xl border border-[var(--card-border)] p-4">
                    <p className="mb-1 text-xs font-medium text-[var(--brand)]">
                      {r.relative}
                      <span className="ml-1 font-normal text-foreground/40">
                        ({r.group} {r.count}개)
                      </span>
                    </p>
                    <p className="text-sm text-foreground/70">{r.text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <AdvancedSaju detail={detail} />

          <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground/60">공망(空亡)</h2>
            <p className="text-sm text-foreground/70">
              {detail.voidBranches.join(", ")} — 이 지지에 해당하는 때에는 일이 헛되이 흩어지기 쉽다고 봐요. 큰 결정은
              한 박자 늦추면 좋아요.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
