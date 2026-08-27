"use client";

import { LIFE_STAGE_ENERGY, type LifeStage } from "@/lib/saju-advanced";

export interface EnergyPoint {
  age: number;
  stage: LifeStage;
  korean: string;
}

const W = 620;
const H = 180;
const PAD_X = 28;
const PAD_TOP = 26;
const PAD_BOTTOM = 42;

export default function LifeEnergyChart({
  points,
  activeIndex,
  onSelect,
}: {
  points: EnergyPoint[];
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  if (points.length === 0) return null;

  const plotW = W - PAD_X * 2;
  const plotH = H - PAD_TOP - PAD_BOTTOM;
  const step = points.length > 1 ? plotW / (points.length - 1) : 0;
  // 십이운성 기운값은 1~10 범위
  const y = (energy: number) => PAD_TOP + plotH - ((energy - 1) / 9) * plotH;
  const x = (i: number) => PAD_X + i * step;

  const coords = points.map((p, i) => ({ x: x(i), y: y(LIFE_STAGE_ENERGY[p.stage]), ...p }));
  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${PAD_TOP + plotH} L ${coords[0].x} ${PAD_TOP + plotH} Z`;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[520px]" role="img" aria-label="대운 기운 흐름">
        <defs>
          <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill="url(#energyFill)" />
        <path d={linePath} fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinejoin="round" />

        {coords.map((c, i) => {
          const active = i === activeIndex;
          return (
            <g
              key={i}
              onClick={() => onSelect(i)}
              style={{ cursor: "pointer" }}
              role="button"
              aria-label={`${c.age}세 ${c.korean} ${c.stage}`}
            >
              {/* 클릭 영역을 넓히기 위한 투명 사각형 */}
              <rect x={c.x - step / 2} y={0} width={Math.max(step, 24)} height={H} fill="transparent" />
              <circle
                cx={c.x}
                cy={c.y}
                r={active ? 6 : 4}
                fill={active ? "var(--brand)" : "var(--card)"}
                stroke="var(--brand)"
                strokeWidth="2"
              />
              <text
                x={c.x}
                y={c.y - 12}
                textAnchor="middle"
                className="fill-current"
                style={{ fontSize: 10, fill: active ? "var(--brand)" : "currentColor", opacity: active ? 1 : 0.5 }}
              >
                {c.stage}
              </text>
              <text
                x={c.x}
                y={H - 22}
                textAnchor="middle"
                style={{ fontSize: 11, fill: "currentColor", opacity: active ? 0.9 : 0.5, fontWeight: active ? 700 : 400 }}
              >
                {c.korean}
              </text>
              <text
                x={c.x}
                y={H - 8}
                textAnchor="middle"
                style={{ fontSize: 9, fill: "currentColor", opacity: 0.4 }}
              >
                {c.age}세
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
