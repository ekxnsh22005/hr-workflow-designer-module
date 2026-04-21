import { Handle, Position, type NodeProps } from 'reactflow';
import { useValidation } from '../contexts/ValidationContext';
import type { TaskNodeData } from '../types';

export default function TaskNode({ id, data, selected }: NodeProps<TaskNodeData>) {
  const { nodeErrors } = useValidation();
  const errors = nodeErrors[id] || [];

  return (
    <div
      className={`relative min-w-[175px] bg-gray-900 rounded-lg border border-gray-800 border-l-4 border-l-sky-500 shadow-md transition-all duration-100 ${
        selected ? 'ring-1 ring-sky-500/40 shadow-sky-900/40' : 'hover:border-gray-700'
      }`}
    >
      {errors.length > 0 && (
        <div className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-amber-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1 shadow z-10">
          {errors.length}
        </div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#0ea5e9', border: '2px solid #0c4a6e', width: 8, height: 8 }}
      />

      <div className="px-3 pt-2.5 pb-1 flex items-center gap-1.5">
        <span className="text-sky-400 text-[11px] leading-none">☑</span>
        <span className="text-sky-400 text-[9px] font-bold uppercase tracking-[0.12em]">Task</span>
      </div>
      <div className="px-3 pb-2.5">
        <p className="text-white text-sm font-semibold leading-tight truncate">
          {data.title || 'New Task'}
        </p>
        {errors.length > 0 ? (
          <p className="text-amber-500 text-[10px] mt-1 leading-snug">
            {errors[0]}{errors.length > 1 ? ` +${errors.length - 1} more` : ''}
          </p>
        ) : (
          <p className="text-gray-600 text-[10px] mt-0.5 truncate">
            {data.assignee ? `→ ${data.assignee}` : 'No assignee'}
            {data.dueDate ? ` · ${data.dueDate}` : ''}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#0ea5e9', border: '2px solid #0c4a6e', width: 8, height: 8 }}
      />
    </div>
  );
}
