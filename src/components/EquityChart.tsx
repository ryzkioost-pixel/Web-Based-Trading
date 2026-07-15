import { useMemo, useState } from 'react';
import type { TradeComputed } from '../types';
import { fmtRp } from '../format';

const WIDTH = 640;
const HEIGHT = 220;
const PAD_L = 56;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 28;

export function EquityChart({ trades }: { trades: TradeComputed[] }) {
  const points = useMemo(
    () =>
      trades
        .filter((t) => t.cumulativeNet !== null)
        .map((t) => ({ label: t.stock, date: t.exitDate, value: t.cumulativeNet as number })),
    [trades],
  );

  const [hover, setHover] = useState<number | null>(null);

  if (points.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
        No closed trades yet — equity curve will appear once trades are closed.
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const range = max - min || 1;

  const innerW = WIDTH - PAD_L - PAD_R;
  const innerH = HEIGHT - PAD_T - PAD_B;

  const x = (i: number) => PAD_L + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => PAD_T + innerH - ((v - min) / range) * innerH;

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
  const zeroY = y(0);
  const areaPath = `${linePath} L ${x(points.length - 1).toFixed(1)} ${zeroY.toFixed(1)} L ${x(0).toFixed(1)} ${zeroY.toFixed(1)} Z`;

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => min + (range * i) / yTicks);

  return (
    <div className="viz-root relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Cumulative net P/L equity curve across closed trades"
        onMouseLeave={() => setHover(null)}
      >
        {tickValues.map((tv, i) => (
          <g key={i}>
            <line
              x1={PAD_L}
              x2={WIDTH - PAD_R}
              y1={y(tv)}
              y2={y(tv)}
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth={1}
            />
            <text x={PAD_L - 8} y={y(tv)} textAnchor="end" dominantBaseline="middle" className="fill-slate-400 text-[9px] dark:fill-slate-500">
              {fmtRp(tv)}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="#2a78d6" fillOpacity={0.08} stroke="none" />
        <path d={linePath} fill="none" stroke="#2a78d6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="dark:hidden" />
        <path d={linePath} fill="none" stroke="#3987e5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="hidden dark:block" />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(p.value)}
            r={hover === i ? 4.5 : 3}
            className="fill-white stroke-[#2a78d6] dark:fill-slate-900 dark:stroke-[#3987e5]"
            strokeWidth={2}
            onMouseEnter={() => setHover(i)}
          />
        ))}

        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={PAD_T} y2={HEIGHT - PAD_B} stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth={1} strokeDasharray="3 3" />
        )}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-md dark:border-slate-700 dark:bg-slate-800"
          style={{
            left: `${(x(hover) / WIDTH) * 100}%`,
            top: `${(y(points[hover].value) / HEIGHT) * 100}%`,
            transform: 'translate(-50%, -130%)',
          }}
        >
          <div className="font-semibold text-slate-900 dark:text-slate-100">{points[hover].label}</div>
          <div className="text-slate-500 dark:text-slate-400">{fmtRp(points[hover].value)}</div>
        </div>
      )}
    </div>
  );
}
