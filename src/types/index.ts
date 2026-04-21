export interface KeyValue {
  key: string;
  value: string;
}

export interface StartNodeData {
  title: string;
  metadata: KeyValue[];
}

export interface TaskNodeData {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValue[];
}

export interface ApprovalNodeData {
  title: string;
  approverRole: string;
  autoApproveThreshold: number;
}

export interface AutomatedNodeData {
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
}

export interface EndNodeData {
  endMessage: string;
  includeSummary: boolean;
}

export type AnyNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

export type WorkflowNodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

export interface MockAction {
  id: string;
  label: string;
  params: string[];
}

export interface SimulationStep {
  nodeId: string;
  nodeType: string;
  title: string;
  status: 'completed' | 'error';
  message: string;
  timestamp: string;
}

export interface SimulationResult {
  success: boolean;
  steps: SimulationStep[];
  errors: string[];
  warnings: string[];
}
