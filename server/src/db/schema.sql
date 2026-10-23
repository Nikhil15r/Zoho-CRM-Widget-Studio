-- Database Schema for Zoho CRM Widget Studio
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS crm_modules (
  api_name TEXT PRIMARY KEY,
  singular_label TEXT NOT NULL,
  plural_label TEXT NOT NULL,
  is_custom INTEGER DEFAULT 0,
  fields_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS crm_records (
  id TEXT PRIMARY KEY,
  module_api_name TEXT NOT NULL,
  record_json TEXT NOT NULL,
  created_time TEXT NOT NULL,
  modified_time TEXT NOT NULL,
  created_by_id TEXT,
  modified_by_id TEXT,
  FOREIGN KEY (module_api_name) REFERENCES crm_modules(api_name) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_crm_records_module ON crm_records(module_api_name);
CREATE INDEX IF NOT EXISTS idx_crm_records_modified ON crm_records(modified_time);

CREATE TABLE IF NOT EXISTS crm_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  profile TEXT NOT NULL,
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS crm_org (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  primary_email TEXT NOT NULL,
  currency_symbol TEXT DEFAULT '$',
  time_zone TEXT DEFAULT 'America/Los_Angeles',
  domain_name TEXT DEFAULT 'zohocrm.com'
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0.0',
  entry_file TEXT DEFAULT 'app.html',
  runtime_mode TEXT DEFAULT 'html',
  framework TEXT DEFAULT 'vanilla',
  zoho_config_json TEXT NOT NULL,
  env_vars_json TEXT DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS project_files (
  project_id TEXT NOT NULL,
  path TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_directory INTEGER DEFAULT 0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (project_id, path),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mock_endpoints (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status_code INTEGER DEFAULT 200,
  response_headers_json TEXT DEFAULT '{}',
  response_body TEXT NOT NULL,
  latency_ms INTEGER DEFAULT 50,
  is_error INTEGER DEFAULT 0,
  enabled INTEGER DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS api_test_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  method TEXT NOT NULL,
  url TEXT NOT NULL,
  headers_json TEXT DEFAULT '{}',
  query_params_json TEXT DEFAULT '{}',
  body TEXT,
  last_run_at TEXT
);

CREATE TABLE IF NOT EXISTS studio_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL
);
