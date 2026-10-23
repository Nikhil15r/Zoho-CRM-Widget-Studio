import React from 'react';
import { Monitor, Smartphone, Layout, AppWindow, Maximize2 } from 'lucide-react';
import { PreviewDevice, DEVICE_DIMENSIONS, usePreviewStore } from '../../store/previewStore';

export const DeviceSelector: React.FC = () => {
  const { device, setDevice } = usePreviewStore();

  const icons: Record<PreviewDevice, React.ReactNode> = {
    responsive: <Maximize2 size={13} />,
    'web-tab': <Monitor size={13} />,
    'related-list': <Layout size={13} />,
    modal: <AppWindow size={13} />,
    mobile: <Smartphone size={13} />
  };

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-studio-darksidebar p-0.5 rounded-lg border border-slate-200 dark:border-studio-darkborder">
      {(Object.keys(DEVICE_DIMENSIONS) as PreviewDevice[]).map((devKey) => {
        const info = DEVICE_DIMENSIONS[devKey];
        const isActive = device === devKey;
        return (
          <button
            key={devKey}
            onClick={() => setDevice(devKey)}
            title={`${info.name} (${info.width} × ${info.height}) - ${info.description}`}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition ${
              isActive
                ? 'bg-white dark:bg-studio-darksurface text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {icons[devKey]}
            <span className="hidden xl:inline text-[11px]">{info.name.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
};
