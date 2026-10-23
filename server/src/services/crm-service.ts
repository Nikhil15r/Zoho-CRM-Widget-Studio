import { Database as DatabaseType } from 'better-sqlite3';
import {
  CRMModuleSchema,
  CRMRecord,
  CRMUser,
  CRMOrgInfo,
  ZohoRecordResponse,
  ZohoActionResponse,
  ZohoErrorResponse
} from '@zoho-studio/shared';
import { resetMockCrmData } from '../db/database.js';

export class CrmService {
  constructor(private db: DatabaseType) {}

  public getModules(): CRMModuleSchema[] {
    const rows = this.db.prepare('SELECT * FROM crm_modules ORDER BY is_custom ASC, api_name ASC').all() as any[];
    return rows.map((r) => ({
      api_name: r.api_name,
      singular_label: r.singular_label,
      plural_label: r.plural_label,
      is_custom: Boolean(r.is_custom),
      fields: JSON.parse(r.fields_json)
    }));
  }

  public getModule(apiName: string): CRMModuleSchema | null {
    const row = this.db.prepare('SELECT * FROM crm_modules WHERE api_name = ? COLLATE NOCASE').get(apiName) as any;
    if (!row) return null;
    return {
      api_name: row.api_name,
      singular_label: row.singular_label,
      plural_label: row.plural_label,
      is_custom: Boolean(row.is_custom),
      fields: JSON.parse(row.fields_json)
    };
  }

  public createCustomModule(moduleData: CRMModuleSchema): CRMModuleSchema {
    const existing = this.getModule(moduleData.api_name);
    if (existing) {
      throw new Error(`Module with api_name "${moduleData.api_name}" already exists.`);
    }

    const defaultFields = [
      { api_name: 'Name', display_label: 'Name', data_type: 'text' as const, required: true },
      ...(moduleData.fields || [])
    ];

    this.db.prepare(
      'INSERT INTO crm_modules (api_name, singular_label, plural_label, is_custom, fields_json) VALUES (?, ?, ?, 1, ?)'
    ).run(
      moduleData.api_name,
      moduleData.singular_label,
      moduleData.plural_label,
      JSON.stringify(defaultFields)
    );

    return this.getModule(moduleData.api_name)!;
  }

  public updateModuleFields(apiName: string, fields: any[]): CRMModuleSchema {
    const mod = this.getModule(apiName);
    if (!mod) {
      throw new Error(`Module "${apiName}" not found.`);
    }
    this.db.prepare('UPDATE crm_modules SET fields_json = ? WHERE api_name = ? COLLATE NOCASE').run(
      JSON.stringify(fields),
      apiName
    );
    return this.getModule(apiName)!;
  }

  public getRecords(
    entity: string,
    options: {
      page?: number;
      per_page?: number;
      sort_order?: 'asc' | 'desc';
      sortBy?: string;
    } = {}
  ): ZohoRecordResponse {
    const mod = this.getModule(entity);
    if (!mod) {
      throw {
        code: 'INVALID_MODULE',
        message: `Module "${entity}" does not exist in CRM.`,
        status: 'error'
      };
    }

    const page = Math.max(1, Number(options.page) || 1);
    const perPage = Math.min(200, Math.max(1, Number(options.per_page) || 200));
    const offset = (page - 1) * perPage;
    const sortOrder = options.sort_order?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const countRow = this.db.prepare(
      'SELECT COUNT(*) as total FROM crm_records WHERE module_api_name = ? COLLATE NOCASE'
    ).get(mod.api_name) as { total: number };

    const rows = this.db.prepare(
      `SELECT record_json FROM crm_records 
       WHERE module_api_name = ? COLLATE NOCASE 
       ORDER BY modified_time ${sortOrder} 
       LIMIT ? OFFSET ?`
    ).all(mod.api_name, perPage, offset) as any[];

    const records = rows.map((r) => JSON.parse(r.record_json));
    const total = countRow.total;
    const moreRecords = offset + records.length < total;

    return {
      data: records,
      info: {
        page,
        per_page: perPage,
        count: records.length,
        more_records: moreRecords
      }
    };
  }

  public getRecord(entity: string, recordId: string): ZohoRecordResponse {
    const mod = this.getModule(entity);
    if (!mod) {
      throw {
        code: 'INVALID_MODULE',
        message: `Module "${entity}" does not exist in CRM.`,
        status: 'error'
      };
    }

    const row = this.db.prepare(
      'SELECT record_json FROM crm_records WHERE module_api_name = ? COLLATE NOCASE AND id = ?'
    ).get(mod.api_name, String(recordId)) as any;

    if (!row) {
      throw {
        code: 'RECORD_NOT_FOUND',
        message: `Record with ID "${recordId}" was not found in module "${entity}".`,
        status: 'error',
        details: { id: recordId, entity }
      };
    }

    return {
      data: [JSON.parse(row.record_json)]
    };
  }

  public insertRecord(entity: string, apiData: Record<string, any>): ZohoActionResponse {
    const mod = this.getModule(entity);
    if (!mod) {
      throw {
        code: 'INVALID_MODULE',
        message: `Module "${entity}" does not exist in CRM.`,
        status: 'error'
      };
    }

    // Validate mandatory fields
    for (const field of mod.fields) {
      if (field.required && (apiData[field.api_name] === undefined || apiData[field.api_name] === null || apiData[field.api_name] === '')) {
        throw {
          code: 'MANDATORY_NOT_FOUND',
          message: `Mandatory field "${field.display_label}" (${field.api_name}) is required.`,
          status: 'error',
          details: { api_name: field.api_name }
        };
      }
    }

    const id = apiData.id ? String(apiData.id) : this.generateZohoId();
    const now = new Date().toISOString();
    const user = this.getCurrentUser().users[0];

    const record: CRMRecord = {
      ...apiData,
      id,
      Created_Time: now,
      Modified_Time: now,
      Created_By: { id: user.id, name: user.name },
      Modified_By: { id: user.id, name: user.name },
      Owner: apiData.Owner || { id: user.id, name: user.name, email: user.email }
    };

    this.db.prepare(
      'INSERT INTO crm_records (id, module_api_name, record_json, created_time, modified_time, created_by_id, modified_by_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      id,
      mod.api_name,
      JSON.stringify(record),
      now,
      now,
      user.id,
      user.id
    );

    return {
      data: [
        {
          code: 'SUCCESS',
          details: {
            id,
            Created_Time: now,
            Modified_Time: now,
            Created_By: { id: user.id, name: user.name }
          },
          message: 'record added',
          status: 'success'
        }
      ]
    };
  }

  public updateRecord(entity: string, apiData: Record<string, any>): ZohoActionResponse {
    const mod = this.getModule(entity);
    if (!mod) {
      throw {
        code: 'INVALID_MODULE',
        message: `Module "${entity}" does not exist in CRM.`,
        status: 'error'
      };
    }

    const id = apiData.id || apiData.RecordID;
    if (!id) {
      throw {
        code: 'INVALID_DATA',
        message: 'Record ID is required for update operation.',
        status: 'error',
        details: { api_name: 'id' }
      };
    }

    const existingRow = this.db.prepare(
      'SELECT record_json FROM crm_records WHERE module_api_name = ? COLLATE NOCASE AND id = ?'
    ).get(mod.api_name, String(id)) as any;

    if (!existingRow) {
      throw {
        code: 'RECORD_NOT_FOUND',
        message: `Record with ID "${id}" does not exist to update.`,
        status: 'error',
        details: { id }
      };
    }

    const existing = JSON.parse(existingRow.record_json);
    const now = new Date().toISOString();
    const user = this.getCurrentUser().users[0];

    const updated: CRMRecord = {
      ...existing,
      ...apiData,
      id: String(id), // Keep original id
      Created_Time: existing.Created_Time,
      Created_By: existing.Created_By,
      Modified_Time: now,
      Modified_By: { id: user.id, name: user.name }
    };

    this.db.prepare(
      'UPDATE crm_records SET record_json = ?, modified_time = ?, modified_by_id = ? WHERE id = ?'
    ).run(JSON.stringify(updated), now, user.id, String(id));

    return {
      data: [
        {
          code: 'SUCCESS',
          details: {
            id: String(id),
            Modified_Time: now,
            Modified_By: { id: user.id, name: user.name }
          },
          message: 'record updated',
          status: 'success'
        }
      ]
    };
  }

  public deleteRecord(entity: string, recordId: string): ZohoActionResponse {
    const mod = this.getModule(entity);
    if (!mod) {
      throw {
        code: 'INVALID_MODULE',
        message: `Module "${entity}" does not exist in CRM.`,
        status: 'error'
      };
    }

    const res = this.db.prepare(
      'DELETE FROM crm_records WHERE module_api_name = ? COLLATE NOCASE AND id = ?'
    ).run(mod.api_name, String(recordId));

    if (res.changes === 0) {
      throw {
        code: 'RECORD_NOT_FOUND',
        message: `Record with ID "${recordId}" was not found to delete.`,
        status: 'error',
        details: { id: recordId }
      };
    }

    return {
      data: [
        {
          code: 'SUCCESS',
          details: { id: String(recordId) },
          message: 'record deleted',
          status: 'success'
        }
      ]
    };
  }

  public searchRecords(
    entity: string,
    options: {
      type?: 'criteria' | 'email' | 'phone' | 'word';
      query?: string;
      page?: number;
      per_page?: number;
    } = {}
  ): ZohoRecordResponse {
    const mod = this.getModule(entity);
    if (!mod) {
      throw {
        code: 'INVALID_MODULE',
        message: `Module "${entity}" does not exist in CRM.`,
        status: 'error'
      };
    }

    const query = (options.query || '').trim().toLowerCase();
    const rows = this.db.prepare(
      'SELECT record_json FROM crm_records WHERE module_api_name = ? COLLATE NOCASE ORDER BY modified_time DESC'
    ).all(mod.api_name) as any[];

    const allRecords: CRMRecord[] = rows.map((r) => JSON.parse(r.record_json));

    let filtered = allRecords;
    if (query) {
      filtered = allRecords.filter((rec) => {
        // Deep search across all record values
        return Object.entries(rec).some(([key, val]) => {
          if (val === null || val === undefined) return false;
          if (typeof val === 'string' || typeof val === 'number') {
            return String(val).toLowerCase().includes(query);
          }
          if (typeof val === 'object' && val.name) {
            return String(val.name).toLowerCase().includes(query);
          }
          return false;
        });
      });
    }

    const page = Math.max(1, Number(options.page) || 1);
    const perPage = Math.min(200, Math.max(1, Number(options.per_page) || 200));
    const offset = (page - 1) * perPage;
    const paginated = filtered.slice(offset, offset + perPage);

    return {
      data: paginated,
      info: {
        page,
        per_page: perPage,
        count: paginated.length,
        more_records: offset + paginated.length < filtered.length
      }
    };
  }

  public getCurrentUser(): { users: CRMUser[] } {
    const user = this.db.prepare('SELECT * FROM crm_users LIMIT 1').get() as CRMUser;
    return {
      users: [user]
    };
  }

  public getOrgInfo(): { org: CRMOrgInfo[] } {
    const org = this.db.prepare('SELECT * FROM crm_org LIMIT 1').get() as CRMOrgInfo;
    return {
      org: [org]
    };
  }

  public resetToDemoData(): void {
    resetMockCrmData(this.db);
  }

  private generateZohoId(): string {
    const prefix = '54829100000';
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}${rand}`;
  }
}
