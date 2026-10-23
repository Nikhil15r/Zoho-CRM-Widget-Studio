import React, { useState, useRef } from 'react';
import {
  Terminal,
  Activity,
  Globe,
  Database,
  FlaskConical,
  AlertOctagon,
  ChevronUp,
  ChevronDown,
  Trash2,
  Maximize2,
  Minimize2,
  GripHorizontal
} from 'lucide-react';
import { useSettingsStore, DevToolsTab } from '../../store/settingsStore';
import { useDevtoolsStore } from '../../store/devtoolsStore';

export const DevToolsPanel: React.FC = () => {
  const { isDevToolsOpen, toggleDevTools, activeDevToolsTab, setActiveDevToolsTab, devToolsHeight, setDevToolsHeight } = useSettingsStore();
  const {
    consoleLogs,
    sdkCalls,
    networkLogs,
    runtimeErrors,
    clearConsoleLogs,
    clearSdkCalls,
    clearNetworkLogs,
    clearErrors
  } = useDevtoolsStore();

  const [consoleFilter, setConsoleFilter] = useState<'all' | 'log' | 'warn' | 'error'>('all');
  const [selectedSdkCallId, setSelectedSdkCallId] = useState<string | null>(null);
  const [prevHeight, setPrevHeight] = useState<number>(240);

  const isMaximized = devToolsHeight >= Math.round(window.innerHeight * 0.65);

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = devToolsHeight;

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '9999';
    overlay.style.cursor = 'row-resize';
    document.body.appendChild(overlay);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY - moveEvent.clientY;
      const newHeight = startHeight + deltaY;
      setDevToolsHeight(newHeight);
    };

    const onMouseUp = () => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleToggleMaximize = () => {
    if (isMaximized) {
      setDevToolsHeight(prevHeight || 250);
    } else {
      setPrevHeight(devToolsHeight);
      setDevToolsHeight(Math.round(window.innerHeight * 0.72));
    }
  };

  if (!isDevToolsOpen) {
    return (
      <div className="h-7 bg-white dark:bg-studio-darksidebar border-t border-slate-200 dark:border-studio-darkborder flex items-center justify-between px-3 text-xs select-none shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDevTools}
            className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-500"
          >
            <ChevronUp size={14} />
            <span>Developer Tools</span>
          </button>

          <span className="text-[11px] text-slate-400">
            {consoleLogs.length} logs • {sdkCalls.length} SDK calls
            {runtimeErrors.length > 0 && ` • ${runtimeErrors.length} errors`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDevTools}
            className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
          >
            <span>Expand</span>
            <ChevronUp size={12} />
          </button>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: DevToolsTab; label: string; count?: number; icon: React.ReactNode }> = [
    { id: 'console', label: 'Console', count: consoleLogs.length, icon: <Terminal size={13} /> },
    { id: 'sdk', label: 'SDK Call History', count: sdkCalls.length, icon: <Activity size={13} /> },
    { id: 'network', label: 'Network', count: networkLogs.length, icon: <Globe size={13} /> },
    { id: 'diagnostics', label: 'Diagnostics & Errors', count: runtimeErrors.length, icon: <AlertOctagon size={13} /> }
  ];

  const filteredConsoleLogs = consoleLogs.filter(
    (l) => consoleFilter === 'all' || l.level === consoleFilter
  );

  const selectedSdkCall = sdkCalls.find((c) => c.id === selectedSdkCallId) || sdkCalls[0];

  return (
    <div
      style={{ height: devToolsHeight }}
      className="bg-white dark:bg-studio-darkbg border-t border-slate-200 dark:border-studio-darkborder flex flex-col select-none overflow-hidden relative shrink-0"
    >
      {/* Interactive Drag Resize Handle */}
      <div
        onMouseDown={handleDragStart}
        onDoubleClick={() => {
          if (devToolsHeight < 350) setDevToolsHeight(450);
          else setDevToolsHeight(240);
        }}
        title="Click and drag up/down to resize Developer Tools (Double-click to toggle height)"
        className="h-1.5 w-full bg-slate-200 dark:bg-studio-darkborder hover:bg-blue-500 active:bg-blue-600 cursor-row-resize transition flex items-center justify-center shrink-0 group z-30"
      >
        <div className="w-10 h-0.5 rounded-full bg-slate-400 group-hover:bg-white transition" />
      </div>

      {/* DevTools Top Bar */}
      <div className="flex items-center justify-between px-2 bg-slate-100 dark:bg-studio-darksidebar border-b border-slate-200 dark:border-studio-darkborder text-xs shrink-0 py-0.5">
        <div className="flex items-center overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeDevToolsTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDevToolsTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 font-medium border-b-2 transition ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-studio-darkbg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      tab.id === 'diagnostics' && tab.count > 0
                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                        : 'bg-slate-200 dark:bg-studio-darkborder text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Height Controls & Actions */}
        <div className="flex items-center gap-1.5">
          {/* Quick Height Preset Pills */}
          <div className="hidden md:flex items-center gap-0.5 text-[10px] bg-slate-200 dark:bg-studio-darkborder p-0.5 rounded">
            <button
              onClick={() => setDevToolsHeight(160)}
              title="Set height to 160px"
              className={`px-1.5 py-0.5 rounded ${devToolsHeight <= 180 ? 'bg-white dark:bg-studio-darksurface text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
            >
              160px
            </button>
            <button
              onClick={() => setDevToolsHeight(260)}
              title="Set height to 260px"
              className={`px-1.5 py-0.5 rounded ${devToolsHeight > 180 && devToolsHeight < 360 ? 'bg-white dark:bg-studio-darksurface text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
            >
              260px
            </button>
            <button
              onClick={() => setDevToolsHeight(420)}
              title="Set height to 420px"
              className={`px-1.5 py-0.5 rounded ${devToolsHeight >= 360 && !isMaximized ? 'bg-white dark:bg-studio-darksurface text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
            >
              420px
            </button>
          </div>

          <div className="h-3.5 w-px bg-slate-300 dark:bg-studio-darkborder hidden md:block" />

          {/* Clear Button */}
          {activeDevToolsTab === 'console' && (
            <button
              onClick={clearConsoleLogs}
              title="Clear Console Output"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
            >
              <Trash2 size={13} />
            </button>
          )}

          {activeDevToolsTab === 'sdk' && (
            <button
              onClick={clearSdkCalls}
              title="Clear SDK Call History"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
            >
              <Trash2 size={13} />
            </button>
          )}

          {activeDevToolsTab === 'network' && (
            <button
              onClick={clearNetworkLogs}
              title="Clear Network Traffic"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
            >
              <Trash2 size={13} />
            </button>
          )}

          {activeDevToolsTab === 'diagnostics' && (
            <button
              onClick={clearErrors}
              title="Clear Error Traces"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
            >
              <Trash2 size={13} />
            </button>
          )}

          {/* Maximize / Restore Toggle */}
          <button
            onClick={handleToggleMaximize}
            title={isMaximized ? 'Restore Previous Height' : 'Maximize Developer Tools (72vh)'}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-studio-darkborder transition"
          >
            {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>

          {/* Collapse Button */}
          <button
            onClick={toggleDevTools}
            title="Collapse Developer Tools"
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-studio-darkborder transition"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-auto p-2 text-xs font-mono">
        {/* Console Tab */}
        {activeDevToolsTab === 'console' && (
          <div className="space-y-1">
            {/* Filter buttons */}
            <div className="flex gap-1 mb-2 font-sans text-[11px]">
              {(['all', 'log', 'warn', 'error'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setConsoleFilter(lvl)}
                  className={`px-2 py-0.5 rounded capitalize ${
                    consoleFilter === lvl
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-100 dark:bg-studio-darksidebar text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {filteredConsoleLogs.length === 0 ? (
              <div className="text-slate-400 text-center py-6 font-sans">No console output recorded yet.</div>
            ) : (
              filteredConsoleLogs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-2 py-1 px-2 rounded border-b border-slate-100 dark:border-studio-darkborder/40 ${
                    log.level === 'error'
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-300'
                      : log.level === 'warn'
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-300'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="font-bold text-[10px] uppercase shrink-0">[{log.level}]</span>
                  <div className="flex-1 overflow-x-auto whitespace-pre-wrap">
                    {log.args.map((arg, idx) => (
                      <span key={idx} className="mr-2">
                        {typeof arg === 'object' && arg !== null
                          ? JSON.stringify(arg, null, 2)
                          : String(arg)}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SDK Call History Tab */}
        {activeDevToolsTab === 'sdk' && (
          <div className="h-full flex divide-x divide-slate-200 dark:divide-studio-darkborder">
            {/* List of calls */}
            <div className="w-1/2 overflow-y-auto pr-2 space-y-1">
              {sdkCalls.length === 0 ? (
                <div className="text-slate-400 text-center py-6 font-sans">No SDK calls recorded.</div>
              ) : (
                sdkCalls.map((call) => {
                  const isSelected = selectedSdkCall?.id === call.id;
                  return (
                    <div
                      key={call.id}
                      onClick={() => setSelectedSdkCallId(call.id)}
                      className={`p-2 rounded border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-300'
                          : 'bg-white dark:bg-studio-darksidebar border-slate-200 dark:border-studio-darkborder hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                            call.status === 'success'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : call.status === 'error'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {call.status}
                        </span>
                        <span className="font-bold truncate">{call.category}.{call.action}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{call.durationMs ?? 0}ms</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Inspector detail */}
            <div className="w-1/2 pl-2 overflow-y-auto space-y-2">
              {selectedSdkCall ? (
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 mb-1">
                    {selectedSdkCall.category}.{selectedSdkCall.action}
                  </div>
                  <div className="text-[10px] text-slate-400 mb-2">
                    Executed at: {new Date(selectedSdkCall.timestamp).toLocaleTimeString()} ({selectedSdkCall.durationMs}ms)
                  </div>

                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Parameters:</div>
                  <pre className="bg-slate-900 text-slate-200 p-2 rounded max-h-32 overflow-auto text-[11px]">
                    {JSON.stringify(selectedSdkCall.params, null, 2)}
                  </pre>

                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-2">Response:</div>
                  <pre className="bg-slate-900 text-slate-200 p-2 rounded max-h-40 overflow-auto text-[11px]">
                    {JSON.stringify(selectedSdkCall.response || selectedSdkCall.errorMessage, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-slate-400 text-center py-6 font-sans">Select a call to inspect payload.</div>
              )}
            </div>
          </div>
        )}

        {/* Network Inspector Tab */}
        {activeDevToolsTab === 'network' && (
          <div className="space-y-1">
            {networkLogs.length === 0 ? (
              <div className="text-slate-400 text-center py-6 font-sans">No network requests logged.</div>
            ) : (
              networkLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded bg-white dark:bg-studio-darksidebar border border-slate-200 dark:border-studio-darkborder flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        log.status >= 200 && log.status < 300
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                      }`}
                    >
                      {log.status}
                    </span>
                    <span className="font-bold text-blue-500">{log.method}</span>
                    <span className="truncate">{log.url}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{log.durationMs}ms</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Diagnostics Tab */}
        {activeDevToolsTab === 'diagnostics' && (
          <div className="space-y-2">
            {runtimeErrors.length === 0 ? (
              <div className="text-slate-400 text-center py-6 font-sans">
                ✓ No runtime exceptions or unhandled rejections detected.
              </div>
            ) : (
              runtimeErrors.map((err) => (
                <div
                  key={err.id}
                  className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs"
                >
                  <div className="font-bold">{err.message}</div>
                  {err.filename && (
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      {err.filename}:{err.lineno}:{err.colno}
                    </div>
                  )}
                  {err.stack && (
                    <pre className="mt-2 text-[10px] bg-slate-900 text-rose-300 p-2 rounded overflow-auto max-h-24">
                      {err.stack}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
