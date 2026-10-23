export type EnvironmentMode = 'mock' | 'real_zoho';

export type ZohoDataCenter = 'com' | 'eu' | 'in' | 'com.au' | 'com.cn' | 'ca';

export interface ZohoOAuthConfig {
  clientId: string;
  clientSecret?: string; // Stored securely on server, masked on client
  refreshToken?: string; // Stored securely on server, masked on client
  dataCenter: ZohoDataCenter;
  redirectUri?: string;
  scope?: string;
  isConnected: boolean;
  currentOrgName?: string;
  currentUserEmail?: string;
  lastConnectedAt?: string;
}

export interface EditorPreferences {
  theme: 'vs-dark' | 'light';
  fontSize: number;
  tabSize: number;
  wordWrap: 'on' | 'off';
  autoSave: boolean;
  autoSaveDelayMs: number;
  formatOnSave: boolean;
}

export interface PreviewPreferences {
  defaultDevice: 'responsive' | 'web-tab' | 'related-list' | 'modal' | 'mobile';
  autoReloadOnSave: boolean;
  simulatedLatencyMs: number;
  simulateErrors: boolean;
}

export interface StudioSettings {
  environmentMode: EnvironmentMode;
  editor: EditorPreferences;
  preview: PreviewPreferences;
  zohoAuth: ZohoOAuthConfig;
}
