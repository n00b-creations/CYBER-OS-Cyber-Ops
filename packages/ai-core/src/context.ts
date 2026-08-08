import type { Alert, Asset, CaseRecord, SecurityEvent, Workspace } from '../../shared/src/domain';

export interface AIWorkspaceContext {
  workspace: Workspace;
  selectedAsset?: Asset;
  selectedAlert?: Alert;
  selectedCase?: CaseRecord;
  events: SecurityEvent[];
}

export interface AIContextProvider {
  buildContext(workspace: Workspace, selection?: Partial<Omit<AIWorkspaceContext, 'workspace' | 'events'>>): AIWorkspaceContext;
}

export class StaticAIContextProvider implements AIContextProvider {
  constructor(private readonly events: SecurityEvent[]) {}

  buildContext(workspace: Workspace, selection: Partial<Omit<AIWorkspaceContext, 'workspace' | 'events'>> = {}): AIWorkspaceContext {
    return {
      workspace,
      selectedAsset: selection.selectedAsset,
      selectedAlert: selection.selectedAlert,
      selectedCase: selection.selectedCase,
      events: [...this.events],
    };
  }
}
