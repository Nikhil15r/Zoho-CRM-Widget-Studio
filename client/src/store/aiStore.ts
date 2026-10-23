import { useState, useEffect } from 'react';
import {
  AiModelConfig,
  AiChatMessage,
  AiContextPayload,
  AiQuickActionType
} from '@zoho-studio/shared';
import { idbGet, idbSet } from '../utils/idb-storage';

export interface AiStoreState {
  config: AiModelConfig;
  messages: AiChatMessage[];
  isLoading: boolean;
  isConfigModalOpen: boolean;
  error: string | null;
}

const DEFAULT_WELCOME_MESSAGE: AiChatMessage = {
  id: 'msg_welcome',
  role: 'assistant',
  content: `👋 **Hello! I'm your Zoho CRM Widget AI Copilot.**

I can help you build, debug, and optimize Zoho CRM embedded widgets:
* **Fix errors**: Click **"Fix Bug"** to analyze runtime errors and patch your code.
* **Generate components**: Create complete Zoho CRM UI tables, forms, or stage bars.
* **Explain & Refactor**: Understand the ZOHO SDK lifecycle, queries, or event handlers.
* **External AI Models**: Connect with OpenAI, Codex, Claude, Gemini, Ollama, or local LLMs!

What would you like to build or troubleshoot?`,
  timestamp: new Date().toISOString()
};

let listeners: Array<() => void> = [];

let state: AiStoreState = {
  config: {
    provider: 'simulator',
    model: 'zoho-copilot-sim',
    temperature: 0.2,
    maxTokens: 2500,
    isConfigured: true
  },
  messages: [DEFAULT_WELCOME_MESSAGE],
  isLoading: false,
  isConfigModalOpen: false,
  error: null
};

function notify() {
  listeners.forEach((l) => l());
}

export const aiActions = {
  async init() {
    try {
      const savedMessages = await idbGet<AiChatMessage[]>('ai_chat_messages', [DEFAULT_WELCOME_MESSAGE]);
      if (savedMessages && savedMessages.length > 0) {
        state = { ...state, messages: savedMessages };
        notify();
      }
      await aiActions.fetchConfig();
    } catch (err: any) {
      console.warn('AI store init warning:', err);
    }
  },

  async fetchConfig() {
    try {
      const res = await fetch('/api/ai/config');
      if (!res.ok) throw new Error('Failed to fetch AI configuration');
      const json = await res.json();
      if (json.success && json.data) {
        state = { ...state, config: json.data };
        notify();
      }
    } catch (err: any) {
      console.error('Error fetching AI config:', err);
    }
  },

  async saveConfig(updates: Partial<AiModelConfig>) {
    state = { ...state, isLoading: true, error: null };
    notify();
    try {
      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to update AI config');
      }
      const json = await res.json();
      state = {
        ...state,
        config: json.data,
        isLoading: false,
        isConfigModalOpen: false,
        error: null
      };
      notify();
    } catch (err: any) {
      state = { ...state, isLoading: false, error: err.message };
      notify();
      throw err;
    }
  },

  setConfigModalOpen(open: boolean) {
    state = { ...state, isConfigModalOpen: open };
    notify();
  },

  clearChat() {
    state = { ...state, messages: [DEFAULT_WELCOME_MESSAGE], error: null };
    idbSet('ai_chat_messages', [DEFAULT_WELCOME_MESSAGE]);
    notify();
  },

  async sendMessage(content: string, context?: AiContextPayload) {
    if (!content.trim()) return;

    const userMsg: AiChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    const nextMessages = [...state.messages, userMsg];
    state = { ...state, messages: nextMessages, isLoading: true, error: null };
    notify();

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          context
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'AI generation failed');
      }

      const json = await res.json();
      const assistantMsg: AiChatMessage = json.data;

      const finalMessages = [...nextMessages, assistantMsg];
      state = { ...state, messages: finalMessages, isLoading: false };
      idbSet('ai_chat_messages', finalMessages);
      notify();
    } catch (err: any) {
      state = { ...state, isLoading: false, error: err.message };
      notify();
    }
  },

  async runQuickAction(action: AiQuickActionType, context: AiContextPayload, prompt?: string) {
    let actionLabel = '';
    switch (action) {
      case 'fix':
        actionLabel = '🛠️ Fix code issues & errors';
        break;
      case 'explain':
        actionLabel = '📘 Explain current code';
        break;
      case 'refactor':
        actionLabel = '⚡ Refactor & optimize';
        break;
      case 'generate_component':
        actionLabel = `✨ Generate component: ${prompt || 'CRM widget'}`;
        break;
      case 'generate_tests':
        actionLabel = '🧪 Generate test cases';
        break;
      case 'optimize':
        actionLabel = '🚀 Optimize performance';
        break;
    }

    const userMsg: AiChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: actionLabel,
      timestamp: new Date().toISOString()
    };

    const nextMessages = [...state.messages, userMsg];
    state = { ...state, messages: nextMessages, isLoading: true, error: null };
    notify();

    try {
      const res = await fetch('/api/ai/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, prompt, context })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'AI action failed');
      }

      const json = await res.json();
      const assistantMsg: AiChatMessage = json.data;

      const finalMessages = [...nextMessages, assistantMsg];
      state = { ...state, messages: finalMessages, isLoading: false };
      idbSet('ai_chat_messages', finalMessages);
      notify();
    } catch (err: any) {
      state = { ...state, isLoading: false, error: err.message };
      notify();
    }
  }
};

// React hook
export function useAiStore() {
  const [storeState, setStoreState] = useState<AiStoreState>(state);

  useEffect(() => {
    const listener = () => setStoreState(state);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return {
    ...storeState,
    ...aiActions
  };
}

// Trigger initial config fetch
aiActions.init();
