import { Handle, Position, type NodeProps } from 'reactflow';
import { useValidation } from '../contexts/ValidationContext';
import type { StartNodeData } from '../types';

export default function StartNode({ id, data, selected }: NodeProps<StartNodeData>) {
  const { nodeErrors } = useValidation();
  const errors = nodeErrors[id] || [];

  return (
    <div
      className={`relative min-w-[175px] bg-gray-900 rounded-lg border border-gray-800 border-l-4 border-l-emerald-500 shadow-md transition-all duration-100 ${
        selected ? 'ring-1 ring-emerald-500/40 shadow-emerald-900/40' : 'hover:border-gray-700'
      }`}
    >
      {errors.length > 0 && (
        <div className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-amber-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1 shadow z-10">
          {errors.length}
        </div>
      )}

      <div className="px-3 pt-2.5 pb-1 flex items-center gap-1.5">
        <span className="text-emerald-400 text-[11px] leading-none">▶</span>
        <span className="text-emerald-400 text-[9px] font-bold uppercase tracking-[0.12em]">Start</span>
      </div>
      <div className="px-3 pb-2.5">
        <p className="text-white text-sm font-semibold leading-tight truncate">
          {data.title || 'Start'}
        </p>
        {errors.length > 0 ? (
          <p className="text-amber-500 text-[10px] mt-1 leading-snug">
            {errors[0]}{errors.length > 1 ? ` +${errors.length - 1} more` : ''}
          </p>
        ) : data.metadata.length > 0 ? (
          <p className="text-gray-600 text-[10px] mt-0.5">{data.metadata.length} metadata field(s)</p>
        ) : null}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#10b981', border: '2px solid #064e3b', width: 8, height: 8 }}
      />
    </div>
  );
}
