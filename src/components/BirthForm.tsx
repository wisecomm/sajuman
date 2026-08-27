"use client";

import { type StoredBirthInfo } from "@/lib/use-birth-info";

interface Props {
  value: StoredBirthInfo;
  onChange: (next: StoredBirthInfo) => void;
  showName?: boolean;
  showGender?: boolean;
  idPrefix?: string;
}

const inputCls =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)] dark:bg-white/5 dark:border-white/15";
const labelCls = "mb-1 block text-xs font-medium text-black/60 dark:text-white/60";

export default function BirthForm({ value, onChange, showName = true, showGender = true, idPrefix = "b" }: Props) {
  const set = <K extends keyof StoredBirthInfo>(key: K, v: StoredBirthInfo[K]) => {
    onChange({ ...value, [key]: v });
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {showName && (
        <div className="col-span-2 sm:col-span-3">
          <label className={labelCls} htmlFor={`${idPrefix}-name`}>
            이름 (선택)
          </label>
          <input
            id={`${idPrefix}-name`}
            className={inputCls}
            type="text"
            placeholder="예: 홍길동"
            value={value.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>
      )}

      <div>
        <label className={labelCls} htmlFor={`${idPrefix}-year`}>
          년(양력/음력)
        </label>
        <input
          id={`${idPrefix}-year`}
          className={inputCls}
          type="number"
          value={value.year}
          onChange={(e) => set("year", Number(e.target.value))}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor={`${idPrefix}-month`}>
          월
        </label>
        <input
          id={`${idPrefix}-month`}
          className={inputCls}
          type="number"
          min={1}
          max={12}
          value={value.month}
          onChange={(e) => set("month", Number(e.target.value))}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor={`${idPrefix}-day`}>
          일
        </label>
        <input
          id={`${idPrefix}-day`}
          className={inputCls}
          type="number"
          min={1}
          max={31}
          value={value.day}
          onChange={(e) => set("day", Number(e.target.value))}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor={`${idPrefix}-hour`}>
          시
        </label>
        <input
          id={`${idPrefix}-hour`}
          className={inputCls}
          type="number"
          min={0}
          max={23}
          value={value.hour}
          onChange={(e) => set("hour", Number(e.target.value))}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor={`${idPrefix}-minute`}>
          분
        </label>
        <input
          id={`${idPrefix}-minute`}
          className={inputCls}
          type="number"
          min={0}
          max={59}
          value={value.minute}
          onChange={(e) => set("minute", Number(e.target.value))}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor={`${idPrefix}-calendar`}>
          양/음력
        </label>
        <select
          id={`${idPrefix}-calendar`}
          className={inputCls}
          value={value.isLunar ? "lunar" : "solar"}
          onChange={(e) => set("isLunar", e.target.value === "lunar")}
        >
          <option value="solar">양력</option>
          <option value="lunar">음력</option>
        </select>
      </div>

      {value.isLunar && (
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.isLeapMonth}
              onChange={(e) => set("isLeapMonth", e.target.checked)}
            />
            윤달
          </label>
        </div>
      )}

      {showGender && (
        <div>
          <label className={labelCls} htmlFor={`${idPrefix}-gender`}>
            성별
          </label>
          <select
            id={`${idPrefix}-gender`}
            className={inputCls}
            value={value.gender}
            onChange={(e) => set("gender", e.target.value as "male" | "female")}
          >
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </div>
      )}
    </div>
  );
}
