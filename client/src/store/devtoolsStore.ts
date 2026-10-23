import { useState, useEffect } from 'react';
import {
  PreviewConsoleMessage,
  SdkCallLog,
  ApiExecutionLog,
  PreviewRuntimeError
} from '@zoho-studio/shared';

export interface DevtoolsStoreState {
  consoleLogs: PreviewConsoleMessage[];
  sdkCalls: SdkCallLog[];
  networkLogs: ApiExecutionLog[];
  runtimeErrors: PreviewRuntimeError[];
}

let listeners: Array<() => void> = [];

let state: DevtoolsStoreState = {
  consoleLogs: [],
  sdkCalls: [],
  networkLogs: [],
  runtimeErrors: []
};

function notify() {
  listeners.forEach((l) => l());
}

export const devtoolsActions = {
  addConsoleLog(log: Omit<PreviewConsoleMessage, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) {
    const item: PreviewConsoleMessage = {
      id: log.id || 'log_' + Math.random().toString(36).substring(2, 9),
      timestamp: log.timestamp || new Date().toISOString(),
      level: log.level,
      args: log.args
    };
    state = {
      ...state,
      consoleLogs: [item, ...state.consoleLogs.slice(0, 199)]
    };
    notify();
  },

  addSdkCall(call: Omit<SdkCallLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) {
    const item: SdkCallLog = {
      id: call.id || 'sdk_' + Math.random().toString(36).substring(2, 9),
      timestamp: call.timestamp || new Date().toISOString(),
      category: call.category,
      action: call.action,
      params: call.params,
      response: call.response,
      durationMs: call.durationMs,
      status: call.status,
      errorMessage: call.errorMessage
    };
    state = {
      ...state,
      sdkCalls: [item, ...state.sdkCalls.slice(0, 199)]
    };
    notify();
    return item.id;
  },

  updateSdkCall(id: string, updates: Partial<SdkCallLog>) {
    state = {
      ...state,
      sdkCalls: state.sdkCalls.map((c) => (c.id === id ? { ...c, ...updates } : c))
    };
    notify();
  },

  addNetworkLog(log: ApiExecutionLog) {
    state = {
      ...state,
      networkLogs: [log, ...state.networkLogs.slice(0, 199)]
    };
    notify();
  },

  addRuntimeError(err: Omit<PreviewRuntimeError, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) {
    const item: PreviewRuntimeError = {
      id: err.id || 'err_' + Math.random().toString(36).substring(2, 9),
      timestamp: err.timestamp || new Date().toISOString(),
      message: err.message,
      filename: err.filename,
      lineno: err.lineno,
      colno: err.colno,
      stack: err.stack
    };
    state = {
      ...state,
      runtimeErrors: [item, ...state.runtimeErrors.slice(0, 99)]
    };
    notify();
  },

  clearConsoleLogs() {
    state = { ...state, consoleLogs: [] };
    notify();
  },

  clearSdkCalls() {
    state = { ...state, sdkCalls: [] };
    notify();
  },

  clearNetworkLogs() {
    state = { ...state, networkLogs: [] };
    notify();
  },

  clearErrors() {
    state = { ...state, runtimeErrors: [] };
    notify();
  },

  clearAll() {
    state = { consoleLogs: [], sdkCalls: [], networkLogs: [], runtimeErrors: [] };
    notify();
  }
};

export function useDevtoolsStore() {
  const [current, setCurrent] = useState<DevtoolsStoreState>(state);

  useEffect(() => {
    const update = () => setCurrent(state);
    listeners.push(update);
    return () => {
      listeners = listeners.filter((l) => l !== update);
    };
  }, []);

  return { ...current, ...devtoolsActions };
}
