import { useEffect, useMemo, useState } from 'react';
import type { RuleConfig, Trade } from '../types';
import { computeTrade } from '../calc';
import { fmtDate, fmtNum, fmtPct, fmtRp, todayISO } from '../format';
import { Badge, Card, Field, Metric, NumberInput, TextInput } from './ui';

export function CloseTradeForm({
  trades,
  rules,
  selectedId,
  onSelectedIdChange,
  onClose,
}: {
  trades: Trade[];
  rules: RuleConfig;
  selectedId: string | null;
  onSelectedIdChange: (id: string | null) => void;
  onClose: (id: string, patch: { exitPrice: number; exitDate: string }) => void;
}) {
  const openTrades = useMemo(() => trades.filter((t) => t.exitPrice === null), [trades]);
  const selected = openTrades.find((t) => t.id === selectedId) ?? openTrades[0] ?? null;

  const [exitPrice, setExitPrice] = useState<number | null>(null);
  const [exitDate, setExitDate] = useState<string>(todayISO());

  useEffect(() => {
    if (selected && selected.id !== selectedId) onSelectedIdChange(selected.id);
    setExitPrice(null);
    setExitDate(todayISO());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const entryComputed = useMemo(
    () => (selected ? computeTrade(selected, rules) : null),
    [selected, rules],
  );

  const preview = useMemo(
    () => (selected ? computeTrade({ ...selected, exitPrice, exitDate }, rules) : null),
    [selected, exitPrice, exitDate, rules],
  );

  if (!selected) {
    return (
      <Card>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No open trades to close. Log one from the Calculator tab, then come back here once it's actually sold.
        </p>
      </Card>
    );
  }

  const canClose = exitPrice !== null && exitDate !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canClose || exitPrice === null) return;
    onClose(selected.id, { exitPrice, exitDate });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col gap-6">
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">Open Trade</h2>
          <Field label="Select a position to close">
            <select
              value={selected.id}
              onChange={(e) => onSelectedIdChange(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {openTrades.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.stock} — entered {fmtDate(t.entryDate)} @ {fmtRp(t.entryPrice)}
                </option>
              ))}
            </select>
          </Field>

          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 sm:grid-cols-3">
            <Metric label="Sector" value={selected.sector || '—'} />
            <Metric label="Trend" value={selected.trend} />
            <Metric label="Entry Date" value={fmtDate(selected.entryDate)} />
            <Metric label="Entry Price" value={fmtRp(selected.entryPrice)} />
            <Metric label="Support / Resistance" value={`${fmtRp(selected.support)} / ${fmtRp(selected.resistance)}`} />
            <Metric label="Lots / Shares" value={`${selected.lots ?? '—'} / ${fmtNum(entryComputed?.shares ?? null, 0)}`} />
            <Metric label="Risk (Rp)" value={fmtRp(entryComputed?.risk ?? null)} />
            <Metric label="Capital Deployed" value={fmtRp(entryComputed?.capitalDeployed ?? null)} />
            <Metric
              label="R-Check"
              value={entryComputed?.rCheck ?? '—'}
              tone={entryComputed?.rCheck === 'TAKE' ? 'good' : entryComputed?.rCheck === 'SKIP' ? 'bad' : undefined}
            />
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">Exit</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Exit Price (Rp)">
              <NumberInput
                value={exitPrice ?? ''}
                onChange={(e) => setExitPrice(e.target.value === '' ? null : Number(e.target.value))}
                placeholder="e.g. 1155"
                autoFocus
                required
              />
            </Field>
            <Field label="Exit Date">
              <TextInput type="date" value={exitDate} onChange={(e) => setExitDate(e.target.value)} required />
            </Field>
          </div>
        </Card>

        <button
          type="submit"
          disabled={!canClose}
          className="self-start rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Close Trade
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <Card className="sticky top-4 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Result Preview</h2>
            {preview?.winLoss && (
              <Badge tone={preview.winLoss === 'W' ? 'good' : 'bad'}>{preview.winLoss === 'W' ? 'Win' : 'Loss'}</Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Metric
              label="Hold Days"
              value={preview?.holdDays ?? '—'}
              tone={preview?.holdDays != null ? (preview.holdDays <= rules.maxHoldDays ? 'good' : 'bad') : undefined}
            />
            <Metric label="Gross P/L" value={fmtRp(preview?.grossPL ?? null)} />
            <Metric label="Buy Fee" value={fmtRp(preview?.buyFee ?? null)} />
            <Metric label="Sell Fee" value={fmtRp(preview?.sellFee ?? null)} />
            <Metric
              label="Net P/L"
              value={fmtRp(preview?.netPL ?? null)}
              tone={preview?.netPL != null ? (preview.netPL > 0 ? 'good' : 'bad') : undefined}
            />
            <Metric
              label="R-Multiple"
              value={preview?.rMultiple != null ? `${fmtNum(preview.rMultiple, 2)}R` : '—'}
              tone={preview?.rMultiple != null ? (preview.rMultiple > 0 ? 'good' : 'bad') : undefined}
            />
            <Metric label="Box Position" value={fmtPct(preview?.boxPosition ?? null, 0)} />
          </div>

          <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
            <Metric
              label="Compliance"
              value={preview?.compliance ?? '—'}
              tone={preview?.compliance === 'CLEAN' ? 'good' : preview?.compliance === 'DIRTY' ? 'bad' : undefined}
            />
          </div>

          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Enter the price and date the position actually sold at. Fees, net P/L, R-multiple, and the compliance
            verdict all recompute live before you confirm.
          </p>
        </Card>
      </div>
    </form>
  );
}
