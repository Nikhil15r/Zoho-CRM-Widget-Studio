import React from 'react';
import {
  Files,
  FolderKanban,
  BookOpen,
  Database,
  Send,
  PlayCircle,
  Layers,
  Link2,
  Settings,
  Moon,
  Sun,
  Sparkles
} from 'lucide-react';
import { SidebarTab, useSettingsStore } from '../../store/settingsStore';

export const ActivityBar: React.FC = () => {
  const { activeSidebarTab, isSidebarOpen, setActiveSidebarTab, theme, toggleTheme } = useSettingsStore();

  const navItems: Array<{ id: SidebarTab; label: string; icon: React.ReactNode }> = [
    { id: 'explorer', label: 'File Explorer', icon: <Files size={18} /> },
    { id: 'ai', label: 'AI Copilot & Assistant', icon: <Sparkles size={18} className="text-indigo-500" /> },
    { id: 'projects', label: 'Projects', icon: <FolderKanban size={18} /> },
    { id: 'snippets', label: 'Snippet Library', icon: <BookOpen size={18} /> },
    { id: 'crm', label: 'Mock CRM Data', icon: <Database size={18} /> },
    { id: 'playground', label: 'API Playground', icon: <Send size={18} /> },
    { id: 'tests', label: 'Test Runner', icon: <PlayCircle size={18} /> },
    { id: 'sdk', label: 'SDK Compatibility', icon: <Layers size={18} /> },
    { id: 'integrations', label: 'Zoho CRM Integration', icon: <Link2 size={18} /> },
    { id: 'settings', label: 'Studio Settings', icon: <Settings size={18} /> }
  ];

  return (
    <div className="w-12 h-full bg-slate-200 dark:bg-studio-darksidebar border-r border-slate-300 dark:border-studio-darkborder flex flex-col justify-between py-2 select-none z-10 shrink-0">
      {/* Top Nav items */}
      <div className="flex flex-col items-center gap-1">
        {navItems.map((item) => {
          const isActive = activeSidebarTab === item.id && isSidebarOpen;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSidebarTab(item.id)}
              title={item.label}
              className={`p-2.5 rounded-lg transition relative ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-studio-darksurface shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-300/50 dark:hover:bg-studio-darkborder'
              }`}
            >
              {item.icon}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-blue-600 dark:bg-blue-400 rounded-r" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-300/50 dark:hover:bg-studio-darkborder transition"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
};
