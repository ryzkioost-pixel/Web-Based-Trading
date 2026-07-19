import { useMemo } from 'react';
import { computeDashboard, computeTradeSeries } from '../calc';
import type { RuleConfig, Trade } from '../types';
import { fmtNum, fmtPct, fmtRp } from '../format';
import { Card, Metric } from './ui';
import { EquityChart } from './EquityChart';

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      {children}
    </Card>
  );
}

export function Dashboard({ trades, rules }: { trades: Trade[]; rules: RuleConfig }) {
  const computed = useMemo(() => computeTradeSeries(trades, rules), [trades, rules]);
  const stats = useMemo(() => computeDashboard(computed, rules), [computed, rules]);

  const phasePct = rules.phaseTargetTrades > 0 ? Math.min(1, stats.tradeCount / rules.phaseTargetTrades) : 0;
  const complianceTotal = stats.cleanCount + stats.dirtyCount;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Trade Count">
          <span className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{stats.tradeCount}</span>
        </StatCard>
        <StatCard label="Win Rate">
          <span className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{fmtPct(stats.winRate)}</span>
          <span className="text-xs text-slate-400">{stats.winCount} wins / {stats.tradeCount}</span>
        </StatCard>
        <StatCard label="Payoff Ratio">
          <span className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {stats.payoffRatio !== null ? `${fmtNum(stats.payoffRatio, 2)}x` : '—'}
          </span>
        </StatCard>
        <StatCard label="Total Net P/L">
          <span
            className={`text-2xl font-semibold tabular-nums ${
              stats.totalNetPL > 0 ? 'text-emerald-600 dark:text-emerald-400' : stats.totalNetPL < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {fmtRp(stats.totalNetPL)}
          </span>
        </StatCard>
        <StatCard label="Average Win">
          <span className="text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{fmtRp(stats.avgWin)}</span>
        </StatCard>
        <StatCard label="Average Loss">
          <span className="text-2xl font-semibold tabular-nums text-rose-600 dark:text-rose-400">{fmtRp(stats.avgLoss)}</span>
        </StatCard>
        <StatCard label="Expectancy / Trade">
          <span className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{fmtRp(stats.expectancyPerTrade)}</span>
          <span className="text-xs text-slate-400">{stats.expectancyInR !== null ? `${fmtNum(stats.expectancyInR, 2)}R` : '—'}</span>
        </StatCard>
        <StatCard label="Max Drawdown">
          <span className="text-2xl font-semibold tabular-nums text-rose-600 dark:text-rose-400">{fmtRp(stats.maxDrawdown)}</span>
        </StatCard>
      </div>

      <Card>
        <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">Equity Curve</h2>
        <EquityChart trades={computed} />
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">Hold Time</h2>
          <div className="grid grid-cols-2 gap-4">
            <Metric label="Avg Hold — Winners" value={stats.avgHoldWinners !== null ? `${fmtNum(stats.avgHoldWinners, 1)}d` : '—'} />
            <Metric label="Avg Hold — Losers" value={stats.avgHoldLosers !== null ? `${fmtNum(stats.avgHoldLosers, 1)}d` : '—'} />
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">Next Phase Progress</h2>
          <div className="mb-2 flex items-baseline justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Trades: {stats.tradeCount} / {rules.phaseTargetTrades}</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{fmtPct(phasePct, 0)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${phasePct * 100}%` }} />
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">Compliance Rate</h2>
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Clean: {stats.cleanCount} / {complianceTotal}
          </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {complianceTotal > 0 ? fmtPct(stats.cleanCount / complianceTotal, 0) : '—'}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${complianceTotal > 0 ? (stats.cleanCount / complianceTotal) * 100 : 0}%` }}
          />
        </div>
      </Card>
    </div>
  );
}
