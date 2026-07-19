import { useState } from 'react';
import { TradeForm } from './components/TradeForm';
import { CloseTradeForm } from './components/CloseTradeForm';
import { TradeLog } from './components/TradeLog';
import { Dashboard } from './components/Dashboard';
import { RulesSettings } from './components/RulesSettings';
import { useProfiles } from './useProfiles';

type Tab = 'calculator' | 'close' | 'log' | 'dashboard' | 'rules';

const TABS: { id: Tab; label: string }[] = [
  { id: 'calculator', label: 'Calculator' },
  { id: 'close', label: 'Close Trade' },
  { id: 'log', label: 'Trade Log' },
  { id: 'dashboard', label: 'Dashboard & Insight' },
  { id: 'rules', label: 'Rules' },
];

function ProfileSwitcher({
  profiles,
  activeProfileId,
  onSwitch,
  onCreate,
  onRename,
  onDelete,
}: {
  profiles: { id: string; name: string }[];
  activeProfileId: string;
  onSwitch: (id: string) => void;
  onCreate: (name: string, cloneRules: boolean) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState(false);

  const activeName = profiles.find((p) => p.id === activeProfileId)?.name ?? '';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={activeProfileId}
        onChange={(e) => onSwitch(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {renaming ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newName.trim()) onRename(activeProfileId, newName.trim());
            setRenaming(false);
            setNewName('');
          }}
          className="flex items-center gap-1"
        >
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-32 rounded-lg border border-slate-300 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
          />
          <button type="submit" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Save
          </button>
        </form>
      ) : (
        <button
          onClick={() => {
            setNewName(activeName);
            setRenaming(true);
          }}
          className="text-xs font-medium text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
        >
          Rename
        </button>
      )}

      {profiles.length > 1 && (
        <button
          onClick={() => {
            if (confirm(`Delete profile "${activeName}"? This removes its rules and trade log.`)) onDelete(activeProfileId);
          }}
          className="text-xs font-medium text-slate-400 transition hover:text-rose-600 dark:hover:text-rose-400"
        >
          Delete
        </button>
      )}

      {creating ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onCreate(newName || 'New Profile', true);
            setCreating(false);
            setNewName('');
          }}
          className="flex items-center gap-1"
        >
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Profile name"
            className="w-32 rounded-lg border border-slate-300 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
          />
          <button type="submit" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Create
          </button>
          <button
            type="button"
            onClick={() => {
              setCreating(false);
              setNewName('');
            }}
            className="text-xs text-slate-400"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="rounded-lg border border-indigo-300 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
        >
          + New Profile
        </button>
      )}
    </div>
  );
}

function App() {
  const [tab, setTab] = useState<Tab>('calculator');
  const [closingTradeId, setClosingTradeId] = useState<string | null>(null);
  const {
    profiles,
    activeProfile,
    activeProfileId,
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
  } = useProfiles();

  return (
    <div className="mx-auto flex min-h-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Stock Trading Calculator</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Position sizing, trade journal, and performance dashboard — every rule configurable per profile.
            </p>
          </div>
          <ProfileSwitcher
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSwitch={(id) => {
              setActiveProfileId(id);
              setClosingTradeId(null);
            }}
            onCreate={(name, cloneRules) => createProfile(name, { cloneRules })}
            onRename={renameProfile}
            onDelete={deleteProfile}
          />
        </div>
      </header>

      <nav className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center">
          <button
            onClick={() => {
              if (confirm('Clear all logged trades in this profile? This cannot be undone.')) clearTrades();
            }}
            className="px-3 py-2 text-xs font-medium text-slate-400 transition hover:text-rose-600 dark:hover:text-rose-400"
          >
            Clear trades
          </button>
        </div>
      </nav>

      <main className="flex-1 pb-10">
        {tab === 'calculator' && <TradeForm rules={activeProfile.rules} onSubmit={addTrade} />}
        {tab === 'close' && (
          <CloseTradeForm
            trades={activeProfile.trades}
            rules={activeProfile.rules}
            selectedId={closingTradeId}
            onSelectedIdChange={setClosingTradeId}
            onClose={(id, patch) => {
              updateTrade(id, patch);
              setClosingTradeId(null);
            }}
          />
        )}
        {tab === 'log' && (
          <TradeLog
            trades={activeProfile.trades}
            rules={activeProfile.rules}
            onUpdate={updateTrade}
            onDelete={deleteTrade}
            onRequestClose={(id) => {
              setClosingTradeId(id);
              setTab('close');
            }}
          />
        )}
        {tab === 'dashboard' && <Dashboard trades={activeProfile.trades} rules={activeProfile.rules} />}
        {tab === 'rules' && (
          <RulesSettings rules={activeProfile.rules} onUpdate={updateRules} onReset={resetRules} />
        )}
      </main>
    </div>
  );
}

export default App;
