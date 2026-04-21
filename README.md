# HR Workflow Designer

A visual drag-and-drop workflow builder for HR processes, built with React, TypeScript, and React Flow.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## How to Use

### Building a Workflow
1. **Drag** any node from the left sidebar onto the canvas
2. **Connect** nodes by dragging from the bottom handle of one node to the top handle of another
3. **Click** a node to open its configuration panel on the right
4. **Edit** fields in the panel — changes apply to the canvas in real time
5. Click **▶ Run Simulation** in the header to test your workflow

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘C` / `Ctrl+C` | Copy selected node |
| `⌘V` / `Ctrl+V` | Paste copied node |
| `⌘Z` / `Ctrl+Z` | Undo last action |
| `Delete` / `Backspace` | Delete selected node or edge |

### Export
Click **↓ Export** in the header to download the workflow as `workflow.json`.

---

## Example — Employee Onboarding Workflow

Here's a complete workflow you can build to verify everything works:

| Step | Node Type | Key Config |
|---|---|---|
| 1 | **Start** | Title: `Employee Onboarding` |
| 2 | **Task** | Title: `Collect Documents`, Assignee: `HR Team`, Due: any date |
| 3 | **Approval** | Title: `Manager Sign-off`, Role: `Manager` |
| 4 | **Automated** | Title: `Send Welcome Email`, Action: `Send Email`, To: `hr@company.com`, Subject: `Welcome!` |
| 5 | **End** | Message: `Onboarding complete. Welcome aboard!` |

Connect them top-to-bottom (Start → Task → Approval → Automated → End), then click **▶ Run Simulation**.

**Expected result:** Green "Workflow executed successfully" banner with a 5-step execution log. Any disconnected or misconfigured node shows an amber badge directly on the canvas.

---

## Node Types

| Node | Purpose | Key Fields |
|---|---|---|
| **Start** | Workflow entry point | Title, metadata key-value pairs |
| **Task** | Human task assignment | Title, description, assignee, due date, custom fields |
| **Approval** | Manager approval step | Title, approver role, auto-approve threshold |
| **Automated** | System-triggered action | Title, action (from mock API), dynamic parameters |
| **End** | Workflow termination | End message, include summary toggle |

---

## Architecture

```
src/
├── types/
│   └── index.ts              # All TypeScript interfaces
├── mocks/
│   └── api.ts                # Mock GET /automations + POST /simulate
├── hooks/
│   ├── useWorkflow.ts        # Nodes/edges state, undo history, CRUD
│   └── useToast.ts           # Toast notification system
├── contexts/
│   └── ValidationContext.ts  # Provides per-node errors to node components
├── utils/
│   └── validation.ts         # computeNodeErrors(), getGlobalWarnings()
├── nodes/
│   ├── StartNode.tsx         # Custom React Flow node components (×5)
│   ├── TaskNode.tsx
│   ├── ApprovalNode.tsx
│   ├── AutomatedNode.tsx
│   ├── EndNode.tsx
│   └── index.ts              # nodeTypes registry (defined outside component)
├── components/
│   ├── Sidebar.tsx           # Draggable node palette + shortcut hints
│   ├── WorkflowCanvas.tsx    # React Flow canvas with drag-drop support
│   ├── NodeFormPanel.tsx     # Right panel — config form + validation errors
│   ├── SandboxPanel.tsx      # Simulation modal with execution log + warnings
│   ├── Toast.tsx             # Toast notification renderer
│   └── forms/
│       ├── StartNodeForm.tsx
│       ├── TaskNodeForm.tsx
│       ├── ApprovalNodeForm.tsx
│       ├── AutomatedNodeForm.tsx
│       └── EndNodeForm.tsx
└── App.tsx                   # Root — wires everything, keyboard shortcuts, export
```

### Key Design Decisions

**`useWorkflow` custom hook** — Encapsulates all workflow state. Uses React Flow's `useNodesState` / `useEdgesState` internally and layers undo history on top via a ref-based snapshot mechanism. Exposes `addNode`, `deleteNode`, `updateNodeData`, `onConnect`, and `undo`.

**Validation via Context** — `computeNodeErrors()` runs on every nodes/edges change (via `useMemo`) and provides per-node error arrays through `ValidationContext`. Node components read from context to render live warning badges and inline error text — no polling, no prop drilling.

**Mock API** — `getAutomations()` and `simulateWorkflow()` simulate network delay and return typed responses. The simulate function performs BFS traversal, cycle detection (DFS), disconnection checks, required-field validation, and generates soft warnings (missing assignee, unfilled params, etc.).

**Extensible forms** — Adding a new node type requires: a type interface in `types/index.ts`, a node component in `nodes/`, a form component in `components/forms/`, one entry in the `nodeTypes` registry, one case in `NodeFormPanel`, and default data in `useWorkflow`. No other files need to change.

---

## Validation Rules

Live on the canvas (amber badge on node + inline error text):

| Rule | Nodes affected |
|---|---|
| Title is required | Start, Task, Approval, Automated |
| Must have outgoing connection | Start, Task, Approval, Automated |
| Must have incoming connection | Task, Approval, Automated, End |
| Action must be selected | Automated |
| Not reachable from Start | All |
| Multiple Start nodes | Start |

Simulation additionally flags:
- **Cycles** — infinite loop detection via DFS
- **Missing assignee** on Task *(warning)*
- **Missing due date** on Task *(warning)*
- **Unfilled parameters** on Automated *(warning)*

---

## Tech Stack

| | |
|---|---|
| UI Framework | React 19 + TypeScript |
| Canvas | React Flow v11 |
| Styling | Tailwind CSS v4 + @tailwindcss/vite |
| Build | Vite 5 |
