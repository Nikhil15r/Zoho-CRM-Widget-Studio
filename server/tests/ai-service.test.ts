import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/index.js';
import { seedDatabase } from '../src/db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('AI Service & Endpoints Integration', () => {
  let app: any;
  let db: any;
  let aiService: any;

  beforeEach(() => {
    db = new Database(':memory:');
    const schemaSql = fs.readFileSync(path.resolve(__dirname, '../src/db/schema.sql'), 'utf-8');
    db.exec(schemaSql);
    seedDatabase(db);

    const appObj = createApp(db);
    app = appObj.app;
    aiService = appObj.aiService;
  });

  it('GET /api/ai/config returns default public config', async () => {
    const res = await request(app).get('/api/ai/config');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.provider).toBe('simulator');
    expect(res.body.data.isConfigured).toBe(true);
    expect(res.body.data.apiKey).toBeUndefined();
  });

  it('POST /api/ai/config updates config without exposing apiKey in public response', async () => {
    const updateRes = await request(app).post('/api/ai/config').send({
      provider: 'openai',
      model: 'gpt-4o',
      apiKey: 'sk-test-secret-key-12345',
      temperature: 0.5
    });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.provider).toBe('openai');
    expect(updateRes.body.data.model).toBe('gpt-4o');
    expect(updateRes.body.data.temperature).toBe(0.5);
    expect(updateRes.body.data.apiKey).toBeUndefined();

    // Verify stored config contains secret
    const stored = aiService.getStoredConfig();
    expect(stored.apiKey).toBe('sk-test-secret-key-12345');
    expect(stored.provider).toBe('openai');
  });

  it('POST /api/ai/chat generates realistic Zoho SDK code in simulator mode', async () => {
    const chatRes = await request(app).post('/api/ai/chat').send({
      messages: [
        { role: 'user', content: 'How do I fetch Deals in a Zoho widget?' }
      ],
      context: {
        activeFilePath: 'app.js',
        activeFileContent: '// Empty widget'
      }
    });

    expect(chatRes.status).toBe(200);
    expect(chatRes.body.success).toBe(true);
    expect(chatRes.body.data.role).toBe('assistant');
    expect(chatRes.body.data.content).toContain('ZOHO.CRM.API');
    expect(chatRes.body.data.proposedFiles).toBeDefined();
    expect(chatRes.body.data.proposedFiles.length).toBeGreaterThan(0);
  });

  it('POST /api/ai/action with "fix" diagnoses DevTools errors', async () => {
    const actionRes = await request(app).post('/api/ai/action').send({
      action: 'fix',
      context: {
        activeFilePath: 'index.html',
        activeFileContent: '<html><body>Loading...</body></html>',
        recentConsoleErrors: [
          'TypeError: Cannot read properties of undefined (reading "getRecord") at fetchRecord'
        ]
      }
    });

    expect(actionRes.status).toBe(200);
    expect(actionRes.body.success).toBe(true);
    expect(actionRes.body.data.content).toContain('ZOHO.embeddedApp.init()');
    expect(actionRes.body.data.proposedFiles.length).toBeGreaterThan(0);
  });

  it('POST /api/ai/action with "explain" provides structured explanation', async () => {
    const actionRes = await request(app).post('/api/ai/action').send({
      action: 'explain',
      context: {
        activeFilePath: 'app.js',
        selectedCode: 'ZOHO.CRM.API.getAllRecords({ Entity: "Deals", sort_order: "desc" })'
      }
    });

    expect(actionRes.status).toBe(200);
    expect(actionRes.body.success).toBe(true);
    expect(actionRes.body.data.content).toContain('Deals');
  });
});
