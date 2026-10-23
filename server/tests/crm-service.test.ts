import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CrmService } from '../src/services/crm-service.js';
import { seedDatabase } from '../src/db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('CrmService (Mock CRM Engine)', () => {
  let db: any;
  let service: CrmService;

  beforeEach(() => {
    db = new Database(':memory:');
    const schemaSql = fs.readFileSync(path.resolve(__dirname, '../src/db/schema.sql'), 'utf-8');
    db.exec(schemaSql);
    seedDatabase(db);
    service = new CrmService(db);
  });

  it('should list standard modules with schemas', () => {
    const modules = service.getModules();
    expect(modules.length).toBeGreaterThanOrEqual(8);
    const dealsMod = modules.find((m) => m.api_name === 'Deals');
    expect(dealsMod).toBeDefined();
    expect(dealsMod?.fields.some((f) => f.api_name === 'Stage')).toBe(true);
  });

  it('should retrieve seeded deals records with pagination', () => {
    const res = service.getRecords('Deals', { page: 1, per_page: 5 });
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data[0].Deal_Name).toBeDefined();
    expect(res.info?.page).toBe(1);
  });

  it('should insert a new record and validate mandatory fields', () => {
    // Missing required Last_Name
    expect(() => {
      service.insertRecord('Leads', { First_Name: 'TestOnly' });
    }).toThrow();

    // Valid insert
    const insertRes = service.insertRecord('Leads', {
      First_Name: 'John',
      Last_Name: 'Doe',
      Company: 'Test Co',
      Email: 'john.doe@example.com'
    });

    expect(insertRes.data[0].status).toBe('success');
    const newId = insertRes.data[0].details.id;
    expect(newId).toBeDefined();

    // Verify record retrieval
    const fetched = service.getRecord('Leads', newId);
    expect(fetched.data[0].Last_Name).toBe('Doe');
  });

  it('should update existing records', () => {
    const deals = service.getRecords('Deals');
    const targetDeal = deals.data[0];

    const updateRes = service.updateRecord('Deals', {
      id: targetDeal.id,
      Amount: 999999,
      Stage: 'Closed Won'
    });

    expect(updateRes.data[0].status).toBe('success');

    const updated = service.getRecord('Deals', targetDeal.id);
    expect(updated.data[0].Amount).toBe(999999);
    expect(updated.data[0].Stage).toBe('Closed Won');
  });

  it('should delete a record', () => {
    const deals = service.getRecords('Deals');
    const targetDeal = deals.data[0];

    const deleteRes = service.deleteRecord('Deals', targetDeal.id);
    expect(deleteRes.data[0].status).toBe('success');

    expect(() => {
      service.getRecord('Deals', targetDeal.id);
    }).toThrow();
  });

  it('should search records by criteria / query', () => {
    const searchRes = service.searchRecords('Accounts', { query: 'Nexus' });
    expect(searchRes.data.length).toBeGreaterThanOrEqual(1);
    expect(searchRes.data[0].Account_Name).toContain('Nexus');
  });

  it('should allow creating custom modules', () => {
    const customMod = service.createCustomModule({
      api_name: 'Custom_Assets',
      singular_label: 'Asset',
      plural_label: 'Assets',
      is_custom: true,
      fields: [
        { api_name: 'Serial_Number', display_label: 'Serial Number', data_type: 'text', required: true }
      ]
    });

    expect(customMod.api_name).toBe('Custom_Assets');
    expect(customMod.is_custom).toBe(true);

    const inserted = service.insertRecord('Custom_Assets', {
      Name: 'Server Rack 01',
      Serial_Number: 'SRV-8821'
    });
    expect(inserted.data[0].status).toBe('success');
  });
});
