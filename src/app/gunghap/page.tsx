"use client";

import { useMemo, useState } from "react";
import BirthForm from "@/components/BirthForm";
import ElementBars from "@/components/ElementBars";
import { DEFAULT_BIRTH_INFO, useMyBirthInfo, type StoredBirthInfo } from "@/lib/use-birth-info";
import { getTenGod, HEAVENLY_STEMS_HANJA, HEAVENLY_STEMS, EARTHLY_BRANCHES, EARTHLY_BRANCHES_HANJA } from "@/lib/manseryeok";
import {
  branchRelationNote,
  elementCounts,
  elementRelation,
  findComplements,
  safeCalculateFourPillars,
  type FourPillarsDetail,
} from "@/lib/saju-utils";
import { DAY_STEM_PERSONALITY, TEN_GOD_MEANING } from "@/lib/saju-interpretation";
import { BRANCH_RESENTMENT } from "@/lib/saju-advanced";

function useOther() {
  return useState<StoredBirthInfo>({ ...DEFAULT_BIRTH_INFO, name: "", year: 1992, gender: "female" });
}

function scoreBand(score: number): string {
  if (score >= 85) return "찰떡궁합에 가까운, 서로 무척 잘 통하는 조합입니다.";
  if (score >= 70) return "전반적으로 잘 맞는 편이라 편안하게 관계를 이어갈 수 있습니다.";
  if (score >= 55) return "무난한 조합으로, 서로 이해하려는 노력이 관계를 더 좋게 만듭니다.";
  return "기질 차이가 있는 편이라, 서로 다름을 인정하고 배려하는 노력이 더 필요합니다.";
}

export default function GunghapPage() {
  const { info: mine, update: updateMine, loaded } = useMyBirthInfo();
  const [other, setOther] = useOther();

  const { result, error } = useMemo(() => {
    if (!loaded) return { result: null, error: null };
    const a = safeCalculateFourPillars({
      year: mine.year, month: mine.month, day: mine.day, hour: mine.hour, minute: mine.minute,
      isLunar: mine.isLunar, isLeapMonth: mine.isLeapMonth, gender: mine.gender,
    });
    if (a.error) return { result: null, error: a.error };
    const b = safeCalculateFourPillars({
      year: other.year, month: other.month, day: other.day, hour: other.hour, minute: other.minute,
      isLunar: other.isLunar, isLeapMonth: other.isLeapMonth, gender: other.gender,
    });
    if (b.error) return { result: null, error: b.error };
    return { result: { a: a.detail!, b: b.detail! }, error: null };
  }, [mine, other, loaded]);

  const analysis = useMemo(() => {
    if (!result) return null;
    const { a, b }: { a: FourPillarsDetail; b: FourPillarsDetail } = result;

    const stemRelation = elementRelation(a.dayElement.stem, b.dayElement.stem);
    const dayBranchRel = branchRelationNote(a.day.earthlyBranch, b.day.earthlyBranch);
    const monthBranchRel = branchRelationNote(a.month.earthlyBranch, b.month.earthlyBranch);

    const aSeesB = getTenGod(a.day.heavenlyStem, b.day.heavenlyStem);
    const bSeesA = getTenGod(b.day.heavenlyStem, a.day.heavenlyStem);

    const complements = findComplements(elementCounts(a), elementCounts(b));
    const isResentment = BRANCH_RESENTMENT[a.day.earthlyBranch] === b.day.earthlyBranch;

    const stemScore = stemRelation === "상생(生)" ? 2 : stemRelation === "비화(比和)" ? 1 : -1;
    const totalScore = Math.max(
      0,
      Math.min(
        100,
        60 +
          (stemScore + dayBranchRel.score + monthBranchRel.score * 0.5) * 8 +
          complements.length * 3 -
          (isResentment ? 10 : 0),
      ),
    );

    const aTitle = DAY_STEM_PERSONALITY[a.day.heavenlyStem].title;
    const bTitle = DAY_STEM_PERSONALITY[b.day.heavenlyStem].title;
    const summary = [
      `나(${a.day.heavenlyStem}, ${aTitle})와 상대(${b.day.heavenlyStem}, ${bTitle})의 일간은 ${stemRelation} 관계입니다.`,
      dayBranchRel.note !== "특별한 합충 관계 없음" ? `일지(부부운) — ${dayBranchRel.note}.` : "",
      monthBranchRel.note !== "특별한 합충 관계 없음" ? `월지(가정·직장운) — ${monthBranchRel.note}.` : "",
      complements.length > 0
        ? `오행으로 보면 ${complements.map((c) => c.element).join(", ")} 기운에서 서로를 채워주는 관계입니다.`
        : "",
      isResentment ? "다만 일지가 원진(怨嗔) 관계라 사소한 일에 서로 예민해질 수 있으니, 감정이 쌓이기 전에 풀어내는 습관이 도움이 됩니다." : "",
      `나는 상대를 ${aSeesB}(${TEN_GOD_MEANING[aSeesB].group})으로 보는데, ${TEN_GOD_MEANING[aSeesB].text}`,
      `상대는 나를 ${bSeesA}(${TEN_GOD_MEANING[bSeesA].group})으로 보는데, ${TEN_GOD_MEANING[bSeesA].text}`,
      scoreBand(totalScore),
    ]
      .filter(Boolean)
      .join(" ");

    return {
      stemRelation,
      branchNote: dayBranchRel.note,
      monthBranchNote: monthBranchRel.note,
      complements,
      isResentment,
      aSeesB,
      bSeesA,
      totalScore: Math.round(totalScore),
      summary,
    };
  }, [result]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--brand)]">궁합</h1>
        <p className="mt-1 text-sm text-foreground/60">두 사람의 사주를 비교해 일간·일지 관계와 십신을 분석합니다.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground/60">나</h2>
          <BirthForm value={mine} onChange={updateMine} idPrefix="gh-a" />
        </div>
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground/60">상대방</h2>
          <BirthForm value={other} onChange={setOther} idPrefix="gh-b" />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && analysis && (
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center">
            <p className="text-xs text-foreground/50">궁합 점수 (참고용)</p>
            <p className="text-4xl font-bold text-[var(--brand)]">{analysis.totalScore}</p>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold text-foreground/60">궁합 풀이</h2>

            <p className="rounded-xl bg-[var(--brand-soft)] p-4 text-sm leading-relaxed text-foreground/80">
              {analysis.summary}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--card-border)] p-4">
                <p className="mb-1 text-xs font-medium text-[var(--brand)]">
                  내가 보는 상대 — {analysis.aSeesB} ({TEN_GOD_MEANING[analysis.aSeesB].group})
                </p>
                <p className="text-sm text-foreground/70">{TEN_GOD_MEANING[analysis.aSeesB].text}</p>
              </div>
              <div className="rounded-xl border border-[var(--card-border)] p-4">
                <p className="mb-1 text-xs font-medium text-[var(--brand)]">
                  상대가 보는 나 — {analysis.bSeesA} ({TEN_GOD_MEANING[analysis.bSeesA].group})
                </p>
                <p className="text-sm text-foreground/70">{TEN_GOD_MEANING[analysis.bSeesA].text}</p>
              </div>
              <div className="rounded-xl border border-[var(--card-border)] p-4 sm:col-span-2">
                <p className="mb-1 text-xs font-medium text-[var(--brand)]">
                  일간 오행 관계 — {analysis.stemRelation} ({result.a.day.heavenlyStem} → {result.b.day.heavenlyStem})
                </p>
                <p className="text-sm text-foreground/70">일지(부부·애정운) 관계: {analysis.branchNote}</p>
                <p className="text-sm text-foreground/70">월지(가정·직장운) 관계: {analysis.monthBranchNote}</p>
                {analysis.isResentment && (
                  <p className="mt-1 text-sm text-amber-600">
                    일지 원진(怨嗔) — 사소한 일에 서로 예민해질 수 있는 조합입니다.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground/60">오행 상호보완</h2>
              <p className="mt-1 text-xs text-foreground/40">
                한쪽에 부족한 오행을 다른 쪽이 채워주는지 봅니다. 서로 다른 기운을 가질수록 보완이 잘 됩니다.
              </p>
            </div>
            {analysis.complements.length === 0 ? (
              <p className="text-sm text-foreground/70">
                두 사람의 오행 구성이 비슷해, 특별히 채워주는 관계는 보이지 않습니다. 비슷한 기질이라 편안한 대신,
                부족한 부분은 함께 노력해 메우면 좋습니다.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {analysis.complements.map((c) => (
                  <div key={`${c.giver}-${c.element}`} className="rounded-xl border border-[var(--card-border)] p-4">
                    <p className="mb-1 text-xs font-medium text-[var(--brand)]">
                      {c.giver === "b" ? "상대 → 나" : "나 → 상대"} · {c.element} 기운
                    </p>
                    <p className="text-sm text-foreground/70">{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground/60">
                나 — {result.a.day.heavenlyStem}{HEAVENLY_STEMS_HANJA[HEAVENLY_STEMS.indexOf(result.a.day.heavenlyStem)]}
                {result.a.day.earthlyBranch}{EARTHLY_BRANCHES_HANJA[EARTHLY_BRANCHES.indexOf(result.a.day.earthlyBranch)]} 일주
              </h2>
              <ElementBars counts={elementCounts(result.a)} />
            </div>
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground/60">
                상대 — {result.b.day.heavenlyStem}{HEAVENLY_STEMS_HANJA[HEAVENLY_STEMS.indexOf(result.b.day.heavenlyStem)]}
                {result.b.day.earthlyBranch}{EARTHLY_BRANCHES_HANJA[EARTHLY_BRANCHES.indexOf(result.b.day.earthlyBranch)]} 일주
              </h2>
              <ElementBars counts={elementCounts(result.b)} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
