import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Search, Copy, Check } from 'lucide-react';
import { SDK_METHOD_CATALOG } from '@zoho-studio/shared';

export const SdkCompatibilityView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'simulated' | 'real_only' | 'unsupported'>('all');
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const filtered = SDK_METHOD_CATALOG.filter((m) => {
    const matchesFilter = filter === 'all' || m.status === filter;
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'simulated') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
          <CheckCircle size={11} /> Simulated & Real
        </span>
      );
    }
    if (status === 'real_only') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded">
          <AlertTriangle size={11} /> Real Zoho Only
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded">
        <XCircle size={11} /> Unsupported
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col text-slate-700 dark:text-slate-300">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-studio-darkborder flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            SDK Compatibility Matrix
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {SDK_METHOD_CATALOG.filter((m) => m.status === 'simulated').length} Simulated
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-1 overflow-x-auto text-[11px]">
          {(['all', 'simulated', 'real_only', 'unsupported'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded capitalize transition ${
                filter === f
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-slate-100 dark:bg-studio-darksidebar text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search SDK APIs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-200 dark:border-studio-darkborder rounded pl-7 pr-2 py-1 text-xs outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Method catalog */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filtered.map((item) => (
          <div
            key={item.name}
            className="bg-white dark:bg-studio-darksidebar border border-slate-200 dark:border-studio-darkborder rounded-lg p-2.5 text-xs flex flex-col gap-1.5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                {item.name}
              </span>
              {getStatusBadge(item.status)}
            </div>

            <div className="text-[10px] font-mono text-slate-500 bg-slate-50 dark:bg-studio-darkbg p-1.5 rounded border border-slate-200/50 dark:border-studio-darkborder/50">
              {item.signature}
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
              {item.description}
            </p>

            <div className="relative group mt-1">
              <pre className="text-[10px] font-mono bg-slate-900 text-slate-200 p-2 rounded overflow-x-auto">
                {item.example}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(item.example);
                  setCopiedName(item.name);
                  setTimeout(() => setCopiedName(null), 1500);
                }}
                className="absolute top-1.5 right-1.5 p-1 bg-slate-800 text-slate-300 hover:text-white rounded text-[10px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
              >
                {copiedName === item.name ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
