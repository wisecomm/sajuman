/**
 * 전문 명리 항목(지장간·십이운성·신살·격국) 계산.
 *
 * 모두 사주 8글자에서 고정 표로 유도되는 값이라 만세력 라이브러리 없이 계산한다.
 * 각 항목은 "왜 나왔는지(evidence)"와 "무슨 뜻인지(text)"를 함께 반환해,
 * 표만 던지는 전문가용 만세력과 달리 근거를 보여주는 것이 이 모듈의 목적이다.
 */

import {
  getTenGod,
  EARTHLY_BRANCHES,
  type EarthlyBranch,
  type HeavenlyStem,
  type TenGod,
} from "./manseryeok";

const branchIndex = (b: EarthlyBranch) => EARTHLY_BRANCHES.indexOf(b);

/* ------------------------------------------------------------------ *
 * 지장간(支藏干) — 지지 속에 숨은 천간
 * ------------------------------------------------------------------ */

export interface HiddenStems {
  /** 여기(餘氣) — 지난 계절의 남은 기운 */
  initial: HeavenlyStem | null;
  /** 중기(中氣) — 삼합으로 들어온 기운 */
  middle: HeavenlyStem | null;
  /** 정기(正氣) — 그 지지의 본래 기운 */
  main: HeavenlyStem;
}

export const HIDDEN_STEMS: Record<EarthlyBranch, HiddenStems> = {
  자: { initial: "임", middle: null, main: "계" },
  축: { initial: "계", middle: "신", main: "기" },
  인: { initial: "무", middle: "병", main: "갑" },
  묘: { initial: "갑", middle: null, main: "을" },
  진: { initial: "을", middle: "계", main: "무" },
  사: { initial: "무", middle: "경", main: "병" },
  오: { initial: "병", middle: "기", main: "정" },
  미: { initial: "정", middle: "을", main: "기" },
  신: { initial: "무", middle: "임", main: "경" },
  유: { initial: "경", middle: null, main: "신" },
  술: { initial: "신", middle: "정", main: "무" },
  해: { initial: "무", middle: "갑", main: "임" },
};

/** 지장간을 십신과 함께 풀어서 반환한다. */
export function getHiddenStemGods(
  dayMaster: HeavenlyStem,
  branch: EarthlyBranch,
): { stem: HeavenlyStem; god: TenGod; role: string }[] {
  const hidden = HIDDEN_STEMS[branch];
  const rows: { stem: HeavenlyStem; god: TenGod; role: string }[] = [];
  if (hidden.initial) rows.push({ stem: hidden.initial, god: getTenGod(dayMaster, hidden.initial), role: "여기" });
  if (hidden.middle) rows.push({ stem: hidden.middle, god: getTenGod(dayMaster, hidden.middle), role: "중기" });
  rows.push({ stem: hidden.main, god: getTenGod(dayMaster, hidden.main), role: "정기" });
  return rows;
}

/* ------------------------------------------------------------------ *
 * 십이운성(十二運星) — 일간이 각 지지에서 갖는 기운의 세기
 * ------------------------------------------------------------------ */

export const LIFE_STAGES = [
  "장생",
  "목욕",
  "관대",
  "건록",
  "제왕",
  "쇠",
  "병",
  "사",
  "묘",
  "절",
  "태",
  "양",
] as const;

export type LifeStage = (typeof LIFE_STAGES)[number];

/** 십이운성 한자 — '병(病)'이 천간 '병(丙)'과 헷갈리지 않도록 함께 표기한다 */
export const LIFE_STAGE_HANJA: Record<LifeStage, string> = {
  장생: "長生",
  목욕: "沐浴",
  관대: "冠帶",
  건록: "建祿",
  제왕: "帝旺",
  쇠: "衰",
  병: "病",
  사: "死",
  묘: "墓",
  절: "絶",
  태: "胎",
  양: "養",
};

/** 일간별 장생(長生) 지지와 순행/역행 — 양간은 순행, 음간은 역행 */
const LIFE_STAGE_ORIGIN: Record<HeavenlyStem, { birth: EarthlyBranch; forward: boolean }> = {
  갑: { birth: "해", forward: true },
  을: { birth: "오", forward: false },
  병: { birth: "인", forward: true },
  정: { birth: "유", forward: false },
  무: { birth: "인", forward: true },
  기: { birth: "유", forward: false },
  경: { birth: "사", forward: true },
  신: { birth: "자", forward: false },
  임: { birth: "신", forward: true },
  계: { birth: "묘", forward: false },
};

/** 십이운성의 기운 세기 (1~10). 대운 에너지 곡선 시각화에 쓰는 정형화된 값이다. */
export const LIFE_STAGE_ENERGY: Record<LifeStage, number> = {
  장생: 6,
  목욕: 5,
  관대: 8,
  건록: 9,
  제왕: 10,
  쇠: 7,
  병: 5,
  사: 3,
  묘: 2,
  절: 1,
  태: 2,
  양: 4,
};

export const LIFE_STAGE_TEXT: Record<LifeStage, string> = {
  장생: "막 태어나 자라기 시작하는 때예요. 새로 벌이는 일에 힘이 붙어요.",
  목욕: "씻고 다듬어지는 시기예요. 흔들림이 있지만 그만큼 모양이 잡혀요.",
  관대: "옷을 갖춰 입고 세상에 나서는 때예요. 자리를 잡아가는 시기죠.",
  건록: "제 발로 서서 제 몫을 하는 때예요. 가장 단단한 시기 중 하나예요.",
  제왕: "기운이 꼭대기까지 오른 때예요. 밀어붙이면 되는 시기예요.",
  쇠: "정점을 지나 힘을 살짝 덜어내는 때예요. 대신 훨씬 노련해져요.",
  병: "기운이 한풀 꺾여요. 무리하지 말고 몸을 챙길 시기예요.",
  사: "활동을 멈추고 정리하는 때예요. 안을 다지기 좋아요.",
  묘: "거둬서 잘 넣어두는 시기예요. 벌이기보다 지킬 때예요.",
  절: "기운이 바닥까지 끊기는 지점이에요. 대신 여기서부터 다시 시작돼요.",
  태: "새 기운이 막 잉태되는 때예요. 조용히 준비하기 좋아요.",
  양: "뱃속에서 길러지는 시기예요. 아직 안 보여도 힘이 차곡차곡 쌓여요.",
};

/** 일간이 특정 지지에서 갖는 십이운성을 구한다. */
export function getLifeStage(dayMaster: HeavenlyStem, branch: EarthlyBranch): LifeStage {
  const { birth, forward } = LIFE_STAGE_ORIGIN[dayMaster];
  const diff = forward
    ? branchIndex(branch) - branchIndex(birth)
    : branchIndex(birth) - branchIndex(branch);
  return LIFE_STAGES[((diff % 12) + 12) % 12];
}

/* ------------------------------------------------------------------ *
 * 신살(神煞) — 사주에 붙는 특수 별
 * ------------------------------------------------------------------ */

export interface Sinsal {
  name: string;
  hanja: string;
  /** 어느 글자에서 나왔는지 — 근거 표시용 */
  evidence: string;
  text: string;
  tone: "good" | "neutral";
}

/** 천을귀인(天乙貴人) — 일간 기준. "갑무경 우양, 을기 서후, 병정 저계, 임계 토사, 신 마호" */
const NOBLEMAN: Record<HeavenlyStem, EarthlyBranch[]> = {
  갑: ["축", "미"],
  무: ["축", "미"],
  경: ["축", "미"],
  을: ["자", "신"],
  기: ["자", "신"],
  병: ["해", "유"],
  정: ["해", "유"],
  임: ["묘", "사"],
  계: ["묘", "사"],
  신: ["인", "오"],
};

/** 삼합 그룹별 도화·역마·화개 지지 */
const TRINE_STARS: { group: EarthlyBranch[]; peach: EarthlyBranch; horse: EarthlyBranch; canopy: EarthlyBranch }[] = [
  { group: ["인", "오", "술"], peach: "묘", horse: "신", canopy: "술" },
  { group: ["신", "자", "진"], peach: "유", horse: "인", canopy: "진" },
  { group: ["사", "유", "축"], peach: "오", horse: "해", canopy: "축" },
  { group: ["해", "묘", "미"], peach: "자", horse: "사", canopy: "미" },
];

/** 양인살(羊刃殺) — 양간에만 붙는다 */
const YANGIN: Partial<Record<HeavenlyStem, EarthlyBranch>> = {
  갑: "묘",
  병: "오",
  무: "오",
  경: "유",
  임: "자",
};

/**
 * 사주 네 지지에 붙는 신살을 찾는다.
 * @param dayStem 일간
 * @param yearBranch 연지 (도화·역마·화개의 기준)
 * @param dayBranch 일지 (연지와 함께 기준으로 쓴다)
 * @param allBranches 연·월·일·시 지지 전체
 */
export function findSinsal(
  dayStem: HeavenlyStem,
  yearBranch: EarthlyBranch,
  dayBranch: EarthlyBranch,
  allBranches: EarthlyBranch[],
): Sinsal[] {
  const found: Sinsal[] = [];
  const seen = new Set<string>();
  const push = (s: Sinsal) => {
    if (seen.has(s.name)) return;
    seen.add(s.name);
    found.push(s);
  };

  const nobleBranches = NOBLEMAN[dayStem];
  const matchedNoble = allBranches.filter((b) => nobleBranches.includes(b));
  if (matchedNoble.length > 0) {
    push({
      name: "천을귀인",
      hanja: "天乙貴人",
      evidence: `일간 ${dayStem} + 지지 ${matchedNoble.join(", ")}`,
      text: "어려울 때 손 내밀어 주는 귀인이 따라요. 사주에서 가장 좋게 보는 별이에요.",
      tone: "good",
    });
  }

  for (const base of [yearBranch, dayBranch]) {
    const trine = TRINE_STARS.find((t) => t.group.includes(base));
    if (!trine) continue;
    const label = base === yearBranch ? "연지" : "일지";

    if (allBranches.includes(trine.peach)) {
      push({
        name: "도화살",
        hanja: "桃花殺",
        evidence: `${label} ${base} 기준 + 지지 ${trine.peach}`,
        text: "사람을 끌어당기는 매력이 있어요. 예술·서비스 분야에서 특히 힘이 돼요.",
        tone: "good",
      });
    }
    if (allBranches.includes(trine.horse)) {
      push({
        name: "역마살",
        hanja: "驛馬殺",
        evidence: `${label} ${base} 기준 + 지지 ${trine.horse}`,
        text: "이동과 변화의 별이에요. 여행·이사·해외활동처럼 움직임이 많은 삶과 인연이 있어요.",
        tone: "neutral",
      });
    }
    if (allBranches.includes(trine.canopy)) {
      push({
        name: "화개살",
        hanja: "華蓋殺",
        evidence: `${label} ${base} 기준 + 지지 ${trine.canopy}`,
        text: "학문·예술·종교처럼 깊이 파고드는 기운이에요. 혼자 몰입할 때 힘이 나요.",
        tone: "neutral",
      });
    }
  }

  const yanginBranch = YANGIN[dayStem];
  if (yanginBranch && allBranches.includes(yanginBranch)) {
    push({
      name: "양인살",
      hanja: "羊刃殺",
      evidence: `일간 ${dayStem} + 지지 ${yanginBranch}`,
      text: "칼처럼 날 선 추진력이에요. 결단이 빠른 대신, 그 힘을 어디에 쓸지 잘 정해야 해요.",
      tone: "neutral",
    });
  }

  return found;
}

/* ------------------------------------------------------------------ *
 * 격국(格局) — 월지 정기의 십신으로 사주의 큰 틀을 본다
 * ------------------------------------------------------------------ */

export interface Gyukguk {
  name: string;
  evidence: string;
  text: string;
}

const GYUKGUK_TEXT: Record<string, string> = {
  건록격: "제 힘으로 자리를 만들어가는 자립형이에요. 남에게 기대기보다 실력으로 승부하는 삶이 잘 맞아요.",
  양인격: "기운이 세고 결단력이 뛰어난 유형이에요. 그 힘을 쓸 무대만 찾으면 크게 터져요.",
  식신격: "먹고사는 복과 표현력을 타고났어요. 여유롭게 재능을 펼치는 삶이 어울려요.",
  상관격: "재능이 뛰어나고 기존 틀을 바꾸려는 힘이 강해요. 전문성·창작 분야에서 빛을 봐요.",
  편재격: "넓게 벌이고 크게 굴리는 사업가형이에요. 활동 반경이 넓을수록 유리해요.",
  정재격: "성실하게 쌓아 올리는 안정형이에요. 꾸준함이 그대로 가장 큰 자산이 돼요.",
  편관격: "압박을 이겨내며 크는 유형이에요. 만만치 않은 환경일수록 실력이 드러나요.",
  정관격: "원칙과 책임을 중시하는 조직형이에요. 명예를 쌓아가는 자리에서 안정감을 느껴요.",
  편인격: "생각하는 방식이 남달라요. 남들이 잘 안 가는 전문 분야에서 강점이 나와요.",
  정인격: "배우고 익혀 차곡차곡 쌓는 유형이에요. 학문·자격·문서와 인연이 깊어요.",
};

/** 월지 정기(지장간 본기)의 십신으로 격국을 판정한다. */
export function getGyukguk(dayMaster: HeavenlyStem, monthBranch: EarthlyBranch): Gyukguk {
  const mainStem = HIDDEN_STEMS[monthBranch].main;
  const god = getTenGod(dayMaster, mainStem);
  const name = god === "비견" ? "건록격" : god === "겁재" ? "양인격" : `${god}격`;
  return {
    name,
    evidence: `월지 ${monthBranch}의 정기 ${mainStem} → 일간 ${dayMaster} 기준 ${god}`,
    text: GYUKGUK_TEXT[name] ?? "월지를 기준으로 본 사주의 큰 틀이에요.",
  };
}

/* ------------------------------------------------------------------ *
 * 원진(怨嗔) — 궁합에서 보는 껄끄러운 지지 관계
 * ------------------------------------------------------------------ */

export const BRANCH_RESENTMENT: Record<EarthlyBranch, EarthlyBranch> = {
  자: "미",
  미: "자",
  축: "오",
  오: "축",
  인: "유",
  유: "인",
  묘: "신",
  신: "묘",
  진: "해",
  해: "진",
  사: "술",
  술: "사",
};
