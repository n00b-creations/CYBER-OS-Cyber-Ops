export type Role = 'owner' | 'admin' | 'operator' | 'analyst' | 'viewer';

export type Permission =
  | 'workspace:read'
  | 'lead:read' | 'lead:write'
  | 'opportunity:read' | 'opportunity:write'
  | 'campaign:read' | 'campaign:write'
  | 'ai:run' | 'ai:approve'
  | 'integration:manage' | 'billing:manage' | 'security:manage';

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  owner: ['workspace:read','lead:read','lead:write','opportunity:read','opportunity:write','campaign:read','campaign:write','ai:run','ai:approve','integration:manage','billing:manage','security:manage'],
  admin: ['workspace:read','lead:read','lead:write','opportunity:read','opportunity:write','campaign:read','campaign:write','ai:run','ai:approve','integration:manage','security:manage'],
  operator: ['workspace:read','lead:read','lead:write','opportunity:read','opportunity:write','campaign:read','campaign:write','ai:run'],
  analyst: ['workspace:read','lead:read','opportunity:read','campaign:read','ai:run'],
  viewer: ['workspace:read','lead:read','opportunity:read','campaign:read'],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function permissionsFor(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}
