import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

export type Role = 'owner' | 'admin' | 'operator' | 'analyst' | 'viewer';
export type Permission =
  | 'lead:read' | 'lead:write'
  | 'opportunity:read' | 'opportunity:write'
  | 'campaign:read' | 'campaign:write'
  | 'ai:run' | 'ai:approve'
  | 'integration:manage' | 'billing:manage' | 'security:manage';

const rolePermissions: Record<Role, readonly Permission[]> = {
  owner: ['lead:read','lead:write','opportunity:read','opportunity:write','campaign:read','campaign:write','ai:run','ai:approve','integration:manage','billing:manage','security:manage'],
  admin: ['lead:read','lead:write','opportunity:read','opportunity:write','campaign:read','campaign:write','ai:run','ai:approve','integration:manage','security:manage'],
  operator: ['lead:read','lead:write','opportunity:read','opportunity:write','campaign:read','campaign:write','ai:run'],
  analyst: ['lead:read','opportunity:read','campaign:read','ai:run'],
  viewer: ['lead:read','opportunity:read','campaign:read']
};

export interface AuthPrincipal {
  userId: string;
  organizationId: string;
  roles: Role[];
  permissions: Permission[];
  claims: JWTPayload;
}

function stringClaim(payload: JWTPayload, key: string): string | undefined {
  const value = payload[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function rolesClaim(payload: JWTPayload): Role[] {
  const value = payload['roles'] ?? payload['role'];
  const values = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
  return values.filter((role): role is Role => role === 'owner' || role === 'admin' || role === 'operator' || role === 'analyst' || role === 'viewer');
}

export class Authenticator {
  private readonly jwks?: ReturnType<typeof createRemoteJWKSet>;

  constructor(
    private readonly issuer = process.env.AUTH_ISSUER,
    private readonly audience = process.env.AUTH_AUDIENCE
  ) {
    const jwksUrl = process.env.AUTH_JWKS_URL;
    if (jwksUrl) this.jwks = createRemoteJWKSet(new URL(jwksUrl));
  }

  async authenticate(request: Request): Promise<AuthPrincipal> {
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) throw new AuthError(401, 'Missing bearer token');
    if (!this.jwks || !this.issuer || !this.audience) {
      throw new AuthError(503, 'Authentication provider is not configured');
    }

    const token = authorization.slice('Bearer '.length).trim();
    const { payload } = await jwtVerify(token, this.jwks, {
      issuer: this.issuer,
      audience: this.audience
    });

    const userId = stringClaim(payload, 'sub');
    const organizationId = stringClaim(payload, 'org_id') ?? stringClaim(payload, 'organization_id');
    const roles = rolesClaim(payload);
    if (!userId || !organizationId || roles.length === 0) {
      throw new AuthError(403, 'Token is missing required identity or organization claims');
    }

    const permissions = [...new Set(roles.flatMap(role => rolePermissions[role]))];
    return { userId, organizationId, roles, permissions, claims: payload };
  }
}

export class AuthError extends Error {
  constructor(public readonly status: 401 | 403 | 503, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export function requirePermission(principal: AuthPrincipal, permission: Permission): void {
  if (!principal.permissions.includes(permission)) {
    throw new AuthError(403, `Missing permission: ${permission}`);
  }
}
