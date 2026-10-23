import { useState, useEffect } from 'react';
import { EnvironmentMode, EditorPreferences } from '@zoho-studio/shared';
import { idbGet, idbSet } from '../utils/idb-storage';

export type SidebarTab =
  | 'explorer'
  | 'projects'
  | 'snippets'
  | 'crm'
  | 'playground'
  | 'tests'
  | 'sdk'
  | 'integrations'
  | 'settings'
  | 'ai';

export type DevToolsTab =
  | 'console'
  | 'sdk'
  | 'network'
  | 'crm-query'
  | 'tests'
  | 'diagnostics';

export interface SettingsStoreState {
  theme: 'dark' | 'light';
  environmentMode: EnvironmentMode;
  runtimeMode: 'html' | 'react';
  activeSidebarTab: SidebarTab;
  isSidebarOpen: boolean;
  activeDevToolsTab: DevToolsTab;
  isDevToolsOpen: boolean;
  devToolsHeight: number;
  editor: EditorPreferences;
}

let listeners: Array<() => void> = [];

let state: SettingsStoreState = {
  theme: 'dark',
  environmentMode: 'mock',
  runtimeMode: 'html',
  activeSidebarTab: 'explorer',
  isSidebarOpen: true,
  activeDevToolsTab: 'console',
  isDevToolsOpen: true,
  devToolsHeight: 240,
  editor: {
    theme: 'vs-dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: 'on',
    autoSave: false,
    autoSaveDelayMs: 2000,
    formatOnSave: true
  }
};

function notify() {
  listeners.forEach((l) => l());
}

// Initialize settings from IDB
async function initSettings() {
  const savedTheme = await idbGet<'dark' | 'light'>('theme', 'dark');
  const savedEnv = await idbGet<EnvironmentMode>('environment_mode', 'mock');
  const savedFontSize = await idbGet<number>('editor_font_size', 14);
  const savedAutoSave = await idbGet<boolean>('editor_auto_save', false);
  const savedDevToolsHeight = await idbGet<number>('devtools_height', 240);
  const savedDevToolsOpen = await idbGet<boolean>('devtools_open', true);

  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  state = {
    ...state,
    theme: savedTheme,
    environmentMode: savedEnv,
    devToolsHeight: savedDevToolsHeight,
    isDevToolsOpen: savedDevToolsOpen,
    editor: {
      ...state.editor,
      theme: savedTheme === 'dark' ? 'vs-dark' : 'light',
      fontSize: savedFontSize,
      autoSave: savedAutoSave
    }
  };
  notify();
}

initSettings();

export const settingsActions = {
  setTheme(theme: 'dark' | 'light') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    state = {
      ...state,
      theme,
      editor: { ...state.editor, theme: theme === 'dark' ? 'vs-dark' : 'light' }
    };
    notify();
    idbSet('theme', theme);
  },

  toggleTheme() {
    settingsActions.setTheme(state.theme === 'dark' ? 'light' : 'dark');
  },

  setEnvironmentMode(mode: EnvironmentMode) {
    state = { ...state, environmentMode: mode };
    notify();
    idbSet('environment_mode', mode);
  },

  setRuntimeMode(mode: 'html' | 'react') {
    state = { ...state, runtimeMode: mode };
    notify();
  },

  setActiveSidebarTab(tab: SidebarTab) {
    if (state.activeSidebarTab === tab && state.isSidebarOpen) {
      state = { ...state, isSidebarOpen: false };
    } else {
      state = { ...state, activeSidebarTab: tab, isSidebarOpen: true };
    }
    notify();
  },

  toggleSidebar() {
    state = { ...state, isSidebarOpen: !state.isSidebarOpen };
    notify();
  },

  setActiveDevToolsTab(tab: DevToolsTab) {
    state = { ...state, activeDevToolsTab: tab, isDevToolsOpen: true };
    notify();
  },

  toggleDevTools() {
    const nextOpen = !state.isDevToolsOpen;
    state = { ...state, isDevToolsOpen: nextOpen };
    notify();
    idbSet('devtools_open', nextOpen);
  },

  setDevToolsHeight(h: number) {
    const clamped = Math.max(80, Math.min(window.innerHeight - 100, h));
    state = { ...state, devToolsHeight: clamped };
    notify();
    idbSet('devtools_height', clamped);
  },

  updateEditorSettings(updates: Partial<EditorPreferences>) {
    state = {
      ...state,
      editor: { ...state.editor, ...updates }
    };
    notify();
    if (updates.fontSize) idbSet('editor_font_size', updates.fontSize);
    if (updates.autoSave !== undefined) idbSet('editor_auto_save', updates.autoSave);
  }
};

export function useSettingsStore() {
  const [current, setCurrent] = useState<SettingsStoreState>(state);

  useEffect(() => {
    const update = () => setCurrent(state);
    listeners.push(update);
    return () => {
      listeners = listeners.filter((l) => l !== update);
    };
  }, []);

  return { ...current, ...settingsActions };
}
