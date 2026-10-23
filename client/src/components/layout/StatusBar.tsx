import React from 'react';
import { Terminal, Database, ShieldCheck, Check } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useDevtoolsStore } from '../../store/devtoolsStore';

export const StatusBar: React.FC = () => {
  const { currentProject, activeFilePath } = useProjectStore();
  const { environmentMode, toggleDevTools, isDevToolsOpen } = useSettingsStore();
  const { consoleLogs, sdkCalls, runtimeErrors } = useDevtoolsStore();

  const getLanguage = (path?: string | null) => {
    if (!path) return 'Plain Text';
    if (path.endsWith('.html')) return 'HTML';
    if (path.endsWith('.css')) return 'CSS';
    if (path.endsWith('.js')) return 'JavaScript';
    if (path.endsWith('.ts')) return 'TypeScript';
    if (path.endsWith('.json')) return 'JSON';
    if (path.endsWith('.md')) return 'Markdown';
    return 'Plain Text';
  };

  return (
    <div className="h-6 bg-blue-600 dark:bg-[#111113] border-t border-blue-700 dark:border-studio-darkborder text-white dark:text-slate-400 flex items-center justify-between px-3 text-[11px] select-none shrink-0 z-20">
      {/* Left */}
      <div className="flex items-center gap-3">
        <span className="font-semibold">{currentProject?.manifest.name || 'No Project'}</span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline font-mono">{activeFilePath || '—'}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleDevTools}
          className="flex items-center gap-1.5 hover:text-white transition"
        >
          <Terminal size={12} />
          <span>DevTools ({consoleLogs.length})</span>
          {runtimeErrors.length > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          )}
        </button>

        <span className="hidden md:inline">•</span>

        <span className="flex items-center gap-1">
          <Database size={11} />
          <span>{environmentMode === 'real_zoho' ? 'Zoho Live CRM' : 'Mock SQLite DB'}</span>
        </span>

        <span className="hidden md:inline">•</span>

        <span className="hidden md:inline font-mono">{getLanguage(activeFilePath)}</span>
        <span className="hidden lg:inline">UTF-8</span>
      </div>
    </div>
  );
};
