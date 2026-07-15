# Stock Trading Calculator

A web-based position-sizing calculator, trade journal, and performance
dashboard — ported from a trading-log spreadsheet (fixed-R risk model, IDR
brokerage fees, discipline/compliance rules).

## Features

- **Calculator** — enter a stock, entry price, support/resistance, and lots;
  see live R-check (reward:risk ≥ 1.5), suggested lot size, risk, capital
  deployed, stop %, and box position before you commit to a trade.
- **Trade Log** — every logged trade with all derived columns (fees, gross/net
  P/L, R-multiple, cumulative equity, drawdown, compliance verdict). Lots,
  exit price, and exit date are editable inline to close out a trade.
- **Dashboard & Insight** — win rate, payoff ratio, expectancy (in Rp and in
  R), total net P/L, max drawdown, an equity curve, average hold time for
  winners/losers, phase progress toward 30 trades, and compliance rate.

## Risk model

- 1R is fixed at **Rp 125,000**.
- Capital per position is capped at **Rp 5,000,000**.
- Buy fee: `max(capital deployed × 0.18%, Rp 5,000)`.
- Sell fee: `max(shares × exit price × 0.28%, Rp 5,000)`.
- A trade is **CLEAN** only if: R-check is TAKE, position size is within
  ±20%/0% of the suggested lots, the stop isn't a breach (<1.5% or >3% of
  entry price), entry sits in the lower 40% of the support–resistance box,
  capital deployed is within the cap, and hold time is ≤3 days.

All formulas are ported 1:1 from the original spreadsheet in
[`src/calc.ts`](src/calc.ts).

## Development

```bash
npm install
npm run dev      # start dev server
npm run build     # type-check + production build
```

Trades persist to `localStorage` in the browser — no backend required.
