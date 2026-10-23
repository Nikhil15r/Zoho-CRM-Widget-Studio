import { Database as DatabaseType } from 'better-sqlite3';
import axios from 'axios';
import {
  MockEndpoint,
  ApiTestProfile,
  ApiExecutionLog,
  HttpMethod
} from '@zoho-studio/shared';
import { validateSafeUrl } from '../middleware/ssrf-filter.js';

export class PlaygroundService {
  constructor(private db: DatabaseType) {}

  public getMockEndpoints(): MockEndpoint[] {
    const rows = this.db.prepare('SELECT * FROM mock_endpoints ORDER BY created_at DESC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      method: r.method as HttpMethod,
      path: r.path,
      statusCode: r.status_code,
      responseHeaders: JSON.parse(r.response_headers_json || '{}'),
      responseBody: r.response_body,
      latencyMs: r.latency_ms,
      isError: Boolean(r.is_error),
      enabled: Boolean(r.enabled),
      createdAt: r.created_at
    }));
  }

  public getMockEndpointById(id: string): MockEndpoint | null {
    const r = this.db.prepare('SELECT * FROM mock_endpoints WHERE id = ?').get(id) as any;
    if (!r) return null;
    return {
      id: r.id,
      name: r.name,
      method: r.method as HttpMethod,
      path: r.path,
      statusCode: r.status_code,
      responseHeaders: JSON.parse(r.response_headers_json || '{}'),
      responseBody: r.response_body,
      latencyMs: r.latency_ms,
      isError: Boolean(r.is_error),
      enabled: Boolean(r.enabled),
      createdAt: r.created_at
    };
  }

  public findMockResponse(method: string, path: string): MockEndpoint | null {
    // Normalize path (ensure leading slash, strip query params)
    const cleanPath = path.split('?')[0].replace(/\/+$/, '') || '/';
    const rows = this.getMockEndpoints().filter((ep) => ep.enabled);

    const match = rows.find(
      (ep) =>
        ep.method.toUpperCase() === method.toUpperCase() &&
        (ep.path.toLowerCase() === cleanPath.toLowerCase() ||
          ep.path.toLowerCase() === (cleanPath.startsWith('/') ? cleanPath.toLowerCase() : '/' + cleanPath.toLowerCase()))
    );

    return match || null;
  }

  public createMockEndpoint(data: Omit<MockEndpoint, 'id' | 'createdAt'>): MockEndpoint {
    const id = 'mock_ep_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    let cleanPath = data.path.trim();
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }

    this.db.prepare(
      `INSERT INTO mock_endpoints (id, name, method, path, status_code, response_headers_json, response_body, latency_ms, is_error, enabled, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      data.name,
      data.method.toUpperCase(),
      cleanPath,
      data.statusCode || 200,
      JSON.stringify(data.responseHeaders || { 'Content-Type': 'application/json' }),
      data.responseBody || '{}',
      data.latencyMs ?? 50,
      data.isError ? 1 : 0,
      data.enabled !== false ? 1 : 0,
      now
    );

    return this.getMockEndpointById(id)!;
  }

  public updateMockEndpoint(id: string, updates: Partial<MockEndpoint>): MockEndpoint {
    const existing = this.getMockEndpointById(id);
    if (!existing) {
      throw new Error(`Mock endpoint "${id}" not found.`);
    }

    let cleanPath = updates.path !== undefined ? updates.path.trim() : existing.path;
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }

    this.db.prepare(
      `UPDATE mock_endpoints SET 
         name = ?, 
         method = ?, 
         path = ?, 
         status_code = ?, 
         response_headers_json = ?, 
         response_body = ?, 
         latency_ms = ?, 
         is_error = ?, 
         enabled = ? 
       WHERE id = ?`
    ).run(
      updates.name ?? existing.name,
      (updates.method ?? existing.method).toUpperCase(),
      cleanPath,
      updates.statusCode ?? existing.statusCode,
      JSON.stringify(updates.responseHeaders ?? existing.responseHeaders),
      updates.responseBody ?? existing.responseBody,
      updates.latencyMs ?? existing.latencyMs,
      updates.isError !== undefined ? (updates.isError ? 1 : 0) : existing.isError ? 1 : 0,
      updates.enabled !== undefined ? (updates.enabled ? 1 : 0) : existing.enabled ? 1 : 0,
      id
    );

    return this.getMockEndpointById(id)!;
  }

  public deleteMockEndpoint(id: string): void {
    const res = this.db.prepare('DELETE FROM mock_endpoints WHERE id = ?').run(id);
    if (res.changes === 0) {
      throw new Error(`Mock endpoint "${id}" not found.`);
    }
  }

  public getTestProfiles(): ApiTestProfile[] {
    const rows = this.db.prepare('SELECT * FROM api_test_profiles ORDER BY name ASC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      method: r.method as HttpMethod,
      url: r.url,
      headers: JSON.parse(r.headers_json || '{}'),
      queryParams: JSON.parse(r.query_params_json || '{}'),
      body: r.body,
      lastRunAt: r.last_run_at
    }));
  }

  public saveTestProfile(profile: Omit<ApiTestProfile, 'id'> & { id?: string }): ApiTestProfile {
    const id = profile.id || 'prof_' + Math.random().toString(36).substring(2, 10);
    this.db.prepare(
      `INSERT INTO api_test_profiles (id, name, method, url, headers_json, query_params_json, body, last_run_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET 
         name = excluded.name,
         method = excluded.method,
         url = excluded.url,
         headers_json = excluded.headers_json,
         query_params_json = excluded.query_params_json,
         body = excluded.body,
         last_run_at = excluded.last_run_at`
    ).run(
      id,
      profile.name,
      profile.method.toUpperCase(),
      profile.url,
      JSON.stringify(profile.headers || {}),
      JSON.stringify(profile.queryParams || {}),
      profile.body || '',
      profile.lastRunAt || new Date().toISOString()
    );

    return {
      id,
      name: profile.name,
      method: profile.method,
      url: profile.url,
      headers: profile.headers || {},
      queryParams: profile.queryParams || {},
      body: profile.body,
      lastRunAt: profile.lastRunAt
    };
  }

  public deleteTestProfile(id: string): void {
    this.db.prepare('DELETE FROM api_test_profiles WHERE id = ?').run(id);
  }

  /**
   * Executes a simulated or real (SSRF-protected) API request from the Playground
   */
  public async executeRequest(params: {
    method: HttpMethod;
    url: string;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
    body?: any;
  }): Promise<ApiExecutionLog> {
    const startTime = Date.now();
    const id = 'exec_' + Math.random().toString(36).substring(2, 10);
    const timestamp = new Date().toISOString();

    // Check if URL matches a local mock endpoint (e.g. /api/v1/... or relative path)
    const isLocalMock = !params.url.startsWith('http://') && !params.url.startsWith('https://');

    if (isLocalMock) {
      const mockEp = this.findMockResponse(params.method, params.url);
      if (mockEp) {
        if (mockEp.latencyMs > 0) {
          await new Promise((r) => setTimeout(r, mockEp.latencyMs));
        }

        let parsedBody: any;
        try {
          parsedBody = JSON.parse(mockEp.responseBody);
        } catch {
          parsedBody = mockEp.responseBody;
        }

        return {
          id,
          timestamp,
          method: params.method,
          url: params.url,
          requestHeaders: params.headers || {},
          requestBody: params.body,
          status: mockEp.statusCode,
          responseHeaders: mockEp.responseHeaders,
          responseBody: parsedBody,
          durationMs: Date.now() - startTime,
          isMock: true
        };
      } else {
        return {
          id,
          timestamp,
          method: params.method,
          url: params.url,
          requestHeaders: params.headers || {},
          requestBody: params.body,
          status: 404,
          responseHeaders: { 'Content-Type': 'application/json' },
          responseBody: {
            error: 'MOCK_ENDPOINT_NOT_FOUND',
            message: `No active mock endpoint registered for [${params.method}] ${params.url}`
          },
          durationMs: Date.now() - startTime,
          isMock: true,
          error: 'Mock endpoint not found'
        };
      }
    }

    // Live Request with SSRF Protection
    const safetyCheck = await validateSafeUrl(params.url);
    if (!safetyCheck.safe) {
      return {
        id,
        timestamp,
        method: params.method,
        url: params.url,
        requestHeaders: params.headers || {},
        requestBody: params.body,
        status: 403,
        responseHeaders: { 'Content-Type': 'application/json' },
        responseBody: {
          error: 'SSRF_BLOCKED',
          message: safetyCheck.error
        },
        durationMs: Date.now() - startTime,
        isMock: false,
        error: safetyCheck.error
      };
    }

    try {
      const response = await axios({
        method: params.method,
        url: params.url,
        headers: params.headers,
        params: params.queryParams,
        data: params.body,
        timeout: 8000,
        maxContentLength: 2 * 1024 * 1024, // Max 2MB response
        validateStatus: () => true // Do not throw on 4xx/5xx to capture full response in playground
      });

      const responseHeaders: Record<string, string> = {};
      for (const [k, v] of Object.entries(response.headers)) {
        if (typeof v === 'string') responseHeaders[k] = v;
      }

      return {
        id,
        timestamp,
        method: params.method,
        url: params.url,
        requestHeaders: params.headers || {},
        requestBody: params.body,
        status: response.status,
        responseHeaders,
        responseBody: response.data,
        durationMs: Date.now() - startTime,
        isMock: false
      };
    } catch (err: any) {
      return {
        id,
        timestamp,
        method: params.method,
        url: params.url,
        requestHeaders: params.headers || {},
        requestBody: params.body,
        status: 502,
        responseHeaders: { 'Content-Type': 'application/json' },
        responseBody: {
          error: 'PROXY_REQUEST_FAILED',
          message: err.message
        },
        durationMs: Date.now() - startTime,
        isMock: false,
        error: err.message
      };
    }
  }
}
