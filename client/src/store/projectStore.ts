import { useState, useEffect } from 'react';
import { ProjectFile, ProjectPackage, ProjectSummary } from '@zoho-studio/shared';
import { idbGet, idbSet } from '../utils/idb-storage';

export interface ProjectStoreState {
  projects: ProjectSummary[];
  currentProject: ProjectPackage | null;
  activeFilePath: string | null;
  openTabs: string[];
  unsavedFiles: Record<string, string>; // path -> modified content
  isLoading: boolean;
  error: string | null;
}

// Global state container for react components
let listeners: Array<() => void> = [];

let state: ProjectStoreState = {
  projects: [],
  currentProject: null,
  activeFilePath: null,
  openTabs: [],
  unsavedFiles: {},
  isLoading: false,
  error: null
};

function notify() {
  listeners.forEach((l) => l());
}

export const projectActions = {
  async fetchProjects() {
    state = { ...state, isLoading: true, error: null };
    notify();
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data: ProjectSummary[] = await res.json();
      state = { ...state, projects: data, isLoading: false };
      notify();

      // If no current project is loaded, restore last active or open the first sample project
      if (!state.currentProject && data.length > 0) {
        const lastActiveId = await idbGet<string>('last_active_project_id', data[0].id);
        const targetId = data.some((p) => p.id === lastActiveId) ? lastActiveId : data[0].id;
        await projectActions.loadProject(targetId);
      }
    } catch (err: any) {
      state = { ...state, isLoading: false, error: err.message };
      notify();
    }
  },

  async loadProject(id: string) {
    state = { ...state, isLoading: true, error: null };
    notify();
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error(`Project "${id}" not found`);
      const pkg: ProjectPackage = await res.json();

      // Restore open tabs from IDB
      const savedTabs = await idbGet<string[]>(`tabs_${id}`, [pkg.manifest.entryFile || 'app.html']);
      const validTabs = savedTabs.filter((t) => pkg.files.some((f) => f.path === t));
      const defaultTabs = validTabs.length > 0 ? validTabs : [pkg.manifest.entryFile || 'app.html'];

      state = {
        ...state,
        currentProject: pkg,
        activeFilePath: defaultTabs[0] || null,
        openTabs: defaultTabs,
        unsavedFiles: {},
        isLoading: false
      };
      notify();

      await idbSet('last_active_project_id', id);
    } catch (err: any) {
      state = { ...state, isLoading: false, error: err.message };
      notify();
    }
  },

  async createProject(name: string, description?: string) {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });
      if (!res.ok) throw new Error('Failed to create project');
      const newPkg: ProjectPackage = await res.json();
      await projectActions.fetchProjects();
      await projectActions.loadProject(newPkg.manifest.id);
      return newPkg;
    } catch (err: any) {
      state = { ...state, error: err.message };
      notify();
      throw err;
    }
  },

  async duplicateProject(sourceId: string, newName?: string) {
    try {
      const res = await fetch(`/api/projects/${sourceId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      if (!res.ok) throw new Error('Failed to duplicate project');
      const duplicated: ProjectPackage = await res.json();
      await projectActions.fetchProjects();
      await projectActions.loadProject(duplicated.manifest.id);
      return duplicated;
    } catch (err: any) {
      state = { ...state, error: err.message };
      notify();
      throw err;
    }
  },

  async deleteProject(id: string) {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete project');
      await projectActions.fetchProjects();
      if (state.currentProject?.manifest.id === id) {
        if (state.projects.length > 0) {
          await projectActions.loadProject(state.projects[0].id);
        } else {
          state = { ...state, currentProject: null, activeFilePath: null, openTabs: [] };
          notify();
        }
      }
    } catch (err: any) {
      state = { ...state, error: err.message };
      notify();
      throw err;
    }
  },

  openTab(filePath: string) {
    if (!state.openTabs.includes(filePath)) {
      const nextTabs = [...state.openTabs, filePath];
      state = { ...state, openTabs: nextTabs, activeFilePath: filePath };
      if (state.currentProject) {
        idbSet(`tabs_${state.currentProject.manifest.id}`, nextTabs);
      }
    } else {
      state = { ...state, activeFilePath: filePath };
    }
    notify();
  },

  closeTab(filePath: string) {
    const nextTabs = state.openTabs.filter((t) => t !== filePath);
    let nextActive = state.activeFilePath;
    if (state.activeFilePath === filePath) {
      nextActive = nextTabs.length > 0 ? nextTabs[nextTabs.length - 1] : null;
    }

    state = { ...state, openTabs: nextTabs, activeFilePath: nextActive };
    if (state.currentProject) {
      idbSet(`tabs_${state.currentProject.manifest.id}`, nextTabs);
    }
    notify();
  },

  closeOtherTabs(currentPath: string) {
    state = { ...state, openTabs: [currentPath], activeFilePath: currentPath };
    if (state.currentProject) {
      idbSet(`tabs_${state.currentProject.manifest.id}`, [currentPath]);
    }
    notify();
  },

  updateUnsavedContent(filePath: string, newContent: string) {
    const originalFile = state.currentProject?.files.find((f) => f.path === filePath);
    const isUnchanged = originalFile && originalFile.content === newContent;

    const nextUnsaved = { ...state.unsavedFiles };
    if (isUnchanged) {
      delete nextUnsaved[filePath];
    } else {
      nextUnsaved[filePath] = newContent;
    }

    state = { ...state, unsavedFiles: nextUnsaved };
    notify();
  },

  async saveFile(filePath?: string) {
    const targetPath = filePath || state.activeFilePath;
    if (!targetPath || !state.currentProject) return;

    const currentContent = state.unsavedFiles[targetPath] !== undefined
      ? state.unsavedFiles[targetPath]
      : state.currentProject.files.find((f) => f.path === targetPath)?.content || '';

    try {
      const filePayload: ProjectFile = {
        path: targetPath,
        name: targetPath.split('/').pop() || targetPath,
        content: currentContent,
        isDirectory: false
      };

      const res = await fetch(`/api/projects/${state.currentProject.manifest.id}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filePayload)
      });

      if (!res.ok) throw new Error('Failed to save file');
      const savedFile: ProjectFile = await res.json();

      // Update in memory files
      const updatedFiles = state.currentProject.files.map((f) =>
        f.path === targetPath ? savedFile : f
      );
      if (!updatedFiles.some((f) => f.path === targetPath)) {
        updatedFiles.push(savedFile);
      }

      const nextUnsaved = { ...state.unsavedFiles };
      delete nextUnsaved[targetPath];

      state = {
        ...state,
        currentProject: {
          ...state.currentProject,
          files: updatedFiles,
          manifest: { ...state.currentProject.manifest, updatedAt: new Date().toISOString() }
        },
        unsavedFiles: nextUnsaved
      };
      notify();
    } catch (err: any) {
      state = { ...state, error: err.message };
      notify();
      throw err;
    }
  },

  async createFile(relativePath: string, initialContent = '') {
    if (!state.currentProject) return;
    const clean = relativePath.replace(/^\/+/, '');
    const filePayload: ProjectFile = {
      path: clean,
      name: clean.split('/').pop() || clean,
      content: initialContent,
      isDirectory: false
    };

    const res = await fetch(`/api/projects/${state.currentProject.manifest.id}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filePayload)
    });

    if (!res.ok) throw new Error('Failed to create file');
    const saved = await res.json();

    const files = [...state.currentProject.files.filter((f) => f.path !== clean), saved];
    state = {
      ...state,
      currentProject: { ...state.currentProject, files }
    };
    notify();
    projectActions.openTab(clean);
  },

  async deleteFile(filePath: string) {
    if (!state.currentProject) return;
    const res = await fetch(
      `/api/projects/${state.currentProject.manifest.id}/files?path=${encodeURIComponent(filePath)}`,
      { method: 'DELETE' }
    );
    if (!res.ok) throw new Error('Failed to delete file');

    projectActions.closeTab(filePath);
    const files = state.currentProject.files.filter((f) => f.path !== filePath);
    state = {
      ...state,
      currentProject: { ...state.currentProject, files }
    };
    notify();
  },

  async updateManifest(updates: Partial<ProjectPackage['manifest']>) {
    if (!state.currentProject) return;
    const res = await fetch(`/api/projects/${state.currentProject.manifest.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update manifest');
    const updated = await res.json();

    state = {
      ...state,
      currentProject: { ...state.currentProject, manifest: updated }
    };
    notify();
  },

  exportCurrentProjectZip() {
    if (!state.currentProject) return;
    window.location.href = `/api/projects/${state.currentProject.manifest.id}/export`;
  },

  async importZipFile(file: File) {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = (reader.result as string) || '';
        const commaIdx = result.indexOf(',');
        resolve(commaIdx !== -1 ? result.substring(commaIdx + 1) : result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    const cleanName = file.name.replace(/\.zip$/i, '');
    const res = await fetch(`/api/projects/import?name=${encodeURIComponent(cleanName)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Zip: base64 })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to import zip');
    }

    const imported: ProjectPackage = await res.json();
    await projectActions.fetchProjects();
    await projectActions.loadProject(imported.manifest.id);
    return imported;
  }
};

export function useProjectStore() {
  const [current, setCurrent] = useState<ProjectStoreState>(state);

  useEffect(() => {
    const update = () => setCurrent(state);
    listeners.push(update);
    return () => {
      listeners = listeners.filter((l) => l !== update);
    };
  }, []);

  return { ...current, ...projectActions };
}
