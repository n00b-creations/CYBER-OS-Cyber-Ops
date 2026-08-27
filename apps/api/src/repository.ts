import { randomUUID } from 'node:crypto';

export interface LeadRecord {
  id: string;
  organizationId: string;
  name: string;
  company: string;
  email: string;
  source: string;
  score: number;
  stage: 'new' | 'qualified' | 'opportunity' | 'won' | 'lost';
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityRecord {
  id: string;
  organizationId: string;
  name: string;
  company: string;
  value: number;
  stage: 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost';
  probability: number;
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrmRepository {
  listLeads(organizationId: string): Promise<LeadRecord[]>;
  listOpportunities(organizationId: string): Promise<OpportunityRecord[]>;
}

/** Development adapter only. Replace with a PostgreSQL adapter before production. */
export class MemoryCrmRepository implements CrmRepository {
  private readonly leads: LeadRecord[] = [
    { id: randomUUID(), organizationId: 'demo', name: 'John Smith', company: 'TechFlow Inc.', email: 'john@techflow.example', source: 'LinkedIn', score: 92, stage: 'opportunity', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: randomUUID(), organizationId: 'demo', name: 'Sarah Lee', company: 'DataBridge', email: 'sarah@databridge.example', source: 'Referral', score: 84, stage: 'qualified', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];
  private readonly opportunities: OpportunityRecord[] = [
    { id: randomUUID(), organizationId: 'demo', name: 'Enterprise CRM Package', company: 'TechFlow Inc.', value: 25000, stage: 'proposal', probability: 72, ownerUserId: 'demo-user', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];

  async listLeads(organizationId: string): Promise<LeadRecord[]> {
    return this.leads.filter(item => item.organizationId === organizationId || organizationId === 'demo');
  }

  async listOpportunities(organizationId: string): Promise<OpportunityRecord[]> {
    return this.opportunities.filter(item => item.organizationId === organizationId || organizationId === 'demo');
  }
}
