export type LeadStage = 'new' | 'qualified' | 'opportunity' | 'won' | 'lost';
export type OpportunityStage = 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface Lead {
  id: string;
  organizationId: string;
  name: string;
  company: string;
  email: string;
  source: string;
  score: number;
  stage: LeadStage;
  createdAt: string;
}

export interface Opportunity {
  id: string;
  organizationId: string;
  name: string;
  company: string;
  value: number;
  stage: OpportunityStage;
  probability: number;
  owner: string;
  updatedAt: string;
}
