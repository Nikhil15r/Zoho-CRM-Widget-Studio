import { useState, useEffect } from 'react';
import { ZohoWidgetContextConfig } from '@zoho-studio/shared';

export type PreviewDevice = 'responsive' | 'web-tab' | 'related-list' | 'modal' | 'mobile';

export interface DeviceDimension {
  name: string;
  width: string;
  height: string;
  description: string;
}

export const DEVICE_DIMENSIONS: Record<PreviewDevice, DeviceDimension> = {
  responsive: { name: 'Full Responsive', width: '100%', height: '100%', description: 'Expands to available preview area' },
  'web-tab': { name: 'Web Tab View', width: '100%', height: '100%', description: 'Full tab widget inside Zoho CRM main nav' },
  'related-list': { name: 'Related List Widget', width: '820px', height: '560px', description: 'Embedded section inside record details' },
  modal: { name: 'Custom Button Popup', width: '700px', height: '500px', description: 'Modal dialog opened via CRM button' },
  mobile: { name: 'Zoho CRM Mobile App', width: '375px', height: '667px', description: 'Simulates mobile viewport' }
};

export interface PreviewStoreState {
  status: 'running' | 'stopped' | 'error';
  device: PreviewDevice;
  contextConfig: ZohoWidgetContextConfig;
  isContextModalOpen: boolean;
  reloadKey: number;
}

let listeners: Array<() => void> = [];

let state: PreviewStoreState = {
  status: 'running',
  device: 'responsive',
  contextConfig: {
    targetEntity: 'Deals',
    defaultRecordId: '548291000001234001',
    pageLoadData: {
      Entity: 'Deals',
      EntityId: '548291000001234001'
    },
    simulatedLatencyMs: 40,
    simulateErrors: false
  },
  isContextModalOpen: false,
  reloadKey: 0
};

function notify() {
  listeners.forEach((l) => l());
}

export const previewActions = {
  run() {
    state = { ...state, status: 'running', reloadKey: state.reloadKey + 1 };
    notify();
  },

  stop() {
    state = { ...state, status: 'stopped' };
    notify();
  },

  reload() {
    state = { ...state, status: 'running', reloadKey: state.reloadKey + 1 };
    notify();
  },

  setDevice(device: PreviewDevice) {
    state = { ...state, device };
    notify();
  },

  setContextConfig(config: Partial<ZohoWidgetContextConfig>) {
    const updated: ZohoWidgetContextConfig = {
      ...state.contextConfig,
      ...config,
      pageLoadData: {
        Entity: config.targetEntity || state.contextConfig.targetEntity,
        EntityId: config.defaultRecordId || state.contextConfig.defaultRecordId,
        ...(config.pageLoadData || state.contextConfig.pageLoadData || {})
      }
    };
    state = { ...state, contextConfig: updated };
    notify();
  },

  openContextModal() {
    state = { ...state, isContextModalOpen: true };
    notify();
  },

  closeContextModal() {
    state = { ...state, isContextModalOpen: false };
    notify();
  }
};

export function usePreviewStore() {
  const [current, setCurrent] = useState<PreviewStoreState>(state);

  useEffect(() => {
    const update = () => setCurrent(state);
    listeners.push(update);
    return () => {
      listeners = listeners.filter((l) => l !== update);
    };
  }, []);

  return { ...current, ...previewActions };
}
