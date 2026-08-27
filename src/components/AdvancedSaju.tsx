import {
  EARTHLY_BRANCHES,
  EARTHLY_BRANCHES_HANJA,
  HEAVENLY_STEMS,
  HEAVENLY_STEMS_HANJA,
  type EarthlyBranch,
} from "@/lib/manseryeok";
import {
  findSinsal,
  getGyukguk,
  getHiddenStemGods,
  getLifeStage,
  LIFE_STAGE_HANJA,
  LIFE_STAGE_TEXT,
  MONTH_BRANCH_NATURE,
} from "@/lib/saju-advanced";
import type { FourPillarsDetail } from "@/lib/saju-utils";

const stemHanja = (s: string) => HEAVENLY_STEMS_HANJA[HEAVENLY_STEMS.indexOf(s as never)];
const branchHanja = (b: string) => EARTHLY_BRANCHES_HANJA[EARTHLY_BRANCHES.indexOf(b as never)];

function Evidence({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1 text-xs text-foreground/40">
      <span className="mr-1 rounded bg-black/5 px-1.5 py-0.5 dark:bg-white/10">근거</span>
      {children}
    </p>
  );
}

export default function AdvancedSaju({ detail }: { detail: FourPillarsDetail }) {
  const dayMaster = detail.day.heavenlyStem;
  const pillars = [
    { label: "년주", pillar: detail.year },
    { label: "월주", pillar: detail.month },
    { label: "일주", pillar: detail.day },
    { label: "시주", pillar: detail.hour },
  ];
  const allBranches: EarthlyBranch[] = pillars.map((p) => p.pillar.earthlyBranch);

  const gyukguk = getGyukguk(dayMaster, detail.month.earthlyBranch);
  const sinsal = findSinsal(dayMaster, detail.year.earthlyBranch, detail.day.earthlyBranch, allBranches);
  const monthBranch = detail.month.earthlyBranch;
  const nature = MONTH_BRANCH_NATURE[monthBranch];

  return (
    <div className="flex flex-col gap-8">
      {/* 월지 기질 */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-foreground/60">
            월지(月支) 기질 — {monthBranch}
            {branchHanja(monthBranch)}월생
          </h2>
          <p className="mt-1 text-xs text-foreground/40">
            월지는 태어난 계절이자 사주에서 가장 힘이 센 자리예요. 절기 기준이라 {nature.term} 이후, 대략 양력{" "}
            {nature.solarMonth}월에 해당합니다.
          </p>
        </div>

        <p className="rounded-xl bg-[var(--brand-soft)] p-4 text-sm leading-relaxed text-foreground/80">
          {nature.season}
        </p>

        <p className="mt-3 text-lg font-bold text-[var(--brand)]">{nature.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/75">{nature.text}</p>

        <div className="mt-3 rounded-xl border border-[var(--card-border)] p-4">
          <p className="mb-1 text-xs font-medium text-[var(--brand)]">일·사회생활에서는</p>
          <p className="text-sm text-foreground/70">{nature.work}</p>
        </div>

        <Evidence>
          월주 지지 {monthBranch}
          {branchHanja(monthBranch)} ({nature.term} 절입 이후 출생)
        </Evidence>
      </section>

      {/* 격국 */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <h2 className="mb-3 text-sm font-semibold text-foreground/60">격국(格局) — 사주의 큰 틀</h2>
        <p className="text-lg font-bold text-[var(--brand)]">{gyukguk.name}</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/75">{gyukguk.text}</p>
        <Evidence>{gyukguk.evidence}</Evidence>
      </section>

      {/* 십이운성 */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground/60">십이운성(十二運星) — 기운의 세기</h2>
          <p className="mt-1 text-xs text-foreground/40">
            일간 {dayMaster}이 각 자리의 지지에서 얼마나 힘을 받는지 보여줘요.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {pillars.map(({ label, pillar }) => {
            const stage = getLifeStage(dayMaster, pillar.earthlyBranch);
            return (
              <div key={label} className="rounded-xl border border-[var(--card-border)] p-4">
                <p className="text-xs font-medium text-[var(--brand)]">
                  {label} {pillar.earthlyBranch}
                  {branchHanja(pillar.earthlyBranch)} — {stage}({LIFE_STAGE_HANJA[stage]})
                </p>
                <p className="mt-1 text-sm text-foreground/70">{LIFE_STAGE_TEXT[stage]}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 신살 */}
      {sinsal.length > 0 && (
        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground/60">신살(神煞) — 사주에 붙은 특수한 별</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {sinsal.map((s) => (
              <div
                key={s.name}
                className="rounded-xl border p-4"
                style={{
                  borderColor: s.tone === "good" ? "var(--brand)" : "var(--card-border)",
                }}
              >
                <p className="text-xs font-medium text-[var(--brand)]">
                  {s.name} <span className="text-foreground/40">{s.hanja}</span>
                </p>
                <p className="mt-1 text-sm text-foreground/70">{s.text}</p>
                <Evidence>{s.evidence}</Evidence>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 지장간 */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground/60">지장간(支藏干) — 지지 속에 숨은 기운</h2>
          <p className="mt-1 text-xs text-foreground/40">
            겉으로 보이는 8글자 아래 숨어서 작용하는 천간이에요. 그중 정기(正氣)가 그 지지의 본래 성격이에요.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="text-xs text-foreground/45">
                <th className="pb-2 text-left font-medium">자리</th>
                <th className="pb-2 text-left font-medium">지지</th>
                <th className="pb-2 text-left font-medium">여기</th>
                <th className="pb-2 text-left font-medium">중기</th>
                <th className="pb-2 text-left font-medium">정기</th>
              </tr>
            </thead>
            <tbody>
              {pillars.map(({ label, pillar }) => {
                const rows = getHiddenStemGods(dayMaster, pillar.earthlyBranch);
                const cell = (role: string) => {
                  const r = rows.find((x) => x.role === role);
                  if (!r) return <span className="text-foreground/25">—</span>;
                  return (
                    <span>
                      {r.stem}
                      {stemHanja(r.stem)}{" "}
                      <span className="text-xs text-foreground/45">{r.god}</span>
                    </span>
                  );
                };
                return (
                  <tr key={label} className="border-t border-[var(--card-border)]">
                    <td className="py-2 text-foreground/60">{label}</td>
                    <td className="py-2">
                      {pillar.earthlyBranch}
                      {branchHanja(pillar.earthlyBranch)}
                    </td>
                    <td className="py-2">{cell("여기")}</td>
                    <td className="py-2">{cell("중기")}</td>
                    <td className="py-2">{cell("정기")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
