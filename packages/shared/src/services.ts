import type { Alert, Asset, CaseRecord, SecurityEvent, ToolDefinition, Workflow } from './domain';

export interface AssetService { list(): Asset[]; get(id: string): Asset | undefined; }
export interface EventService { list(): SecurityEvent[]; byAsset(assetId: string): SecurityEvent[]; }
export interface AlertService { list(): Alert[]; get(id: string): Alert | undefined; }
export interface CaseService { list(): CaseRecord[]; get(id: string): CaseRecord | undefined; }
export interface WorkflowService { list(): Workflow[]; get(id: string): Workflow | undefined; }
export interface ToolService { list(): ToolDefinition[]; }

export interface OperationsDataServices {
  assets: AssetService;
  events: EventService;
  alerts: AlertService;
  cases: CaseService;
  workflows: WorkflowService;
  tools: ToolService;
}

export class InMemoryListService<T extends { id: string }> {
  constructor(private readonly records: T[]) {}
  list(): T[] { return [...this.records]; }
  get(id: string): T | undefined { return this.records.find((record) => record.id === id); }
}
