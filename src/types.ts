export type Trend = 'Sideways' | 'Downtrend' | 'Uptrend';
export type BookRead = 'Balance' | 'Buy' | 'Sell';

/** Raw, user-entered fields for a single trade — mirrors the input columns of the '2026 Log' sheet. */
export interface Trade {
  id: string;
  date: string; // Watchlist date (col B), ISO yyyy-mm-dd
  stock: string; // C
  sector: string; // D
  trend: Trend; // E
  candleTrigger: string; // F
  bookRead: BookRead; // G
  entryDate: string; // I
  entryPrice: number | null; // J
  lots: number | null; // K
  support: number | null; // O
  resistance: number | null; // P
  exitPrice: number | null; // R
  exitDate: string | null; // S
}

/** Every tunable rule the calculation engine uses — one set per profile. */
export interface RuleConfig {
  rUnit: number; // rupiah value of 1R
  maxCapitalDeployed: number; // max capital per position (Rp)
  buyFeeRate: number; // fraction, e.g. 0.0018 = 0.18%
  sellFeeRate: number; // fraction, e.g. 0.0028 = 0.28%
  minFee: number; // minimum fee per leg (Rp)
  rCheckMinRatio: number; // reward:risk must be >= this to "TAKE"
  stopWidePct: number; // stop wider than this fraction of entry = BREACH-WIDE
  stopTightPct: number; // stop tighter than this fraction of entry = BREACH-TIGHT
  maxBoxPosition: number; // entry must sit at or below this fraction of the support-resistance range
  maxHoldDays: number; // trades held longer than this are non-compliant
  undersizedRatio: number; // lots below suggested * this ratio = UNDERSIZED
  phaseTargetTrades: number; // trade count target for "next phase" progress
}

export type RCheck = 'TAKE' | 'SKIP' | null;
export type SizeVariance = 'OVERSIZED' | 'UNDERSIZED' | 'OK' | null;
export type WinLoss = 'W' | 'L' | null;
export type Compliance = 'CLEAN' | 'DIRTY' | null;
export type StopBreach = 'WIDE' | 'TIGHT' | null;

/** Every derived/formula column, computed from a Trade (plus running series state for AB/AE/AF). */
export interface TradeComputed extends Trade {
  rCheck: RCheck; // H
  shares: number | null; // L
  risk: number | null; // M
  capitalDeployed: number | null; // N
  stopPct: number | null; // Q (numeric fraction, e.g. 0.02 = 2.00%)
  stopBreach: StopBreach; // Q label
  holdDays: number | null; // T
  rMultiple: number | null; // U
  grossPL: number | null; // V
  buyFee: number | null; // W
  sellFee: number | null; // X
  netPL: number | null; // Y
  winLoss: WinLoss; // Z
  boxPosition: number | null; // AA
  cumulativeNet: number | null; // AB
  suggestedLots: number | null; // AC
  sizeVariance: SizeVariance; // AD
  peakEquity: number | null; // AE
  drawdown: number | null; // AF
  compliance: Compliance; // AG
}

export interface DashboardStats {
  tradeCount: number;
  winCount: number;
  winRate: number | null;
  avgWin: number | null;
  avgLoss: number | null;
  payoffRatio: number | null;
  expectancyPerTrade: number | null;
  expectancyInR: number | null;
  totalNetPL: number;
  maxDrawdown: number;
  avgHoldWinners: number | null;
  avgHoldLosers: number | null;
  cleanCount: number;
  dirtyCount: number;
}

/** A named workspace: its own rule set and its own trade log. */
export interface Profile {
  id: string;
  name: string;
  rules: RuleConfig;
  trades: Trade[];
}
