/**
 * 절기(節氣) 기준 시간 계산.
 *
 * 사주에서 해와 달은 달력이 아니라 절기로 바뀐다.
 * - 사주 연도는 1월 1일이 아니라 입춘(立春)에 바뀐다.
 * - 사주 월은 매월 1일이 아니라 절(節)에 바뀐다 (인월은 입춘, 묘월은 경칩…).
 *
 * 라이브러리가 주는 절입 시각은 UTC 절대 순간이므로, 한국 달력 필드로 바꿔
 * calculateFourPillars 에 넘긴다.
 */

import { calculateFourPillars, getSolarTerm, type Pillar } from "./manseryeok";

const KST_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export interface KstParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

/** UTC 절대 순간을 한국 시각(KST)의 달력 필드로 바꾼다. */
export function toKstParts(date: Date): KstParts {
  const parts = KST_FORMAT.formatToParts(date);
  const pick = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    hour: pick("hour"),
    minute: pick("minute"),
  };
}

/** 절입 시각을 "2026년 2월 4일 11:52" 형태로 표기한다 (KST 기준). */
export function formatKst(date: Date): string {
  const p = toKstParts(date);
  const mm = String(p.minute).padStart(2, "0");
  return `${p.year}년 ${p.month}월 ${p.day}일 ${p.hour}:${mm}`;
}

/** 해당 연도의 입춘(立春) 절입 순간 — 사주 연도가 바뀌는 지점 */
export function getIpchun(year: number): Date {
  return getSolarTerm(year, 2).date;
}

/**
 * 주어진 시각이 속한 사주 연도를 구한다.
 * 1월 1일이 아니라 입춘을 기준으로 하므로, 1~2월 초는 아직 전년도다.
 */
export function getSajuYear(at: Date = new Date()): number {
  const calendarYear = toKstParts(at).year;
  return at.getTime() < getIpchun(calendarYear).getTime() ? calendarYear - 1 : calendarYear;
}

/* ------------------------------------------------------------------ *
 * 월운(月運) — 절기로 나뉘는 12개월
 * ------------------------------------------------------------------ */

/** 월의 시작을 정하는 절(節)의 인덱스 — 입춘(2)부터 대설(22)까지 */
const MONTH_START_TERMS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

export interface MonthPillarInfo {
  /** 1 = 인월(입춘~) … 12 = 축월(소한~) */
  order: number;
  /** 이 달을 여는 절기 이름 */
  termName: string;
  termHanja: string;
  /** 절입 순간 (이 달의 시작) */
  start: Date;
  /** 다음 절입 순간 (이 달의 끝) */
  end: Date;
  pillar: Pillar;
}

/**
 * 사주 연도(입춘~다음 입춘) 안의 12개 절기월과 각 월주를 구한다.
 *
 * 월주는 직접 유도하지 않고, 각 절기월의 한가운데 날짜를 만세력에 넣어
 * 라이브러리가 계산한 값을 그대로 쓴다.
 */
export function getMonthPillars(sajuYear: number): MonthPillarInfo[] {
  const boundaries = MONTH_START_TERMS.map((index) => getSolarTerm(sajuYear, index));
  // 축월은 다음 해 소한(0)에 시작해서 다음 해 입춘(2)에 끝난다
  boundaries.push(getSolarTerm(sajuYear + 1, 0));
  const nextIpchun = getIpchun(sajuYear + 1);

  return boundaries.map((term, i) => {
    const start = term.date;
    const end = i + 1 < boundaries.length ? boundaries[i + 1].date : nextIpchun;
    const middle = new Date((start.getTime() + end.getTime()) / 2);
    const kst = toKstParts(middle);
    const pillar = calculateFourPillars({
      year: kst.year,
      month: kst.month,
      day: kst.day,
      hour: 12,
      minute: 0,
    }).month;

    return {
      order: i + 1,
      termName: term.name,
      termHanja: term.hanja,
      start,
      end,
      pillar,
    };
  });
}

/** 주어진 시각이 몇 번째 절기월에 있는지 (없으면 -1) */
export function findCurrentMonthIndex(months: MonthPillarInfo[], at: Date = new Date()): number {
  const t = at.getTime();
  return months.findIndex((m) => t >= m.start.getTime() && t < m.end.getTime());
}
