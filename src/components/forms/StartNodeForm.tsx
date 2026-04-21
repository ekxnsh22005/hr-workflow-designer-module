import type { StartNodeData, KeyValue } from '../../types';

interface Props {
  data: StartNodeData;
  onUpdate: (patch: Partial<StartNodeData>) => void;
}

export default function StartNodeForm({ data, onUpdate }: Props) {
  const addField = () =>
    onUpdate({ metadata: [...data.metadata, { key: '', value: '' }] });

  const removeField = (i: number) =>
    onUpdate({ metadata: data.metadata.filter((_, idx) => idx !== i) });

  const updateField = (i: number, patch: Partial<KeyValue>) =>
    onUpdate({ metadata: data.metadata.map((item, idx) => idx === i ? { ...item, ...patch } : item) });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1.5">
          Title
        </label>
        <input
          className="w-full bg-gray-900 border border-gray-700/80 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-colors"
          value={data.title}
          onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Start title"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
            Metadata
          </label>
          <button
            onClick={addField}
            className="text-[11px] text-emerald-500 hover:text-emerald-400 font-medium"
          >
            + Add field
          </button>
        </div>
        {data.metadata.length === 0 && (
          <p className="text-gray-700 text-xs">No metadata fields yet.</p>
        )}
        <div className="space-y-2">
          {data.metadata.map((item, i) => (
            <div key={i} className="flex gap-1.5 items-center min-w-0">
              <input
                className="min-w-0 flex-1 bg-gray-900 border border-gray-700/80 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-600"
                value={item.key}
                onChange={e => updateField(i, { key: e.target.value })}
                placeholder="Key"
              />
              <input
                className="min-w-0 flex-1 bg-gray-900 border border-gray-700/80 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-600"
                value={item.value}
                onChange={e => updateField(i, { value: e.target.value })}
                placeholder="Value"
              />
              <button
                onClick={() => removeField(i)}
                className="flex-shrink-0 text-gray-600 hover:text-rose-400 text-base leading-none w-5 text-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
