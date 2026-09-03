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

export type ApiIdentity = {
  userId: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
};

export class ApiClient {
  constructor(private readonly baseUrl: string, private readonly accessToken: string) {}

  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}${path}`, {
      headers: { accept: 'application/json', authorization: `Bearer ${this.accessToken}` },
      credentials: 'omit',
    });
    if (!response.ok) throw new Error(`JARVIS API request failed: ${response.status}`);
    return response.json() as Promise<T>;
  }

  me() { return this.request<ApiIdentity>('/v1/me'); }
  leads() { return this.request<{ data: ApiLead[] }>('/v1/leads'); }
  opportunities() { return this.request<{ data: ApiOpportunity[] }>('/v1/opportunities'); }
}

/** Development-only bridge. Production auth must supply an in-memory token. */
export function createDevelopmentApiClient(): ApiClient | null {
  if (!import.meta.env.DEV) return null;
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const accessToken = import.meta.env.VITE_DEV_ACCESS_TOKEN;
  if (!baseUrl || !accessToken) return null;
  return new ApiClient(baseUrl, accessToken);
}
