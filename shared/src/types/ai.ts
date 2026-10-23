export type AiProvider =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'ollama'
  | 'custom'
  | 'simulator';

export interface AiModelConfig {
  provider: AiProvider;
  model: string;
  apiKey?: string;
  endpointUrl?: string; // For Ollama or custom OpenAI-compatible proxies
  temperature?: number;
  maxTokens?: number;
  systemPromptExtra?: string;
  isConfigured: boolean;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  proposedFiles?: Array<{ path: string; content: string; language?: string }>;
  suggestedAction?: string;
}

export type AiQuickActionType =
  | 'explain'
  | 'fix'
  | 'refactor'
  | 'generate_component'
  | 'generate_tests'
  | 'optimize';

export interface AiContextPayload {
  activeFilePath?: string;
  activeFileContent?: string;
  selectedCode?: string;
  projectManifest?: any;
  projectFilesSummary?: Array<{ path: string; size?: number }>;
  recentConsoleErrors?: Array<{ message: string; stack?: string }>;
}

export interface AiChatRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  context?: AiContextPayload;
  providerOverride?: Partial<AiModelConfig>;
}

export interface AiQuickActionRequest {
  action: AiQuickActionType;
  prompt?: string;
  context: AiContextPayload;
}
