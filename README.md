# Stock Trading Calculator

A web-based position-sizing calculator, trade journal, and performance
dashboard — ported from a trading-log spreadsheet (fixed-R risk model, IDR
brokerage fees, discipline/compliance rules).

## Features

- **Calculator** — enter a stock, entry price, support/resistance, and lots;
  see live R-check (reward:risk ≥ 1.5), suggested lot size, risk, capital
  deployed, stop %, and box position before you commit to a trade. Every
  trade logs as **open** — exit price isn't asked for here, since it isn't
  known until the position is actually sold.
- **Close Trade** — pick an open position, enter the real exit price and
  date once it's sold, and see the resulting gross/net P/L, fees,
  R-multiple, and compliance verdict live before confirming.
- **Trade Log** — every logged trade with all derived columns (fees, gross/net
  P/L, R-multiple, cumulative equity, drawdown, compliance verdict). Open
  trades show a Close button that jumps to the Close Trade tab; lots stay
  editable inline.
- **Dashboard & Insight** — win rate, payoff ratio, expectancy (in Rp and in
  R), total net P/L, max drawdown, an equity curve, average hold time for
  winners/losers, phase progress toward a configurable trade-count target,
  and compliance rate.
- **Rules** — every threshold below is editable, per profile, with live
  recalculation everywhere it's used.
- **Profiles** — separate named rule-sets + trade logs in the same browser
  (e.g. "Conservative", "Aggressive", one per strategy). Switch, rename,
  duplicate, or delete profiles from the header. No login required.

## Risk model (defaults — all configurable in the Rules tab)

- 1R defaults to **Rp 125,000**.
- Capital per position defaults to a cap of **Rp 5,000,000**.
- Buy fee: `max(capital deployed × buy fee rate, minimum fee)` — defaults to 0.18% / Rp 5,000.
- Sell fee: `max(shares × exit price × sell fee rate, minimum fee)` — defaults to 0.28% / Rp 5,000.
- A trade is **CLEAN** only if: R-check is TAKE (reward:risk ≥ the configured
  minimum, default 1.5), position size is within the configured undersized
  ratio of suggested lots and never over, the stop isn't a breach (outside
  the configured tight/wide % of entry price), entry sits at or below the
  configured box-position fraction of the support–resistance range, capital
  deployed is within the cap, and hold time is within the configured max
  days.

All formulas are ported 1:1 from the original spreadsheet in
[`src/calc.ts`](src/calc.ts), parameterized by a `RuleConfig` per profile
instead of hardcoded constants.

## Development

```bash
npm install
npm run dev      # start dev server
npm run build     # type-check + production build
```

Trades persist to `localStorage` in the browser — no backend required.
