import React, { useState, useEffect } from 'react';
import { Shield, Link2, CheckCircle, XCircle, RefreshCw, KeyRound, Globe, ExternalLink } from 'lucide-react';
import { ZohoOAuthConfig, ZohoDataCenter } from '@zoho-studio/shared';
import { useSettingsStore } from '../../store/settingsStore';

export const IntegrationsPanel: React.FC = () => {
  const { environmentMode, setEnvironmentMode } = useSettingsStore();

  const [authConfig, setAuthConfig] = useState<ZohoOAuthConfig>({
    clientId: '',
    dataCenter: 'com',
    isConnected: false
  });

  const [clientSecret, setClientSecret] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/zoho/config');
      if (res.ok) {
        const data = await res.json();
        setAuthConfig(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/zoho/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: authConfig.clientId,
          clientSecret: clientSecret || undefined,
          refreshToken: refreshToken || undefined,
          dataCenter: authConfig.dataCenter
        })
      });

      if (res.ok) {
        const saved = await res.json();
        setAuthConfig(saved);
        setClientSecret('');
        setRefreshToken('');
        alert('Zoho OAuth credentials securely stored on local server.');
      }
    } catch (e: any) {
      alert('Save failed: ' + e.message);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/zoho/test', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `Connected to Org: "${data.orgName}" (${data.userEmail})`
        });
        fetchConfig();
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Connection verification failed'
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect from real Zoho CRM account?')) return;
    try {
      const res = await fetch('/api/zoho/disconnect', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAuthConfig(data.config);
        setEnvironmentMode('mock');
        setTestResult(null);
      }
    } catch (e: any) {
      alert('Disconnect failed: ' + e.message);
    }
  };

  return (
    <div className="h-full flex flex-col text-slate-700 dark:text-slate-300 overflow-y-auto p-3 space-y-4 text-xs">
      {/* Environment Mode Switch */}
      <div className="bg-slate-100 dark:bg-studio-darksidebar border border-slate-200 dark:border-studio-darkborder rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide text-[11px]">
            Execution Target
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              environmentMode === 'real_zoho'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400'
            }`}
          >
            {environmentMode === 'real_zoho' ? 'Live Zoho CRM' : 'Mock Simulator'}
          </span>
        </div>

        <div className="flex gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setEnvironmentMode('mock')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition ${
              environmentMode === 'mock'
                ? 'bg-white dark:bg-studio-darksurface text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-studio-darkborder'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Mock Engine (Offline)
          </button>
          <button
            type="button"
            onClick={() => {
              if (!authConfig.isConnected) {
                alert('Configure credentials and verify connection below before enabling Real Zoho mode.');
                return;
              }
              setEnvironmentMode('real_zoho');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition ${
              environmentMode === 'real_zoho'
                ? 'bg-white dark:bg-studio-darksurface text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-studio-darkborder'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Real Zoho CRM
          </button>
        </div>
      </div>

      {/* Connection Status Card */}
      <div className="bg-white dark:bg-studio-darksidebar border border-slate-200 dark:border-studio-darkborder rounded-xl p-3 flex flex-col gap-2 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Link2 size={13} className="text-blue-500" />
            OAuth Connection Status
          </span>
          {authConfig.isConnected ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
              <CheckCircle size={11} /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-studio-darkborder px-2 py-0.5 rounded">
              <XCircle size={11} /> Disconnected
            </span>
          )}
        </div>

        {authConfig.isConnected && (
          <div className="space-y-1 text-[11px] pt-1 border-t border-slate-100 dark:border-studio-darkborder/60">
            <div><strong>Organization:</strong> {authConfig.currentOrgName || 'Zoho CRM'}</div>
            <div><strong>Authorized User:</strong> {authConfig.currentUserEmail || 'N/A'}</div>
            <div className="text-slate-400">Connected: {authConfig.lastConnectedAt ? new Date(authConfig.lastConnectedAt).toLocaleString() : 'Recently'}</div>

            <button
              onClick={handleDisconnect}
              className="mt-2 text-rose-500 hover:text-rose-700 font-semibold text-[11px]"
            >
              Disconnect Zoho Account
            </button>
          </div>
        )}
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSaveConfig} className="bg-white dark:bg-studio-darksidebar border border-slate-200 dark:border-studio-darkborder rounded-xl p-3 flex flex-col gap-3 shadow-sm">
        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <KeyRound size={13} className="text-blue-500" />
          Credentials Configuration
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Data Center Region
          </label>
          <select
            value={authConfig.dataCenter}
            onChange={(e) =>
              setAuthConfig({ ...authConfig, dataCenter: e.target.value as ZohoDataCenter })
            }
            className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
          >
            <option value="com">United States (.com)</option>
            <option value="eu">Europe (.eu)</option>
            <option value="in">India (.in)</option>
            <option value="com.au">Australia (.com.au)</option>
            <option value="com.cn">China (.com.cn)</option>
            <option value="ca">Canada (.ca)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Client ID
          </label>
          <input
            type="text"
            value={authConfig.clientId}
            onChange={(e) => setAuthConfig({ ...authConfig, clientId: e.target.value })}
            placeholder="1000.XXXXXXXXXXXXXXXXXXXXXXXX"
            className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Client Secret (Stored server-side only)
          </label>
          <input
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder={authConfig.isConnected ? '••••••••' : 'Client Secret'}
            className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            OAuth Refresh Token
          </label>
          <input
            type="password"
            value={refreshToken}
            onChange={(e) => setRefreshToken(e.target.value)}
            placeholder={authConfig.isConnected ? '••••••••' : '1000.XXXXXXXXXXXXXXXXXXXXXXXX'}
            className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs transition"
          >
            Save Credentials
          </button>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-studio-darkborder dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg text-xs transition flex items-center gap-1"
          >
            <RefreshCw size={12} className={isTesting ? 'animate-spin' : ''} />
            <span>Test</span>
          </button>
        </div>

        {testResult && (
          <div
            className={`p-2 rounded-lg text-[11px] ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {testResult.message}
          </div>
        )}
      </form>

      {/* Setup Guide */}
      <div className="p-3 bg-slate-50 dark:bg-studio-darkbg border border-slate-200 dark:border-studio-darkborder rounded-xl space-y-1.5 text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
        <span className="font-bold text-slate-700 dark:text-slate-200 block">Zoho Developer Console Setup</span>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Create a "Server-based Application" in <a href="https://api-console.zoho.com" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-0.5">Zoho API Console <ExternalLink size={10} /></a>.</li>
          <li>Set authorized redirect URI to <code>http://127.0.0.1:3001/oauth/callback</code>.</li>
          <li>Generate a code with scope: <code>ZohoCRM.modules.ALL,ZohoCRM.users.READ,ZohoCRM.org.READ</code>.</li>
          <li>Client secrets and refresh tokens are kept strictly on the local backend and never sent to preview iframes.</li>
        </ol>
      </div>
    </div>
  );
};
