import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Profile, RuleConfig, Trade } from './types';
import { DEFAULT_RULES } from './calc';
import { seedTrades } from './seed';

const STORAGE_KEY = 'trading-calculator/profiles/v2';

interface StoredState {
  profiles: Profile[];
  activeProfileId: string;
}

function defaultState(): StoredState {
  const profile: Profile = {
    id: crypto.randomUUID(),
    name: 'Default',
    rules: { ...DEFAULT_RULES },
    trades: seedTrades,
  };
  return { profiles: [profile], activeProfileId: profile.id };
}

function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as StoredState;
    if (!Array.isArray(parsed.profiles) || parsed.profiles.length === 0) return defaultState();
    // Backfill any rule fields missing from an older save.
    const profiles = parsed.profiles.map((p) => ({ ...p, rules: { ...DEFAULT_RULES, ...p.rules } }));
    const activeProfileId = profiles.some((p) => p.id === parsed.activeProfileId)
      ? parsed.activeProfileId
      : profiles[0].id;
    return { profiles, activeProfileId };
  } catch {
    return defaultState();
  }
}

export function useProfiles() {
  const [state, setState] = useState<StoredState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const activeProfile = useMemo(
    () => state.profiles.find((p) => p.id === state.activeProfileId) ?? state.profiles[0],
    [state],
  );

  const setActiveProfileId = useCallback((id: string) => {
    setState((s) => (s.profiles.some((p) => p.id === id) ? { ...s, activeProfileId: id } : s));
  }, []);

  const createProfile = useCallback(
    (name: string, opts?: { cloneRules?: boolean; cloneTrades?: boolean }) => {
      setState((s) => {
        const source = s.profiles.find((p) => p.id === s.activeProfileId) ?? s.profiles[0];
        const profile: Profile = {
          id: crypto.randomUUID(),
          name: name.trim() || 'Untitled Profile',
          rules: opts?.cloneRules ? { ...source.rules } : { ...DEFAULT_RULES },
          trades: opts?.cloneTrades ? source.trades.map((t) => ({ ...t, id: crypto.randomUUID() })) : [],
        };
        return { profiles: [...s.profiles, profile], activeProfileId: profile.id };
      });
    },
    [],
  );

  const renameProfile = useCallback((id: string, name: string) => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name } : p)),
    }));
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setState((s) => {
      if (s.profiles.length <= 1) return s;
      const profiles = s.profiles.filter((p) => p.id !== id);
      const activeProfileId = s.activeProfileId === id ? profiles[0].id : s.activeProfileId;
      return { profiles, activeProfileId };
    });
  }, []);

  const updateRules = useCallback((patch: Partial<RuleConfig>) => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id === s.activeProfileId ? { ...p, rules: { ...p.rules, ...patch } } : p,
      ),
    }));
  }, []);

  const resetRules = useCallback(() => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => (p.id === s.activeProfileId ? { ...p, rules: { ...DEFAULT_RULES } } : p)),
    }));
  }, []);

  const addTrade = useCallback((trade: Trade) => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id === s.activeProfileId ? { ...p, trades: [...p.trades, trade] } : p,
      ),
    }));
  }, []);

  const updateTrade = useCallback((id: string, patch: Partial<Trade>) => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id === s.activeProfileId
          ? { ...p, trades: p.trades.map((t) => (t.id === id ? { ...t, ...patch } : t)) }
          : p,
      ),
    }));
  }, []);

  const deleteTrade = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id === s.activeProfileId ? { ...p, trades: p.trades.filter((t) => t.id !== id) } : p,
      ),
    }));
  }, []);

  const clearTrades = useCallback(() => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => (p.id === s.activeProfileId ? { ...p, trades: [] } : p)),
    }));
  }, []);

  return {
    profiles: state.profiles,
    activeProfile,
    activeProfileId: state.activeProfileId,
    setActiveProfileId,
    createProfile,
    renameProfile,
    deleteProfile,
    updateRules,
    resetRules,
    addTrade,
    updateTrade,
    deleteTrade,
    clearTrades,
  };
}
