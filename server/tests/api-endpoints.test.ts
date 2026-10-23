import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/index.js';
import { seedDatabase } from '../src/db/database.js';
import { seedSampleProjects } from '../src/db/sample-projects.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('API Endpoints & Runtime Integration', () => {
  let app: any;
  let db: any;

  beforeEach(() => {
    db = new Database(':memory:');
    const schemaSql = fs.readFileSync(path.resolve(__dirname, '../src/db/schema.sql'), 'utf-8');
    db.exec(schemaSql);
    seedDatabase(db);
    seedSampleProjects(db);

    const appObj = createApp(db);
    app = appObj.app;
  });

  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/crm/modules returns list of modules', async () => {
    const res = await request(app).get('/api/crm/modules');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((m: any) => m.api_name === 'Deals')).toBe(true);
  });

  it('GET /api/crm/records/Deals returns paginated records', async () => {
    const res = await request(app).get('/api/crm/records/Deals');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.info.count).toBeGreaterThan(0);
  });

  it('GET /api/projects lists seeded sample projects', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(8);
  });

  it('GET /sdk/ZohoEmbededAppSDK.js serves SDK simulator', async () => {
    const res = await request(app).get('/sdk/ZohoEmbededAppSDK.js');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('application/javascript');
    expect(res.text).toContain('window.ZOHO');
  });

  it('GET /preview/:projectId/app.html serves project with SDK script injected', async () => {
    const res = await request(app).get('/preview/sample_proj_01/app.html');
    expect(res.status).toBe(200);
    expect(res.text).toContain('ZohoEmbededAppSDK.js');
  });

  it('GET /api/v1/weather/forecast serves mock endpoint directly', async () => {
    const res = await request(app).get('/api/v1/weather/forecast');
    expect(res.status).toBe(200);
    expect(res.body.condition).toBe('Sunny');
    expect(res.body.temperature_f).toBe(68);
  });
});
