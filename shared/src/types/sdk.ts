export type SdkSupportStatus = 'simulated' | 'real_only' | 'unsupported';

export interface SdkMethodDoc {
  name: string;
  category: 'embeddedApp' | 'CRM.API' | 'CRM.UI' | 'CRM.CONFIG' | 'CRM.CONNECTIONS';
  signature: string;
  description: string;
  status: SdkSupportStatus;
  example: string;
  supportedInSimulation: boolean;
}

export type SdkCallLogStatus = 'pending' | 'success' | 'error';

export interface SdkCallLog {
  id: string;
  timestamp: string;
  category: string;
  action: string;
  params: any;
  response?: any;
  durationMs?: number;
  status: SdkCallLogStatus;
  errorMessage?: string;
}

export interface PreviewConsoleMessage {
  id: string;
  timestamp: string;
  level: 'log' | 'info' | 'warn' | 'error';
  args: any[];
}

export interface PreviewRuntimeError {
  id: string;
  timestamp: string;
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
}

// Bridge Protocol Messages (Iframe <-> Parent)
export type SdkBridgeMessage =
  | {
      type: 'SDK_READY';
    }
  | {
      type: 'ZOHO_SDK_CALL';
      requestId: string;
      category: string;
      action: string;
      params: any;
    }
  | {
      type: 'ZOHO_SDK_RESPONSE';
      requestId: string;
      success: boolean;
      data?: any;
      error?: any;
    }
  | {
      type: 'SDK_PAGELOAD_TRIGGER';
      payload: any;
    }
  | {
      type: 'CONSOLE_LOG';
      level: 'log' | 'info' | 'warn' | 'error';
      args: any[];
    }
  | {
      type: 'RUNTIME_ERROR';
      message: string;
      filename?: string;
      lineno?: number;
      colno?: number;
      stack?: string;
    };
