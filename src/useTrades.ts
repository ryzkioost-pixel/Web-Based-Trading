import { useCallback, useEffect, useState } from 'react';
import type { Trade } from './types';
import { seedTrades } from './seed';

const STORAGE_KEY = 'trading-calculator/trades/v1';

function loadTrades(): Trade[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedTrades;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seedTrades;
  } catch {
    return seedTrades;
  }
}

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>(loadTrades);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  }, [trades]);

  const addTrade = useCallback((trade: Trade) => {
    setTrades((prev) => [...prev, trade]);
  }, []);

  const updateTrade = useCallback((id: string, patch: Partial<Trade>) => {
    setTrades((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const deleteTrade = useCallback((id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const resetToSeed = useCallback(() => {
    setTrades(seedTrades);
  }, []);

  const clearAll = useCallback(() => {
    setTrades([]);
  }, []);

  return { trades, addTrade, updateTrade, deleteTrade, resetToSeed, clearAll };
}
