import React, { useRef, useEffect, useMemo } from 'react';
import { Play, Square, RotateCw, Settings2, ExternalLink } from 'lucide-react';
import { usePreviewStore, DEVICE_DIMENSIONS } from '../../store/previewStore';
import { useProjectStore } from '../../store/projectStore';
import { useSettingsStore } from '../../store/settingsStore';
import { PreviewBridgeHandler } from './PreviewBridge';
import { DeviceSelector } from './DeviceSelector';
import { ContextConfigModal } from './ContextConfigModal';

export const LivePreview: React.FC = () => {
  const { status, device, contextConfig, reloadKey, run, stop, reload, openContextModal } = usePreviewStore();
  const { currentProject } = useProjectStore();
  const { environmentMode } = useSettingsStore();

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initialize postMessage bridge handler
  const bridge = useMemo(
    () => new PreviewBridgeHandler(() => contextConfig, () => environmentMode),
    [contextConfig, environmentMode]
  );

  useEffect(() => {
    bridge.setIframe(iframeRef.current);
  }, [bridge, iframeRef, reloadKey, currentProject]);

  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      bridge.handleMessage(event);
    };

    window.addEventListener('message', handleWindowMessage);
    return () => {
      window.removeEventListener('message', handleWindowMessage);
    };
  }, [bridge]);

  const entryFile = currentProject?.manifest.entryFile || 'app.html';
  const previewUrl = currentProject
    ? `/preview/${currentProject.manifest.id}/${entryFile}?_k=${reloadKey}`
    : '';

  const dimension = DEVICE_DIMENSIONS[device];

  return (
    <div className="h-full flex flex-col bg-slate-100 dark:bg-studio-darkbg border-l border-slate-200 dark:border-studio-darkborder overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-studio-darksidebar border-b border-slate-200 dark:border-studio-darkborder gap-2">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'running'
                  ? 'bg-emerald-500 animate-pulse'
                  : status === 'stopped'
                  ? 'bg-slate-400'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 capitalize">
              {status}
            </span>
          </div>

          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 hidden md:inline">
            {currentProject ? `/${entryFile}` : ''}
          </span>
        </div>

        {/* Device Viewport Selector */}
        <DeviceSelector />

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={openContextModal}
            title="Configure Target Module, Record ID & PageLoad Context"
            className="p-1.5 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-studio-darkborder transition"
          >
            <Settings2 size={14} />
          </button>

          {status === 'running' ? (
            <button
              onClick={stop}
              title="Stop Preview"
              className="p-1.5 rounded text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition"
            >
              <Square size={14} />
            </button>
          ) : (
            <button
              onClick={run}
              title="Run Preview"
              className="p-1.5 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
            >
              <Play size={14} />
            </button>
          )}

          <button
            onClick={reload}
            title="Reload Widget Preview"
            className="p-1.5 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-studio-darkborder transition"
          >
            <RotateCw size={14} />
          </button>

          {currentProject && (
            <a
              href={`/preview/${currentProject.manifest.id}/${entryFile}`}
              target="_blank"
              rel="noreferrer"
              title="Open Widget in Detached Window"
              className="p-1.5 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-studio-darkborder transition"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 flex items-center justify-center p-3 overflow-auto bg-slate-200/50 dark:bg-[#0c0c0e]">
        {currentProject ? (
          status === 'running' ? (
            <div
              style={{
                width: dimension.width,
                height: dimension.height,
                maxWidth: '100%',
                maxHeight: '100%'
              }}
              className="bg-white rounded-lg shadow-lg border border-slate-300 dark:border-studio-darkborder overflow-hidden transition-all duration-200 flex flex-col"
            >
              <iframe
                ref={iframeRef}
                key={reloadKey}
                src={previewUrl}
                title="Zoho CRM Widget Live Preview"
                sandbox="allow-scripts allow-forms allow-modals"
                className="w-full h-full border-none bg-white"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 text-center p-8">
              <Square size={36} className="mb-2 text-slate-400" />
              <p className="text-sm font-medium">Widget preview execution is stopped.</p>
              <button
                onClick={run}
                className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow transition"
              >
                Start Preview
              </button>
            </div>
          )
        ) : (
          <div className="text-slate-400 text-xs">No project selected.</div>
        )}
      </div>

      {/* Context Configuration Modal */}
      <ContextConfigModal />
    </div>
  );
};
