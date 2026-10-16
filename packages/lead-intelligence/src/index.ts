export interface DataProvenance<T = unknown> {
  value: T;
  source: string;
  observedAt: string;
  confidence: number;
}

export interface LeadEnrichment {
  leadId: string;
  companySize?: DataProvenance<number>;
  industry?: DataProvenance<string>;
  technologies?: DataProvenance<string[]>;
  summary?: DataProvenance<string>;
}

export interface LeadScore {
  leadId: string;
  score: number;
  factors: Array<{ name: string; contribution: number; explanation: string }>;
  generatedAt: string;
}
