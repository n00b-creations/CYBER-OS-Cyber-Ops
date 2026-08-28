import test from 'node:test';
import assert from 'node:assert/strict';
import { AuthError, requirePermission, type AuthPrincipal } from './auth.js';

const principal = (permissions: AuthPrincipal['permissions']): AuthPrincipal => ({
  userId: 'user-test',
  organizationId: 'org-test',
  roles: ['analyst'],
  permissions,
  claims: {}
});

test('requirePermission allows an explicitly granted permission', () => {
  assert.doesNotThrow(() => requirePermission(principal(['lead:read']), 'lead:read'));
});

test('requirePermission rejects missing permissions with 403', () => {
  assert.throws(
    () => requirePermission(principal(['lead:read']), 'lead:write'),
    (error: unknown) => error instanceof AuthError && error.status === 403,
  );
});

test('tenant identity is represented separately from permissions', () => {
  const value = principal(['lead:read']);
  assert.equal(value.organizationId, 'org-test');
  assert.deepEqual(value.permissions, ['lead:read']);
});
