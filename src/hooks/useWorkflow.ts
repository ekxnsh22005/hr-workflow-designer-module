import { useCallback, useEffect, useRef } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from 'reactflow';
import type {
  AnyNodeData,
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from '../types';

const DEFAULT_DATA: Record<string, AnyNodeData> = {
  start:     { title: 'Start', metadata: [] } as StartNodeData,
  task:      { title: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] } as TaskNodeData,
  approval:  { title: 'Approval', approverRole: 'Manager', autoApproveThreshold: 0 } as ApprovalNodeData,
  automated: { title: 'Automated Step', actionId: '', actionParams: {} } as AutomatedNodeData,
  end:       { endMessage: 'Workflow completed successfully.', includeSummary: false } as EndNodeData,
};

interface HistoryEntry {
  nodes: Node<AnyNodeData>[];
  edges: Edge[];
}

export function useWorkflow() {
  const [nodes, setNodes, _onNodesChange] = useNodesState<AnyNodeData>([]);
  const [edges, setEdges, _onEdgesChange] = useEdgesState([]);

  // ── History ────────────────────────────────────────────────────────────────
  const history   = useRef<HistoryEntry[]>([{ nodes: [], edges: [] }]);
  const historyPos = useRef(0);

  // Set to true by any action that should be undoable.
  // The useEffect below picks it up AFTER the state has actually settled.
  const pendingPush = useRef(false);

  // Set to true by undo() so the post-render effect doesn't re-push the
  // restored state back into history.
  const skipPush = useRef(false);

  // Push to history AFTER React has committed the new nodes/edges to state.
  // This guarantees we snapshot the RESULT of the action, not the state before.
  useEffect(() => {
    if (skipPush.current) {
      skipPush.current = false;
      return;
    }
    if (!pendingPush.current) return;
    pendingPush.current = false;

    const snapshot: HistoryEntry = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    history.current = history.current.slice(0, historyPos.current + 1);
    history.current.push(snapshot);
    if (history.current.length > 30) history.current.shift();
    historyPos.current = history.current.length - 1;
  }, [nodes, edges]);

  // ── Undo ──────────────────────────────────────────────────────────────────
  const undo = useCallback((): boolean => {
    if (historyPos.current <= 0) return false;
    skipPush.current = true;       // don't re-push when restoring
    historyPos.current--;
    const state = history.current[historyPos.current];
    setNodes(state.nodes);
    setEdges(state.edges);
    return true;
  }, [setNodes, setEdges]);

  // ── React Flow change handlers (wraps internal handlers) ──────────────────
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (changes.some(c => c.type === 'remove')) pendingPush.current = true;
      _onNodesChange(changes);
    },
    [_onNodesChange]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (changes.some(c => c.type === 'remove')) pendingPush.current = true;
      _onEdgesChange(changes);
    },
    [_onEdgesChange]
  );

  // ── Public actions ────────────────────────────────────────────────────────
  const onConnect = useCallback(
    (connection: Connection) => {
      pendingPush.current = true;
      setEdges(eds =>
        addEdge(
          { ...connection, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
          eds
        )
      );
    },
    [setEdges]
  );

  const addNode = useCallback(
    (type: string, position: { x: number; y: number }, extraData?: Partial<AnyNodeData>) => {
      pendingPush.current = true;
      const id = `${type}-${Date.now()}`;
      const newNode: Node<AnyNodeData> = {
        id,
        type,
        position,
        data: { ...DEFAULT_DATA[type], ...extraData } as AnyNodeData,
      };
      setNodes(nds => [...nds, newNode]);
    },
    [setNodes]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      pendingPush.current = true;
      setNodes(nds => nds.filter(n => n.id !== nodeId));
      setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    },
    [setNodes, setEdges]
  );

  // Typing in forms is intentionally NOT tracked in history (too granular)
  const updateNodeData = useCallback(
    (nodeId: string, patch: Partial<AnyNodeData>) => {
      setNodes(nds =>
        nds.map(n => (n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n))
      );
    },
    [setNodes]
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteNode,
    updateNodeData,
    undo,
  };
}
