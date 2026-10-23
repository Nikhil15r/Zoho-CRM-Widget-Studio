import React from 'react';
import { X, FileCode, FileText, FileSpreadsheet, FileJson, File } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';

export const EditorTabs: React.FC = () => {
  const { openTabs, activeFilePath, unsavedFiles, openTab, closeTab, closeOtherTabs } = useProjectStore();

  const getFileIcon = (path: string) => {
    if (path.endsWith('.html') || path.endsWith('.htm')) {
      return <FileCode size={13} className="text-orange-500" />;
    }
    if (path.endsWith('.js') || path.endsWith('.ts')) {
      return <FileCode size={13} className="text-amber-400" />;
    }
    if (path.endsWith('.css')) {
      return <FileSpreadsheet size={13} className="text-blue-400" />;
    }
    if (path.endsWith('.json')) {
      return <FileJson size={13} className="text-yellow-500" />;
    }
    if (path.endsWith('.md')) {
      return <FileText size={13} className="text-purple-400" />;
    }
    return <File size={13} className="text-slate-400" />;
  };

  if (openTabs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center overflow-x-auto bg-slate-100 dark:bg-studio-darksidebar border-b border-slate-200 dark:border-studio-darkborder scrollbar-none select-none">
      {openTabs.map((path) => {
        const isActive = activeFilePath === path;
        const isDirty = unsavedFiles[path] !== undefined;
        const fileName = path.split('/').pop() || path;

        return (
          <div
            key={path}
            onClick={() => openTab(path)}
            onContextMenu={(e) => {
              e.preventDefault();
              closeOtherTabs(path);
            }}
            className={`group flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-r border-slate-200 dark:border-studio-darkborder cursor-pointer transition min-w-fit ${
              isActive
                ? 'bg-white dark:bg-studio-darkbg text-blue-600 dark:text-slate-100 border-t-2 border-t-blue-500'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-studio-darksurface'
            }`}
          >
            {getFileIcon(path)}
            <span>{fileName}</span>

            {/* Unsaved indicator / close button */}
            <div className="flex items-center ml-1">
              {isDirty ? (
                <span
                  title="Unsaved changes"
                  className="w-2 h-2 rounded-full bg-blue-500 group-hover:hidden"
                />
              ) : null}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(path);
                }}
                className={`p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-300 dark:hover:bg-studio-darkborder ${
                  isDirty ? 'hidden group-hover:block' : ''
                }`}
              >
                <X size={12} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
