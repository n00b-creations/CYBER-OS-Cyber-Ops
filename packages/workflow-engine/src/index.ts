export type WorkflowNodeType = 'trigger' | 'action' | 'condition' | 'approval' | 'output';

export interface WorkflowNode { id: string; type: WorkflowNodeType; label: string; config: Record<string, unknown>; }
export interface WorkflowEdge { source: string; target: string; }
export interface WorkflowDefinition { id: string; name: string; enabled: boolean; nodes: WorkflowNode[]; edges: WorkflowEdge[]; }

export interface WorkflowValidation { valid: boolean; errors: string[]; warnings: string[]; }

export function validateWorkflow(workflow: WorkflowDefinition): WorkflowValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!workflow.nodes.length) errors.push('Workflow must contain at least one node.');
  if (!workflow.nodes.some((node) => node.type === 'trigger')) errors.push('Workflow requires a trigger.');
  const ids = new Set(workflow.nodes.map((node) => node.id));
  for (const edge of workflow.edges) {
    if (!ids.has(edge.source) || !ids.has(edge.target)) errors.push(`Invalid edge: ${edge.source} -> ${edge.target}`);
  }
  if (workflow.enabled && !workflow.nodes.some((node) => node.type === 'approval')) warnings.push('Enabled workflow has no approval gate.');
  return { valid: errors.length === 0, errors, warnings };
}
