import type { TaskNodeData, KeyValue } from '../../types';

interface Props {
  data: TaskNodeData;
  onUpdate: (patch: Partial<TaskNodeData>) => void;
}

const inputClass =
  'w-full bg-gray-900 border border-gray-700/80 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600/30 transition-colors';

const labelClass = 'block text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1.5';

export default function TaskNodeForm({ data, onUpdate }: Props) {
  const addField = () =>
    onUpdate({ customFields: [...data.customFields, { key: '', value: '' }] });

  const removeField = (i: number) =>
    onUpdate({ customFields: data.customFields.filter((_, idx) => idx !== i) });

  const updateField = (i: number, patch: Partial<KeyValue>) =>
    onUpdate({ customFields: data.customFields.map((item, idx) => idx === i ? { ...item, ...patch } : item) });

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>
          Title <span className="text-rose-500 normal-case tracking-normal">*</span>
        </label>
        <input
          className={inputClass}
          value={data.title}
          onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Task title"
        />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={3}
          value={data.description}
          onChange={e => onUpdate({ description: e.target.value })}
          placeholder="Describe the task..."
        />
      </div>

      <div>
        <label className={labelClass}>Assignee</label>
        <input
          className={inputClass}
          value={data.assignee}
          onChange={e => onUpdate({ assignee: e.target.value })}
          placeholder="e.g. John Doe"
        />
      </div>

      <div>
        <label className={labelClass}>Due Date</label>
        <input
          type="date"
          className={inputClass}
          value={data.dueDate}
          onChange={e => onUpdate({ dueDate: e.target.value })}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass.replace('mb-1.5', '')}>Custom Fields</label>
          <button
            onClick={addField}
            className="text-[11px] text-sky-500 hover:text-sky-400 font-medium"
          >
            + Add field
          </button>
        </div>
        {data.customFields.length === 0 && (
          <p className="text-gray-700 text-xs">No custom fields yet.</p>
        )}
        <div className="space-y-2 mt-2">
          {data.customFields.map((item, i) => (
            <div key={i} className="flex gap-1.5 items-center min-w-0">
              <input
                className="min-w-0 flex-1 bg-gray-900 border border-gray-700/80 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-sky-600"
                value={item.key}
                onChange={e => updateField(i, { key: e.target.value })}
                placeholder="Key"
              />
              <input
                className="min-w-0 flex-1 bg-gray-900 border border-gray-700/80 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-sky-600"
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
