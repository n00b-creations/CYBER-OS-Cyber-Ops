import { createRemoteJWKSet, jwtVerify } from 'jose';

export type OidcConfig = {
  issuer: string;
  clientId: string;
  audience?: string;
  scopes?: string;
};

type Discovery = {
  authorization_endpoint: string;
  token_endpoint: string;
  issuer: string;
  jwks_uri: string;
};
type TokenResponse = { access_token: string; token_type: string; expires_in?: number; id_token?: string };

const verifierKey = 'jarvis.oidc.verifier';
const stateKey = 'jarvis.oidc.state';
const nonceKey = 'jarvis.oidc.nonce';

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function randomString(size = 32): string {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
}

async function challenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64url(new Uint8Array(digest));
}

export class OidcClient {
  private discovery?: Discovery;
  private jwks?: ReturnType<typeof createRemoteJWKSet>;
  private accessToken?: string;

  constructor(private readonly config: OidcConfig) {}

  async initialize(): Promise<void> {
    const issuer = this.config.issuer.replace(/\/$/, '');
    const response = await fetch(`${issuer}/.well-known/openid-configuration`, { credentials: 'omit' });
    if (!response.ok) throw new Error(`OIDC discovery failed: ${response.status}`);
    const discovery = await response.json() as Discovery;
    if (!discovery.authorization_endpoint || !discovery.token_endpoint || !discovery.jwks_uri || discovery.issuer.replace(/\/$/, '') !== issuer) {
      throw new Error('OIDC discovery document is invalid');
    }
    this.discovery = discovery;
    this.jwks = createRemoteJWKSet(new URL(discovery.jwks_uri));
  }

  async beginLogin(): Promise<void> {
    if (!this.discovery) await this.initialize();
    const verifier = randomString(48);
    const state = randomString(32);
    const nonce = randomString(32);
    sessionStorage.setItem(verifierKey, verifier);
    sessionStorage.setItem(stateKey, state);
    sessionStorage.setItem(nonceKey, nonce);
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: `${window.location.origin}/auth/callback`,
      scope: this.config.scopes ?? 'openid profile email',
      state,
      nonce,
      code_challenge: await challenge(verifier),
      code_challenge_method: 'S256',
    });
    window.location.assign(`${this.discovery!.authorization_endpoint}?${params}`);
  }

  async handleCallback(): Promise<boolean> {
    if (!this.discovery) await this.initialize();
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const expectedState = sessionStorage.getItem(stateKey);
    const verifier = sessionStorage.getItem(verifierKey);
    const expectedNonce = sessionStorage.getItem(nonceKey);
    if (params.get('error')) throw new Error(params.get('error_description') ?? params.get('error')!);
    if (!code || !state || !expectedState || state !== expectedState || !verifier || !expectedNonce) {
      throw new Error('Invalid OIDC callback state');
    }
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      code,
      redirect_uri: `${window.location.origin}/auth/callback`,
      code_verifier: verifier,
    });
    const response = await fetch(this.discovery!.token_endpoint, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body, credentials: 'omit' });
    if (!response.ok) throw new Error(`OIDC token exchange failed: ${response.status}`);
    const token = await response.json() as TokenResponse;
    if (!token.access_token) throw new Error('OIDC provider returned no access token');
    if (!token.id_token || !this.jwks) throw new Error('OIDC provider returned no verifiable ID token');

    await jwtVerify(token.id_token, this.jwks, {
      issuer: this.discovery!.issuer,
      audience: this.config.clientId,
      nonce: expectedNonce,
    });

    this.accessToken = token.access_token;
    sessionStorage.removeItem(verifierKey);
    sessionStorage.removeItem(stateKey);
    sessionStorage.removeItem(nonceKey);
    window.history.replaceState({}, '', '/');
    return true;
  }

  get token(): string | undefined { return this.accessToken; }
  clear(): void { this.accessToken = undefined; }
}

export function createOidcClient(): OidcClient | null {
  const issuer = import.meta.env.VITE_OIDC_ISSUER;
  const clientId = import.meta.env.VITE_OIDC_CLIENT_ID;
  if (!issuer || !clientId) return null;
  return new OidcClient({ issuer, clientId, audience: import.meta.env.VITE_OIDC_AUDIENCE, scopes: import.meta.env.VITE_OIDC_SCOPES });
}
