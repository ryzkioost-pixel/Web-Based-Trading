import { useMemo } from 'react';
import type { RuleConfig, TradeComputed } from '../types';
import { computeTradeSeries } from '../calc';
import { fmtDate, fmtNum, fmtPct, fmtRp } from '../format';
import { Badge, Card, NumberInput } from './ui';
import type { Trade } from '../types';

function StopCell({ trade }: { trade: TradeComputed }) {
  if (trade.stopBreach) return <Badge tone="bad">BREACH-{trade.stopBreach}</Badge>;
  if (trade.stopPct !== null) return <span>{fmtPct(trade.stopPct)}</span>;
  return <span className="text-slate-400">—</span>;
}

function th(label: string) {
  return (
    <th
      key={label}
      className="sticky top-0 whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
    >
      {label}
    </th>
  );
}

export function TradeLog({
  trades,
  rules,
  onUpdate,
  onDelete,
  onRequestClose,
}: {
  trades: Trade[];
  rules: RuleConfig;
  onUpdate: (id: string, patch: Partial<Trade>) => void;
  onDelete: (id: string) => void;
  onRequestClose: (id: string) => void;
}) {
  const computed = useMemo(() => computeTradeSeries(trades, rules), [trades, rules]);

  if (trades.length === 0) {
    return (
      <Card>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No trades logged yet. Use the Calculator tab to log your first trade.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="max-h-[70vh] overflow-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr>
              {[
                'Stock',
                'Sector',
                'Trend',
                'R-Check',
                'Entry Date',
                'Entry',
                'Support',
                'Resistance',
                'Lots',
                'Shares',
                'Risk',
                'Capital',
                'Stop %',
                'Box %',
                'Status',
                'Exit Price',
                'Exit Date',
                'Hold',
                'R-Mult',
                'Net P/L',
                'W/L',
                'Suggested',
                'Size',
                'Cum Net',
                'Drawdown',
                'Compliance',
                '',
              ].map(th)}
            </tr>
          </thead>
          <tbody>
            {computed.map((t) => (
              <tr
                key={t.id}
                className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
              >
                <td className="sticky left-0 whitespace-nowrap bg-white px-3 py-2 font-semibold text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                  {t.stock}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-500 dark:text-slate-400">{t.sector || '—'}</td>
                <td className="whitespace-nowrap px-3 py-2">{t.trend}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  {t.rCheck ? <Badge tone={t.rCheck === 'TAKE' ? 'good' : 'bad'}>{t.rCheck}</Badge> : '—'}
                </td>
                <td className="whitespace-nowrap px-3 py-2">{fmtDate(t.entryDate)}</td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">{fmtRp(t.entryPrice)}</td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">{fmtRp(t.support)}</td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">{fmtRp(t.resistance)}</td>
                <td className="whitespace-nowrap px-2 py-1">
                  <NumberInput
                    value={t.lots ?? ''}
                    onChange={(e) => onUpdate(t.id, { lots: e.target.value === '' ? null : Number(e.target.value) })}
                    className="w-20 !py-1"
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">{fmtNum(t.shares, 0)}</td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">{fmtRp(t.risk)}</td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">{fmtRp(t.capitalDeployed)}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <StopCell trade={t} />
                </td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">{fmtPct(t.boxPosition, 0)}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  {t.exitPrice === null ? (
                    <button
                      onClick={() => onRequestClose(t.id)}
                      className="rounded-md border border-indigo-300 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                    >
                      Close
                    </button>
                  ) : (
                    <Badge tone="neutral">Closed</Badge>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                  {t.exitPrice === null ? <span className="text-slate-400">—</span> : fmtRp(t.exitPrice)}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  {t.exitDate === null ? <span className="text-slate-400">—</span> : fmtDate(t.exitDate)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">{t.holdDays ?? '—'}</td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                  {t.rMultiple !== null ? `${fmtNum(t.rMultiple, 2)}R` : '—'}
                </td>
                <td
                  className={`whitespace-nowrap px-3 py-2 tabular-nums font-medium ${
                    t.netPL === null ? '' : t.netPL > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {fmtRp(t.netPL)}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  {t.winLoss ? <Badge tone={t.winLoss === 'W' ? 'good' : 'bad'}>{t.winLoss}</Badge> : '—'}
                </td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">{t.suggestedLots ?? '—'}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  {t.sizeVariance ? (
                    <Badge tone={t.sizeVariance === 'OK' ? 'good' : 'warn'}>{t.sizeVariance}</Badge>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">{fmtRp(t.cumulativeNet)}</td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums text-rose-600 dark:text-rose-400">
                  {t.drawdown !== null ? fmtRp(t.drawdown) : '—'}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  {t.compliance ? <Badge tone={t.compliance === 'CLEAN' ? 'good' : 'bad'}>{t.compliance}</Badge> : '—'}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <button
                    onClick={() => onDelete(t.id)}
                    className="rounded-md px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
