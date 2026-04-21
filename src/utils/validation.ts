import type { Node, Edge } from 'reactflow';

export function computeNodeErrors(
  nodes: Node[],
  edges: Edge[]
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  const add = (id: string, msg: string) => {
    errors[id] = [...(errors[id] || []), msg];
  };

  // Build adjacency maps
  const incoming: Record<string, string[]> = {};
  const outgoing: Record<string, string[]> = {};
  edges.forEach(e => {
    (outgoing[e.source] = outgoing[e.source] || []).push(e.target);
    (incoming[e.target] = incoming[e.target] || []).push(e.source);
  });

  const startNodes = nodes.filter(n => n.type === 'start');

  // Multiple start nodes
  if (startNodes.length > 1) {
    startNodes.forEach(n => add(n.id, 'Multiple Start nodes detected'));
  }

  // BFS reachability from first start node
  const reachable = new Set<string>();
  if (startNodes.length > 0) {
    const q = [startNodes[0].id];
    while (q.length > 0) {
      const id = q.shift()!;
      if (reachable.has(id)) continue;
      reachable.add(id);
      (outgoing[id] || []).forEach(n => q.push(n));
    }
  }

  nodes.forEach(n => {
    const data = n.data as any;

    // Reachability check
    if (startNodes.length > 0 && !reachable.has(n.id)) {
      add(n.id, 'Not reachable from Start');
    }

    switch (n.type) {
      case 'start':
        if (!data?.title?.trim()) add(n.id, 'Title is required');
        if (!(outgoing[n.id]?.length)) add(n.id, 'Needs an outgoing connection');
        break;

      case 'task':
        if (!data?.title?.trim()) add(n.id, 'Title is required');
        if (!incoming[n.id]?.length) add(n.id, 'No incoming connection');
        if (!outgoing[n.id]?.length) add(n.id, 'No outgoing connection');
        break;

      case 'approval':
        if (!data?.title?.trim()) add(n.id, 'Title is required');
        if (!incoming[n.id]?.length) add(n.id, 'No incoming connection');
        if (!outgoing[n.id]?.length) add(n.id, 'No outgoing connection');
        break;

      case 'automated':
        if (!data?.title?.trim()) add(n.id, 'Title is required');
        if (!data?.actionId) add(n.id, 'No action selected');
        if (!incoming[n.id]?.length) add(n.id, 'No incoming connection');
        if (!outgoing[n.id]?.length) add(n.id, 'No outgoing connection');
        break;

      case 'end':
        if (!data?.endMessage?.trim()) add(n.id, 'End message is empty');
        if (!incoming[n.id]?.length) add(n.id, 'No incoming connection');
        break;
    }
  });

  return errors;
}

export function getGlobalWarnings(nodes: Node[], edges: Edge[]): string[] {
  const warnings: string[] = [];
  if (nodes.length === 0) return warnings;

  const startNodes = nodes.filter(n => n.type === 'start');
  const endNodes = nodes.filter(n => n.type === 'end');

  if (startNodes.length === 0) warnings.push('No Start node — workflow cannot execute');
  if (endNodes.length === 0) warnings.push('No End node — workflow has no termination point');
  if (startNodes.length > 1) warnings.push('Multiple Start nodes detected — only one is allowed');
  if (edges.length === 0 && nodes.length > 1) warnings.push('Nodes are not connected');

  return warnings;
}
