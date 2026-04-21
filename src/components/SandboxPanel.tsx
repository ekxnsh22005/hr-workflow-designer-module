import { useState } from 'react';
import type { Node, Edge } from 'reactflow';
import { simulateWorkflow } from '../mocks/api';
import type { SimulationResult } from '../types';

interface Props {
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
}

const NODE_ICONS: Record<string, string> = {
  start: '▶', task: '☑', approval: '✓', automated: '⚡', end: '■',
};

const NODE_COLORS: Record<string, string> = {
  start:     'bg-emerald-500/15 border-emerald-600/40 text-emerald-400',
  task:      'bg-sky-500/15 border-sky-600/40 text-sky-400',
  approval:  'bg-amber-500/15 border-amber-600/40 text-amber-400',
  automated: 'bg-violet-500/15 border-violet-600/40 text-violet-400',
  end:       'bg-rose-500/15 border-rose-600/40 text-rose-400',
};

export default function SandboxPanel({ nodes, edges, onClose }: Props) {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    const r = await simulateWorkflow({ nodes, edges });
    setResult(r);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-gray-950 w-full border-t border-gray-800 max-h-[70vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-800 flex-shrink-0">
          <div>
            <h2 className="text-white font-semibold text-sm">Workflow Sandbox</h2>
            <p className="text-gray-600 text-[11px] mt-0.5">
              {nodes.length} node{nodes.length !== 1 ? 's' : ''} · {edges.length} edge{edges.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={loading || nodes.length === 0}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              {loading ? 'Running…' : '▶ Run Simulation'}
            </button>
            <button onClick={onClose} className="text-gray-600 hover:text-white text-xl leading-none">×</button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-gray-600 text-sm">
                Click <span className="text-indigo-400 font-semibold">▶ Run Simulation</span> to execute
              </p>
              <p className="text-gray-700 text-xs mt-1">
                Requires a Start node and End node connected in sequence
              </p>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 py-8 justify-center">
              <div className="animate-spin w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full" />
              <span className="text-indigo-400 text-sm">Simulating workflow…</span>
            </div>
          )}

          {result && (
            <div className="space-y-5">
              {/* Status */}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                result.success
                  ? 'bg-emerald-500/8 border-emerald-600/30 text-emerald-400'
                  : 'bg-rose-500/8 border-rose-600/30 text-rose-400'
              }`}>
                <span className="text-lg font-bold">{result.success ? '✓' : '✕'}</span>
                <p className="font-semibold text-sm">
                  {result.success
                    ? `Workflow executed successfully — ${result.steps.length} step${result.steps.length !== 1 ? 's' : ''} completed`
                    : `Execution failed — ${result.errors.length} error${result.errors.length > 1 ? 's' : ''}`}
                </p>
              </div>

              {/* Errors */}
              {result.errors.length > 0 && (
                <div className="bg-rose-500/5 border border-rose-600/20 rounded-lg p-4">
                  <p className="text-rose-400 text-[10px] font-bold uppercase tracking-widest mb-2">Errors</p>
                  <ul className="space-y-1.5">
                    {result.errors.map((err, i) => (
                      <li key={i} className="text-rose-300 text-sm flex gap-2">
                        <span className="text-rose-500 mt-px">•</span> {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {result.warnings?.length > 0 && (
                <div className="bg-amber-500/5 border border-amber-600/20 rounded-lg p-4">
                  <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                    ⚠ Warnings ({result.warnings.length})
                  </p>
                  <ul className="space-y-1.5">
                    {result.warnings.map((w, i) => (
                      <li key={i} className="text-amber-300/80 text-sm flex gap-2">
                        <span className="text-amber-500 mt-px">•</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Execution log */}
              {result.steps.length > 0 && (
                <div>
                  <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-4">
                    Execution Log
                  </p>
                  <div className="space-y-0">
                    {result.steps.map((step, i) => {
                      const colorClass = NODE_COLORS[step.nodeType] || 'bg-gray-800 border-gray-700 text-gray-400';
                      const isLast = i === result.steps.length - 1;
                      return (
                        <div key={step.nodeId} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-[11px] flex-shrink-0 ${colorClass}`}>
                              {NODE_ICONS[step.nodeType] || '•'}
                            </div>
                            {!isLast && <div className="w-px flex-1 bg-gray-800 my-1 min-h-[12px]" />}
                          </div>
                          <div className={`flex-1 ${!isLast ? 'pb-4' : ''}`}>
                            <p className="text-white text-sm font-semibold">{step.title}</p>
                            <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{step.message}</p>
                            <p className="text-gray-700 text-[10px] mt-0.5 font-mono">
                              {new Date(step.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
