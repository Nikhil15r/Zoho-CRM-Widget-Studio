import { describe, it, expect } from 'vitest';
import { ZOHO_SNIPPETS } from '../src/utils/snippets';
import { SDK_METHOD_CATALOG } from '@zoho-studio/shared';
import { PreviewBridgeHandler } from '../src/components/preview/PreviewBridge';

describe('Client SDK & Snippets Logic', () => {
  it('should provide comprehensive Zoho widget snippets catalog', () => {
    expect(ZOHO_SNIPPETS.length).toBeGreaterThanOrEqual(10);
    const initSnip = ZOHO_SNIPPETS.find((s) => s.id === 'snip_init');
    expect(initSnip).toBeDefined();
    expect(initSnip?.code).toContain('ZOHO.embeddedApp.init()');

    const getRecSnip = ZOHO_SNIPPETS.find((s) => s.id === 'snip_get_record');
    expect(getRecSnip?.code).toContain('ZOHO.CRM.API.getRecord');
  });

  it('should catalog SDK methods with simulated and real statuses', () => {
    expect(SDK_METHOD_CATALOG.length).toBeGreaterThanOrEqual(10);
    const getRecDoc = SDK_METHOD_CATALOG.find((m) => m.name === 'ZOHO.CRM.API.getRecord');
    expect(getRecDoc).toBeDefined();
    expect(getRecDoc?.status).toBe('simulated');
    expect(getRecDoc?.supportedInSimulation).toBe(true);
  });

  it('should initialize PreviewBridgeHandler with context config', () => {
    const handler = new PreviewBridgeHandler(
      () => ({
        targetEntity: 'Deals',
        defaultRecordId: '548291000001234001',
        simulatedLatencyMs: 20
      }),
      () => 'mock'
    );

    expect(handler).toBeDefined();
  });
});
