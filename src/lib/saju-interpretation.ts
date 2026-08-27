import {
  getBranchTenGod,
  getTenGod,
  type FiveElement,
  type FourPillarsDetail,
  type Gender,
  type HeavenlyStem,
  type Pillar,
  type TenGod,
} from "./manseryeok";

/* ------------------------------------------------------------------ *
 * 나이대 — 같은 사주도 나이에 따라 읽는 각도가 달라진다
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 * 한글 조사 — 받침 유무에 따라 이/가, 은/는, 을/를, 와/과를 고른다
 * ------------------------------------------------------------------ */

function hasBatchim(word: string): boolean {
  const code = word.charCodeAt(word.length - 1);
  if (Number.isNaN(code) || code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

const JOSA_PAIRS = {
  이가: ["이", "가"],
  은는: ["은", "는"],
  을를: ["을", "를"],
  와과: ["과", "와"],
} as const;

/** 앞 단어의 받침에 맞는 조사를 붙여 돌려준다. 예: josa("화", "이가") → "화가" */
export function josa(word: string, type: keyof typeof JOSA_PAIRS): string {
  const [withBatchim, withoutBatchim] = JOSA_PAIRS[type];
  return `${word}${hasBatchim(word) ? withBatchim : withoutBatchim}`;
}

export type AgeBracket = "청소년" | "청년" | "중년" | "장년";

export const AGE_BRACKETS: { key: AgeBracket; label: string }[] = [
  { key: "청소년", label: "청소년기 (~19세)" },
  { key: "청년", label: "청년기 (20~34세)" },
  { key: "중년", label: "중년기 (35~54세)" },
  { key: "장년", label: "장년기 (55세~)" },
];

export function getAgeBracket(age: number): AgeBracket {
  if (age < 20) return "청소년";
  if (age < 35) return "청년";
  if (age < 55) return "중년";
  return "장년";
}

/** 생년월일로 현재 만 나이를 구한다. */
export function currentApproxAge(year: number, month: number, day: number): number {
  const now = new Date();
  let age = now.getFullYear() - year;
  const hadBirthday =
    now.getMonth() + 1 > month || (now.getMonth() + 1 === month && now.getDate() >= day);
  if (!hadBirthday) age -= 1;
  return Math.max(age, 0);
}

/* ------------------------------------------------------------------ *
 * 일간 성격
 * ------------------------------------------------------------------ */

export const DAY_STEM_PERSONALITY: Record<HeavenlyStem, { title: string; text: string }> = {
  갑: {
    title: "큰 나무(甲木)",
    text: "하늘로 곧게 자라는 큰 나무예요. 정직하고 앞장서는 걸 좋아하지만, 한번 방향을 정하면 잘 안 굽혀요.",
  },
  을: {
    title: "화초·덩굴(乙木)",
    text: "바위도 타고 넘는 덩굴이에요. 어디든 부드럽게 적응하지만, 속상한 일은 혼자 삭이는 편이에요.",
  },
  병: {
    title: "태양(丙火)",
    text: "환하게 비추는 태양이에요. 어디 있든 눈에 띄고 사람이 모이지만, 감정이 앞서 성급해질 때가 있어요.",
  },
  정: {
    title: "촛불·등불(丁火)",
    text: "은은하게 오래 타는 촛불이에요. 곁에 있는 사람을 세심하게 챙기지만, 속으로 걱정이 많아요.",
  },
  무: {
    title: "큰 산(戊土)",
    text: "묵직하게 자리를 지키는 산이에요. 믿음직하고 품이 넓지만, 한번 자리 잡으면 잘 안 움직여요.",
  },
  기: {
    title: "논밭(己土)",
    text: "곡식을 길러내는 기름진 밭이에요. 남을 잘 챙기지만, 참고 맞춰주다 손해를 보기도 해요.",
  },
  경: {
    title: "무쇠·바위(庚金)",
    text: "아직 다듬지 않은 무쇠예요. 결단이 빠르고 의리가 있지만, 융통성이 아쉬울 때가 있어요.",
  },
  신: {
    title: "보석(辛金)",
    text: "정교하게 세공된 보석이에요. 감각이 예리하고 깔끔하지만, 작은 것에도 예민하게 반응해요.",
  },
  임: {
    title: "큰 바다(壬水)",
    text: "끝이 안 보이는 넓은 바다예요. 스케일이 크고 자유롭지만, 한곳에 머무는 걸 답답해해요.",
  },
  계: {
    title: "이슬·샘물(癸水)",
    text: "조용히 스며드는 샘물이에요. 눈치가 빠르고 속을 깊이 들여다보지만, 생각이 많아요.",
  },
};

/* ------------------------------------------------------------------ *
 * 오행 과다·부족
 * ------------------------------------------------------------------ */

export const ELEMENT_EXCESS_TEXT: Record<FiveElement, string> = {
  목: "밀고 나가는 힘이 넘쳐요. 대신 고집이 세져서 방향을 바꾸기 어려울 때가 있어요.",
  화: "열정이 활활 타올라요. 대신 급해지고 감정 기복이 커질 수 있어요.",
  토: "든든하고 흔들림이 적어요. 대신 변화를 꺼려 제자리에 머물 수 있어요.",
  금: "칼같이 정확하고 결단이 빨라요. 대신 차갑게 보일 수 있어요.",
  수: "머리가 잘 돌아가고 융통성이 좋아요. 대신 생각이 많아 결정을 미룰 수 있어요.",
};

export const ELEMENT_LACK_TEXT: Record<FiveElement, string> = {
  목: "새로 시작하는 힘이 약한 편이에요. 첫발을 떼는 게 늘 제일 어렵게 느껴져요.",
  화: "나서서 드러내는 걸 어려워해요. 잘해놓고도 표현을 안 해 손해 볼 때가 있어요.",
  토: "중심을 잡아주는 힘이 약해요. 흔들릴 때 붙잡아 줄 나만의 루틴이 있으면 큰 도움이 돼요.",
  금: "맺고 끊는 걸 어려워해요. 시작한 일을 끝까지 마무리하는 게 숙제예요.",
  수: "유연하게 돌아가는 힘이 약해요. 한 방향으로만 보기 쉬우니 가끔 한 발 물러서면 좋아요.",
};

/* ------------------------------------------------------------------ *
 * 십신 — 나이대별로 가리키는 대상이 달라진다
 * ------------------------------------------------------------------ */

export type TenGodGroup = "비겁" | "식상" | "재성" | "관성" | "인성";

export const TEN_GOD_MEANING: Record<
  TenGod,
  { group: TenGodGroup; text: string; byAge: Record<AgeBracket, string> }
> = {
  비견: {
    group: "비겁",
    text: "자립심과 주체성이 강하고, 대등한 관계에서 힘을 얻어요.",
    byAge: {
      청소년: "친구들 사이에서 휩쓸리지 않고 내 생각을 지켜요. 몰려다니기보다 마음 맞는 몇 명과 깊게 지내는 편이에요.",
      청년: "남이 정해준 길보다 내가 고른 길을 가고 싶어 해요. 혼자 힘으로 자리 잡으려는 뚝심이 있어요.",
      중년: "누가 시키지 않아도 알아서 굴러가는 사람이에요. 다만 다 짊어지려다 지칠 수 있으니 나눠 맡기는 연습이 필요해요.",
      장년: "나이가 들어도 남에게 기대지 않는 힘이 있어요. 또래·동료와 어울릴 때 기운이 확 살아나요.",
    },
  },
  겁재: {
    group: "비겁",
    text: "추진력과 경쟁심이 강한 대신, 돈이 얽히는 관계는 조심할 필요가 있어요.",
    byAge: {
      청소년: "지기 싫어하는 승부욕이 있어요. 경쟁이 좋은 자극이 되지만, 친구와 비교하다 지칠 수도 있어요.",
      청년: "추진력이 좋아 일을 크게 벌여요. 다만 돈 문제는 친구·동업자와 얽히지 않게 선을 그어두면 좋아요.",
      중년: "밀어붙이는 힘이 강해요. 보증이나 동업처럼 돈이 걸린 일은 한 번 더 확인하고 가는 게 좋아요.",
      장년: "여전히 활동적이고 의욕이 있어요. 큰돈이 오가는 결정만큼은 서두르지 않는 편이 나아요.",
    },
  },
  식신: {
    group: "식상",
    text: "여유와 표현력, 먹고사는 복을 뜻해요.",
    byAge: {
      청소년: "먹는 것도 노는 것도 즐길 줄 알아요. 좋아하는 걸 파고들 때 실력이 확 늘어요.",
      청년: "느긋하고 붙임성이 좋아요. 취미가 자연스럽게 일이 되는 흐름과 잘 맞아요.",
      중년: "여유가 있고 사람을 편하게 해줘요. 먹고사는 걱정이 크게 없는 흐름이에요.",
      장년: "취미와 모임에서 활기를 얻어요. 잘 먹고 잘 노는 게 그대로 건강이 되는 타입이에요.",
    },
  },
  상관: {
    group: "식상",
    text: "재능이 뛰어난 대신, 규율·권위와는 부딪히기 쉬워요.",
    byAge: {
      청소년: "말도 잘하고 아이디어도 톡톡 튀어요. 다만 '왜요?'가 많아 어른들과 부딪힐 수 있어요.",
      청년: "재능이 눈에 띄어요. 틀에 박힌 조직보다 실력으로 승부하는 자리가 훨씬 잘 맞아요.",
      중년: "전문성이 가장 큰 무기예요. 하고 싶은 말을 조금만 다듬으면 인정받는 폭이 훨씬 넓어져요.",
      장년: "오래 쌓아온 안목이 있어요. 가르치거나 나누는 자리에서 제일 빛나요.",
    },
  },
  편재: {
    group: "재성",
    text: "크게 벌이고 굴리는 사업가형 재물 감각이에요.",
    byAge: {
      청소년: "돈 감각이 빨라요. 용돈을 굴리거나 뭔가 만들어 파는 데 흥미를 느껴요.",
      청년: "기회를 잘 포착해요. 월급 하나보다 여러 갈래로 벌 때 더 신이 나는 타입이에요.",
      중년: "판을 크게 벌이는 기질이에요. 활동 반경이 넓을수록 유리해요.",
      장년: "돈을 굴리는 감각이 여전해요. 다만 이 시기엔 늘리기보다 지키는 쪽이 실속 있어요.",
    },
  },
  정재: {
    group: "재성",
    text: "성실하게 모으는 안정적인 재물 감각이에요.",
    byAge: {
      청소년: "용돈을 계획해서 써요. 저금통이 잘 채워지는 스타일이에요.",
      청년: "성실하게 모으는 힘이 있어요. 첫 월급부터 차곡차곡 쌓아가는 타입이에요.",
      중년: "꾸준함이 최고의 자산이에요. 크게 터뜨리기보다 안정적으로 불려가는 흐름이에요.",
      장년: "쌓아온 걸 지키고 관리하는 힘이 좋아요. 노후 준비가 탄탄한 편이에요.",
    },
  },
  편관: {
    group: "관성",
    text: "도전 정신이 강한 대신, 압박과 스트레스도 함께 짊어져요.",
    byAge: {
      청소년: "규칙이 빡빡한 환경에서 스트레스를 받지만, 그만큼 버티는 힘도 같이 길러져요.",
      청년: "경쟁이 치열한 곳에서 오히려 실력이 드러나요. 압박을 성장으로 바꾸는 타입이에요.",
      중년: "책임이 무겁게 얹히는 자리예요. 잘 해내는 만큼 몸과 마음도 꼭 챙겨야 해요.",
      장년: "여전히 도전 정신이 살아 있어요. 무리하지 않는 선에서 쓰면 좋은 활력이 돼요.",
    },
  },
  정관: {
    group: "관성",
    text: "책임감과 명예를 중시하는 조직형 기운이에요.",
    byAge: {
      청소년: "규칙을 잘 지키고 맡은 일을 해내요. 선생님이 믿고 맡기는 학생이에요.",
      청년: "책임감이 강해 조직에서 신뢰를 얻어요. 안정적인 직장과 잘 맞아요.",
      중년: "'믿고 맡기는 사람'이 되는 시기예요. 명예와 직책이 자연스럽게 따라와요.",
      장년: "쌓아온 신뢰가 그대로 자산이에요. 어른 노릇을 부탁받는 자리가 늘어나요.",
    },
  },
  편인: {
    group: "인성",
    text: "독창적인 사고와 직관으로 깊이 파고드는 기운이에요.",
    byAge: {
      청소년: "남들과 다른 방식으로 이해해요. 관심 없는 과목은 손을 놓지만, 한번 꽂히면 끝까지 파요.",
      청년: "직관이 예리해요. 남들이 잘 안 가는 전문 분야에서 강점이 나와요.",
      중년: "깊이 파고드는 힘이 있어요. 자격과 전문성으로 승부하는 흐름이에요.",
      장년: "사색과 공부가 즐거운 시기예요. 종교·철학·예술 쪽으로 마음이 갑니다.",
    },
  },
  정인: {
    group: "인성",
    text: "배우고 쌓아가는 힘과 윗사람의 도움을 뜻해요.",
    byAge: {
      청소년: "배우는 걸 잘 받아들여요. 시험운이 따르고, 어른들이 잘 챙겨줘요.",
      청년: "차근차근 쌓아 올리는 힘이 있어요. 자격증과 학위가 좋은 무기가 돼요.",
      중년: "문서·계약운이 좋아요. 집이나 자격증처럼 종이로 남는 것과 인연이 깊어요.",
      장년: "배움을 놓지 않는 사람이에요. 어머니와 윗사람의 덕이 오래 남아요.",
    },
  },
};

/** 나이대가 주어지면 그에 맞는 문장을, 없으면 일반 문장을 돌려준다. */
export function tenGodText(god: TenGod, bracket?: AgeBracket): string {
  const info = TEN_GOD_MEANING[god];
  return bracket ? info.byAge[bracket] : info.text;
}

/* ------------------------------------------------------------------ *
 * 육친(六親) — 십신이 가리키는 사람. 성별에 따라 달라진다
 * ------------------------------------------------------------------ */

export const SIX_RELATIVES: Record<TenGodGroup, Record<Gender, string>> = {
  비겁: { male: "형제·친구·동료", female: "형제·친구·동료" },
  식상: { male: "아랫사람·제자", female: "자녀" },
  재성: { male: "아버지·배우자", female: "아버지" },
  관성: { male: "자녀", female: "배우자" },
  인성: { male: "어머니·윗사람", female: "어머니·윗사람" },
};

/** 나이대별로 관심이 큰 육친(십신 그룹) — 앞에 오는 것일수록 그 시기에 중요하다 */
export const AGE_RELATIVE_FOCUS: Record<AgeBracket, TenGodGroup[]> = {
  청소년: ["인성", "비겁"],
  청년: ["재성", "관성", "비겁"],
  중년: ["관성", "식상", "재성"],
  장년: ["식상", "관성", "비겁"],
};

/* ------------------------------------------------------------------ *
 * 실생활 분야 — 십신 그룹을 다섯 갈래로
 * ------------------------------------------------------------------ */

export type LifeCategory = "재물운" | "직업·명예운" | "학업·문서운" | "표현력·활동운" | "자아·경쟁운";

export const LIFE_CATEGORY_ORDER: LifeCategory[] = [
  "재물운",
  "직업·명예운",
  "학업·문서운",
  "표현력·활동운",
  "자아·경쟁운",
];

export const GROUP_LIFE_CATEGORY: Record<TenGodGroup, LifeCategory> = {
  재성: "재물운",
  관성: "직업·명예운",
  인성: "학업·문서운",
  식상: "표현력·활동운",
  비겁: "자아·경쟁운",
};

/** 나이대별로 관심이 큰 분야 순서 — 리포트 정렬에 쓴다 */
export const AGE_CATEGORY_PRIORITY: Record<AgeBracket, LifeCategory[]> = {
  청소년: ["학업·문서운", "자아·경쟁운", "표현력·활동운", "직업·명예운", "재물운"],
  청년: ["직업·명예운", "학업·문서운", "재물운", "자아·경쟁운", "표현력·활동운"],
  중년: ["재물운", "직업·명예운", "표현력·활동운", "자아·경쟁운", "학업·문서운"],
  장년: ["재물운", "표현력·활동운", "자아·경쟁운", "직업·명예운", "학업·문서운"],
};

/** 나이대에 맞게 분야를 정렬한다 (관심 큰 순). */
export function categoriesForAge(bracket: AgeBracket): LifeCategory[] {
  return AGE_CATEGORY_PRIORITY[bracket];
}

export const LIFE_CATEGORY_TEXT: Record<LifeCategory, { strong: string; weak: string }> = {
  재물운: {
    strong: "돈이 들어오고 나가는 흐름을 읽는 감각이 좋아요. 기회다 싶으면 잘 잡아요.",
    weak: "돈 감각보다 다른 데 강점이 있는 타입이에요. 자동이체처럼 알아서 굴러가는 장치를 만들어두면 편해요.",
  },
  "직업·명예운": {
    strong: "맡은 일을 끝까지 해내서 '믿고 맡기는 사람'이 돼요.",
    weak: "정해진 틀보다 자유로운 자리가 잘 맞아요. 조직 생활은 조금 답답하게 느낄 수 있어요.",
  },
  "학업·문서운": {
    strong: "배우고 익히는 힘이 좋고, 자격증·계약처럼 종이로 남는 일에 운이 따라요.",
    weak: "책상보다 현장에서 힘을 내는 타입이에요. 짧게 자주 보는 습관이 큰 도움이 돼요.",
  },
  "표현력·활동운": {
    strong: "가진 걸 밖으로 꺼내 보이는 데 능해요. 만들고 표현하는 일에서 두각을 보여요.",
    weak: "먼저 나서기보다 지켜보는 편이에요. 기회가 왔을 때 반 발짝만 나가도 달라져요.",
  },
  "자아·경쟁운": {
    strong: "스스로 길을 여는 힘이 좋아요. 누가 안 시켜도 알아서 해내요.",
    weak: "혼자보다 같이할 때 훨씬 잘해요. 좋은 팀을 만나는 게 곧 실력이 돼요.",
  },
};

/** 십신 목록을 실생활 분야별 개수로 집계한다. */
export function categorizeTenGods(gods: TenGod[]): Record<LifeCategory, number> {
  const counts: Record<LifeCategory, number> = {
    재물운: 0,
    "직업·명예운": 0,
    "학업·문서운": 0,
    "표현력·활동운": 0,
    "자아·경쟁운": 0,
  };
  for (const god of gods) {
    counts[GROUP_LIFE_CATEGORY[TEN_GOD_MEANING[god].group]]++;
  }
  return counts;
}

/* ------------------------------------------------------------------ *
 * 사주 종합 풀이
 * ------------------------------------------------------------------ */

const SUPPORT_GROUPS: TenGod[] = ["비견", "겁재", "편인", "정인"];

export interface RelativeNote {
  group: TenGodGroup;
  relative: string;
  category: LifeCategory;
  count: number;
  text: string;
}

export interface SajuInterpretation {
  dayMasterTitle: string;
  dayMasterText: string;
  strength: "신강" | "신약" | "중화";
  strengthText: string;
  dominantElement: { element: FiveElement; count: number } | null;
  lackingElements: FiveElement[];
  dominantTenGod: { god: TenGod; count: number } | null;
  categoryCounts: Record<LifeCategory, number>;
  strongCategories: LifeCategory[];
  weakCategories: LifeCategory[];
  relatives: RelativeNote[];
  summary: string;
}

export function interpretSaju(
  detail: FourPillarsDetail,
  elementCounts: Record<FiveElement, number>,
  displayName: string,
  bracket: AgeBracket,
  gender: Gender,
): SajuInterpretation {
  const dayMaster = detail.day.heavenlyStem;
  const { title, text } = DAY_STEM_PERSONALITY[dayMaster];

  const chart = detail.tenGods;
  const countable: TenGod[] = [
    chart.year.stem,
    chart.year.branch,
    chart.month.stem,
    chart.month.branch,
    chart.day.branch,
    chart.hour.stem,
    chart.hour.branch,
  ];

  const godCounts: Partial<Record<TenGod, number>> = {};
  for (const god of countable) {
    godCounts[god] = (godCounts[god] ?? 0) + 1;
  }

  const supportCount = countable.filter((g) => SUPPORT_GROUPS.includes(g)).length;
  const drainCount = countable.length - supportCount;

  let strength: SajuInterpretation["strength"];
  let strengthText: string;
  if (supportCount > drainCount) {
    strength = "신강";
    strengthText =
      "나를 돕는 기운(비겁·인성)이 많은 신강한 사주예요. 주체성과 추진력이 강한 만큼, 그 힘을 어디에 쓸지 정하는 게 중요해요.";
  } else if (drainCount > supportCount) {
    strength = "신약";
    strengthText =
      "기운을 쓰는 쪽(식상·재성·관성)이 많은 신약한 사주예요. 무리하게 벌이기보다, 나를 채워주는 사람과 시간을 곁에 두면 훨씬 잘 풀려요.";
  } else {
    strength = "중화";
    strengthText = "돕는 기운과 쓰는 기운이 팽팽하게 균형을 이뤄요. 어느 쪽으로도 치우치지 않은 안정적인 구조예요.";
  }

  const elementEntries = Object.entries(elementCounts) as [FiveElement, number][];
  const maxCount = Math.max(...elementEntries.map(([, c]) => c));
  const dominant = elementEntries.find(([, c]) => c === maxCount && c >= 3);
  const lacking = elementEntries.filter(([, c]) => c === 0).map(([el]) => el);

  const godEntries = Object.entries(godCounts) as [TenGod, number][];
  const maxGodCount = Math.max(...godEntries.map(([, c]) => c));
  const dominantGod = godEntries.find(([, c]) => c === maxGodCount && c >= 2);

  const categoryCounts = categorizeTenGods(countable);
  const ordered = categoriesForAge(bracket);
  const strongCategories = ordered.filter((c) => categoryCounts[c] >= 2);
  const weakCategories = ordered.filter((c) => categoryCounts[c] === 0);

  // 육친 — 나이대에 맞는 관심사 순으로
  const groupCounts: Record<TenGodGroup, number> = { 비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0 };
  for (const god of countable) groupCounts[TEN_GOD_MEANING[god].group]++;

  const relatives: RelativeNote[] = AGE_RELATIVE_FOCUS[bracket].map((group) => {
    const count = groupCounts[group];
    const relative = SIX_RELATIVES[group][gender];
    const text =
      count >= 2
        ? `${josa(relative, "와과")}의 인연이 사주에 뚜렷하게 드러나요. 이 관계에서 얻는 것도, 신경 쓸 일도 많은 편이에요.`
        : count === 0
          ? `${josa(relative, "을를")} 뜻하는 기운이 사주에 없어요. 인연이 옅다기보다, 그쪽에 크게 좌우되지 않고 스스로 풀어가는 편이라고 봐요.`
          : `${josa(relative, "와과")}는 적당한 거리에서 편안하게 지내는 편이에요.`;
    return { group, relative, category: GROUP_LIFE_CATEGORY[group], count, text };
  });

  const nameLabel = displayName ? `${displayName}님은` : "이 사주는";
  const parts = [`${nameLabel} 일간이 ${dayMaster}, ${title}이에요. ${text}`, strengthText];

  if (dominant) parts.push(`오행 중에서는 ${josa(dominant[0], "이가")} 유난히 많아요. ${ELEMENT_EXCESS_TEXT[dominant[0]]}`);
  if (lacking.length > 0) {
    parts.push(`반대로 ${lacking.join(", ")} 기운은 하나도 없어요. ${lacking.map((el) => ELEMENT_LACK_TEXT[el]).join(" ")}`);
  }
  if (dominantGod) parts.push(`십신 중에서는 ${josa(dominantGod[0], "이가")} 두드러져요. ${tenGodText(dominantGod[0], bracket)}`);
  if (strongCategories.length > 0) {
    parts.push(`지금 ${bracket}기에 눈여겨볼 만한 건 ${strongCategories.slice(0, 2).join(", ")}이에요.`);
  }

  return {
    dayMasterTitle: title,
    dayMasterText: text,
    strength,
    strengthText,
    dominantElement: dominant ? { element: dominant[0], count: dominant[1] } : null,
    lackingElements: lacking,
    dominantTenGod: dominantGod ? { god: dominantGod[0], count: dominantGod[1] } : null,
    categoryCounts,
    strongCategories,
    weakCategories,
    relatives,
    summary: parts.join(" "),
  };
}

/* ------------------------------------------------------------------ *
 * 분야별 별점 (일일 운세)
 * ------------------------------------------------------------------ */

export interface CategoryScore {
  category: LifeCategory;
  /** 1~5 별점 */
  stars: number;
  /** 이 점수가 나온 근거 */
  reasons: string[];
}

/**
 * 하루의 십신 조합을 분야별 별점으로 환산한다.
 * 기본 3점에서 시작해, 그날의 천간·지지 십신이 해당 분야를 건드리면 올리고
 * 공망·충 같은 요소가 있으면 전 분야를 함께 낮춘다.
 */
export function dailyCategoryScores(
  stemGod: TenGod,
  branchGod: TenGod,
  modifiers: { isVoid: boolean; isClash: boolean; isUnion: boolean },
  bracket?: AgeBracket,
): CategoryScore[] {
  const stemCat = GROUP_LIFE_CATEGORY[TEN_GOD_MEANING[stemGod].group];
  const branchCat = GROUP_LIFE_CATEGORY[TEN_GOD_MEANING[branchGod].group];
  const order = bracket ? categoriesForAge(bracket) : LIFE_CATEGORY_ORDER;

  return order.map((category) => {
    let score = 3;
    const reasons: string[] = [];

    if (stemCat === category) {
      score += 1;
      reasons.push(`천간 ${stemGod}`);
    }
    if (branchCat === category) {
      score += 1;
      reasons.push(`지지 ${branchGod}`);
    }
    if (modifiers.isUnion) {
      score += 0.5;
      reasons.push("일지와 합(合)");
    }
    if (modifiers.isVoid) {
      score -= 1;
      reasons.push("공망일");
    }
    if (modifiers.isClash) {
      score -= 1;
      reasons.push("일지와 충(沖)");
    }

    return { category, stars: Math.max(1, Math.min(5, Math.round(score))), reasons };
  });
}

/* ------------------------------------------------------------------ *
 * 특정 시점(대운·세운·일진) 풀이
 * ------------------------------------------------------------------ */

export interface PillarInfluence {
  stemGod: TenGod;
  branchGod: TenGod;
  category: LifeCategory | null;
  summary: string;
}

/**
 * 일간 기준으로 임의의 간지가 어떤 십신 조합인지 풀어서 설명한다.
 * 대운·년도별·일일·택일 등 "일간 대비 특정 시점" 해석에 공통으로 쓰인다.
 */
export function describePillarInfluence(
  dayMaster: HeavenlyStem,
  pillar: Pillar,
  label: string,
  bracket?: AgeBracket,
): PillarInfluence {
  const stemGod = getTenGod(dayMaster, pillar.heavenlyStem);
  const branchGod = getBranchTenGod(dayMaster, pillar.earthlyBranch);
  const stemInfo = TEN_GOD_MEANING[stemGod];
  const branchInfo = TEN_GOD_MEANING[branchGod];

  const stemCategory = GROUP_LIFE_CATEGORY[stemInfo.group];
  const branchCategory = GROUP_LIFE_CATEGORY[branchInfo.group];
  const category = stemCategory === branchCategory ? stemCategory : null;
  const categoryNote = category ? ` 한마디로 ${category}이 크게 움직이는 시기예요.` : "";

  const summary =
    stemGod === branchGod
      ? `${label}은 천간·지지 모두 ${stemGod}(${stemInfo.group}) 기운이 겹쳐요. ${tenGodText(stemGod, bracket)}${categoryNote}`
      : `${label}은 천간 ${stemGod}(${stemInfo.group}), 지지 ${branchGod}(${branchInfo.group}) 기운이 함께 흘러요. ${tenGodText(stemGod, bracket)} 여기에 더해, ${tenGodText(branchGod, bracket)}${categoryNote}`;

  return { stemGod, branchGod, category, summary };
}
