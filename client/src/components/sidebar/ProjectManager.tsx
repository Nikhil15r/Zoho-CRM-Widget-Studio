import React, { useState } from 'react';
import {
  Folder,
  Plus,
  Upload,
  Download,
  Copy,
  Trash2,
  CheckCircle2,
  Search
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { usePreviewStore } from '../../store/previewStore';

export const ProjectManager: React.FC = () => {
  const {
    projects,
    currentProject,
    loadProject,
    createProject,
    duplicateProject,
    deleteProject,
    importZipFile,
    exportCurrentProjectZip
  } = useProjectStore();

  const { reload } = usePreviewStore();
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    await createProject(newProjectName.trim(), newProjectDesc.trim());
    setNewProjectName('');
    setNewProjectDesc('');
    setIsCreating(false);
    reload();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importZipFile(file);
      reload();
    } catch (err: any) {
      alert('Import failed: ' + err.message);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col text-slate-700 dark:text-slate-300">
      {/* Top Header */}
      <div className="p-3 border-b border-slate-200 dark:border-studio-darkborder flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Projects ({projects.length})
          </span>
          <div className="flex items-center gap-1">
            <label
              title="Import ZIP Project"
              className="p-1 rounded cursor-pointer text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-studio-darkborder transition"
            >
              <Upload size={14} />
              <input type="file" accept=".zip" onChange={handleImportFile} className="hidden" />
            </label>
            <button
              onClick={() => setIsCreating(true)}
              title="New Project"
              className="p-1 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-studio-darkborder transition"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-200 dark:border-studio-darkborder rounded-md pl-8 pr-2 py-1.5 text-xs outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Creation Form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-3 border-b border-slate-200 dark:border-studio-darkborder bg-blue-50/50 dark:bg-blue-950/20">
          <div className="text-xs font-semibold mb-2 text-blue-600 dark:text-blue-400">Create New Widget Project</div>
          <input
            autoFocus
            type="text"
            placeholder="Project Name (e.g. Deals Viewer)"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="w-full bg-white dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder rounded px-2.5 py-1 text-xs mb-2 outline-none"
          />
          <input
            type="text"
            placeholder="Short description (optional)"
            value={newProjectDesc}
            onChange={(e) => setNewProjectDesc(e.target.value)}
            className="w-full bg-white dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder rounded px-2.5 py-1 text-xs mb-2 outline-none"
          />
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filtered.map((proj) => {
          const isCurrent = currentProject?.manifest.id === proj.id;

          return (
            <div
              key={proj.id}
              onClick={() => {
                loadProject(proj.id);
                reload();
              }}
              className={`group p-2.5 rounded-lg border text-xs cursor-pointer transition flex flex-col gap-1 ${
                isCurrent
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400/50 dark:border-blue-700/50'
                  : 'bg-white dark:bg-studio-darksidebar border-slate-200 dark:border-studio-darkborder hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100 truncate">
                  <Folder size={14} className={isCurrent ? 'text-blue-500' : 'text-slate-400'} />
                  <span className="truncate">{proj.name}</span>
                </div>
                {isCurrent && (
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                )}
              </div>

              {proj.description && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {proj.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-studio-darkborder/50">
                <span>{proj.fileCount} files • {proj.entryFile}</span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateProject(proj.id);
                    }}
                    title="Duplicate Project"
                    className="p-1 hover:text-blue-500 rounded"
                  >
                    <Copy size={12} />
                  </button>

                  {isCurrent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportCurrentProjectZip();
                      }}
                      title="Export as ZIP"
                      className="p-1 hover:text-blue-500 rounded"
                    >
                      <Download size={12} />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete project "${proj.name}"?`)) {
                        deleteProject(proj.id);
                      }
                    }}
                    title="Delete Project"
                    className="p-1 hover:text-red-500 rounded"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
