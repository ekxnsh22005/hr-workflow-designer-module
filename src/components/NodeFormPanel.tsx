import type { Node } from 'reactflow';
import StartNodeForm from './forms/StartNodeForm';
import TaskNodeForm from './forms/TaskNodeForm';
import ApprovalNodeForm from './forms/ApprovalNodeForm';
import AutomatedNodeForm from './forms/AutomatedNodeForm';
import EndNodeForm from './forms/EndNodeForm';
import { useValidation } from '../contexts/ValidationContext';
import type {
  AnyNodeData,
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from '../types';

interface Props {
  node: Node<AnyNodeData>;
  onUpdate: (patch: Partial<AnyNodeData>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const TYPE_META: Record<string, { label: string; accent: string; ring: string }> = {
  start:     { label: 'Start',     accent: 'text-emerald-400', ring: 'border-emerald-800' },
  task:      { label: 'Task',      accent: 'text-sky-400',     ring: 'border-sky-800' },
  approval:  { label: 'Approval',  accent: 'text-amber-400',   ring: 'border-amber-800' },
  automated: { label: 'Automated', accent: 'text-violet-400',  ring: 'border-violet-800' },
  end:       { label: 'End',       accent: 'text-rose-400',    ring: 'border-rose-800' },
};

export default function NodeFormPanel({ node, onUpdate, onDelete, onClose }: Props) {
  const meta = TYPE_META[node.type || ''] ?? { label: 'Node', accent: 'text-gray-400', ring: 'border-gray-700' };
  const { nodeErrors } = useValidation();
  const errors = nodeErrors[node.id] || [];

  const renderForm = () => {
    switch (node.type) {
      case 'start':
        return <StartNodeForm data={node.data as StartNodeData} onUpdate={p => onUpdate(p as Partial<AnyNodeData>)} />;
      case 'task':
        return <TaskNodeForm data={node.data as TaskNodeData} onUpdate={p => onUpdate(p as Partial<AnyNodeData>)} />;
      case 'approval':
        return <ApprovalNodeForm data={node.data as ApprovalNodeData} onUpdate={p => onUpdate(p as Partial<AnyNodeData>)} />;
      case 'automated':
        return <AutomatedNodeForm data={node.data as AutomatedNodeData} onUpdate={p => onUpdate(p as Partial<AnyNodeData>)} />;
      case 'end':
        return <EndNodeForm data={node.data as EndNodeData} onUpdate={p => onUpdate(p as Partial<AnyNodeData>)} />;
      default:
        return <p className="text-gray-500 text-sm">Unknown node type.</p>;
    }
  };

  return (
    <aside className="w-72 bg-gray-950 border-l border-gray-800/60 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3 border-b border-gray-800/60">
        <div>
          <p className={`text-[9px] font-bold uppercase tracking-widest ${meta.accent}`}>
            {meta.label} Node
          </p>
          <p className="text-white font-semibold text-sm mt-0.5">Configure</p>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <button
            onClick={onDelete}
            title="Delete node"
            className="text-gray-600 hover:text-rose-400 transition-colors text-sm leading-none px-1"
          >
            🗑
          </button>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-white transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="mx-4 mt-3 bg-amber-500/8 border border-amber-500/20 rounded-lg p-3">
          <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            ⚠ {errors.length} issue{errors.length > 1 ? 's' : ''} found
          </p>
          <ul className="space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-amber-300/80 text-[11px] flex gap-1.5">
                <span className="text-amber-500 mt-px">•</span>
                <span>{err}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderForm()}
      </div>

      <div className="px-4 py-2 border-t border-gray-800/60">
        <p className="text-[10px] text-gray-700">Changes apply instantly · Press ⌫ to delete</p>
      </div>
    </aside>
  );
}
