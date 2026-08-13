import type { WorkflowDefinition } from './index';
import { validateWorkflow } from './index';

export interface WorkflowEditorState { workflow: WorkflowDefinition; validation: ReturnType<typeof validateWorkflow>; dirty: boolean; }

export function createWorkflowEditorState(workflow: WorkflowDefinition): WorkflowEditorState {
  return { workflow: structuredClone(workflow), validation: validateWorkflow(workflow), dirty: false };
}

export function revalidateWorkflow(state: WorkflowEditorState): WorkflowEditorState {
  return { ...state, validation: validateWorkflow(state.workflow) };
}
