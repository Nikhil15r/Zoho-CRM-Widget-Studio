import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { usePreviewStore } from '../../store/previewStore';

export const ContextConfigModal: React.FC = () => {
  const { isContextModalOpen, closeContextModal, contextConfig, setContextConfig, reload } = usePreviewStore();

  const [entity, setEntity] = useState(contextConfig.targetEntity || 'Deals');
  const [recordId, setRecordId] = useState(contextConfig.defaultRecordId || '548291000001234001');
  const [latency, setLatency] = useState(contextConfig.simulatedLatencyMs ?? 40);
  const [simulateErrors, setSimulateErrors] = useState(contextConfig.simulateErrors ?? false);
  const [rawPayload, setRawPayload] = useState(
    JSON.stringify(
      contextConfig.pageLoadData || { Entity: entity, EntityId: recordId },
      null,
      2
    )
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleEntityChange = (newEntity: string) => {
    setEntity(newEntity);
    let sampleId = '548291000001234001';
    if (newEntity === 'Contacts') sampleId = '548291000001002001';
    if (newEntity === 'Accounts') sampleId = '548291000001001001';
    if (newEntity === 'Leads') sampleId = '548291000001004001';
    setRecordId(sampleId);

    try {
      const parsed = JSON.parse(rawPayload);
      parsed.Entity = newEntity;
      parsed.EntityId = sampleId;
      setRawPayload(JSON.stringify(parsed, null, 2));
    } catch {}
  };

  const handleSave = () => {
    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(rawPayload);
      setJsonError(null);
    } catch (e: any) {
      setJsonError('Invalid JSON format for PageLoad data: ' + e.message);
      return;
    }

    setContextConfig({
      targetEntity: entity,
      defaultRecordId: recordId,
      pageLoadData: parsedPayload,
      simulatedLatencyMs: latency,
      simulateErrors
    });

    closeContextModal();
    // Reload preview with new context
    reload();
  };

  return (
    <Modal
      isOpen={isContextModalOpen}
      onClose={closeContextModal}
      title="⚙️ Configure Widget Runtime & PageLoad Context"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
            Target CRM Module
          </label>
          <select
            value={entity}
            onChange={(e) => handleEntityChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
          >
            <option value="Deals">Deals</option>
            <option value="Contacts">Contacts</option>
            <option value="Accounts">Accounts</option>
            <option value="Leads">Leads</option>
            <option value="Tasks">Tasks</option>
            <option value="Calls">Calls</option>
            <option value="Meetings">Meetings</option>
            <option value="Products">Products</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
            Default Record ID
          </label>
          <input
            type="text"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            placeholder="548291000001234001"
            className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder rounded-lg px-3 py-2 text-sm font-mono text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              Simulated Network Latency
            </label>
            <span className="text-xs font-mono text-blue-500 font-bold">{latency} ms</span>
          </div>
          <input
            type="range"
            min="0"
            max="1500"
            step="25"
            value={latency}
            onChange={(e) => setLatency(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-studio-darksidebar border border-slate-200 dark:border-studio-darkborder">
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Simulate SDK API Failures</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Forces all SDK calls to return simulated errors for fault resilience testing
            </div>
          </div>
          <input
            type="checkbox"
            checked={simulateErrors}
            onChange={(e) => setSimulateErrors(e.target.checked)}
            className="w-4 h-4 accent-red-600 cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
            PageLoad Event Payload (JSON)
          </label>
          <textarea
            rows={4}
            value={rawPayload}
            onChange={(e) => {
              setRawPayload(e.target.value);
              setJsonError(null);
            }}
            className="w-full bg-slate-50 dark:bg-studio-darkbg border border-slate-300 dark:border-studio-darkborder rounded-lg p-2.5 text-xs font-mono text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
          />
          {jsonError && <p className="text-xs text-red-500 mt-1">{jsonError}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-studio-darkborder">
          <button
            onClick={closeContextModal}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-studio-darkborder rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Apply Context & Reload
          </button>
        </div>
      </div>
    </Modal>
  );
};
