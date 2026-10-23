import { SdkBridgeMessage } from '@zoho-studio/shared';
import { devtoolsActions } from '../../store/devtoolsStore';
import { PreviewStoreState } from '../../store/previewStore';

export class PreviewBridgeHandler {
  private iframeWindow: Window | null = null;

  constructor(
    private getContextConfig: () => PreviewStoreState['contextConfig'],
    private getEnvironmentMode: () => 'mock' | 'real_zoho'
  ) {}

  public setIframe(iframe: HTMLIFrameElement | null) {
    this.iframeWindow = iframe ? iframe.contentWindow : null;
  }

  public async handleMessage(event: MessageEvent<any>) {
    const msg = event.data;
    if (!msg || typeof msg !== 'object') return;

    switch (msg.type) {
      case 'SDK_READY': {
        console.log('[Studio Bridge] Widget SDK Ready');
        // Immediately trigger PageLoad event with configured context
        this.triggerPageLoad();
        break;
      }

      case 'CONSOLE_LOG': {
        devtoolsActions.addConsoleLog({
          level: msg.level || 'log',
          args: msg.args || []
        });
        break;
      }

      case 'RUNTIME_ERROR': {
        devtoolsActions.addRuntimeError({
          message: msg.message || 'Error in widget preview',
          filename: msg.filename,
          lineno: msg.lineno,
          colno: msg.colno,
          stack: msg.stack
        });
        break;
      }

      case 'ZOHO_SDK_CALL': {
        await this.handleSdkCall(msg);
        break;
      }

      default:
        break;
    }
  }

  public triggerPageLoad(customPayload?: any) {
    if (!this.iframeWindow) return;
    const config = this.getContextConfig();
    const payload = customPayload || config.pageLoadData || {
      Entity: config.targetEntity || 'Deals',
      EntityId: config.defaultRecordId || '548291000001234001'
    };

    console.log('[Studio Bridge] Dispatching SDK_PAGELOAD_TRIGGER:', payload);
    this.iframeWindow.postMessage(
      {
        type: 'SDK_PAGELOAD_TRIGGER',
        payload
      },
      '*'
    );
  }

  private async handleSdkCall(msg: {
    requestId: string;
    category: string;
    action: string;
    params: any;
  }) {
    const startTime = Date.now();
    const callLogId = devtoolsActions.addSdkCall({
      category: msg.category,
      action: msg.action,
      params: msg.params,
      status: 'pending'
    });

    const envMode = this.getEnvironmentMode();
    const context = this.getContextConfig();

    // Check simulated latency
    const latency = context.simulatedLatencyMs ?? 30;
    if (latency > 0) {
      await new Promise((r) => setTimeout(r, latency));
    }

    // Check simulated error
    if (context.simulateErrors) {
      const errorResponse = {
        code: 'SIMULATED_FAILURE',
        message: 'Simulated API failure triggered via Studio Preview configuration.',
        status: 'error'
      };
      devtoolsActions.updateSdkCall(callLogId, {
        status: 'error',
        response: errorResponse,
        durationMs: Date.now() - startTime,
        errorMessage: errorResponse.message
      });
      this.sendResponse(msg.requestId, false, null, errorResponse);
      return;
    }

    try {
      let resultData: any;

      if (envMode === 'real_zoho') {
        // Proxy to Real Zoho CRM
        const proxyRes = await fetch('/api/zoho/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entity: msg.params?.Entity || 'Deals',
            method: msg.action,
            params: msg.params
          })
        });

        if (!proxyRes.ok) {
          const errBody = await proxyRes.json();
          throw errBody;
        }
        resultData = await proxyRes.json();
      } else {
        // Execute against Mock CRM Engine
        resultData = await this.executeMockOperation(msg.category, msg.action, msg.params);
      }

      devtoolsActions.updateSdkCall(callLogId, {
        status: 'success',
        response: resultData,
        durationMs: Date.now() - startTime
      });

      this.sendResponse(msg.requestId, true, resultData, null);
    } catch (err: any) {
      const errorObj = {
        code: err.code || 'SDK_OPERATION_FAILED',
        message: err.message || 'Operation failed in Zoho CRM mock runtime',
        status: 'error',
        details: err.details
      };

      devtoolsActions.updateSdkCall(callLogId, {
        status: 'error',
        response: errorObj,
        durationMs: Date.now() - startTime,
        errorMessage: errorObj.message
      });

      this.sendResponse(msg.requestId, false, null, errorObj);
    }
  }

  private async executeMockOperation(category: string, action: string, params: any) {
    const entity = params?.Entity || 'Deals';

    if (category === 'CRM.API') {
      switch (action) {
        case 'getRecord': {
          const res = await fetch(`/api/crm/records/${entity}/${params.RecordID}`);
          if (!res.ok) throw await res.json();
          return await res.json();
        }
        case 'getAllRecords': {
          const query = new URLSearchParams({
            page: String(params.page || 1),
            per_page: String(params.per_page || 200),
            sort_order: params.sort_order || 'desc'
          });
          const res = await fetch(`/api/crm/records/${entity}?${query.toString()}`);
          if (!res.ok) throw await res.json();
          return await res.json();
        }
        case 'insertRecord': {
          const res = await fetch(`/api/crm/records/${entity}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params.APIData)
          });
          if (!res.ok) throw await res.json();
          return await res.json();
        }
        case 'updateRecord': {
          const res = await fetch(`/api/crm/records/${entity}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params.APIData)
          });
          if (!res.ok) throw await res.json();
          return await res.json();
        }
        case 'deleteRecord': {
          const res = await fetch(`/api/crm/records/${entity}/${params.RecordID}`, {
            method: 'DELETE'
          });
          if (!res.ok) throw await res.json();
          return await res.json();
        }
        case 'searchRecord': {
          const res = await fetch('/api/crm/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entity,
              type: params.Type,
              query: params.Query,
              page: params.page,
              per_page: params.per_page
            })
          });
          if (!res.ok) throw await res.json();
          return await res.json();
        }
        default:
          throw new Error(`Unsupported CRM.API action: "${action}"`);
      }
    } else if (category === 'CRM.CONFIG') {
      if (action === 'getCurrentUser') {
        const res = await fetch('/api/crm/current-user');
        return await res.json();
      } else if (action === 'getOrgInfo') {
        const res = await fetch('/api/crm/org-info');
        return await res.json();
      }
    } else if (category === 'CRM.UI') {
      if (action === 'Record.open') {
        console.log(`[Studio Simulated UI] ZOHO.CRM.UI.Record.open: Entity="${params.Entity}", RecordID="${params.RecordID}"`);
        return { status: 'success', message: 'Record opened in parent CRM tab' };
      } else if (action === 'Popup.close' || action === 'Popup.closeReload') {
        console.log(`[Studio Simulated UI] ZOHO.CRM.UI.Popup.${action} executed`);
        return { status: 'success', message: 'Popup closed' };
      }
    }

    throw new Error(`Unimplemented simulated action: ${category}.${action}`);
  }

  private sendResponse(requestId: string, success: boolean, data: any, error: any) {
    if (!this.iframeWindow) return;
    this.iframeWindow.postMessage(
      {
        type: 'ZOHO_SDK_RESPONSE',
        requestId,
        success,
        data,
        error
      },
      '*'
    );
  }
}
