import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Key, Globe, Cpu, Check, AlertCircle } from 'lucide-react';
import { AiProvider, AiModelConfig } from '@zoho-studio/shared';
import { useAiStore } from '../../store/aiStore';

interface ProviderOption {
  id: AiProvider;
  name: string;
  description: string;
  defaultModel: string;
  defaultEndpoint?: string;
  requiresKey: boolean;
}

const PROVIDER_OPTIONS: ProviderOption[] = [
  {
    id: 'simulator',
    name: 'Built-in Zoho Copilot (Offline Simulator)',
    description: 'High-fidelity offline Zoho CRM widget specialist. Works instantly without an API key.',
    defaultModel: 'zoho-copilot-sim',
    requiresKey: false
  },
  {
    id: 'openai',
    name: 'OpenAI / Codex',
    description: 'GPT-4o, GPT-4o-mini, and OpenAI coding models.',
    defaultModel: 'gpt-4o-mini',
    defaultEndpoint: 'https://api.openai.com/v1',
    requiresKey: true
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude 3.5 Sonnet & Claude 3.5 Haiku.',
    defaultModel: 'claude-3-5-sonnet-20241022',
    requiresKey: true
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini 1.5 Flash & Gemini 1.5 Pro.',
    defaultModel: 'gemini-1.5-flash',
    requiresKey: true
  },
  {
    id: 'ollama',
    name: 'Ollama (Local LLM)',
    description: 'Local DeepSeek Coder, Llama 3, or Qwen running on your machine.',
    defaultModel: 'deepseek-coder:6.7b',
    defaultEndpoint: 'http://localhost:11434/v1',
    requiresKey: false
  },
  {
    id: 'custom',
    name: 'Custom OpenAI-Compatible API',
    description: 'Any endpoint (OpenRouter, Azure OpenAI, vLLM, LM Studio, etc.).',
    defaultModel: 'custom-model',
    defaultEndpoint: 'https://openrouter.ai/api/v1',
    requiresKey: false
  }
];

export const AiSettingsModal: React.FC = () => {
  const { config, isConfigModalOpen, setConfigModalOpen, saveConfig, isLoading } = useAiStore();

  const [provider, setProvider] = useState<AiProvider>(config.provider || 'simulator');
  const [model, setModel] = useState<string>(config.model || 'zoho-copilot-sim');
  const [endpointUrl, setEndpointUrl] = useState<string>(config.endpointUrl || '');
  const [apiKey, setApiKey] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(config.temperature ?? 0.2);
  const [systemPromptExtra, setSystemPromptExtra] = useState<string>(config.systemPromptExtra || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isConfigModalOpen) {
      setProvider(config.provider || 'simulator');
      setModel(config.model || 'zoho-copilot-sim');
      setEndpointUrl(config.endpointUrl || '');
      setApiKey('');
      setTemperature(config.temperature ?? 0.2);
      setSystemPromptExtra(config.systemPromptExtra || '');
      setSaveSuccess(false);
      setErrorMessage(null);
    }
  }, [isConfigModalOpen, config]);

  const handleProviderChange = (newProvider: AiProvider) => {
    setProvider(newProvider);
    const opt = PROVIDER_OPTIONS.find((p) => p.id === newProvider);
    if (opt) {
      setModel(opt.defaultModel);
      if (opt.defaultEndpoint) {
        setEndpointUrl(opt.defaultEndpoint);
      } else if (newProvider === 'simulator' || newProvider === 'anthropic' || newProvider === 'gemini') {
        setEndpointUrl('');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const activeOpt = PROVIDER_OPTIONS.find((p) => p.id === provider);
    if (activeOpt?.requiresKey && !apiKey && !config.isConfigured) {
      setErrorMessage(`An API key is required for ${activeOpt.name}`);
      return;
    }

    try {
      await saveConfig({
        provider,
        model,
        endpointUrl: endpointUrl.trim() || undefined,
        apiKey: apiKey.trim() || undefined,
        temperature,
        systemPromptExtra: systemPromptExtra.trim() || undefined
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setConfigModalOpen(false);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save AI configuration');
    }
  };

  // Close on Escape key press
  useEffect(() => {
    if (!isConfigModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConfigModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConfigModalOpen, setConfigModalOpen]);

  if (!isConfigModalOpen) return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setConfigModalOpen(false);
        }
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        className="bg-white dark:bg-studio-darksurface border border-slate-200 dark:border-studio-darkborder rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative z-10 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-studio-darkborder bg-slate-50/50 dark:bg-studio-darkbg/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white shadow-sm">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                AI System & Model Configuration
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Configure OpenAI/Codex, Claude, Gemini, Ollama, or built-in Copilot
              </p>
            </div>
          </div>
          <button
            onClick={() => setConfigModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Check size={14} className="shrink-0" />
              <span>Configuration saved successfully!</span>
            </div>
          )}

          {/* Provider Selection */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              AI Provider / Tool Integration
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {PROVIDER_OPTIONS.map((opt) => {
                const isSelected = provider === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleProviderChange(opt.id)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-sm'
                        : 'border-slate-200 dark:border-studio-darkborder hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs flex items-center gap-1.5">
                        {opt.id === 'simulator' ? (
                          <Cpu size={13} className="text-purple-500" />
                        ) : (
                          <Sparkles size={13} className="text-indigo-500" />
                        )}
                        {opt.name.split(' (')[0]}
                      </span>
                      {isSelected && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Name */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Model Identifier
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. gpt-4o, claude-3-5-sonnet, deepseek-coder"
              className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-200 dark:border-studio-darkborder rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Endpoint URL (if applicable) */}
          {(provider === 'openai' || provider === 'ollama' || provider === 'custom') && (
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Globe size={12} className="text-slate-400" />
                API Endpoint Base URL
              </label>
              <input
                type="url"
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                placeholder={provider === 'ollama' ? 'http://localhost:11434/v1' : 'https://api.openai.com/v1'}
                className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-200 dark:border-studio-darkborder rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Base URL for OpenAI-compatible endpoints (will call <code>/chat/completions</code>).
              </p>
            </div>
          )}

          {/* API Key (if not simulator) */}
          {provider !== 'simulator' && (
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Key size={12} className="text-slate-400" />
                  API Secret Key
                </span>
                {config.isConfigured && config.provider === provider && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                    ✓ Key is securely stored on server
                  </span>
                )}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  config.isConfigured && config.provider === provider
                    ? '••••••••  (Leave blank to keep current key)'
                    : 'Paste your API key here'
                }
                className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-200 dark:border-studio-darkborder rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          )}

          {/* Temperature Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                Creativity / Temperature
              </label>
              <span className="text-slate-500 font-mono text-[11px]">{temperature}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0.0 (Precise & deterministic)</span>
              <span>1.0 (Creative)</span>
            </div>
          </div>

          {/* Custom Instructions */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Custom Prompt Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={systemPromptExtra}
              onChange={(e) => setSystemPromptExtra(e.target.value)}
              placeholder="e.g. Always generate TypeScript components with Tailwind classes."
              className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-200 dark:border-studio-darkborder rounded-lg p-2.5 text-xs outline-none focus:border-indigo-500"
            />
          </div>

          {/* Submit footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-studio-darkborder flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfigModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-studio-darkborder hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
