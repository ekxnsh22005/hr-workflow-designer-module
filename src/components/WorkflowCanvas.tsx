import { useCallback } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  useReactFlow,
} from 'reactflow';
import { nodeTypes } from '../nodes';

interface Props {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeClick: (nodeId: string) => void;
  onPaneClick: () => void;
  onAddNode: (type: string, position: { x: number; y: number }) => void;
}

const NODE_COLORS: Record<string, string> = {
  start:     '#10b981',
  task:      '#0ea5e9',
  approval:  '#f59e0b',
  automated: '#8b5cf6',
  end:       '#ef4444',
};

function EmptyState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
      <div className="text-center space-y-2">
        <div className="text-5xl mb-3 opacity-20">⬡</div>
        <p className="text-gray-500 font-semibold text-base">Canvas is empty</p>
        <p className="text-gray-700 text-sm">Drag nodes from the left panel to get started</p>
        <div className="flex gap-4 mt-5 justify-center">
          {[
            ['▶ Start', 'text-emerald-700'],
            ['☑ Task',  'text-sky-700'],
            ['✓ Approval', 'text-amber-700'],
            ['⚡ Auto', 'text-violet-700'],
            ['■ End',   'text-rose-700'],
          ].map(([label, color]) => (
            <span key={label} className={`text-xs font-medium ${color}`}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WorkflowCanvas({
  nodes, edges, onNodesChange, onEdgesChange,
  onConnect, onNodeClick, onPaneClick, onAddNode,
}: Props) {
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/reactflow');
      if (!type) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      onAddNode(type, position);
    },
    [screenToFlowPosition, onAddNode]
  );

  return (
    <div className="w-full h-full relative">
      {nodes.length === 0 && <EmptyState />}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onNodeClick(node.id)}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        deleteKeyCode={['Delete', 'Backspace']}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        style={{ background: '#030712' }}
      >
        <Background variant={BackgroundVariant.Dots} color="#1a1f2e" gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeColor={n => NODE_COLORS[n.type || ''] || '#374151'}
          style={{ background: '#0a0c14', border: '1px solid #1f2937' }}
          maskColor="rgba(3,7,18,0.7)"
        />
      </ReactFlow>
    </div>
  );
}
