import type { DashboardStats, Trade, TradeComputed } from './types';

// --- Constants (tuned to the original spreadsheet's risk model) ---
export const R_UNIT = 125_000; // fixed rupiah value of 1R
export const MAX_CAPITAL_DEPLOYED = 5_000_000; // max capital per position
export const BUY_FEE_RATE = 0.0018;
export const SELL_FEE_RATE = 0.0028;
export const MIN_FEE = 5_000;
export const R_CHECK_MIN_RATIO = 1.5; // reward:risk must be >= this to "TAKE"
export const STOP_WIDE_PCT = 0.03; // stop wider than this = BREACH-WIDE
export const STOP_TIGHT_PCT = 0.015; // stop tighter than this = BREACH-TIGHT
export const MAX_BOX_POSITION = 0.4; // entry must be in lower 40% of support-resistance range
export const MAX_HOLD_DAYS = 3;
export const UNDERSIZED_RATIO = 0.8;
export const PHASE_TARGET_TRADES = 30;

const isNum = (v: number | null | undefined): v is number =>
  typeof v === 'number' && Number.isFinite(v);

/** Excel ROUNDDOWN behaviour: truncate toward zero. */
const roundDownToZero = (v: number) => (v >= 0 ? Math.floor(v) : Math.ceil(v));

const daysBetween = (start: string, end: string) => {
  const a = new Date(start + 'T00:00:00Z').getTime();
  const b = new Date(end + 'T00:00:00Z').getTime();
  return Math.round((b - a) / 86_400_000);
};

/** R-Check (col H): is reward:risk >= 1.5? */
export function computeRCheck(
  entryPrice: number | null,
  support: number | null,
  resistance: number | null,
): TradeComputed['rCheck'] {
  if (!isNum(entryPrice) || !isNum(support) || !isNum(resistance)) return null;
  const riskDenom = entryPrice - support;
  if (riskDenom === 0) return null;
  const ratio = (resistance - entryPrice) / riskDenom;
  return ratio >= R_CHECK_MIN_RATIO ? 'TAKE' : 'SKIP';
}

/** Shares (col L): lots * 100. */
export function computeShares(lots: number | null): number | null {
  return isNum(lots) ? lots * 100 : null;
}

/** Risk in rupiah (col M): (entry - support) * shares. */
export function computeRisk(
  entryPrice: number | null,
  support: number | null,
  shares: number | null,
): number | null {
  if (!isNum(entryPrice) || !isNum(support) || !isNum(shares)) return null;
  return (entryPrice - support) * shares;
}

/** Capital deployed (col N): shares * entry price. */
export function computeCapitalDeployed(
  shares: number | null,
  entryPrice: number | null,
): number | null {
  if (!isNum(shares) || !isNum(entryPrice)) return null;
  return shares * entryPrice;
}

/** Stop % + breach flag (col Q). */
export function computeStop(
  entryPrice: number | null,
  support: number | null,
): { pct: number | null; breach: TradeComputed['stopBreach'] } {
  if (!isNum(entryPrice) || !isNum(support) || entryPrice === 0) {
    return { pct: null, breach: null };
  }
  const pct = (entryPrice - support) / entryPrice;
  const breach = pct > STOP_WIDE_PCT ? 'WIDE' : pct < STOP_TIGHT_PCT ? 'TIGHT' : null;
  return { pct, breach };
}

/** Hold days (col T): exit date - entry date. */
export function computeHoldDays(
  entryDate: string,
  exitDate: string | null,
): number | null {
  if (!entryDate || !exitDate) return null;
  return daysBetween(entryDate, exitDate);
}

/** Gross P/L (col V): (exit - entry) * shares. */
export function computeGrossPL(
  exitPrice: number | null,
  entryPrice: number | null,
  shares: number | null,
): number | null {
  if (!isNum(exitPrice) || !isNum(entryPrice) || !isNum(shares)) return null;
  return (exitPrice - entryPrice) * shares;
}

/** Buy fee (col W): max(capital deployed * 0.18%, Rp5,000). */
export function computeBuyFee(
  entryPrice: number | null,
  capitalDeployed: number | null,
): number | null {
  if (!isNum(entryPrice) || !isNum(capitalDeployed)) return null;
  return Math.max(capitalDeployed * BUY_FEE_RATE, MIN_FEE);
}

/** Sell fee (col X): max(shares * exit price * 0.28%, Rp5,000). */
export function computeSellFee(
  shares: number | null,
  exitPrice: number | null,
): number | null {
  if (!isNum(shares) || !isNum(exitPrice)) return null;
  return Math.max(shares * exitPrice * SELL_FEE_RATE, MIN_FEE);
}

/** Net P/L (col Y): gross - buy fee - sell fee. */
export function computeNetPL(
  grossPL: number | null,
  buyFee: number | null,
  sellFee: number | null,
): number | null {
  if (!isNum(grossPL) || !isNum(buyFee) || !isNum(sellFee)) return null;
  return grossPL - buyFee - sellFee;
}

/** Win/Loss (col Z). */
export function computeWinLoss(netPL: number | null): TradeComputed['winLoss'] {
  if (!isNum(netPL)) return null;
  return netPL > 0 ? 'W' : 'L';
}

/** R-Multiple realised (col U): net P/L / risk. */
export function computeRMultiple(
  netPL: number | null,
  risk: number | null,
): number | null {
  if (!isNum(netPL) || !isNum(risk) || risk === 0) return null;
  return netPL / risk;
}

/** Box position (col AA): where entry sits between support (0) and resistance (1). */
export function computeBoxPosition(
  entryPrice: number | null,
  support: number | null,
  resistance: number | null,
): number | null {
  if (!isNum(entryPrice) || !isNum(support) || !isNum(resistance)) return null;
  const range = resistance - support;
  if (range === 0) return null;
  return (entryPrice - support) / range;
}

/** Suggested lots (col AC): sized so both the fixed-R risk budget and max capital cap are respected. */
export function computeSuggestedLots(
  entryPrice: number | null,
  support: number | null,
): number | null {
  if (!isNum(entryPrice) || !isNum(support) || entryPrice === 0) return null;
  const riskDenom = entryPrice - support;
  if (riskDenom === 0) return null;
  const byRisk = roundDownToZero(R_UNIT / riskDenom / 100);
  const byCapital = roundDownToZero(MAX_CAPITAL_DEPLOYED / entryPrice / 100);
  return Math.min(byRisk, byCapital);
}

/** Size variance (col AD): actual lots vs. suggested lots. */
export function computeSizeVariance(
  lots: number | null,
  suggestedLots: number | null,
): TradeComputed['sizeVariance'] {
  if (!isNum(lots) || !isNum(suggestedLots)) return null;
  if (lots > suggestedLots) return 'OVERSIZED';
  if (lots < suggestedLots * UNDERSIZED_RATIO) return 'UNDERSIZED';
  return 'OK';
}

/** Compliance verdict (col AG): every discipline rule must pass. */
export function computeCompliance(args: {
  netPL: number | null;
  rCheck: TradeComputed['rCheck'];
  sizeVariance: TradeComputed['sizeVariance'];
  stopBreach: TradeComputed['stopBreach'];
  boxPosition: number | null;
  capitalDeployed: number | null;
  holdDays: number | null;
}): TradeComputed['compliance'] {
  const { netPL, rCheck, sizeVariance, stopBreach, boxPosition, capitalDeployed, holdDays } = args;
  if (!isNum(netPL)) return null;
  const clean =
    rCheck === 'TAKE' &&
    sizeVariance === 'OK' &&
    stopBreach === null &&
    isNum(boxPosition) &&
    boxPosition <= MAX_BOX_POSITION &&
    isNum(capitalDeployed) &&
    capitalDeployed <= MAX_CAPITAL_DEPLOYED &&
    isNum(holdDays) &&
    holdDays <= MAX_HOLD_DAYS;
  return clean ? 'CLEAN' : 'DIRTY';
}

/** Compute every derived field for a single trade (everything except the running-series columns AB/AE/AF). */
export function computeTrade(trade: Trade): Omit<TradeComputed, 'cumulativeNet' | 'peakEquity' | 'drawdown'> {
  const rCheck = computeRCheck(trade.entryPrice, trade.support, trade.resistance);
  const shares = computeShares(trade.lots);
  const risk = computeRisk(trade.entryPrice, trade.support, shares);
  const capitalDeployed = computeCapitalDeployed(shares, trade.entryPrice);
  const { pct: stopPct, breach: stopBreach } = computeStop(trade.entryPrice, trade.support);
  const holdDays = computeHoldDays(trade.entryDate, trade.exitDate);
  const grossPL = computeGrossPL(trade.exitPrice, trade.entryPrice, shares);
  const buyFee = computeBuyFee(trade.entryPrice, capitalDeployed);
  const sellFee = computeSellFee(shares, trade.exitPrice);
  const netPL = computeNetPL(grossPL, buyFee, sellFee);
  const winLoss = computeWinLoss(netPL);
  const rMultiple = computeRMultiple(netPL, risk);
  const boxPosition = computeBoxPosition(trade.entryPrice, trade.support, trade.resistance);
  const suggestedLots = computeSuggestedLots(trade.entryPrice, trade.support);
  const sizeVariance = computeSizeVariance(trade.lots, suggestedLots);
  const compliance = computeCompliance({
    netPL,
    rCheck,
    sizeVariance,
    stopBreach,
    boxPosition,
    capitalDeployed,
    holdDays,
  });

  return {
    ...trade,
    rCheck,
    shares,
    risk,
    capitalDeployed,
    stopPct,
    stopBreach,
    holdDays,
    rMultiple,
    grossPL,
    buyFee,
    sellFee,
    netPL,
    winLoss,
    boxPosition,
    suggestedLots,
    sizeVariance,
    compliance,
  };
}

/**
 * Compute the full trade log: per-trade fields plus the running series columns
 * (cumulative net, peak equity, drawdown), which depend on chronological order.
 * Returns trades sorted by entry date (ties broken by original array order).
 */
export function computeTradeSeries(trades: Trade[]): TradeComputed[] {
  const withIndex = trades.map((t, index) => ({ t, index }));
  withIndex.sort((a, b) => {
    const dateCmp = (a.t.entryDate || '').localeCompare(b.t.entryDate || '');
    return dateCmp !== 0 ? dateCmp : a.index - b.index;
  });

  let runningSum = 0;
  let peak = 0;

  return withIndex.map(({ t }) => {
    const computed = computeTrade(t);
    if (!isNum(computed.netPL)) {
      return { ...computed, cumulativeNet: null, peakEquity: null, drawdown: null };
    }
    runningSum += computed.netPL;
    peak = Math.max(peak, runningSum);
    return {
      ...computed,
      cumulativeNet: runningSum,
      peakEquity: peak,
      drawdown: runningSum - peak,
    };
  });
}

/** Dashboard aggregate stats — mirrors the '2026 Dashboard and Insight' sheet. */
export function computeDashboard(trades: TradeComputed[]): DashboardStats {
  const clean = trades.filter((t) => t.compliance === 'CLEAN');
  const dirty = trades.filter((t) => t.compliance === 'DIRTY');

  const tradeCount = clean.length;
  const winCount = clean.filter((t) => t.winLoss === 'W').length;
  const winRate = tradeCount > 0 ? winCount / tradeCount : null;

  const wins = clean.filter((t) => isNum(t.netPL) && t.netPL > 0);
  const losses = clean.filter((t) => isNum(t.netPL) && t.netPL < 0);
  const avgWin = wins.length ? wins.reduce((s, t) => s + (t.netPL as number), 0) / wins.length : null;
  const avgLoss = losses.length ? losses.reduce((s, t) => s + (t.netPL as number), 0) / losses.length : null;
  const payoffRatio = isNum(avgWin) && isNum(avgLoss) && avgLoss !== 0 ? avgWin / Math.abs(avgLoss) : null;

  const expectancyPerTrade =
    isNum(winRate) && isNum(avgWin) && isNum(avgLoss)
      ? winRate * avgWin + (1 - winRate) * avgLoss
      : null;
  const expectancyInR = isNum(expectancyPerTrade) ? expectancyPerTrade / R_UNIT : null;

  const totalNetPL = trades.reduce((s, t) => s + (isNum(t.netPL) ? t.netPL : 0), 0);

  const drawdowns = trades.filter((t) => isNum(t.drawdown)).map((t) => t.drawdown as number);
  const maxDrawdown = drawdowns.length ? Math.min(...drawdowns) : 0;

  const winnersHold = clean.filter((t) => t.winLoss === 'W' && isNum(t.holdDays));
  const losersHold = clean.filter((t) => t.winLoss === 'L' && isNum(t.holdDays));
  const avgHoldWinners = winnersHold.length
    ? winnersHold.reduce((s, t) => s + (t.holdDays as number), 0) / winnersHold.length
    : null;
  const avgHoldLosers = losersHold.length
    ? losersHold.reduce((s, t) => s + (t.holdDays as number), 0) / losersHold.length
    : null;

  return {
    tradeCount,
    winCount,
    winRate,
    avgWin,
    avgLoss,
    payoffRatio,
    expectancyPerTrade,
    expectancyInR,
    totalNetPL,
    maxDrawdown,
    avgHoldWinners,
    avgHoldLosers,
    cleanCount: clean.length,
    dirtyCount: dirty.length,
  };
}
