import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Settings,
  Trash2,
  Send,
  Wrench,
  BookOpen,
  Code2,
  FilePlus,
  Play,
  Copy,
  Check,
  AlertTriangle,
  FileCode,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAiStore } from '../../store/aiStore';
import { useProjectStore } from '../../store/projectStore';
import { useDevtoolsStore } from '../../store/devtoolsStore';
import { usePreviewStore } from '../../store/previewStore';
import { globalEditorInstance } from '../editor/CodeEditor';
import { AiContextPayload } from '@zoho-studio/shared';

export const AiAssistantPanel: React.FC = () => {
  const {
    messages,
    config,
    isLoading,
    error,
    sendMessage,
    runQuickAction,
    clearChat,
    setConfigModalOpen
  } = useAiStore();

  const {
    currentProject,
    activeFilePath,
    unsavedFiles,
    updateUnsavedContent,
    createFile,
    saveFile,
    openTab
  } = useProjectStore();

  const { consoleLogs, runtimeErrors } = useDevtoolsStore();
  const { reload } = usePreviewStore();

  const [input, setInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [appliedFile, setAppliedFile] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Build real-time context payload from current IDE state
  const buildCurrentContext = (): AiContextPayload => {
    let selectedCode: string | undefined;
    if (globalEditorInstance) {
      const model = globalEditorInstance.getModel();
      const selection = globalEditorInstance.getSelection();
      if (model && selection && !selection.isEmpty()) {
        selectedCode = model.getValueInRange(selection);
      }
    }

    const activeContent = activeFilePath
      ? unsavedFiles[activeFilePath] !== undefined
        ? unsavedFiles[activeFilePath]
        : currentProject?.files.find((f) => f.path === activeFilePath)?.content
      : undefined;

    const recentErrors: Array<{ message: string; stack?: string }> = [
      ...runtimeErrors.map((e) => ({
        message: e.message,
        stack: `${e.filename || 'unknown'}:${e.lineno || 0}`
      })),
      ...consoleLogs
        .filter((l) => l.level === 'error')
        .map((l) => ({ message: l.args.join(' ') }))
    ].slice(0, 8);

    return {
      activeFilePath: activeFilePath || undefined,
      activeFileContent: activeContent,
      selectedCode,
      projectFilesSummary: currentProject?.files.map((f) => ({ path: f.path })),
      projectManifest: currentProject?.manifest,
      recentConsoleErrors: recentErrors.length > 0 ? recentErrors : undefined
    };
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    const context = buildCurrentContext();
    sendMessage(text, context);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleInsertAtCursor = (code: string) => {
    if (globalEditorInstance) {
      const position = globalEditorInstance.getPosition();
      globalEditorInstance.executeEdits('ai-copilot-insert', [
        {
          range: new (window as any).monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
          ),
          text: '\n' + code + '\n'
        }
      ]);
      globalEditorInstance.focus();
    } else {
      navigator.clipboard.writeText(code);
    }
  };

  const handleApplyToFile = async (code: string, filePath?: string) => {
    const targetPath = filePath || activeFilePath;
    if (!targetPath) return;

    updateUnsavedContent(targetPath, code);
    await saveFile(targetPath);
    setAppliedFile(targetPath);
    setTimeout(() => setAppliedFile(null), 2000);
    reload();
  };

  const handleCreateProposedFile = async (filePath: string, content: string) => {
    await createFile(filePath, content);
    openTab(filePath);
    reload();
  };

  // Render assistant message content with formatted code blocks
  const renderMessageContent = (content: string, msgId: string) => {
    const parts: React.ReactNode[] = [];
    const codeBlockRegex = /```([a-zA-Z0-9_\-\.]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <div key={`text-${lastIndex}`} className="whitespace-pre-wrap leading-relaxed">
            {content.substring(lastIndex, match.index)}
          </div>
        );
      }

      const lang = match[1] || 'javascript';
      const code = match[2].trim();
      const codeId = `${msgId}-block-${blockIndex++}`;

      // Detect filename header inside the code block if present (e.g. // app.js)
      let detectedPath: string | undefined;
      const firstLine = code.split('\n')[0];
      const filenameMatch = firstLine.match(/^\/\/\s*([a-zA-Z0-9_\-\./\\]+\.[a-zA-Z0-9]+)/);
      if (filenameMatch) {
        detectedPath = filenameMatch[1];
      }

      parts.push(
        <div
          key={codeId}
          className="my-2.5 rounded-xl border border-slate-700/60 bg-slate-950 text-slate-100 overflow-hidden text-xs shadow-md"
        >
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
            <span className="font-mono flex items-center gap-1.5 text-indigo-300">
              <Code2 size={12} />
              {detectedPath || lang || 'code'}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleCopyCode(code, codeId)}
                title="Copy code"
                className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1"
              >
                {copiedIndex === codeId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span className="text-[10px]">{copiedIndex === codeId ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleInsertAtCursor(code)}
                title="Insert at cursor in editor"
                className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1"
              >
                <ArrowRight size={12} className="text-blue-400" />
                <span className="text-[10px]">Insert</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyToFile(code, detectedPath)}
                title="Apply to active file"
                className="p-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 transition flex items-center gap-1"
              >
                {appliedFile === (detectedPath || activeFilePath) ? (
                  <Check size={12} className="text-emerald-400" />
                ) : (
                  <Play size={12} className="text-indigo-400" />
                )}
                <span className="text-[10px]">
                  {appliedFile === (detectedPath || activeFilePath) ? 'Applied!' : 'Apply to File'}
                </span>
              </button>
            </div>
          </div>

          <pre className="p-3 overflow-x-auto font-mono text-[11px] leading-relaxed text-slate-200 selection:bg-indigo-600/40">
            <code>{code}</code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(
        <div key={`text-${lastIndex}`} className="whitespace-pre-wrap leading-relaxed">
          {content.substring(lastIndex)}
        </div>
      );
    }

    return parts;
  };

  const hasRecentErrors = runtimeErrors.length > 0 || consoleLogs.some((l) => l.level === 'error');

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-studio-darksidebar text-slate-700 dark:text-slate-300 overflow-hidden">
      {/* Panel Header */}
      <div className="px-3 py-2.5 border-b border-slate-200 dark:border-studio-darkborder bg-white dark:bg-studio-darkbg/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white shadow-sm">
            <Sparkles size={14} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">AI Copilot</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
                {config.provider === 'simulator' ? 'Simulator' : config.model || config.provider}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setConfigModalOpen(true)}
            title="Configure AI Provider & Models"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Settings size={14} />
          </button>
          <button
            onClick={clearChat}
            title="Clear Chat History"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Quick Action Chips */}
      <div className="px-3 py-2 bg-slate-100/70 dark:bg-studio-darkbg/30 border-b border-slate-200 dark:border-studio-darkborder flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
        <button
          onClick={() => runQuickAction('fix', buildCurrentContext())}
          disabled={isLoading}
          className={`px-2 py-1 rounded-md border flex items-center gap-1 font-medium transition shrink-0 ${
            hasRecentErrors
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 animate-pulse'
              : 'bg-white dark:bg-studio-darksidebar border-slate-200 dark:border-studio-darkborder hover:border-indigo-400 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Wrench size={11} className={hasRecentErrors ? 'text-amber-500' : 'text-indigo-500'} />
          <span>Fix Bug</span>
          {hasRecentErrors && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          )}
        </button>

        <button
          onClick={() => runQuickAction('explain', buildCurrentContext())}
          disabled={isLoading}
          className="px-2 py-1 rounded-md border border-slate-200 dark:border-studio-darkborder bg-white dark:bg-studio-darksidebar hover:border-indigo-400 text-slate-700 dark:text-slate-300 flex items-center gap-1 font-medium transition shrink-0"
        >
          <BookOpen size={11} className="text-blue-500" />
          <span>Explain</span>
        </button>

        <button
          onClick={() => runQuickAction('refactor', buildCurrentContext())}
          disabled={isLoading}
          className="px-2 py-1 rounded-md border border-slate-200 dark:border-studio-darkborder bg-white dark:bg-studio-darksidebar hover:border-indigo-400 text-slate-700 dark:text-slate-300 flex items-center gap-1 font-medium transition shrink-0"
        >
          <Code2 size={11} className="text-purple-500" />
          <span>Refactor</span>
        </button>

        <button
          onClick={() => runQuickAction('generate_component', buildCurrentContext(), 'Interactive CRM Deals Table')}
          disabled={isLoading}
          className="px-2 py-1 rounded-md border border-slate-200 dark:border-studio-darkborder bg-white dark:bg-studio-darksidebar hover:border-indigo-400 text-slate-700 dark:text-slate-300 flex items-center gap-1 font-medium transition shrink-0"
        >
          <Layers size={11} className="text-emerald-500" />
          <span>Deals Table</span>
        </button>

        <button
          onClick={() => runQuickAction('generate_tests', buildCurrentContext())}
          disabled={isLoading}
          className="px-2 py-1 rounded-md border border-slate-200 dark:border-studio-darkborder bg-white dark:bg-studio-darksidebar hover:border-indigo-400 text-slate-700 dark:text-slate-300 flex items-center gap-1 font-medium transition shrink-0"
        >
          <Check size={11} className="text-cyan-500" />
          <span>Tests</span>
        </button>
      </div>

      {/* Active Context Bar */}
      <div className="px-3 py-1 bg-white/50 dark:bg-studio-darkbg/20 border-b border-slate-200 dark:border-studio-darkborder flex items-center gap-2 text-[10px] text-slate-500">
        <span className="flex items-center gap-1 truncate">
          <FileCode size={11} className="text-slate-400 shrink-0" />
          <span className="font-mono text-slate-600 dark:text-slate-300">{activeFilePath || 'No file selected'}</span>
        </span>
        {hasRecentErrors && (
          <span className="flex items-center gap-1 text-amber-500 shrink-0 ml-auto">
            <AlertTriangle size={11} />
            <span>Errors captured</span>
          </span>
        )}
      </div>

      {/* Chat Messages Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1 px-1">
              <span>{msg.role === 'user' ? 'You' : 'Copilot'}</span>
              <span>•</span>
              <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <div
              className={`max-w-[95%] rounded-2xl p-3 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-studio-darkbg border border-slate-200 dark:border-studio-darkborder text-slate-800 dark:text-slate-200 rounded-bl-none'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="space-y-1">
                  {renderMessageContent(msg.content, msg.id)}

                  {/* Proposed files button shortcuts */}
                  {msg.proposedFiles && msg.proposedFiles.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Suggested Files
                      </span>
                      {msg.proposedFiles.map((file, fIdx) => (
                        <div
                          key={fIdx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60"
                        >
                          <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                            {file.path}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCreateProposedFile(file.path, file.content)}
                            className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-medium transition flex items-center gap-1"
                          >
                            <FilePlus size={11} />
                            <span>Save to Project</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="bg-white dark:bg-studio-darkbg border border-slate-200 dark:border-studio-darkborder rounded-2xl rounded-bl-none p-3 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-500 text-xs">
                <Sparkles size={14} className="animate-spin" />
                <span className="font-medium">Zoho Copilot is analyzing & writing code...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs">
            <div className="flex items-center gap-1.5 font-medium mb-1">
              <AlertTriangle size={13} />
              <span>AI Request Error</span>
            </div>
            <p className="text-[11px]">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-3 bg-white dark:bg-studio-darkbg/60 border-t border-slate-200 dark:border-studio-darkborder">
        <form onSubmit={handleSend} className="relative flex flex-col">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Copilot (e.g. 'Fetch Deals and render cards', 'Fix PageLoad event')..."
            rows={2}
            className="w-full bg-slate-50 dark:bg-studio-darksidebar border border-slate-200 dark:border-studio-darkborder rounded-xl p-2.5 pr-10 text-xs outline-none focus:border-indigo-500 resize-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />

          <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg font-medium transition flex items-center gap-1 shadow-sm"
            >
              <span>Send</span>
              <Send size={11} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
