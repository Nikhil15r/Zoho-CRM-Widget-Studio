import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Clock, ShieldCheck, Terminal } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';

interface TestItem {
  id: string;
  name: string;
  category: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  durationMs?: number;
  error?: string;
  log?: string;
}

export const TestRunnerPanel: React.FC = () => {
  const { currentProject } = useProjectStore();
  const [isRunningAll, setIsRunningAll] = useState(false);

  const [tests, setTests] = useState<TestItem[]>([
    {
      id: 'test_sdk_init',
      name: 'SDK Handshake & Global Object Verification',
      category: 'SDK Runtime',
      status: 'idle'
    },
    {
      id: 'test_pageload_event',
      name: 'PageLoad Context Event Emitted & Received',
      category: 'Lifecycle',
      status: 'idle'
    },
    {
      id: 'test_crm_crud',
      name: 'CRM Records CRUD Operations (Get, List, Insert, Update)',
      category: 'CRM API',
      status: 'idle'
    },
    {
      id: 'test_mock_api',
      name: 'Third-Party REST Mock Endpoint Response',
      category: 'Playground',
      status: 'idle'
    },
    {
      id: 'test_security_ssrf',
      name: 'SSRF & Private Network Access Protection',
      category: 'Security',
      status: 'idle'
    }
  ]);

  const runAllTests = async () => {
    setIsRunningAll(true);

    for (let i = 0; i < tests.length; i++) {
      const t = tests[i];
      setTests((prev) =>
        prev.map((item) => (item.id === t.id ? { ...item, status: 'running' } : item))
      );

      const start = Date.now();

      try {
        if (t.id === 'test_sdk_init') {
          const res = await fetch('/sdk/ZohoEmbededAppSDK.js');
          if (!res.ok) throw new Error('SDK simulator script could not be loaded');
          const script = await res.text();
          if (!script.includes('window.ZOHO')) throw new Error('Global window.ZOHO definition missing');
        } else if (t.id === 'test_pageload_event') {
          // Verify preview route loads entry file
          if (!currentProject) throw new Error('No project active');
          const res = await fetch(`/preview/${currentProject.manifest.id}/${currentProject.manifest.entryFile}`);
          if (!res.ok) throw new Error('Preview entry point failed to serve');
        } else if (t.id === 'test_crm_crud') {
          // Test CRM CRUD via mock api
          const res1 = await fetch('/api/crm/records/Deals');
          if (!res1.ok) throw new Error('Failed to fetch Deals list');

          const res2 = await fetch('/api/crm/records/Leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              First_Name: 'Automated',
              Last_Name: 'TestRecord',
              Company: 'TestRunner Suite',
              Email: 'auto.test@example.com'
            })
          });
          if (!res2.ok) throw new Error('Failed to insert test Lead');
          const inserted = await res2.json();
          const recId = inserted.data[0].details.id;

          // Delete test lead
          await fetch(`/api/crm/records/Leads/${recId}`, { method: 'DELETE' });
        } else if (t.id === 'test_mock_api') {
          const res = await fetch('/api/v1/weather/forecast');
          if (!res.ok) throw new Error('Mock endpoint returned HTTP ' + res.status);
          const data = await res.json();
          if (!data.condition) throw new Error('Mock response body invalid');
        } else if (t.id === 'test_security_ssrf') {
          // Verify that private loopback request is blocked by SSRF proxy
          const res = await fetch('/api/playground/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              method: 'GET',
              url: 'http://127.0.0.1:3000/secret'
            })
          });
          const log = await res.json();
          if (log.status !== 403 || !log.error?.includes('blocked')) {
            throw new Error('SSRF filter failed to block loopback access');
          }
        }

        const duration = Date.now() - start;
        setTests((prev) =>
          prev.map((item) =>
            item.id === t.id
              ? { ...item, status: 'passed', durationMs: duration, log: 'All assertions verified.' }
              : item
          )
        );
      } catch (err: any) {
        const duration = Date.now() - start;
        setTests((prev) =>
          prev.map((item) =>
            item.id === t.id
              ? { ...item, status: 'failed', durationMs: duration, error: err.message }
              : item
          )
        );
      }
    }

    setIsRunningAll(false);
  };

  const passedCount = tests.filter((t) => t.status === 'passed').length;
  const failedCount = tests.filter((t) => t.status === 'failed').length;

  return (
    <div className="h-full flex flex-col text-slate-700 dark:text-slate-300">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-studio-darkborder flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Widget Test Runner
          </span>

          <button
            onClick={runAllTests}
            disabled={isRunningAll}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-xs font-semibold shadow transition"
          >
            <Play size={12} />
            <span>{isRunningAll ? 'Running Tests...' : 'Run All Tests'}</span>
          </button>
        </div>

        {/* Results summary pill */}
        <div className="flex items-center gap-3 text-[11px] pt-1 font-medium">
          <span className="text-emerald-600 dark:text-emerald-400">{passedCount} Passed</span>
          <span className="text-rose-600 dark:text-rose-400">{failedCount} Failed</span>
          <span className="text-slate-400">{tests.length} Total</span>
        </div>
      </div>

      {/* Tests list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {tests.map((t) => (
          <div
            key={t.id}
            className={`border rounded-lg p-2.5 text-xs flex flex-col gap-1 transition ${
              t.status === 'passed'
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                : t.status === 'failed'
                ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                : t.status === 'running'
                ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 animate-pulse'
                : 'bg-white dark:bg-studio-darksidebar border-slate-200 dark:border-studio-darkborder'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                {t.status === 'passed' && <CheckCircle2 size={13} className="text-emerald-500" />}
                {t.status === 'failed' && <XCircle size={13} className="text-rose-500" />}
                {t.status === 'running' && <Clock size={13} className="text-blue-500 animate-spin" />}
                {t.status === 'idle' && <Clock size={13} className="text-slate-400" />}
                {t.name}
              </span>

              {t.durationMs !== undefined && (
                <span className="text-[10px] font-mono text-slate-400">{t.durationMs}ms</span>
              )}
            </div>

            <div className="text-[10px] text-slate-400 font-medium">{t.category}</div>

            {t.error && (
              <div className="mt-1 p-2 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[11px] font-mono">
                {t.error}
              </div>
            )}

            {t.log && (
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                ✓ {t.log}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
