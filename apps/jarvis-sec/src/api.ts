export type ApiLead = {
  id: string;
  organizationId: string;
  name: string;
  company: string;
  email: string;
  source: string;
  score: number;
  stage: string;
  createdAt: string;
  updatedAt: string;
};
export type ApiOpportunity = {
  id: string;
  organizationId: string;
  name: string;
  company: string;
  value: number;
  stage: string;
  probability: number;
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
};
export type ApiIdentity = { userId: string; organizationId: string; roles: string[]; permissions: string[] };
export type CreateLeadRequest = { name: string; company: string; email: string; source: string; score?: number; stage?: 'new' | 'qualified' | 'opportunity' | 'won' | 'lost' };
export type CreateOpportunityRequest = { name: string; company: string; value: number; stage?: 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost'; probability?: number; ownerUserId?: string };

let runtimeAccessToken: string | undefined;

/** Keep the authenticated access token in JavaScript memory only. */
export function setRuntimeAccessToken(token: string | undefined): void { runtimeAccessToken = token; }

export class ApiClient {
  constructor(private readonly baseUrl: string, private readonly accessToken: string) {}
  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}${path}`, {
      ...init,
      headers: { accept: 'application/json', authorization: `Bearer ${this.accessToken}`, ...(init.body ? { 'content-type': 'application/json' } : {}), ...init.headers },
      credentials: 'omit',
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => null) as { error?: string } | null;
      throw new Error(detail?.error || `JARVIS API request failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }
  me() { return this.request<ApiIdentity>('/v1/me'); }
  leads() { return this.request<{ data: ApiLead[] }>('/v1/leads'); }
  opportunities() { return this.request<{ data: ApiOpportunity[] }>('/v1/opportunities'); }
  createLead(input: CreateLeadRequest) { return this.request<{ data: ApiLead }>('/v1/leads', { method: 'POST', body: JSON.stringify(input) }); }
  createOpportunity(input: CreateOpportunityRequest) { return this.request<{ data: ApiOpportunity }>('/v1/opportunities', { method: 'POST', body: JSON.stringify(input) }); }
}

/** Development bridge or authenticated runtime session. Never persists credentials. */
export function createDevelopmentApiClient(): ApiClient | null {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const developmentToken = import.meta.env.DEV ? import.meta.env.VITE_DEV_ACCESS_TOKEN : undefined;
  const accessToken = developmentToken || runtimeAccessToken;
  if (!baseUrl || !accessToken) return null;
  return new ApiClient(baseUrl, accessToken);
}
