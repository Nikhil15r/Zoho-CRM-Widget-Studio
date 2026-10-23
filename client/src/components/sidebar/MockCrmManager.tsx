import React, { useState, useEffect } from 'react';
import { Database, RotateCcw, Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { CRMModuleSchema, CRMRecord } from '@zoho-studio/shared';
import { Modal } from '../common/Modal';

export const MockCrmManager: React.FC = () => {
  const [modules, setModules] = useState<CRMModuleSchema[]>([]);
  const [activeModule, setActiveModule] = useState<string>('Deals');
  const [records, setRecords] = useState<CRMRecord[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRecordData, setNewRecordData] = useState<Record<string, any>>({});

  const fetchModules = async () => {
    try {
      const res = await fetch('/api/crm/modules');
      if (res.ok) {
        const data = await res.json();
        setModules(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRecords = async (moduleName: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/crm/records/${moduleName}?per_page=100`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    if (activeModule) {
      fetchRecords(activeModule);
    }
  }, [activeModule]);

  const handleReset = async () => {
    if (!confirm('Reset all mock CRM data back to default demo fixtures?')) return;
    try {
      const res = await fetch('/api/crm/reset', { method: 'POST' });
      if (res.ok) {
        fetchRecords(activeModule);
        alert('Mock CRM data reset successfully.');
      }
    } catch (e: any) {
      alert('Reset failed: ' + e.message);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm(`Delete record ID ${id}?`)) return;
    try {
      const res = await fetch(`/api/crm/records/${activeModule}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecords(records.filter((r) => r.id !== id));
      }
    } catch (e: any) {
      alert('Delete failed: ' + e.message);
    }
  };

  const currentModSchema = modules.find((m) => m.api_name === activeModule);

  const handleSaveNewRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/crm/records/${activeModule}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecordData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to insert');
      }
      setIsAddModalOpen(false);
      setNewRecordData({});
      fetchRecords(activeModule);
    } catch (e: any) {
      alert('Insert failed: ' + e.message);
    }
  };

  const filtered = records.filter((r) => {
    const text = JSON.stringify(r).toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="h-full flex flex-col text-slate-700 dark:text-slate-300">
      {/* Top Header */}
      <div className="p-3 border-b border-slate-200 dark:border-studio-darkborder flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Database size={13} className="text-blue-500" />
            Mock CRM Database
          </span>

          <button
            onClick={handleReset}
            title="Reset Mock CRM to Demo Fixtures"
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-studio-darkborder transition"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>

        {/* Modules select & Add record */}
        <div className="flex gap-1.5">
          <select
            value={activeModule}
            onChange={(e) => setActiveModule(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-studio-darkbg border border-slate-200 dark:border-studio-darkborder rounded px-2.5 py-1 text-xs outline-none focus:border-blue-500"
          >
            {modules.map((m) => (
              <option key={m.api_name} value={m.api_name}>
                {m.plural_label} ({m.api_name})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setNewRecordData({});
              setIsAddModalOpen(true);
            }}
            title="Insert Record"
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium flex items-center gap-1 transition"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={`Filter ${activeModule}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-200 dark:border-studio-darkborder rounded pl-7 pr-2 py-1 text-xs outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Records list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {isLoading ? (
          <div className="text-center p-4 text-xs text-slate-400">Loading records...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-4 text-xs text-slate-400">No records found.</div>
        ) : (
          filtered.map((rec) => {
            const title = rec.Deal_Name || rec.Last_Name || rec.Account_Name || rec.Subject || rec.Product_Name || rec.id;
            return (
              <div
                key={rec.id}
                className="bg-white dark:bg-studio-darksidebar border border-slate-200 dark:border-studio-darkborder rounded-lg p-2.5 text-xs flex flex-col gap-1 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {String(title)}
                  </span>
                  <button
                    onClick={() => handleDeleteRecord(rec.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div className="text-[11px] font-mono text-slate-400">ID: {rec.id}</div>

                <div className="text-[11px] text-slate-600 dark:text-slate-300 grid grid-cols-2 gap-1 pt-1 border-t border-slate-100 dark:border-studio-darkborder/50">
                  {Object.entries(rec)
                    .filter(([k]) => !['id', 'Created_Time', 'Modified_Time', 'Created_By', 'Modified_By', 'Owner'].includes(k))
                    .slice(0, 4)
                    .map(([k, v]) => (
                      <div key={k} className="truncate">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">{k}: </span>
                        <span>{typeof v === 'object' && v ? v.name || JSON.stringify(v) : String(v)}</span>
                      </div>
                    ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Record Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add Record to ${activeModule}`}
      >
        <form onSubmit={handleSaveNewRecord} className="space-y-3">
          {currentModSchema?.fields.slice(0, 6).map((field) => (
            <div key={field.api_name}>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {field.display_label} {field.required ? '*' : ''}
              </label>
              {field.data_type === 'picklist' && field.pick_list_values ? (
                <select
                  value={newRecordData[field.api_name] || ''}
                  onChange={(e) =>
                    setNewRecordData({ ...newRecordData, [field.api_name]: e.target.value })
                  }
                  required={field.required}
                  className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder rounded-md px-3 py-1.5 text-xs outline-none"
                >
                  <option value="">Select...</option>
                  {field.pick_list_values.map((opt) => (
                    <option key={opt.actual_value} value={opt.actual_value}>
                      {opt.display_value}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.data_type === 'currency' || field.data_type === 'integer' ? 'number' : 'text'}
                  value={newRecordData[field.api_name] || ''}
                  onChange={(e) =>
                    setNewRecordData({
                      ...newRecordData,
                      [field.api_name]:
                        field.data_type === 'currency' || field.data_type === 'integer'
                          ? Number(e.target.value)
                          : e.target.value
                    })
                  }
                  required={field.required}
                  placeholder={field.display_label}
                  className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder rounded-md px-3 py-1.5 text-xs outline-none"
                />
              )}
            </div>
          ))}

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
