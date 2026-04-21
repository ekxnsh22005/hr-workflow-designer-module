import { useState, useCallback, useEffect, useMemo } from 'react';
import { ReactFlowProvider, type NodeChange, type EdgeChange } from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflow } from './hooks/useWorkflow';
import { useToast } from './hooks/useToast';
import { ValidationContext } from './contexts/ValidationContext';
import { computeNodeErrors } from './utils/validation';

import WorkflowCanvas from './components/WorkflowCanvas';
import Sidebar from './components/Sidebar';
import NodeFormPanel from './components/NodeFormPanel';
import SandboxPanel from './components/SandboxPanel';
import Toast from './components/Toast';

import type { AnyNodeData } from './types';

export default function App() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showSandbox, setShowSandbox] = useState(false);
  const [clipboard, setClipboard] = useState<{ type: string; data: AnyNodeData } | null>(null);

  const { toasts, showToast } = useToast();

  const {
    nodes, edges,
    onNodesChange, onEdgesChange,
    onConnect, addNode, deleteNode, updateNodeData, undo,
  } = useWorkflow();

  const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null;

  // Live validation errors per node
  const nodeErrors = useMemo(() => computeNodeErrors(nodes, edges), [nodes, edges]);

  // Wrap onNodesChange just to add toasts — history is handled inside useWorkflow
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const removals = changes.filter(c => c.type === 'remove');
      if (removals.length > 0) {
        showToast(`Deleted ${removals.length} node${removals.length > 1 ? 's' : ''}`, 'info');
        if (removals.some((r: any) => r.id === selectedNodeId)) {
          setSelectedNodeId(null);
        }
      }
      onNodesChange(changes);
    },
    [onNodesChange, showToast, selectedNodeId]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const removals = changes.filter(c => c.type === 'remove');
      if (removals.length > 0) {
        showToast(`Deleted ${removals.length} connection${removals.length > 1 ? 's' : ''}`, 'info');
      }
      onEdgesChange(changes);
    },
    [onEdgesChange, showToast]
  );

  // Delete node via form panel button
  const handleDeleteNode = useCallback(() => {
    if (!selectedNodeId) return;
    deleteNode(selectedNodeId);
    setSelectedNodeId(null);
    showToast('Node deleted', 'info');
  }, [selectedNodeId, deleteNode, showToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

      // Ctrl/Cmd+Z  — undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !isEditing) {
        e.preventDefault();
        const ok = undo();
        showToast(ok ? 'Undone' : 'Nothing to undo', ok ? 'info' : 'warning');
        return;
      }

      // Ctrl/Cmd+C — copy selected node
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && !isEditing && selectedNode) {
        e.preventDefault();
        setClipboard({ type: selectedNode.type!, data: { ...selectedNode.data } });
        showToast('Node copied');
        return;
      }

      // Ctrl/Cmd+V — paste
      if ((e.metaKey || e.ctrlKey) && e.key === 'v' && !isEditing) {
        e.preventDefault();
        if (!clipboard) { showToast('Nothing to paste', 'warning'); return; }
        addNode(
          clipboard.type,
          { x: 160 + Math.random() * 280, y: 160 + Math.random() * 200 },
          clipboard.data
        );
        showToast('Node pasted', 'success');
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNode, clipboard, undo, addNode, showToast]);

  // Export workflow as JSON
  const handleExport = useCallback(() => {
    const json = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Workflow exported', 'success');
  }, [nodes, edges, showToast]);

  const totalErrors = Object.values(nodeErrors).flat().length;

  return (
    <ValidationContext.Provider value={{ nodeErrors }}>
      <ReactFlowProvider>
        <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">

          {/* Header */}
          <header className="h-11 bg-gray-900/80 border-b border-gray-800/60 flex items-center justify-between px-4 flex-shrink-0 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-[10px] font-bold tracking-tight">
                HR
              </div>
              <h1 className="text-sm font-semibold text-white">HR Workflow Designer</h1>
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-600">
                <span>{nodes.length} node{nodes.length !== 1 ? 's' : ''}</span>
                <span>·</span>
                <span>{edges.length} connection{edges.length !== 1 ? 's' : ''}</span>
                {totalErrors > 0 && (
                  <>
                    <span>·</span>
                    <span className="text-amber-500 font-semibold">
                      ⚠ {totalErrors} issue{totalErrors !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                disabled={nodes.length === 0}
                className="text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed px-2.5 py-1.5 rounded text-xs font-medium transition-colors border border-gray-800 hover:border-gray-700"
                title="Export as JSON"
              >
                ↓ Export
              </button>
              <button
                onClick={() => setShowSandbox(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>▶</span>
                Run Simulation
              </button>
            </div>
          </header>

          {/* Main */}
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 relative overflow-hidden">
              <WorkflowCanvas
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={onConnect}
                onNodeClick={nodeId => setSelectedNodeId(nodeId)}
                onPaneClick={() => setSelectedNodeId(null)}
                onAddNode={addNode}
              />
            </main>
            {selectedNode && (
              <NodeFormPanel
                node={selectedNode}
                onUpdate={patch => updateNodeData(selectedNodeId!, patch)}
                onDelete={handleDeleteNode}
                onClose={() => setSelectedNodeId(null)}
              />
            )}
          </div>
        </div>

        {showSandbox && (
          <SandboxPanel
            nodes={nodes}
            edges={edges}
            onClose={() => setShowSandbox(false)}
          />
        )}

        <Toast toasts={toasts} />
      </ReactFlowProvider>
    </ValidationContext.Provider>
  );
}
