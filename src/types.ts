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
