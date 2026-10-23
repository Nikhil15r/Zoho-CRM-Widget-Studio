import React, { useState } from 'react';
import { Copy, PlusCircle, Check, Search } from 'lucide-react';
import { ZOHO_SNIPPETS, WidgetSnippet } from '../../utils/snippets';
import { globalEditorInstance } from '../editor/CodeEditor';

export const SnippetLibrary: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', 'Lifecycle', 'CRM API', 'CRM UI', 'CRM Config', 'Network & REST'];

  const filtered = ZOHO_SNIPPETS.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (snip: WidgetSnippet) => {
    navigator.clipboard.writeText(snip.code);
    setCopiedId(snip.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleInsert = (snip: WidgetSnippet) => {
    if (globalEditorInstance) {
      const position = globalEditorInstance.getPosition();
      globalEditorInstance.executeEdits('snippet-insert', [
        {
          range: new (window as any).monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
          ),
          text: '\n' + snip.code + '\n'
        }
      ]);
      globalEditorInstance.focus();
    } else {
      handleCopy(snip);
    }
  };

  return (
    <div className="h-full flex flex-col text-slate-700 dark:text-slate-300">
      {/* Search & Categories */}
      <div className="p-3 border-b border-slate-200 dark:border-studio-darkborder flex flex-col gap-2">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search snippets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-200 dark:border-studio-darkborder rounded-md pl-8 pr-2 py-1.5 text-xs outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto scrollbar-none py-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 rounded text-[11px] whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-slate-100 dark:bg-studio-darksidebar text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Snippets List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filtered.map((snip) => (
          <div
            key={snip.id}
            className="bg-white dark:bg-studio-darksidebar border border-slate-200 dark:border-studio-darkborder rounded-lg p-2.5 flex flex-col gap-1.5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{snip.title}</span>
                <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-studio-darkborder text-slate-500 uppercase font-bold">
                  {snip.category}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopy(snip)}
                  title="Copy snippet"
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-studio-darkborder transition"
                >
                  {copiedId === snip.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
                <button
                  onClick={() => handleInsert(snip)}
                  title="Insert at cursor in Code Editor"
                  className="p-1 rounded text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                >
                  <PlusCircle size={13} />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">{snip.description}</p>

            <pre className="text-[10px] font-mono bg-slate-50 dark:bg-studio-darkbg p-2 rounded border border-slate-200/60 dark:border-studio-darkborder overflow-x-auto text-slate-700 dark:text-slate-300 max-h-32">
              {snip.code}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};
