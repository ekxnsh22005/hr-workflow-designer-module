import type { ToastItem } from '../hooks/useToast';

const ICONS: Record<string, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✕',
};

const STYLES: Record<string, string> = {
  info: 'bg-gray-800 border-gray-700 text-gray-100',
  success: 'bg-emerald-900/80 border-emerald-700 text-emerald-100',
  warning: 'bg-amber-900/80 border-amber-700 text-amber-100',
  error: 'bg-rose-900/80 border-rose-700 text-rose-100',
};

const ICON_STYLES: Record<string, string> = {
  info: 'text-gray-400',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  error: 'text-rose-400',
};

interface Props {
  toasts: ToastItem[];
}

export default function Toast({ toasts }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-14 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border shadow-xl text-sm font-medium backdrop-blur-sm toast-enter ${STYLES[t.type]}`}
        >
          <span className={`text-sm ${ICON_STYLES[t.type]}`}>{ICONS[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
