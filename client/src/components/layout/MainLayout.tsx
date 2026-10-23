import React, { useState, useEffect, useRef } from 'react';
import { TopToolbar } from './TopToolbar';
import { ActivityBar } from './ActivityBar';
import { StatusBar } from './StatusBar';
import { CodeEditor } from '../editor/CodeEditor';
import { LivePreview } from '../preview/LivePreview';
import { DevToolsPanel } from '../devtools/DevToolsPanel';

import { FileExplorer } from '../sidebar/FileExplorer';
import { ProjectManager } from '../sidebar/ProjectManager';
import { SnippetLibrary } from '../sidebar/SnippetLibrary';
import { MockCrmManager } from '../sidebar/MockCrmManager';
import { ApiPlayground } from '../sidebar/ApiPlayground';
import { TestRunnerPanel } from '../sidebar/TestRunnerPanel';
import { SdkCompatibilityView } from '../sidebar/SdkCompatibilityView';
import { IntegrationsPanel } from '../sidebar/IntegrationsPanel';
import { SettingsPanel } from '../sidebar/SettingsPanel';
import { AiAssistantPanel } from '../sidebar/AiAssistantPanel';
import { AiSettingsModal } from '../ai/AiSettingsModal';

import { useSettingsStore } from '../../store/settingsStore';
import { idbGet, idbSet } from '../../utils/idb-storage';

export const MainLayout: React.FC = () => {
  const { activeSidebarTab, isSidebarOpen } = useSettingsStore();

  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [previewWidthPct, setPreviewWidthPct] = useState(45); // 45% for preview, 55% for editor
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Restore stored widths from IndexedDB
  useEffect(() => {
    idbGet<number>('sidebar_width', 260).then((w) => setSidebarWidth(w));
    idbGet<number>('preview_width_pct', 45).then((pct) => setPreviewWidthPct(pct));
  }, []);

  // Sidebar drag resizer
  const handleSidebarDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '9999';
    overlay.style.cursor = 'col-resize';
    document.body.appendChild(overlay);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(180, Math.min(500, startWidth + deltaX));
      setSidebarWidth(Math.round(newWidth));
    };

    const onMouseUp = () => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      idbSet('sidebar_width', sidebarWidth);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Editor vs Preview horizontal split resizer
  const handleSplitterDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const container = splitContainerRef.current;
    if (!container) return;
    const containerWidth = container.getBoundingClientRect().width;
    const startPct = previewWidthPct;

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '9999';
    overlay.style.cursor = 'col-resize';
    document.body.appendChild(overlay);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaPct = (deltaX / containerWidth) * 100;
      // Moving left increases preview %, moving right decreases preview %
      const newPct = Math.max(15, Math.min(85, startPct - deltaPct));
      setPreviewWidthPct(Math.round(newPct));
    };

    const onMouseUp = () => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      idbSet('preview_width_pct', previewWidthPct);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const renderSidebarContent = () => {
    switch (activeSidebarTab) {
      case 'explorer':
        return <FileExplorer />;
      case 'ai':
        return <AiAssistantPanel />;
      case 'projects':
        return <ProjectManager />;
      case 'snippets':
        return <SnippetLibrary />;
      case 'crm':
        return <MockCrmManager />;
      case 'playground':
        return <ApiPlayground />;
      case 'tests':
        return <TestRunnerPanel />;
      case 'sdk':
        return <SdkCompatibilityView />;
      case 'integrations':
        return <IntegrationsPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <FileExplorer />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 dark:bg-studio-darkbg text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      {/* Top Toolbar */}
      <TopToolbar />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Activity Bar */}
        <ActivityBar />

        {/* Collapsible & Resizable Sidebar */}
        {isSidebarOpen && (
          <div
            style={{ width: sidebarWidth }}
            className="h-full bg-slate-50 dark:bg-studio-darksidebar border-r border-slate-200 dark:border-studio-darkborder flex flex-col overflow-hidden shrink-0 z-10 relative"
          >
            {renderSidebarContent()}

            {/* Sidebar Drag Resizer Handle */}
            <div
              onMouseDown={handleSidebarDragStart}
              onDoubleClick={() => {
                setSidebarWidth(260);
                idbSet('sidebar_width', 260);
              }}
              title="Drag to resize sidebar width (Double-click to reset to 260px)"
              className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 transition z-20 group"
            >
              <div className="w-full h-full group-hover:bg-blue-500 transition" />
            </div>
          </div>
        )}

        {/* Center Editor + Live Preview */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Editor and Preview Split Container */}
          <div ref={splitContainerRef} className="flex-1 flex overflow-hidden relative">
            {/* Center Code Editor */}
            <div
              style={{ width: `${100 - previewWidthPct}%` }}
              className="h-full overflow-hidden min-w-[200px]"
            >
              <CodeEditor />
            </div>

            {/* Editor-to-Preview Split Resizer Handle */}
            <div
              onMouseDown={handleSplitterDragStart}
              onDoubleClick={() => {
                setPreviewWidthPct(50);
                idbSet('preview_width_pct', 50);
              }}
              title="Drag to resize Editor vs Preview split (Double-click to center 50/50)"
              className="relative w-1.5 h-full bg-slate-200 dark:bg-studio-darkborder hover:bg-blue-500 active:bg-blue-600 cursor-col-resize transition shrink-0 z-20 flex items-center justify-center group"
            >
              <div className="w-0.5 h-8 rounded-full bg-slate-400 group-hover:bg-white transition" />
            </div>

            {/* Live Preview Panel */}
            <div
              style={{ width: `${previewWidthPct}%` }}
              className="h-full overflow-hidden min-w-[200px]"
            >
              <LivePreview />
            </div>
          </div>

          {/* Resizable DevTools Panel */}
          <DevToolsPanel />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />

      {/* Global AI Model Configuration Dialog */}
      <AiSettingsModal />
    </div>
  );
};
