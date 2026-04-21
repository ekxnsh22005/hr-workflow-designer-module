import type { NodeTypes } from 'reactflow';
import StartNode from './StartNode';
import TaskNode from './TaskNode';
import ApprovalNode from './ApprovalNode';
import AutomatedNode from './AutomatedNode';
import EndNode from './EndNode';

// Defined outside any component to prevent unnecessary re-renders
export const nodeTypes: NodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
};
