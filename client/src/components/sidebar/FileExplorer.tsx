import React, { useState } from 'react';
import {
  FilePlus,
  FolderPlus,
  FileCode,
  FileText,
  FileSpreadsheet,
  FileJson,
  Trash2,
  Folder,
  FolderOpen
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';

export const FileExplorer: React.FC = () => {
  const { currentProject, activeFilePath, openTab, createFile, deleteFile } = useProjectStore();
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  if (!currentProject) {
    return (
      <div className="p-4 text-xs text-slate-400">
        No active project. Open or create a project.
      </div>
    );
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    createFile(newFileName.trim());
    setNewFileName('');
    setIsCreatingFile(false);
  };

  const getFileIcon = (path: string) => {
    if (path.endsWith('.html') || path.endsWith('.htm')) return <FileCode size={14} className="text-orange-500" />;
    if (path.endsWith('.js') || path.endsWith('.ts')) return <FileCode size={14} className="text-amber-400" />;
    if (path.endsWith('.css')) return <FileSpreadsheet size={14} className="text-blue-400" />;
    if (path.endsWith('.json')) return <FileJson size={14} className="text-yellow-500" />;
    if (path.endsWith('.md')) return <FileText size={14} className="text-purple-400" />;
    return <FileCode size={14} className="text-slate-400" />;
  };

  return (
    <div className="h-full flex flex-col text-slate-700 dark:text-slate-300">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-studio-darkborder">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
          {currentProject.manifest.name}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCreatingFile(true)}
            title="New File"
            className="p-1 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-studio-darkborder transition"
          >
            <FilePlus size={14} />
          </button>
        </div>
      </div>

      {/* New file input form */}
      {isCreatingFile && (
        <form onSubmit={handleCreateSubmit} className="p-2 border-b border-slate-200 dark:border-studio-darkborder">
          <input
            autoFocus
            type="text"
            placeholder="e.g. js/helper.js"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onBlur={() => {
              if (!newFileName.trim()) setIsCreatingFile(false);
            }}
            className="w-full bg-slate-50 dark:bg-studio-darkbg border border-blue-500 rounded px-2 py-1 text-xs outline-none"
          />
        </form>
      )}

      {/* Files list */}
      <div className="flex-1 overflow-y-auto py-1">
        {currentProject.files.map((file) => {
          const isActive = activeFilePath === file.path;
          const isEntry = file.path === currentProject.manifest.entryFile;

          return (
            <div
              key={file.path}
              onClick={() => openTab(file.path)}
              className={`group flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer select-none transition ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 font-medium'
                  : 'hover:bg-slate-100 dark:hover:bg-studio-darksurface text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {getFileIcon(file.path)}
                <span className="truncate">{file.path}</span>
                {isEntry && (
                  <span className="text-[9px] uppercase px-1 py-0.2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded font-bold">
                    entry
                  </span>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${file.path}"?`)) {
                    deleteFile(file.path);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
