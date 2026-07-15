import type { RuleConfig } from '../types';
import { Card, Field, NumberInput } from './ui';

const pctToFrac = (v: number) => v / 100;
const fracToPct = (v: number) => Number((v * 100).toFixed(4));

function RateField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <NumberInput
          value={fracToPct(value)}
          step="0.01"
          onChange={(e) => onChange(pctToFrac(Number(e.target.value)))}
        />
        <span className="text-sm text-slate-400">%</span>
      </div>
      <span className="text-xs font-normal text-slate-400">{hint}</span>
    </Field>
  );
}

function NumField({
  label,
  hint,
  value,
  onChange,
  step = 1,
  suffix,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  step?: number | string;
  suffix?: string;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <NumberInput value={value} step={step} onChange={(e) => onChange(Number(e.target.value))} />
        {suffix && <span className="text-sm text-slate-400">{suffix}</span>}
      </div>
      <span className="text-xs font-normal text-slate-400">{hint}</span>
    </Field>
  );
}

export function RulesSettings({
  rules,
  onUpdate,
  onReset,
}: {
  rules: RuleConfig;
  onUpdate: (patch: Partial<RuleConfig>) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Every threshold the calculator and compliance engine use, editable per profile.
        </p>
        <button
          onClick={onReset}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Reset to defaults
        </button>
      </div>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">Risk &amp; Capital</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumField
            label="R Unit (Rp)"
            hint="Rupiah value of 1R — the fixed risk budget used to size positions and to convert expectancy into R."
            value={rules.rUnit}
            step={1000}
            onChange={(v) => onUpdate({ rUnit: v })}
          />
          <NumField
            label="Max Capital Deployed (Rp)"
            hint="Position size cap — capital deployed above this fails compliance."
            value={rules.maxCapitalDeployed}
            step={100_000}
            onChange={(v) => onUpdate({ maxCapitalDeployed: v })}
          />
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">Fees</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <RateField
            label="Buy Fee Rate"
            hint="Applied to capital deployed at entry."
            value={rules.buyFeeRate}
            onChange={(v) => onUpdate({ buyFeeRate: v })}
          />
          <RateField
            label="Sell Fee Rate"
            hint="Applied to proceeds at exit."
            value={rules.sellFeeRate}
            onChange={(v) => onUpdate({ sellFeeRate: v })}
          />
          <NumField
            label="Minimum Fee (Rp)"
            hint="Floor applied to both buy and sell fees."
            value={rules.minFee}
            step={500}
            onChange={(v) => onUpdate({ minFee: v })}
          />
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">Entry Discipline</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumField
            label="Min Reward:Risk Ratio"
            hint="R-Check requires reward ÷ risk to be at least this to read TAKE."
            value={rules.rCheckMinRatio}
            step={0.1}
            suffix="x"
            onChange={(v) => onUpdate({ rCheckMinRatio: v })}
          />
          <NumField
            label="Max Box Position"
            hint="Entry must sit at or below this fraction of the support→resistance range."
            value={fracToPct(rules.maxBoxPosition)}
            step={1}
            suffix="%"
            onChange={(v) => onUpdate({ maxBoxPosition: pctToFrac(v) })}
          />
          <RateField
            label="Stop Wide Threshold"
            hint="Stop wider than this fraction of entry price reads BREACH-WIDE."
            value={rules.stopWidePct}
            onChange={(v) => onUpdate({ stopWidePct: v })}
          />
          <RateField
            label="Stop Tight Threshold"
            hint="Stop tighter than this fraction of entry price reads BREACH-TIGHT."
            value={rules.stopTightPct}
            onChange={(v) => onUpdate({ stopTightPct: v })}
          />
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">Trade Management</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumField
            label="Max Hold Days"
            hint="Trades held longer than this fail compliance."
            value={rules.maxHoldDays}
            step={1}
            suffix="days"
            onChange={(v) => onUpdate({ maxHoldDays: v })}
          />
          <NumField
            label="Undersized Ratio"
            hint="Lots below suggested lots × this ratio read UNDERSIZED."
            value={fracToPct(rules.undersizedRatio)}
            step={1}
            suffix="%"
            onChange={(v) => onUpdate({ undersizedRatio: pctToFrac(v) })}
          />
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">Goals</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumField
            label="Phase Target Trades"
            hint="Trade count target shown on the Dashboard's Next Phase Progress bar."
            value={rules.phaseTargetTrades}
            step={1}
            onChange={(v) => onUpdate({ phaseTargetTrades: v })}
          />
        </div>
      </Card>
    </div>
  );
}
