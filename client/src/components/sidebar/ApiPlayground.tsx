import React, { useState, useEffect } from 'react';
import { Send, Plus, Bookmark, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { HttpMethod, MockEndpoint, ApiTestProfile, ApiExecutionLog } from '@zoho-studio/shared';
import { devtoolsActions } from '../../store/devtoolsStore';

export const ApiPlayground: React.FC = () => {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState<string>('/api/v1/weather/forecast');
  const [headers, setHeaders] = useState<string>('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState<string>('{\n  "message": "test"\n}');
  const [activeSubTab, setActiveSubTab] = useState<'request' | 'mock-endpoints' | 'saved'>('request');

  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<ApiExecutionLog | null>(null);

  const [mockEndpoints, setMockEndpoints] = useState<MockEndpoint[]>([]);
  const [testProfiles, setTestProfiles] = useState<ApiTestProfile[]>([]);

  const fetchMockEndpoints = async () => {
    try {
      const res = await fetch('/api/playground/endpoints');
      if (res.ok) setMockEndpoints(await res.json());
    } catch {}
  };

  const fetchTestProfiles = async () => {
    try {
      const res = await fetch('/api/playground/profiles');
      if (res.ok) setTestProfiles(await res.json());
    } catch {}
  };

  useEffect(() => {
    fetchMockEndpoints();
    fetchTestProfiles();
  }, []);

  const handleSend = async () => {
    setIsLoading(true);
    setLastResponse(null);

    let parsedHeaders = {};
    try {
      parsedHeaders = JSON.parse(headers);
    } catch {}

    let parsedBody: any = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
      try {
        parsedBody = JSON.parse(body);
      } catch {
        parsedBody = body;
      }
    }

    try {
      const res = await fetch('/api/playground/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          url,
          headers: parsedHeaders,
          body: parsedBody
        })
      });

      const log: ApiExecutionLog = await res.json();
      setLastResponse(log);
      devtoolsActions.addNetworkLog(log);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    const name = prompt('Enter profile name:', `${method} ${url}`);
    if (!name) return;

    let parsedHeaders = {};
    try {
      parsedHeaders = JSON.parse(headers);
    } catch {}

    try {
      const res = await fetch('/api/playground/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          method,
          url,
          headers: parsedHeaders,
          body
        })
      });
      if (res.ok) {
        fetchTestProfiles();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="h-full flex flex-col text-slate-700 dark:text-slate-300">
      {/* Sub tabs */}
      <div className="flex border-b border-slate-200 dark:border-studio-darkborder bg-slate-50 dark:bg-studio-darksidebar text-xs">
        <button
          onClick={() => setActiveSubTab('request')}
          className={`flex-1 py-2 font-medium border-b-2 transition ${
            activeSubTab === 'request'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-studio-darkbg'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Request
        </button>
        <button
          onClick={() => setActiveSubTab('mock-endpoints')}
          className={`flex-1 py-2 font-medium border-b-2 transition ${
            activeSubTab === 'mock-endpoints'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-studio-darkbg'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Mock Endpoints ({mockEndpoints.length})
        </button>
        <button
          onClick={() => setActiveSubTab('saved')}
          className={`flex-1 py-2 font-medium border-b-2 transition ${
            activeSubTab === 'saved'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-studio-darkbg'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Profiles ({testProfiles.length})
        </button>
      </div>

      {activeSubTab === 'request' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Method and URL */}
          <div className="flex gap-1.5">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as HttpMethod)}
              className="bg-slate-100 dark:bg-studio-darksidebar border border-slate-300 dark:border-studio-darkborder rounded px-2 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 outline-none"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>

            <input
              type="text"
              placeholder="/api/v1/... or https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder rounded px-2.5 py-1.5 text-xs font-mono outline-none focus:border-blue-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleSaveProfile}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <Bookmark size={12} />
              <span>Save Scenario</span>
            </button>

            <button
              onClick={handleSend}
              disabled={isLoading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow transition disabled:opacity-50"
            >
              <Send size={12} />
              <span>{isLoading ? 'Sending...' : 'Send Request'}</span>
            </button>
          </div>

          {/* Headers */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Headers (JSON)</label>
            <textarea
              rows={2}
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder rounded p-2 text-xs font-mono outline-none"
            />
          </div>

          {/* Body */}
          {['POST', 'PUT', 'PATCH'].includes(method) && (
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Request Body (JSON)</label>
              <textarea
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder rounded p-2 text-xs font-mono outline-none"
              />
            </div>
          )}

          {/* Response Viewer */}
          {lastResponse && (
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-studio-darkborder space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      lastResponse.status >= 200 && lastResponse.status < 300
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                    }`}
                  >
                    HTTP {lastResponse.status}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock size={11} />
                    {lastResponse.durationMs}ms
                  </span>
                </div>
                {lastResponse.isMock && (
                  <span className="text-[10px] uppercase font-bold text-blue-500 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded">
                    Simulated Mock
                  </span>
                )}
              </div>

              <div className="bg-slate-900 text-slate-200 rounded-lg p-2.5 text-xs font-mono max-h-56 overflow-auto">
                <pre>{JSON.stringify(lastResponse.responseBody, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'mock-endpoints' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {mockEndpoints.map((ep) => (
            <div
              key={ep.id}
              onClick={() => {
                setMethod(ep.method);
                setUrl(ep.path);
                setActiveSubTab('request');
              }}
              className="bg-white dark:bg-studio-darksidebar border border-slate-200 dark:border-studio-darkborder rounded-lg p-2.5 text-xs cursor-pointer hover:border-blue-400 transition flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-100">{ep.name}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    ep.statusCode >= 200 && ep.statusCode < 300
                      ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600'
                      : 'bg-red-100 dark:bg-red-950/50 text-red-600'
                  }`}
                >
                  {ep.statusCode}
                </span>
              </div>
              <div className="font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="font-bold text-blue-500">{ep.method}</span>
                <span>{ep.path}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'saved' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {testProfiles.length === 0 ? (
            <div className="text-center p-4 text-xs text-slate-400">No saved test profiles.</div>
          ) : (
            testProfiles.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setMethod(p.method);
                  setUrl(p.url);
                  setHeaders(JSON.stringify(p.headers, null, 2));
                  setBody(p.body || '');
                  setActiveSubTab('request');
                }}
                className="bg-white dark:bg-studio-darksidebar border border-slate-200 dark:border-studio-darkborder rounded-lg p-2.5 text-xs cursor-pointer hover:border-blue-400 transition"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-100">{p.name}</div>
                <div className="font-mono text-slate-400 mt-1 flex items-center gap-1">
                  <span className="font-bold text-blue-500">{p.method}</span>
                  <span className="truncate">{p.url}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
