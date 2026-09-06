import { randomUUID } from 'node:crypto';

export type LeadStage = 'new' | 'qualified' | 'opportunity' | 'won' | 'lost';
export type OpportunityStage = 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface LeadRecord {
  id: string; organizationId: string; name: string; company: string; email: string; source: string;
  score: number; stage: LeadStage; createdAt: string; updatedAt: string;
}
export interface OpportunityRecord {
  id: string; organizationId: string; name: string; company: string; value: number; stage: OpportunityStage;
  probability: number; ownerUserId: string; createdAt: string; updatedAt: string;
}
export interface CreateLeadInput { name: string; company: string; email: string; source: string; score?: number; stage?: LeadStage; }
export interface CreateOpportunityInput { name: string; company: string; value: number; stage?: OpportunityStage; probability?: number; ownerUserId: string; }

export interface CrmRepository {
  listLeads(organizationId: string): Promise<LeadRecord[]>;
  listOpportunities(organizationId: string): Promise<OpportunityRecord[]>;
  createLead(organizationId: string, input: CreateLeadInput): Promise<LeadRecord>;
  createOpportunity(organizationId: string, input: CreateOpportunityInput): Promise<OpportunityRecord>;
}

/** Development adapter only. Replace with PostgreSQL before production. */
export class MemoryCrmRepository implements CrmRepository {
  private readonly organizationId = process.env.DEV_ORG_ID ?? 'dev-organization';
  private readonly leads: LeadRecord[] = [
    { id: randomUUID(), organizationId: this.organizationId, name: 'John Smith', company: 'TechFlow Inc.', email: 'john@techflow.example', source: 'LinkedIn', score: 92, stage: 'opportunity', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: randomUUID(), organizationId: this.organizationId, name: 'Sarah Lee', company: 'DataBridge', email: 'sarah@databridge.example', source: 'Referral', score: 84, stage: 'qualified', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];
  private readonly opportunities: OpportunityRecord[] = [
    { id: randomUUID(), organizationId: this.organizationId, name: 'Enterprise CRM Package', company: 'TechFlow Inc.', value: 25000, stage: 'proposal', probability: 72, ownerUserId: 'demo-user', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];
  async listLeads(organizationId: string) { return this.leads.filter(item => item.organizationId === organizationId); }
  async listOpportunities(organizationId: string) { return this.opportunities.filter(item => item.organizationId === organizationId); }
  async createLead(organizationId: string, input: CreateLeadInput): Promise<LeadRecord> {
    const now = new Date().toISOString();
    const record: LeadRecord = { id: randomUUID(), organizationId, name: input.name, company: input.company, email: input.email, source: input.source, score: input.score ?? 0, stage: input.stage ?? 'new', createdAt: now, updatedAt: now };
    this.leads.unshift(record); return record;
  }
  async createOpportunity(organizationId: string, input: CreateOpportunityInput): Promise<OpportunityRecord> {
    const now = new Date().toISOString();
    const record: OpportunityRecord = { id: randomUUID(), organizationId, name: input.name, company: input.company, value: input.value, stage: input.stage ?? 'discovery', probability: input.probability ?? 0, ownerUserId: input.ownerUserId, createdAt: now, updatedAt: now };
    this.opportunities.unshift(record); return record;
  }
}
