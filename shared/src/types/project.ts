export interface ProjectFile {
  path: string; // Relative path e.g. "app.html", "js/main.js", "css/style.css"
  name: string;
  content: string;
  isDirectory: boolean;
  updatedAt?: string;
  size?: number;
}

export interface ZohoWidgetContextConfig {
  targetEntity?: string;
  defaultRecordId?: string;
  pageLoadData?: Record<string, any>;
  simulatedLatencyMs?: number;
  simulateErrors?: boolean;
  emptyResults?: boolean;
}

export interface ProjectManifest {
  id: string;
  name: string;
  description?: string;
  version: string;
  entryFile: string;
  runtimeMode: 'html' | 'react';
  framework: 'vanilla' | 'react';
  zohoConfig: ZohoWidgetContextConfig;
  envVariables?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description?: string;
  version: string;
  entryFile: string;
  runtimeMode: 'html' | 'react';
  fileCount: number;
  updatedAt: string;
  createdAt: string;
}

export interface ProjectPackage {
  manifest: ProjectManifest;
  files: ProjectFile[];
}
