"use client";

import { useMemo, useState } from "react";
import BirthForm from "@/components/BirthForm";
import { useMyBirthInfo } from "@/lib/use-birth-info";
import { toDate, useToday } from "@/lib/use-today";
import { HEAVENLY_STEMS, HEAVENLY_STEMS_HANJA, EARTHLY_BRANCHES, EARTHLY_BRANCHES_HANJA } from "@/lib/manseryeok";
import { findTaekilCandidates, safeCalculateFourPillars, TAEKIL_PURPOSES, type TaekilCandidate } from "@/lib/saju-utils";
import { TEN_GOD_MEANING } from "@/lib/saju-interpretation";

/** input[type=date] 값으로 쓸 로컬 날짜 문자열 (toISOString은 UTC라 하루 밀릴 수 있다) */
function toInputValue(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function addDays(d: Date, n: number) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export default function TaekilPage() {
  const { info, update, loaded } = useMyBirthInfo();
  const [purposeKey, setPurposeKey] = useState(TAEKIL_PURPOSES[0].key);
  // 직접 고르기 전까지는 오늘~60일 뒤가 기본값이고, 자정을 넘기면 따라 갱신된다
  const today = useToday();
  const [startOverride, setStartOverride] = useState<string | null>(null);
  const [endOverride, setEndOverride] = useState<string | null>(null);
  const startStr = startOverride ?? toInputValue(toDate(today));
  const endStr = endOverride ?? toInputValue(addDays(toDate(today), 60));
  const [excludeWeekend, setExcludeWeekend] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [results, setResults] = useState<TaekilCandidate[] | null>(null);

  const purpose = TAEKIL_PURPOSES.find((p) => p.key === purposeKey) ?? TAEKIL_PURPOSES[0];

  const { detail: mySaju, error: loadError } = useMemo(() => {
    if (!loaded) return { detail: null, error: null };
    return safeCalculateFourPillars({
      year: info.year, month: info.month, day: info.day, hour: info.hour, minute: info.minute,
      isLunar: info.isLunar, isLeapMonth: info.isLeapMonth,
    });
  }, [info, loaded]);

  const error = searchError ?? loadError;

  const runSearch = () => {
    if (!mySaju) return;
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      setSearchError("올바른 기간을 입력해주세요.");
      setResults(null);
      return;
    }
    if ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) > 366) {
      setSearchError("검색 기간은 1년 이내로 설정해주세요.");
      setResults(null);
      return;
    }
    setSearchError(null);
    const candidates = findTaekilCandidates({
      dayMaster: mySaju.day.heavenlyStem,
      myDayBranch: mySaju.day.earthlyBranch,
      startDate: start,
      endDate: end,
      purpose,
      excludeWeekdays: excludeWeekend ? [0, 6] : [],
    });
    setResults(candidates.slice(0, 15));
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--brand)]">택일</h1>
        <p className="mt-1 text-sm text-foreground/60">
          목적에 맞는 좋은 날짜를 기간 내에서 찾아드립니다. (참고용 간단 규칙 기반 계산)
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <BirthForm value={info} onChange={update} showGender={false} idPrefix="taekil" />
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <div>
          <label className="mb-2 block text-xs font-medium text-foreground/50">목적</label>
          <div className="flex flex-wrap gap-2">
            {TAEKIL_PURPOSES.map((p) => (
              <button
                key={p.key}
                onClick={() => setPurposeKey(p.key)}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  p.key === purposeKey ? "bg-[var(--brand)] text-white" : "bg-black/5 text-foreground/70 dark:bg-white/10"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-foreground/50">{purpose.description}</p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/50" htmlFor="start">
              시작일
            </label>
            <input
              id="start"
              type="date"
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:bg-white/5 dark:border-white/15"
              value={startStr}
              onChange={(e) => setStartOverride(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/50" htmlFor="end">
              종료일
            </label>
            <input
              id="end"
              type="date"
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:bg-white/5 dark:border-white/15"
              value={endStr}
              onChange={(e) => setEndOverride(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input type="checkbox" checked={excludeWeekend} onChange={(e) => setExcludeWeekend(e.target.checked)} />
            주말 제외
          </label>
          <button
            onClick={runSearch}
            disabled={!mySaju}
            className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            좋은 날 찾기
          </button>
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {results && results.length > 0 && (
        <TopPickSummary candidate={results[0]} purposeLabel={purpose.label} />
      )}

      {results && (
        <section className="flex flex-col gap-2">
          {results.length === 0 && <p className="text-sm text-foreground/50">조건에 맞는 날짜를 찾지 못했습니다.</p>}
          {results.map((r, i) => {
            const si = HEAVENLY_STEMS.indexOf(r.pillar.heavenlyStem);
            const bi = EARTHLY_BRANCHES.indexOf(r.pillar.earthlyBranch);
            return (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {r.date.getFullYear()}. {r.date.getMonth() + 1}. {r.date.getDate()}. ({WEEKDAY_LABELS[r.date.getDay()]})
                    <span className="ml-2 text-foreground/50">
                      {r.pillar.heavenlyStem}
                      {HEAVENLY_STEMS_HANJA[si]}
                      {r.pillar.earthlyBranch}
                      {EARTHLY_BRANCHES_HANJA[bi]}일
                    </span>
                  </p>
                  {r.reasons.length > 0 && (
                    <p className="mt-1 text-xs text-foreground/50">{r.reasons.join(" · ")}</p>
                  )}
                  <p className="mt-1 text-xs text-foreground/40">
                    {TEN_GOD_MEANING[r.stemGod].text}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    r.score > 0
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : r.score < 0
                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        : "bg-black/5 text-foreground/60 dark:bg-white/10"
                  }`}
                >
                  {r.score > 0 ? "+" : ""}
                  {r.score}
                </span>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

function TopPickSummary({ candidate, purposeLabel }: { candidate: TaekilCandidate; purposeLabel: string }) {
  const si = HEAVENLY_STEMS.indexOf(candidate.pillar.heavenlyStem);
  const bi = EARTHLY_BRANCHES.indexOf(candidate.pillar.earthlyBranch);
  const stemInfo = TEN_GOD_MEANING[candidate.stemGod];
  const branchInfo = TEN_GOD_MEANING[candidate.branchGod];

  return (
    <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
      <h2 className="mb-2 text-sm font-semibold text-foreground/60">
        가장 좋은 날 — {candidate.date.getFullYear()}. {candidate.date.getMonth() + 1}. {candidate.date.getDate()}. (
        {WEEKDAY_LABELS[candidate.date.getDay()]}) {candidate.pillar.heavenlyStem}
        {HEAVENLY_STEMS_HANJA[si]}
        {candidate.pillar.earthlyBranch}
        {EARTHLY_BRANCHES_HANJA[bi]}일
      </h2>
      <p className="text-sm leading-relaxed text-foreground/80">
        {purposeLabel} 목적으로 이 날의 천간은 {candidate.stemGod}({stemInfo.group}), 지지는 {candidate.branchGod}(
        {branchInfo.group}) 기운입니다. {stemInfo.text} {stemInfo.group !== branchInfo.group && branchInfo.text}
      </p>
    </section>
  );
}
