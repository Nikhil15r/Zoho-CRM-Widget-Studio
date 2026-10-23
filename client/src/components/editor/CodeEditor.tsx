import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useProjectStore } from '../../store/projectStore';
import { useSettingsStore } from '../../store/settingsStore';
import { usePreviewStore } from '../../store/previewStore';
import { EditorTabs } from './EditorTabs';

// Global reference so toolbar buttons can invoke format / undo / redo
export let globalEditorInstance: any = null;

export const CodeEditor: React.FC = () => {
  const { currentProject, activeFilePath, unsavedFiles, updateUnsavedContent, saveFile } = useProjectStore();
  const { editor: editorPrefs, theme } = useSettingsStore();
  const { reload } = usePreviewStore();
  const editorRef = useRef<any>(null);

  const activeFile = currentProject?.files.find((f) => f.path === activeFilePath);
  const currentContent = activeFilePath && unsavedFiles[activeFilePath] !== undefined
    ? unsavedFiles[activeFilePath]
    : activeFile?.content || '';

  const getLanguage = (filePath?: string | null) => {
    if (!filePath) return 'javascript';
    if (filePath.endsWith('.html') || filePath.endsWith('.htm')) return 'html';
    if (filePath.endsWith('.css')) return 'css';
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) return 'javascript';
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) return 'typescript';
    if (filePath.endsWith('.json')) return 'json';
    if (filePath.endsWith('.md')) return 'markdown';
    return 'plaintext';
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    globalEditorInstance = editor;

    // Add Ctrl+S / Cmd+S save command
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveFile();
      // Optional reload preview
      reload();
    });
  };

  // Auto-save logic
  useEffect(() => {
    if (!editorPrefs.autoSave || !activeFilePath || unsavedFiles[activeFilePath] === undefined) {
      return;
    }

    const timer = setTimeout(() => {
      saveFile(activeFilePath);
    }, editorPrefs.autoSaveDelayMs || 2000);

    return () => clearTimeout(timer);
  }, [unsavedFiles, activeFilePath, editorPrefs.autoSave, editorPrefs.autoSaveDelayMs, saveFile]);

  if (!currentProject || !activeFilePath) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-studio-darkbg">
        <p className="text-sm">Select a file from Explorer to begin editing.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-studio-darkbg overflow-hidden">
      <EditorTabs />

      <div className="flex-1 relative">
        <Editor
          height="100%"
          path={activeFilePath}
          language={getLanguage(activeFilePath)}
          value={currentContent}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            fontSize: editorPrefs.fontSize || 14,
            tabSize: editorPrefs.tabSize || 2,
            wordWrap: editorPrefs.wordWrap || 'on',
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            lineNumbers: 'on',
            renderWhitespace: 'selection'
          }}
          onChange={(val) => {
            if (activeFilePath && val !== undefined) {
              updateUnsavedContent(activeFilePath, val);
            }
          }}
          onMount={handleEditorMount}
        />
      </div>
    </div>
  );
};
