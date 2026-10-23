export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface MockEndpoint {
  id: string;
  name: string;
  method: HttpMethod;
  path: string; // e.g. "/api/v1/weather"
  statusCode: number;
  responseHeaders: Record<string, string>;
  responseBody: string; // JSON string or text
  latencyMs: number;
  isError: boolean;
  enabled: boolean;
  createdAt: string;
}

export interface ApiTestProfile {
  id: string;
  name: string;
  method: HttpMethod;
  url: string; // Can be a mock endpoint (/api/mock/...) or a safe external URL
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  body?: string;
  lastRunAt?: string;
}

export interface ApiExecutionLog {
  id: string;
  timestamp: string;
  method: HttpMethod;
  url: string;
  requestHeaders: Record<string, string>;
  requestBody?: any;
  status: number;
  responseHeaders: Record<string, string>;
  responseBody: any;
  durationMs: number;
  isMock: boolean;
  error?: string;
}
