import type { ApprovalNodeData } from '../../types';

interface Props {
  data: ApprovalNodeData;
  onUpdate: (patch: Partial<ApprovalNodeData>) => void;
}

const APPROVER_ROLES = ['Manager', 'HRBP', 'Director', 'VP', 'C-Level'];

export default function ApprovalNodeForm({ data, onUpdate }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-400 font-medium mb-1">Title</label>
        <input
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          value={data.title}
          onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Approval step title"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 font-medium mb-1">Approver Role</label>
        <select
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          value={data.approverRole}
          onChange={e => onUpdate({ approverRole: e.target.value })}
        >
          {APPROVER_ROLES.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 font-medium mb-1">
          Auto-Approve Threshold
        </label>
        <p className="text-gray-600 text-xs mb-1">
          Automatically approve if score ≥ this value. Set 0 to disable.
        </p>
        <input
          type="number"
          min={0}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          value={data.autoApproveThreshold}
          onChange={e => onUpdate({ autoApproveThreshold: Number(e.target.value) })}
        />
      </div>
    </div>
  );
}
