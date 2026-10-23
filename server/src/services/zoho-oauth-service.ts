import { Database as DatabaseType } from 'better-sqlite3';
import axios from 'axios';
import { ZohoDataCenter, ZohoOAuthConfig } from '@zoho-studio/shared';

const ACCOUNTS_URLS: Record<ZohoDataCenter, string> = {
  com: 'https://accounts.zoho.com',
  eu: 'https://accounts.zoho.eu',
  in: 'https://accounts.zoho.in',
  'com.au': 'https://accounts.zoho.com.au',
  'com.cn': 'https://accounts.zoho.com.cn',
  ca: 'https://accounts.zoho.ca'
};

const API_BASE_URLS: Record<ZohoDataCenter, string> = {
  com: 'https://www.zohoapis.com/crm/v2',
  eu: 'https://www.zohoapis.eu/crm/v2',
  in: 'https://www.zohoapis.in/crm/v2',
  'com.au': 'https://www.zohoapis.com.au/crm/v2',
  'com.cn': 'https://www.zohoapis.com.cn/crm/v2',
  ca: 'https://www.zohoapis.ca/crm/v2'
};

interface StoredAuthConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
  tokenExpiresAt?: number;
  dataCenter: ZohoDataCenter;
  redirectUri?: string;
  scope?: string;
  isConnected: boolean;
  currentOrgName?: string;
  currentUserEmail?: string;
  lastConnectedAt?: string;
}

export class ZohoOAuthService {
  constructor(private db: DatabaseType) {}

  public getPublicConfig(): ZohoOAuthConfig {
    const stored = this.getStoredConfig();
    if (!stored) {
      return {
        clientId: '',
        dataCenter: 'com',
        isConnected: false
      };
    }

    return {
      clientId: stored.clientId,
      dataCenter: stored.dataCenter,
      redirectUri: stored.redirectUri,
      scope: stored.scope,
      isConnected: stored.isConnected,
      currentOrgName: stored.currentOrgName,
      currentUserEmail: stored.currentUserEmail,
      lastConnectedAt: stored.lastConnectedAt
      // Intentionally omitting clientSecret and refreshToken to protect secrets!
    };
  }

  public getStoredConfig(): StoredAuthConfig | null {
    const row = this.db.prepare('SELECT value_json FROM studio_settings WHERE key = ?').get('zoho_oauth') as any;
    if (!row) return null;
    try {
      return JSON.parse(row.value_json);
    } catch {
      return null;
    }
  }

  public saveConfig(config: Partial<StoredAuthConfig>): ZohoOAuthConfig {
    const existing = this.getStoredConfig() || {
      clientId: '',
      clientSecret: '',
      refreshToken: '',
      dataCenter: 'com' as ZohoDataCenter,
      isConnected: false
    };

    const merged: StoredAuthConfig = {
      ...existing,
      ...config,
      // If client provided placeholder/masked secrets, keep existing
      clientSecret: config.clientSecret && config.clientSecret !== '••••••••' ? config.clientSecret : existing.clientSecret,
      refreshToken: config.refreshToken && config.refreshToken !== '••••••••' ? config.refreshToken : existing.refreshToken
    };

    this.db.prepare(
      'INSERT OR REPLACE INTO studio_settings (key, value_json) VALUES (?, ?)'
    ).run('zoho_oauth', JSON.stringify(merged));

    return this.getPublicConfig();
  }

  public disconnect(): ZohoOAuthConfig {
    const existing = this.getStoredConfig();
    if (existing) {
      existing.isConnected = false;
      existing.accessToken = undefined;
      existing.tokenExpiresAt = undefined;
      this.db.prepare(
        'INSERT OR REPLACE INTO studio_settings (key, value_json) VALUES (?, ?)'
      ).run('zoho_oauth', JSON.stringify(existing));
    }
    return this.getPublicConfig();
  }

  public async getValidAccessToken(): Promise<string> {
    const config = this.getStoredConfig();
    if (!config || !config.isConnected || !config.refreshToken) {
      throw new Error('Real Zoho integration is not connected or configured.');
    }

    // Return cached access token if valid for at least another 60 seconds
    const now = Date.now();
    if (config.accessToken && config.tokenExpiresAt && config.tokenExpiresAt > now + 60000) {
      return config.accessToken;
    }

    // Refresh token
    const accountsUrl = ACCOUNTS_URLS[config.dataCenter] || ACCOUNTS_URLS.com;
    const tokenEndpoint = `${accountsUrl}/oauth/v2/token`;

    try {
      const response = await axios.post(tokenEndpoint, null, {
        params: {
          refresh_token: config.refreshToken,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          grant_type: 'refresh_token'
        }
      });

      if (response.data.error) {
        throw new Error(`Zoho OAuth Error: ${response.data.error}`);
      }

      const accessToken = response.data.access_token;
      const expiresInSec = response.data.expires_in || 3600;

      config.accessToken = accessToken;
      config.tokenExpiresAt = now + expiresInSec * 1000;

      this.db.prepare(
        'INSERT OR REPLACE INTO studio_settings (key, value_json) VALUES (?, ?)'
      ).run('zoho_oauth', JSON.stringify(config));

      return accessToken;
    } catch (err: any) {
      throw new Error(`Failed to refresh Zoho CRM access token: ${err.response?.data?.error || err.message}`);
    }
  }

  public async testConnection(): Promise<{ success: boolean; orgName?: string; userEmail?: string; error?: string }> {
    const config = this.getStoredConfig();
    if (!config || !config.clientId || !config.clientSecret || !config.refreshToken) {
      return { success: false, error: 'Missing Client ID, Client Secret, or Refresh Token.' };
    }

    try {
      const token = await this.getValidAccessToken();
      const apiBase = API_BASE_URLS[config.dataCenter] || API_BASE_URLS.com;

      // Fetch org info to test
      const orgRes = await axios.get(`${apiBase}/org`, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` }
      });

      const orgName = orgRes.data?.org?.[0]?.company_name || 'Zoho CRM Connected';

      // Fetch current user
      const userRes = await axios.get(`${apiBase}/users?type=CurrentUser`, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` }
      });
      const userEmail = userRes.data?.users?.[0]?.email || 'user@zoho.com';

      // Update config as verified and connected
      config.isConnected = true;
      config.currentOrgName = orgName;
      config.currentUserEmail = userEmail;
      config.lastConnectedAt = new Date().toISOString();

      this.db.prepare(
        'INSERT OR REPLACE INTO studio_settings (key, value_json) VALUES (?, ?)'
      ).run('zoho_oauth', JSON.stringify(config));

      return { success: true, orgName, userEmail };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }

  public async proxyApiCall(entity: string, method: string, params: any): Promise<any> {
    const config = this.getStoredConfig();
    if (!config || !config.isConnected) {
      throw new Error('Real Zoho mode is selected, but Zoho CRM account is not connected.');
    }

    const token = await this.getValidAccessToken();
    const apiBase = API_BASE_URLS[config.dataCenter] || API_BASE_URLS.com;

    let url = `${apiBase}/${entity}`;
    let httpMethod = 'GET';
    let data: any = undefined;
    let queryParams: any = {};

    switch (method) {
      case 'getRecord':
        url = `${apiBase}/${entity}/${params.RecordID}`;
        httpMethod = 'GET';
        break;
      case 'getAllRecords':
        httpMethod = 'GET';
        queryParams = {
          page: params.page || 1,
          per_page: params.per_page || 200,
          sort_order: params.sort_order || 'desc'
        };
        break;
      case 'insertRecord':
        httpMethod = 'POST';
        data = { data: [params.APIData] };
        break;
      case 'updateRecord':
        httpMethod = 'PUT';
        data = { data: [params.APIData] };
        break;
      case 'deleteRecord':
        url = `${apiBase}/${entity}/${params.RecordID}`;
        httpMethod = 'DELETE';
        break;
      case 'searchRecord':
        url = `${apiBase}/${entity}/search`;
        httpMethod = 'GET';
        queryParams = {
          [params.Type || 'criteria']: params.Query,
          page: params.page || 1,
          per_page: params.per_page || 200
        };
        break;
      case 'getCurrentUser':
        url = `${apiBase}/users?type=CurrentUser`;
        httpMethod = 'GET';
        break;
      case 'getOrgInfo':
        url = `${apiBase}/org`;
        httpMethod = 'GET';
        break;
      default:
        throw new Error(`Unsupported method "${method}" for real Zoho integration.`);
    }

    const res = await axios({
      method: httpMethod,
      url,
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json'
      },
      params: queryParams,
      data
    });

    return res.data;
  }
}
