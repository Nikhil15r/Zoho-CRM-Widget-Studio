import Database, { Database as DatabaseType } from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STANDARD_MODULES,
  INITIAL_RECORDS,
  DEFAULT_USER,
  DEFAULT_ORG,
  DEFAULT_MOCK_ENDPOINTS
} from './seed-data.js';
import { seedSampleProjects } from './sample-projects.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let instance: DatabaseType | null = null;

export function getDatabase(dbPath?: string): DatabaseType {
  if (instance && !dbPath) {
    return instance;
  }

  const resolvedPath =
    dbPath ||
    process.env.DB_PATH ||
    path.resolve(process.cwd(), 'studio.sqlite3');

  const db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Load and apply schema
  let schemaPath = path.resolve(__dirname, 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    schemaPath = path.resolve(__dirname, '../../src/db/schema.sql');
  }
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schemaSql);

  // Check if seeding is needed
  const moduleCount = db.prepare('SELECT COUNT(*) as count FROM crm_modules').get() as { count: number };
  if (moduleCount.count === 0) {
    seedDatabase(db);
  }
  seedSampleProjects(db);

  if (!dbPath) {
    instance = db;
  }
  return db;
}

export function seedDatabase(db: DatabaseType): void {
  const insertModule = db.prepare(
    'INSERT OR REPLACE INTO crm_modules (api_name, singular_label, plural_label, is_custom, fields_json) VALUES (?, ?, ?, ?, ?)'
  );

  const insertRecord = db.prepare(
    'INSERT OR REPLACE INTO crm_records (id, module_api_name, record_json, created_time, modified_time, created_by_id, modified_by_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const insertUser = db.prepare(
    'INSERT OR REPLACE INTO crm_users (id, name, email, role, profile, status) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const insertOrg = db.prepare(
    'INSERT OR REPLACE INTO crm_org (id, company_name, primary_email, currency_symbol, time_zone, domain_name) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const insertEndpoint = db.prepare(
    'INSERT OR REPLACE INTO mock_endpoints (id, name, method, path, status_code, response_headers_json, response_body, latency_ms, is_error, enabled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const tx = db.transaction(() => {
    // Insert Modules
    for (const mod of STANDARD_MODULES) {
      insertModule.run(
        mod.api_name,
        mod.singular_label,
        mod.plural_label,
        mod.is_custom ? 1 : 0,
        JSON.stringify(mod.fields)
      );
    }

    // Insert Initial Records
    const now = new Date().toISOString();
    for (const [moduleName, records] of Object.entries(INITIAL_RECORDS)) {
      for (const rec of records) {
        const fullRecord = {
          ...rec,
          Created_Time: rec.Created_Time || now,
          Modified_Time: rec.Modified_Time || now,
          Created_By: { id: DEFAULT_USER.id, name: DEFAULT_USER.name },
          Modified_By: { id: DEFAULT_USER.id, name: DEFAULT_USER.name }
        };

        insertRecord.run(
          rec.id,
          moduleName,
          JSON.stringify(fullRecord),
          fullRecord.Created_Time,
          fullRecord.Modified_Time,
          DEFAULT_USER.id,
          DEFAULT_USER.id
        );
      }
    }

    // Insert Default User & Org
    insertUser.run(
      DEFAULT_USER.id,
      DEFAULT_USER.name,
      DEFAULT_USER.email,
      DEFAULT_USER.role,
      DEFAULT_USER.profile,
      DEFAULT_USER.status
    );

    insertOrg.run(
      DEFAULT_ORG.id,
      DEFAULT_ORG.company_name,
      DEFAULT_ORG.primary_email,
      DEFAULT_ORG.currency_symbol,
      DEFAULT_ORG.time_zone,
      DEFAULT_ORG.domain_name
    );

    // Insert Mock Endpoints
    for (const ep of DEFAULT_MOCK_ENDPOINTS) {
      insertEndpoint.run(
        ep.id,
        ep.name,
        ep.method,
        ep.path,
        ep.statusCode,
        JSON.stringify(ep.responseHeaders),
        ep.responseBody,
        ep.latencyMs,
        ep.isError ? 1 : 0,
        ep.enabled ? 1 : 0,
        ep.createdAt
      );
    }
  });

  tx();
}

export function resetMockCrmData(db: DatabaseType): void {
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM crm_records').run();
    db.prepare('DELETE FROM crm_modules WHERE is_custom = 1').run();
    seedDatabase(db);
  });
  tx();
}
