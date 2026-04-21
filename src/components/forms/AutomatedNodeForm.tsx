import { useEffect, useState } from 'react';
import { getAutomations } from '../../mocks/api';
import type { AutomatedNodeData, MockAction } from '../../types';

interface Props {
  data: AutomatedNodeData;
  onUpdate: (patch: Partial<AutomatedNodeData>) => void;
}

export default function AutomatedNodeForm({ data, onUpdate }: Props) {
  const [actions, setActions] = useState<MockAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAutomations().then(a => {
      setActions(a);
      setLoading(false);
    });
  }, []);

  const selectedAction = actions.find(a => a.id === data.actionId);

  const handleActionChange = (actionId: string) => {
    onUpdate({ actionId, actionParams: {} });
  };

  const updateParam = (param: string, value: string) => {
    onUpdate({ actionParams: { ...data.actionParams, [param]: value } });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-400 font-medium mb-1">Title</label>
        <input
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          value={data.title}
          onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Automated step title"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 font-medium mb-1">Action</label>
        {loading ? (
          <p className="text-gray-500 text-xs">Loading actions...</p>
        ) : (
          <select
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            value={data.actionId}
            onChange={e => handleActionChange(e.target.value)}
          >
            <option value="">Select an action...</option>
            {actions.map(a => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        )}
      </div>

      {selectedAction && selectedAction.params.length > 0 && (
        <div>
          <label className="block text-xs text-gray-400 font-medium mb-2">Parameters</label>
          <div className="space-y-2">
            {selectedAction.params.map(param => (
              <div key={param}>
                <label className="block text-xs text-gray-500 mb-1 capitalize">{param}</label>
                <input
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  value={data.actionParams[param] || ''}
                  onChange={e => updateParam(param, e.target.value)}
                  placeholder={`Enter ${param}...`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
