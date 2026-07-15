import { useState } from 'react';
import { TradeForm } from './components/TradeForm';
import { TradeLog } from './components/TradeLog';
import { Dashboard } from './components/Dashboard';
import { useTrades } from './useTrades';

type Tab = 'calculator' | 'log' | 'dashboard';

const TABS: { id: Tab; label: string }[] = [
  { id: 'calculator', label: 'Calculator' },
  { id: 'log', label: 'Trade Log' },
  { id: 'dashboard', label: 'Dashboard & Insight' },
];

function App() {
  const [tab, setTab] = useState<Tab>('calculator');
  const { trades, addTrade, updateTrade, deleteTrade, clearAll } = useTrades();

  return (
    <div className="mx-auto flex min-h-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Stock Trading Calculator</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Position sizing, trade journal, and performance dashboard — ported from the 2026 trading log spreadsheet.
        </p>
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
              if (confirm('Clear all logged trades? This cannot be undone.')) clearAll();
            }}
            className="px-3 py-2 text-xs font-medium text-slate-400 transition hover:text-rose-600 dark:hover:text-rose-400"
          >
            Clear all
          </button>
        </div>
      </nav>

      <main className="flex-1 pb-10">
        {tab === 'calculator' && <TradeForm onSubmit={addTrade} />}
        {tab === 'log' && <TradeLog trades={trades} onUpdate={updateTrade} onDelete={deleteTrade} />}
        {tab === 'dashboard' && <Dashboard trades={trades} />}
      </main>
    </div>
  );
}

export default App;
