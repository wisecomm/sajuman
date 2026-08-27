"use client";

import { useEffect, useState } from "react";

export interface DateParts {
  year: number;
  month: number;
  day: number;
}

export function todayParts(): DateParts {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

export function sameDate(a: DateParts, b: DateParts): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function toDate(p: DateParts): Date {
  return new Date(p.year, p.month - 1, p.day, 12, 0, 0, 0);
}

/**
 * 오늘 날짜를 돌려주되, 날짜가 바뀌면 알아서 갱신한다.
 *
 * 탭을 열어둔 채 자정을 넘기거나, 잠자기에서 깨어난 뒤 다시 돌아왔을 때
 * 어제 날짜가 남아 있지 않도록 자정 타이머와 포커스 복귀를 함께 본다.
 */
export function useToday(): DateParts {
  const [today, setToday] = useState<DateParts>(todayParts);

  useEffect(() => {
    const refresh = () => setToday((prev) => {
      const next = todayParts();
      return sameDate(prev, next) ? prev : next;
    });

    let timer: number;
    const scheduleMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
      timer = window.setTimeout(() => {
        refresh();
        scheduleMidnight();
      }, nextMidnight.getTime() - now.getTime());
    };
    scheduleMidnight();

    // 절전/백그라운드에서 타이머가 밀릴 수 있으니 돌아올 때 한 번 더 확인한다
    const onVisible = () => {
      if (!document.hidden) refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return today;
}
