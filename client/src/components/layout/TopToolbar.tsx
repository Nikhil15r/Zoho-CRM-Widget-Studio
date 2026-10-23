import React, { useRef } from 'react';
import {
  FilePlus,
  FolderOpen,
  Upload,
  Save,
  Undo2,
  Redo2,
  Play,
  Square,
  RotateCw,
  AlignLeft,
  PlayCircle,
  Download,
  Settings,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { usePreviewStore } from '../../store/previewStore';
import { useSettingsStore } from '../../store/settingsStore';
import { globalEditorInstance } from '../editor/CodeEditor';

export const TopToolbar: React.FC = () => {
  const { currentProject, unsavedFiles, activeFilePath, saveFile, exportCurrentProjectZip, importZipFile, createProject } = useProjectStore();
  const { status, run, stop, reload } = usePreviewStore();
  const { environmentMode, setEnvironmentMode, runtimeMode, setRuntimeMode, setActiveSidebarTab } = useSettingsStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasUnsavedChanges = activeFilePath ? unsavedFiles[activeFilePath] !== undefined : false;

  const handleNewProject = async () => {
    const name = prompt('Enter new project name:');
    if (!name || !name.trim()) return;
    try {
      await createProject(name.trim());
      reload();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importZipFile(file);
      reload();
    } catch (err: any) {
      alert('Import failed: ' + err.message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUndo = () => {
    if (globalEditorInstance) {
      globalEditorInstance.trigger('toolbar', 'undo', null);
      globalEditorInstance.focus();
    }
  };

  const handleRedo = () => {
    if (globalEditorInstance) {
      globalEditorInstance.trigger('toolbar', 'redo', null);
      globalEditorInstance.focus();
    }
  };

  const handleFormatCode = () => {
    if (globalEditorInstance) {
      globalEditorInstance.getAction('editor.action.formatDocument')?.run();
      globalEditorInstance.focus();
    }
  };

  return (
    <div className="h-10 bg-slate-200 dark:bg-studio-darksidebar border-b border-slate-300 dark:border-studio-darkborder flex items-center justify-between px-3 text-xs select-none shrink-0 z-20">
      {/* Hidden File Input for ZIP Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Left Toolbar Items: Project & File Operations */}
      <div className="flex items-center gap-1">
        {/* App Title / Logo */}
        <div className="flex items-center gap-2 mr-3 font-bold text-slate-800 dark:text-slate-100">
          <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-[11px]">
            Z
          </div>
          <span className="hidden sm:inline">Zoho CRM Widget Studio</span>
        </div>

        <div className="h-4 w-px bg-slate-300 dark:bg-studio-darkborder mx-1" />

        <button
          onClick={handleNewProject}
          title="New Project"
          className="flex items-center gap-1 px-2 py-1 rounded text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-studio-darkborder transition"
        >
          <FilePlus size={13} />
          <span className="hidden md:inline">New</span>
        </button>

        <button
          onClick={() => setActiveSidebarTab('projects')}
          title="Open Project"
          className="flex items-center gap-1 px-2 py-1 rounded text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-studio-darkborder transition"
        >
          <FolderOpen size={13} />
          <span className="hidden md:inline">Open</span>
        </button>

        <button
          onClick={handleImportClick}
          title="Import Project from ZIP Archive"
          className="flex items-center gap-1 px-2 py-1 rounded text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-studio-darkborder transition"
        >
          <Upload size={13} />
          <span className="hidden lg:inline">Import</span>
        </button>

        <button
          onClick={() => {
            saveFile();
            reload();
          }}
          title={hasUnsavedChanges ? 'Save Unsaved Changes (Ctrl+S)' : 'Save (Ctrl+S)'}
          className={`flex items-center gap-1 px-2 py-1 rounded transition ${
            hasUnsavedChanges
              ? 'bg-blue-600 text-white font-bold animate-pulse'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-studio-darkborder'
          }`}
        >
          <Save size={13} />
          <span>Save</span>
        </button>

        <button
          onClick={exportCurrentProjectZip}
          title="Export Project as ZIP Archive"
          className="flex items-center gap-1 px-2 py-1 rounded text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-studio-darkborder transition"
        >
          <Download size={13} />
          <span className="hidden lg:inline">Export</span>
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-studio-darkborder mx-1" />

        {/* Undo / Redo / Format */}
        <button
          onClick={handleUndo}
          title="Undo (Ctrl+Z)"
          className="p-1 rounded text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-studio-darkborder transition"
        >
          <Undo2 size={13} />
        </button>

        <button
          onClick={handleRedo}
          title="Redo (Ctrl+Y)"
          className="p-1 rounded text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-studio-darkborder transition"
        >
          <Redo2 size={13} />
        </button>

        <button
          onClick={handleFormatCode}
          title="Format Document (Shift+Alt+F)"
          className="flex items-center gap-1 px-2 py-1 rounded text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-studio-darkborder transition"
        >
          <AlignLeft size={13} />
          <span className="hidden xl:inline">Format</span>
        </button>
      </div>

      {/* Center / Right: Execution Controls & Selectors */}
      <div className="flex items-center gap-2">
        {/* Run / Stop / Reload */}
        <div className="flex items-center bg-slate-100 dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder rounded-md p-0.5">
          {status === 'running' ? (
            <button
              onClick={stop}
              title="Stop Preview Runtime"
              className="flex items-center gap-1 px-2 py-0.5 rounded text-amber-600 font-semibold hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
            >
              <Square size={12} />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={run}
              title="Run Preview"
              className="flex items-center gap-1 px-2 py-0.5 rounded text-emerald-600 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
            >
              <Play size={12} />
              <span>Run</span>
            </button>
          )}

          <button
            onClick={reload}
            title="Reload Preview"
            className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <RotateCw size={12} />
          </button>
        </div>

        {/* AI Copilot shortcut button */}
        <button
          onClick={() => setActiveSidebarTab('ai')}
          title="Open AI Copilot & Assistant"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border border-indigo-400/30 text-indigo-700 dark:text-indigo-300 font-medium hover:border-indigo-500 transition shadow-xs"
        >
          <Sparkles size={13} className="text-indigo-500" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Test runner button */}
        <button
          onClick={() => setActiveSidebarTab('tests')}
          title="Run Widget Test Runner"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder text-slate-700 dark:text-slate-200 font-medium hover:border-blue-500 transition"
        >
          <PlayCircle size={13} className="text-blue-500" />
          <span className="hidden sm:inline">Test</span>
        </button>

        {/* Environment Selector */}
        <select
          value={environmentMode}
          onChange={(e) => setEnvironmentMode(e.target.value as any)}
          title="Switch between Mock CRM database and Real Zoho CRM integration"
          className="bg-slate-100 dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder rounded-md px-2 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 outline-none"
        >
          <option value="mock">Env: Mock CRM</option>
          <option value="real_zoho">Env: Real Zoho</option>
        </select>

        {/* Runtime Selector */}
        <select
          value={runtimeMode}
          onChange={(e) => setRuntimeMode(e.target.value as any)}
          title="Runtime mode: Standalone HTML/JS or React Vite"
          className="bg-slate-100 dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder rounded-md px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none hidden md:block"
        >
          <option value="html">Runtime: HTML/JS</option>
          <option value="react">Runtime: React</option>
        </select>

        {/* Settings button */}
        <button
          onClick={() => setActiveSidebarTab('settings')}
          title="Studio Settings"
          className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-studio-darkborder transition"
        >
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
};
