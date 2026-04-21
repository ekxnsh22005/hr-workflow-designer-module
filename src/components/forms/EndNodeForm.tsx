import type { EndNodeData } from '../../types';

interface Props {
  data: EndNodeData;
  onUpdate: (patch: Partial<EndNodeData>) => void;
}

export default function EndNodeForm({ data, onUpdate }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-400 font-medium mb-1">End Message</label>
        <textarea
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500 resize-none"
          rows={3}
          value={data.endMessage}
          onChange={e => onUpdate({ endMessage: e.target.value })}
          placeholder="Message shown when workflow completes..."
        />
      </div>

      <div className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5">
        <div>
          <p className="text-sm text-white font-medium">Include Summary</p>
          <p className="text-xs text-gray-500">Show a summary report on completion</p>
        </div>
        <button
          role="switch"
          aria-checked={data.includeSummary}
          onClick={() => onUpdate({ includeSummary: !data.includeSummary })}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
            data.includeSummary ? 'bg-rose-500' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
              data.includeSummary ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
