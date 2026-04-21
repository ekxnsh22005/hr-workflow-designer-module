import type { MockAction, SimulationResult } from '../types';

const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

export async function getAutomations(): Promise<MockAction[]> {
  await delay(300);
  return [
    { id: 'send_email',     label: 'Send Email',          params: ['to', 'subject'] },
    { id: 'generate_doc',   label: 'Generate Document',   params: ['template', 'recipient'] },
    { id: 'send_slack',     label: 'Send Slack Message',  params: ['channel', 'message'] },
    { id: 'create_ticket',  label: 'Create Ticket',       params: ['project', 'title'] },
    { id: 'update_record',  label: 'Update Record',       params: ['table', 'field', 'value'] },
  ];
}

export async function simulateWorkflow(workflow: {
  nodes: any[];
  edges: any[];
}): Promise<SimulationResult> {
  await delay(900);

  const { nodes, edges } = workflow;
  const errors: string[] = [];
  const warnings: string[] = [];

  // --- Hard errors ---
  const startNodes = nodes.filter(n => n.type === 'start');
  const endNodes   = nodes.filter(n => n.type === 'end');

  if (nodes.length === 0)       errors.push('Workflow is empty.');
  if (startNodes.length === 0)  errors.push('No Start node — workflow cannot execute.');
  if (startNodes.length > 1)    errors.push('Only one Start node is allowed.');
  if (endNodes.length === 0)    errors.push('No End node — workflow has no termination point.');

  // Build adjacency
  const adj: Record<string, string[]> = {};
  const incoming: Record<string, boolean> = {};
  edges.forEach((e: any) => {
    (adj[e.source] = adj[e.source] || []).push(e.target);
    incoming[e.target] = true;
  });

  // Detect disconnected nodes
  const reachable = new Set<string>();
  if (startNodes.length > 0) {
    const q = [startNodes[0].id];
    while (q.length > 0) {
      const id = q.shift()!;
      if (reachable.has(id)) continue;
      reachable.add(id);
      (adj[id] || []).forEach(n => q.push(n));
    }
  }

  nodes.forEach(n => {
    if (!reachable.has(n.id)) {
      errors.push(`Node "${n.data?.title || n.data?.endMessage || n.type}" is not connected to the workflow.`);
    }
  });

  // Detect cycles (DFS)
  if (hasCycle(nodes, adj)) {
    errors.push('Workflow contains a cycle — execution would loop infinitely.');
  }

  // --- Soft warnings ---
  nodes.forEach(n => {
    const d = n.data;
    if (n.type === 'task') {
      if (!d?.assignee?.trim())     warnings.push(`Task "${d?.title}" has no assignee.`);
      if (!d?.dueDate?.trim())      warnings.push(`Task "${d?.title}" has no due date.`);
    }
    if (n.type === 'automated') {
      if (!d?.actionId)             warnings.push(`Automated step "${d?.title}" has no action selected.`);
      else {
        const params = Object.values(d?.actionParams || {}).filter(Boolean);
        if (params.length === 0)    warnings.push(`Automated step "${d?.title}" has no parameters filled.`);
      }
    }
    if (n.type === 'approval') {
      if (d?.autoApproveThreshold === 0) {
        warnings.push(`Approval step "${d?.title}" auto-approve threshold is 0 (manual only).`);
      }
    }
  });

  if (errors.length > 0) {
    return { success: false, steps: [], errors, warnings };
  }

  // --- Build execution steps (BFS traversal) ---
  const visited = new Set<string>();
  const steps: SimulationResult['steps'] = [];
  const queue = [startNodes[0].id];
  let time = Date.now();

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const node = nodes.find((n: any) => n.id === id);
    if (!node) continue;

    steps.push({
      nodeId: id,
      nodeType: node.type,
      title: node.data?.title || node.data?.endMessage || node.type,
      status: 'completed',
      message: buildMessage(node),
      timestamp: new Date(time).toISOString(),
    });
    time += 1200;
    (adj[id] || []).forEach(nextId => queue.push(nextId));
  }

  return { success: true, steps, errors: [], warnings };
}

function buildMessage(node: any): string {
  const d = node.data;
  switch (node.type) {
    case 'start':
      return `Workflow "${d?.title}" initiated.`;
    case 'task':
      return `Task "${d?.title}" assigned to ${d?.assignee || '(unassigned)'}${d?.dueDate ? `, due ${d.dueDate}` : ''}.`;
    case 'approval':
      return `Approval requested from ${d?.approverRole || 'approver'}. Auto-approve threshold: ${d?.autoApproveThreshold ?? 0}.`;
    case 'automated':
      return `Executing "${d?.actionId || 'action'}" with ${Object.keys(d?.actionParams || {}).length} parameter(s).`;
    case 'end':
      return d?.endMessage || 'Workflow completed.';
    default:
      return 'Processing...';
  }
}

function hasCycle(nodes: any[], adj: Record<string, string[]>): boolean {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color: Record<string, number> = {};
  nodes.forEach(n => { color[n.id] = WHITE; });

  const dfs = (id: string): boolean => {
    if (color[id] === GRAY)  return true;
    if (color[id] === BLACK) return false;
    color[id] = GRAY;
    for (const next of adj[id] || []) {
      if (dfs(next)) return true;
    }
    color[id] = BLACK;
    return false;
  };

  return nodes.some(n => color[n.id] === WHITE && dfs(n.id));
}
