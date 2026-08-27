"use client";

import { useEffect, useState } from "react";

export interface StoredBirthInfo {
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  isLunar: boolean;
  isLeapMonth: boolean;
  gender: "male" | "female";
}

export const DEFAULT_BIRTH_INFO: StoredBirthInfo = {
  name: "",
  year: 1990,
  month: 1,
  day: 1,
  hour: 12,
  minute: 0,
  isLunar: false,
  isLeapMonth: false,
  gender: "male",
};

const STORAGE_KEY = "sajuman:my-birth-info";

export function useMyBirthInfo() {
  const [info, setInfo] = useState<StoredBirthInfo>(DEFAULT_BIRTH_INFO);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // localStorage는 서버에 없는 외부 저장소이므로, 하이드레이션 불일치를 피하려면
      // 마운트 이후 이 effect에서 한 번만 동기화해야 한다.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setInfo({ ...DEFAULT_BIRTH_INFO, ...JSON.parse(raw) });
    } catch {
      // localStorage 접근 불가 시 기본값 유지
    }
    setLoaded(true);
  }, []);

  const update = (next: StoredBirthInfo) => {
    setInfo(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 저장 실패 시 무시 (세션 내 상태는 유지됨)
    }
  };

  return { info, update, loaded };
}
