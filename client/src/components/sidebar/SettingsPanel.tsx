import React from 'react';
import { Moon, Sun, Sliders, Monitor, Code, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { usePreviewStore, PreviewDevice } from '../../store/previewStore';
import { useAiStore } from '../../store/aiStore';

export const SettingsPanel: React.FC = () => {
  const { theme, setTheme, editor, updateEditorSettings } = useSettingsStore();
  const { device, setDevice, contextConfig, setContextConfig } = usePreviewStore();
  const { config, setConfigModalOpen } = useAiStore();

  return (
    <div className="h-full flex flex-col text-slate-700 dark:text-slate-300 overflow-y-auto p-3 space-y-4 text-xs">
      {/* Theme */}
      <div className="bg-white dark:bg-studio-darksidebar border border-slate-200 dark:border-studio-darkborder rounded-xl p-3 flex flex-col gap-2 shadow-sm">
        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          {theme === 'dark' ? <Moon size={13} className="text-blue-400" /> : <Sun size={13} className="text-amber-500" />}
          Color Theme
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => setTheme('dark')}
            className={`flex-1 py-1.5 px-3 rounded-lg border font-medium flex items-center justify-center gap-1.5 transition ${
              theme === 'dark'
                ? 'bg-slate-900 border-blue-500 text-white'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Moon size={12} />
            <span>Dark</span>
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 py-1.5 px-3 rounded-lg border font-medium flex items-center justify-center gap-1.5 transition ${
              theme === 'light'
                ? 'bg-white border-blue-500 text-blue-600 shadow-sm'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun size={12} />
            <span>Light</span>
          </button>
        </div>
      </div>

      {/* Editor Preferences */}
      <div className="bg-white dark:bg-studio-darksidebar border border-slate-200 dark:border-studio-darkborder rounded-xl p-3 flex flex-col gap-3 shadow-sm">
        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Code size={13} className="text-blue-500" />
          Monaco Code Editor
        </span>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-500 dark:text-slate-400">Font Size</span>
            <span className="font-mono font-bold text-blue-500">{editor.fontSize}px</span>
          </div>
          <input
            type="range"
            min="11"
            max="22"
            step="1"
            value={editor.fontSize}
            onChange={(e) => updateEditorSettings({ fontSize: Number(e.target.value) })}
            className="w-full accent-blue-600"
          />
        </div>

        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-1">Tab Size</label>
          <select
            value={editor.tabSize}
            onChange={(e) => updateEditorSettings({ tabSize: Number(e.target.value) })}
            className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder rounded-md px-2 py-1 text-xs outline-none"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-300">Word Wrap</span>
          <input
            type="checkbox"
            checked={editor.wordWrap === 'on'}
            onChange={(e) => updateEditorSettings({ wordWrap: e.target.checked ? 'on' : 'off' })}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-slate-600 dark:text-slate-300">Auto Save</div>
            <div className="text-[10px] text-slate-400">Save edits after typing pause</div>
          </div>
          <input
            type="checkbox"
            checked={editor.autoSave}
            onChange={(e) => updateEditorSettings({ autoSave: e.target.checked })}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Preview Runtime Settings */}
      <div className="bg-white dark:bg-studio-darksidebar border border-slate-200 dark:border-studio-darkborder rounded-xl p-3 flex flex-col gap-3 shadow-sm">
        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Monitor size={13} className="text-blue-500" />
          Preview Settings
        </span>

        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-1">Default Viewport</label>
          <select
            value={device}
            onChange={(e) => setDevice(e.target.value as PreviewDevice)}
            className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder rounded-md px-2 py-1 text-xs outline-none"
          >
            <option value="responsive">Full Responsive</option>
            <option value="web-tab">Web Tab View (100%)</option>
            <option value="related-list">Related List Widget (820x560)</option>
            <option value="modal">Custom Button Popup (700x500)</option>
            <option value="mobile">Zoho CRM Mobile App (375x667)</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-500 dark:text-slate-400">SDK Latency Simulation</span>
            <span className="font-mono font-bold text-blue-500">{contextConfig.simulatedLatencyMs ?? 40}ms</span>
          </div>
          <input
            type="range"
            min="0"
            max="1000"
            step="20"
            value={contextConfig.simulatedLatencyMs ?? 40}
            onChange={(e) => setContextConfig({ simulatedLatencyMs: Number(e.target.value) })}
            className="w-full accent-blue-600"
          />
        </div>
      </div>

      {/* AI Copilot & Model Settings */}
      <div className="bg-white dark:bg-studio-darksidebar border border-slate-200 dark:border-studio-darkborder rounded-xl p-3 flex flex-col gap-2.5 shadow-sm">
        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-indigo-500" />
            AI Copilot System
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
            {config.provider === 'simulator' ? 'Simulator' : config.model}
          </span>
        </span>
        <p className="text-[11px] text-slate-400">
          Configure external models (OpenAI/Codex, Claude, Gemini, Ollama) or offline Zoho Copilot.
        </p>
        <button
          onClick={() => setConfigModalOpen(true)}
          className="w-full py-1.5 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-medium flex items-center justify-center gap-1.5 transition text-xs"
        >
          <SettingsIcon size={12} />
          <span>Configure AI Models & Keys</span>
        </button>
      </div>
    </div>
  );
};
