const NODE_ITEMS = [
  {
    type: 'start',
    label: 'Start',
    description: 'Workflow entry point',
    icon: '▶',
    accent: 'border-l-emerald-500',
    label_color: 'text-emerald-400',
    bg: 'bg-emerald-500/5 hover:bg-emerald-500/10',
    border: 'border-gray-800 hover:border-emerald-800',
  },
  {
    type: 'task',
    label: 'Task',
    description: 'Human task assignment',
    icon: '☑',
    accent: 'border-l-sky-500',
    label_color: 'text-sky-400',
    bg: 'bg-sky-500/5 hover:bg-sky-500/10',
    border: 'border-gray-800 hover:border-sky-900',
  },
  {
    type: 'approval',
    label: 'Approval',
    description: 'Manager approval step',
    icon: '✓',
    accent: 'border-l-amber-500',
    label_color: 'text-amber-400',
    bg: 'bg-amber-500/5 hover:bg-amber-500/10',
    border: 'border-gray-800 hover:border-amber-900',
  },
  {
    type: 'automated',
    label: 'Automated',
    description: 'System-triggered action',
    icon: '⚡',
    accent: 'border-l-violet-500',
    label_color: 'text-violet-400',
    bg: 'bg-violet-500/5 hover:bg-violet-500/10',
    border: 'border-gray-800 hover:border-violet-900',
  },
  {
    type: 'end',
    label: 'End',
    description: 'Workflow completion',
    icon: '■',
    accent: 'border-l-rose-500',
    label_color: 'text-rose-400',
    bg: 'bg-rose-500/5 hover:bg-rose-500/10',
    border: 'border-gray-800 hover:border-rose-900',
  },
] as const;

export default function Sidebar() {
  const onDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-52 bg-gray-950 border-r border-gray-800/60 flex flex-col flex-shrink-0">
      <div className="px-4 py-3 border-b border-gray-800/60">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Node Palette</p>
        <p className="text-[11px] text-gray-700 mt-0.5">Drag onto canvas</p>
      </div>

      <div className="p-3 space-y-1.5 flex-1">
        {NODE_ITEMS.map(item => (
          <div
            key={item.type}
            draggable
            onDragStart={e => onDragStart(e, item.type)}
            className={`border border-l-4 rounded-lg p-2.5 cursor-grab active:cursor-grabbing transition-colors select-none ${item.accent} ${item.bg} ${item.border}`}
          >
            <div className="flex items-center gap-1.5">
              <span className={`text-xs leading-none ${item.label_color}`}>{item.icon}</span>
              <span className={`text-xs font-semibold ${item.label_color}`}>{item.label}</span>
            </div>
            <p className="text-gray-600 text-[10px] mt-1 leading-snug">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="px-3 py-3 border-t border-gray-800/60 space-y-1">
        <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider mb-1.5">Shortcuts</p>
        {[
          ['⌘C', 'Copy node'],
          ['⌘V', 'Paste node'],
          ['⌘Z', 'Undo'],
          ['⌫', 'Delete selected'],
        ].map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-[10px] text-gray-700">{label}</span>
            <kbd className="text-[9px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded font-mono">{key}</kbd>
          </div>
        ))}
      </div>
    </aside>
  );
}
