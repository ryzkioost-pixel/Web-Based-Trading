import { useMemo, useState } from 'react';
import type { BookRead, RuleConfig, Trade, Trend } from '../types';
import { computeTrade } from '../calc';
import { fmtNum, fmtPct, fmtRp, todayISO } from '../format';
import { Badge, Card, Field, Metric, NumberInput, Select, TextInput } from './ui';

const TRENDS: Trend[] = ['Sideways', 'Downtrend', 'Uptrend'];
const BOOK_READS: BookRead[] = ['Balance', 'Buy', 'Sell'];

function emptyDraft(): Trade {
  return {
    id: '',
    date: todayISO(),
    stock: '',
    sector: '',
    trend: 'Sideways',
    candleTrigger: '',
    bookRead: 'Balance',
    entryDate: todayISO(),
    entryPrice: null,
    lots: null,
    support: null,
    resistance: null,
    exitPrice: null,
    exitDate: null,
  };
}

export function TradeForm({ rules, onSubmit }: { rules: RuleConfig; onSubmit: (trade: Trade) => void }) {
  const [draft, setDraft] = useState<Trade>(emptyDraft);

  const preview = useMemo(() => computeTrade(draft, rules), [draft, rules]);
  const rewardRisk = useMemo(() => {
    const { entryPrice, support, resistance } = draft;
    if (entryPrice === null || support === null || resistance === null) return null;
    const riskDenom = entryPrice - support;
    if (riskDenom === 0) return null;
    return (resistance - entryPrice) / riskDenom;
  }, [draft]);

  const set = <K extends keyof Trade>(key: K, value: Trade[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  const canSubmit =
    draft.stock.trim() !== '' &&
    draft.entryDate !== '' &&
    draft.entryPrice !== null &&
    draft.support !== null &&
    draft.resistance !== null &&
    draft.lots !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ ...draft, id: crypto.randomUUID() });
    setDraft(emptyDraft());
  };

  const handleUseSuggested = () => {
    if (preview.suggestedLots !== null) set('lots', preview.suggestedLots);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col gap-6">
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">Trade Setup</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Stock">
              <TextInput
                value={draft.stock}
                onChange={(e) => set('stock', e.target.value.toUpperCase())}
                placeholder="e.g. BBCA"
                required
              />
            </Field>
            <Field label="Sector">
              <TextInput value={draft.sector} onChange={(e) => set('sector', e.target.value)} placeholder="e.g. Bank" />
            </Field>
            <Field label="Trend">
              <Select value={draft.trend} onChange={(e) => set('trend', e.target.value as Trend)}>
                {TRENDS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="Candle Trigger">
              <TextInput value={draft.candleTrigger} onChange={(e) => set('candleTrigger', e.target.value)} placeholder="e.g. Double Bottom" />
            </Field>
            <Field label="Book Read">
              <Select value={draft.bookRead} onChange={(e) => set('bookRead', e.target.value as BookRead)}>
                {BOOK_READS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </Select>
            </Field>
            <Field label="Watchlist Date">
              <TextInput type="date" value={draft.date} onChange={(e) => set('date', e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">Position Sizing</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Entry Date">
              <TextInput
                type="date"
                value={draft.entryDate}
                onChange={(e) => set('entryDate', e.target.value)}
                required
              />
            </Field>
            <Field label="Entry Price (Rp)">
              <NumberInput
                value={draft.entryPrice ?? ''}
                onChange={(e) => set('entryPrice', numOrNull(e.target.value))}
                placeholder="1140"
                required
              />
            </Field>
            <Field label="Support (Rp)">
              <NumberInput
                value={draft.support ?? ''}
                onChange={(e) => set('support', numOrNull(e.target.value))}
                placeholder="1040"
                required
              />
            </Field>
            <Field label="Resistance (Rp)">
              <NumberInput
                value={draft.resistance ?? ''}
                onChange={(e) => set('resistance', numOrNull(e.target.value))}
                placeholder="1175"
                required
              />
            </Field>
            <Field label="Lots">
              <div className="flex gap-2">
                <NumberInput
                  value={draft.lots ?? ''}
                  onChange={(e) => set('lots', numOrNull(e.target.value))}
                  placeholder="Suggested"
                  required
                />
                {preview.suggestedLots !== null && (
                  <button
                    type="button"
                    onClick={handleUseSuggested}
                    className="whitespace-nowrap rounded-lg border border-indigo-300 bg-indigo-50 px-3 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                  >
                    Use {preview.suggestedLots}
                  </button>
                )}
              </div>
            </Field>
          </div>
        </Card>

        <button
          type="submit"
          disabled={!canSubmit}
          className="self-start rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Log Trade
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <Card className="sticky top-4 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Live Calculation</h2>
            {preview.rCheck && (
              <Badge tone={preview.rCheck === 'TAKE' ? 'good' : 'bad'}>R-Check: {preview.rCheck}</Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Metric label="Suggested Lots" value={preview.suggestedLots ?? '—'} />
            <Metric
              label="Size Variance"
              value={preview.sizeVariance ?? '—'}
              tone={preview.sizeVariance === 'OK' ? 'good' : preview.sizeVariance ? 'bad' : undefined}
            />
            <Metric label="Shares" value={preview.shares !== null ? fmtNum(preview.shares, 0) : '—'} />
            <Metric label="Risk (Rp)" value={fmtRp(preview.risk)} />
            <Metric
              label="Capital Deployed"
              value={fmtRp(preview.capitalDeployed)}
              tone={
                preview.capitalDeployed !== null
                  ? preview.capitalDeployed > rules.maxCapitalDeployed
                    ? 'bad'
                    : 'good'
                  : undefined
              }
            />
            <Metric
              label="Stop %"
              value={preview.stopBreach ? `BREACH-${preview.stopBreach}` : fmtPct(preview.stopPct)}
              tone={preview.stopBreach ? 'bad' : preview.stopPct !== null ? 'good' : undefined}
            />
            <Metric
              label="Box Position"
              value={fmtPct(preview.boxPosition, 0)}
              tone={
                preview.boxPosition !== null
                  ? preview.boxPosition <= rules.maxBoxPosition
                    ? 'good'
                    : 'bad'
                  : undefined
              }
            />
            <Metric label="Reward:Risk" value={rewardRisk !== null ? `${fmtNum(rewardRisk, 2)}x` : '—'} />
          </div>

          <div className="border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <p>
              Risk budget is fixed at {fmtRp(rules.rUnit)} per R and capital per position is capped at{' '}
              {fmtRp(rules.maxCapitalDeployed)}. Suggested lots respects both caps automatically. Adjust these in the
              Rules tab.
            </p>
            <p className="mt-2">
              Trades log as <span className="font-semibold">open</span> — record the real exit price and date later
              from the Close Trade tab, once the position is actually sold.
            </p>
          </div>
        </Card>
      </div>
    </form>
  );
}
