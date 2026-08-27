import {
  calculateFourPillars,
  getBranchTenGod,
  getEarthlyBranchElement,
  getHeavenlyStemElement,
  getTenGod,
  getVoidBranches,
  isValidSolarDate,
  lunarToSolar,
  solarToLunar,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  LUNAR_MIN_YEAR,
  LUNAR_MAX_YEAR,
  type BirthInfo,
  type EarthlyBranch,
  type FiveElement,
  type FourPillarsDetail,
  type HeavenlyStem,
  type LunarDate,
  type Pillar,
  type SolarDate,
  type TenGod,
  type YinYang,
} from "./manseryeok";

/** 오행 색상 (전통 오방색 기반) */
export const ELEMENT_COLOR: Record<FiveElement, string> = {
  목: "#2e9e5b",
  화: "#e0483e",
  토: "#c9922a",
  금: "#8a8f98",
  수: "#3268c9",
};

export const ELEMENT_BG: Record<FiveElement, string> = {
  목: "#eafaf1",
  화: "#fdecea",
  토: "#faf1de",
  금: "#f1f2f4",
  수: "#eaf0fd",
};

/** 오행 상생: A → B (A가 B를 생함) */
export const ELEMENT_GENERATES: Record<FiveElement, FiveElement> = {
  목: "화",
  화: "토",
  토: "금",
  금: "수",
  수: "목",
};

/** 오행 상극: A → B (A가 B를 극함) */
export const ELEMENT_CONTROLS: Record<FiveElement, FiveElement> = {
  목: "토",
  토: "수",
  수: "화",
  화: "금",
  금: "목",
};

/** 음력 최소/최대 연도 등 매직넘버 없이, saju 계산 안전 범위 */
export const SAJU_MIN_YEAR = 1900;
export const SAJU_MAX_YEAR = 2100;

const mod = (n: number, m: number) => ((n % m) + m) % m;

/** 연도 숫자로 세운(歲運) 간지를 구한다. 1984년 = 갑자년 기준. */
export function getYearPillar(year: number): Pillar {
  const stemIndex = mod(year - 4, 10);
  const branchIndex = mod(year - 4, 12);
  return {
    heavenlyStem: HEAVENLY_STEMS[stemIndex],
    earthlyBranch: EARTHLY_BRANCHES[branchIndex],
  };
}

/** 특정 양력 날짜의 일주(日柱)를 구한다. */
export function getDayPillar(year: number, month: number, day: number): Pillar {
  const result = calculateFourPillars({ year, month, day, hour: 12, minute: 0 });
  return result.day;
}

export function pillarToKorean(p: Pillar): string {
  return `${p.heavenlyStem}${p.earthlyBranch}`;
}

export function pillarToHanja(p: Pillar, stemHanja: readonly string[], branchHanja: readonly string[]): string {
  const si = HEAVENLY_STEMS.indexOf(p.heavenlyStem);
  const bi = EARTHLY_BRANCHES.indexOf(p.earthlyBranch);
  return `${stemHanja[si]}${branchHanja[bi]}`;
}

/** 지지 충(沖) 짝 */
export const BRANCH_CLASH: Record<EarthlyBranch, EarthlyBranch> = {
  자: "오",
  오: "자",
  축: "미",
  미: "축",
  인: "신",
  신: "인",
  묘: "유",
  유: "묘",
  진: "술",
  술: "진",
  사: "해",
  해: "사",
};

/** 지지 육합(六合) 짝 */
export const BRANCH_UNION: Record<EarthlyBranch, EarthlyBranch> = {
  자: "축",
  축: "자",
  인: "해",
  해: "인",
  묘: "술",
  술: "묘",
  진: "유",
  유: "진",
  사: "신",
  신: "사",
  오: "미",
  미: "오",
};

/** 지지 삼합(三合) 그룹과 결과 오행 */
export const BRANCH_TRINE: { branches: EarthlyBranch[]; element: FiveElement; label: string }[] = [
  { branches: ["인", "오", "술"], element: "화", label: "인오술 화국(火局)" },
  { branches: ["신", "자", "진"], element: "수", label: "신자진 수국(水局)" },
  { branches: ["사", "유", "축"], element: "금", label: "사유축 금국(金局)" },
  { branches: ["해", "묘", "미"], element: "목", label: "해묘미 목국(木局)" },
];

export interface BranchRelation {
  note: string;
  score: number;
}

/** 두 지지 사이의 합(合)/충(沖)/삼합(三合) 관계를 판정한다. */
export function branchRelationNote(branchA: EarthlyBranch, branchB: EarthlyBranch): BranchRelation {
  if (BRANCH_UNION[branchA] === branchB) {
    return { note: "합(合) — 서로 끌리고 잘 맞는 조합", score: 2 };
  }
  if (BRANCH_CLASH[branchA] === branchB) {
    return { note: "충(沖) — 초반엔 끌리지만 부딪힘이 있을 수 있음", score: -2 };
  }
  const trine = BRANCH_TRINE.find((t) => t.branches.includes(branchA) && t.branches.includes(branchB));
  if (trine) {
    return { note: `삼합(三合)의 일부 — ${trine.label}, 함께 있을 때 시너지`, score: 2 };
  }
  return { note: "특별한 합충 관계 없음", score: 0 };
}

export type ElementRelation = "상생(生)" | "상극(剋)" | "비화(比和)";

/** from 오행이 to 오행에 대해 갖는 관계 (from 기준 서술) */
export function elementRelation(from: FiveElement, to: FiveElement): ElementRelation {
  if (from === to) return "비화(比和)";
  if (ELEMENT_GENERATES[from] === to) return "상생(生)";
  if (ELEMENT_CONTROLS[from] === to) return "상극(剋)";
  // to가 from을 생하거나 극하는 역방향인 경우도 상생/상극으로 표기(방향은 별도 안내)
  if (ELEMENT_GENERATES[to] === from) return "상생(生)";
  return "상극(剋)";
}

export interface DayGodInfo {
  pillar: Pillar;
  stemGod: TenGod;
  branchGod: TenGod;
  stemElement: FiveElement;
  branchElement: FiveElement;
}

/** 어떤 사람의 일간(dayMaster) 기준으로 임의의 간지(target)가 어떤 십신/오행인지 */
export function analyzePillarAgainst(dayMaster: HeavenlyStem, target: Pillar): DayGodInfo {
  return {
    pillar: target,
    stemGod: getTenGod(dayMaster, target.heavenlyStem),
    branchGod: getBranchTenGod(dayMaster, target.earthlyBranch),
    stemElement: getHeavenlyStemElement(target.heavenlyStem),
    branchElement: getEarthlyBranchElement(target.earthlyBranch),
  };
}

export interface TaekilPurposeDef {
  key: string;
  label: string;
  description: string;
  favorGods: TenGod[];
  avoidGods: TenGod[];
}

export const TAEKIL_PURPOSES: TaekilPurposeDef[] = [
  {
    key: "wedding",
    label: "결혼 / 상견례",
    description: "정관·정재 기운이 강한 날을 좋게 봐요.",
    favorGods: ["정관", "정재", "정인"],
    avoidGods: ["겁재", "상관", "편관"],
  },
  {
    key: "contract",
    label: "계약 / 매매",
    description: "정재·정관처럼 안정적인 기운의 날을 좋게 봐요.",
    favorGods: ["정재", "정관", "식신"],
    avoidGods: ["겁재", "비견", "편관"],
  },
  {
    key: "moving",
    label: "이사 / 개업",
    description: "식신·정인처럼 안정과 시작의 기운이 있는 날을 봐요.",
    favorGods: ["식신", "정인", "정재"],
    avoidGods: ["편관", "상관"],
  },
  {
    key: "travel",
    label: "여행 / 출행",
    description: "식신·비견처럼 무난하고 편안한 날을 좋게 봐요.",
    favorGods: ["식신", "비견", "정인"],
    avoidGods: ["편관", "겁재"],
  },
];

export interface TaekilCandidate {
  date: Date;
  pillar: Pillar;
  stemGod: TenGod;
  branchGod: TenGod;
  isVoid: boolean;
  isClash: boolean;
  score: number;
  reasons: string[];
}

/**
 * 주어진 기간 내에서 특정 목적에 맞는 날짜 후보를 찾아 점수순으로 정렬한다.
 * (참고용 단순 규칙 기반 계산이며, 정식 택일과는 차이가 있을 수 있음)
 */
export function findTaekilCandidates(params: {
  dayMaster: HeavenlyStem;
  myDayBranch: EarthlyBranch;
  startDate: Date;
  endDate: Date;
  purpose: TaekilPurposeDef;
  excludeWeekdays?: number[];
}): TaekilCandidate[] {
  const { dayMaster, myDayBranch, startDate, endDate, purpose, excludeWeekdays = [] } = params;
  const myVoidBranches = getVoidBranches(
    dayMaster,
    myDayBranch,
  );
  const results: TaekilCandidate[] = [];

  const cur = new Date(startDate);
  cur.setHours(12, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(12, 0, 0, 0);

  while (cur.getTime() <= end.getTime()) {
    if (!excludeWeekdays.includes(cur.getDay())) {
      const pillar = getDayPillar(cur.getFullYear(), cur.getMonth() + 1, cur.getDate());
      const stemGod = getTenGod(dayMaster, pillar.heavenlyStem);
      const branchGod = getBranchTenGod(dayMaster, pillar.earthlyBranch);
      const isVoid = myVoidBranches.includes(pillar.earthlyBranch);
      const isClash = BRANCH_CLASH[myDayBranch] === pillar.earthlyBranch;

      let score = 0;
      const reasons: string[] = [];

      if (purpose.favorGods.includes(stemGod)) {
        score += 2;
        reasons.push(`일간 오행 '${stemGod}' 길함`);
      }
      if (purpose.favorGods.includes(branchGod)) {
        score += 1;
        reasons.push(`일지 오행 '${branchGod}' 길함`);
      }
      if (purpose.avoidGods.includes(stemGod)) {
        score -= 2;
        reasons.push(`일간 오행 '${stemGod}' 주의`);
      }
      if (purpose.avoidGods.includes(branchGod)) {
        score -= 1;
        reasons.push(`일지 오행 '${branchGod}' 주의`);
      }
      if (isVoid) {
        score -= 3;
        reasons.push("공망일(空亡日)이라 기운이 흩어짐");
      }
      if (isClash) {
        score -= 3;
        reasons.push("나의 일지와 충(沖)이 되는 날");
      }
      if (BRANCH_UNION[myDayBranch] === pillar.earthlyBranch) {
        score += 2;
        reasons.push("나의 일지와 합(合)이 되는 좋은 날");
      }

      results.push({
        date: new Date(cur),
        pillar,
        stemGod,
        branchGod,
        isVoid,
        isClash,
        score,
        reasons,
      });
    }
    cur.setDate(cur.getDate() + 1);
  }

  return results.sort((a, b) => b.score - a.score || a.date.getTime() - b.date.getTime());
}

export interface SajuCalcResult {
  detail: FourPillarsDetail | null;
  error: string | null;
}

/** calculateFourPillars 를 감싸 예외를 결과 객체로 반환한다 (렌더 중 setState 없이 사용하기 위함). */
export function safeCalculateFourPillars(input: BirthInfo): SajuCalcResult {
  try {
    return { detail: calculateFourPillars(input), error: null };
  } catch (e) {
    return { detail: null, error: e instanceof Error ? e.message : "계산 중 오류가 발생했습니다." };
  }
}

export function elementCounts(detail: FourPillarsDetail): Record<FiveElement, number> {
  const counts: Record<FiveElement, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  const pairs = [detail.yearElement, detail.monthElement, detail.dayElement, detail.hourElement];
  for (const p of pairs) {
    counts[p.stem]++;
    counts[p.branch]++;
  }
  return counts;
}

export function yinYangCounts(detail: FourPillarsDetail): Record<YinYang, number> {
  const counts: Record<YinYang, number> = { 양: 0, 음: 0 };
  const pairs = [detail.yearYinYang, detail.monthYinYang, detail.dayYinYang, detail.hourYinYang];
  for (const p of pairs) {
    counts[p.stem]++;
    counts[p.branch]++;
  }
  return counts;
}

export interface Complement {
  element: FiveElement;
  /** 채워주는 쪽 */
  giver: "a" | "b";
  text: string;
}

/**
 * 두 사람의 오행 분포를 비교해, 한쪽이 부족한 오행을 다른 쪽이 채워주는 관계를 찾는다.
 * (내가 0~1개인 오행을 상대가 2개 이상 갖고 있으면 보완 관계로 본다)
 */
export function findComplements(
  aCounts: Record<FiveElement, number>,
  bCounts: Record<FiveElement, number>,
): Complement[] {
  const result: Complement[] = [];
  for (const element of Object.keys(aCounts) as FiveElement[]) {
    if (aCounts[element] <= 1 && bCounts[element] >= 2) {
      result.push({
        element,
        giver: "b",
        text: `내게 부족한 ${element} 기운을 상대가 넉넉히 갖고 있어, ${ELEMENT_LACK_HINT[element]}`,
      });
    } else if (bCounts[element] <= 1 && aCounts[element] >= 2) {
      result.push({
        element,
        giver: "a",
        text: `상대에게 부족한 ${element} 기운을 내가 갖고 있어, ${ELEMENT_LACK_HINT[element]}`,
      });
    }
  }
  return result;
}

const ELEMENT_LACK_HINT: Record<FiveElement, string> = {
  목: "새로운 시작과 추진력을 서로 북돋아 줘요.",
  화: "표현과 활기를 더해주는 관계가 돼요.",
  토: "안정감과 중심을 잡아주는 역할을 해요.",
  금: "결단과 마무리를 도와주는 관계가 돼요.",
  수: "유연한 사고와 여유를 더해줘요.",
};

export interface CalendarConversion {
  label: string;
  error: string | null;
}

/**
 * 입력한 생년월일의 반대쪽 달력(양력↔음력) 날짜를 문자열로 변환한다.
 * 지원 범위를 벗어나면 error 메시지를 반환한다.
 */
export function convertCalendar(birth: {
  year: number;
  month: number;
  day: number;
  isLunar?: boolean;
  isLeapMonth?: boolean;
}): CalendarConversion {
  try {
    if (birth.isLunar) {
      if (birth.year < LUNAR_MIN_YEAR || birth.year > LUNAR_MAX_YEAR) {
        return { label: "", error: `음력 변환 지원 범위(${LUNAR_MIN_YEAR}~${LUNAR_MAX_YEAR}년)를 벗어났습니다.` };
      }
      const solar: SolarDate = lunarToSolar(birth.year, birth.month, birth.day, Boolean(birth.isLeapMonth));
      return { label: `양력 ${solar.year}. ${solar.month}. ${solar.day}.`, error: null };
    }
    if (!isValidSolarDate(birth.year, birth.month, birth.day)) {
      return { label: "", error: "올바른 양력 날짜가 아닙니다." };
    }
    if (birth.year < LUNAR_MIN_YEAR || birth.year > LUNAR_MAX_YEAR) {
      return { label: "", error: `음력 변환 지원 범위(${LUNAR_MIN_YEAR}~${LUNAR_MAX_YEAR}년)를 벗어났습니다.` };
    }
    const lunar: LunarDate = solarToLunar(birth.year, birth.month, birth.day);
    return {
      label: `음력 ${lunar.year}. ${lunar.month}. ${lunar.day}.${lunar.isLeapMonth ? " (윤달)" : ""}`,
      error: null,
    };
  } catch (e) {
    return { label: "", error: e instanceof Error ? e.message : "변환 중 오류가 발생했습니다." };
  }
}

export type { BirthInfo, FourPillarsDetail, Pillar, HeavenlyStem, EarthlyBranch, TenGod, FiveElement, YinYang };
