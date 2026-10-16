# JARVIS-SEC API Runbook

## Current boundary

`apps/api` is the authenticated API boundary for JARVIS-SEC. It validates OIDC JWTs against a configured remote JWKS endpoint, derives the organization from trusted token claims, applies server-side RBAC, and emits structured audit events.

## Required production configuration

Set:

- `AUTH_ISSUER`
- `AUTH_AUDIENCE`
- `AUTH_JWKS_URL`
- `PORT`

Do not deploy the API with placeholder identity-provider values.

## Request flow

```text
HTTP request
  -> correlation ID
  -> OIDC JWT verification
  -> user + organization extraction
  -> permission check
  -> tenant-scoped repository query
  -> structured audit event
  -> JSON response
```

## Routes

- `GET /healthz` — liveness; no authentication required.
- `GET /readyz` — readiness placeholder; no authentication required until database readiness is wired.
- `GET /v1/me` — authenticated identity and effective permissions.
- `GET /v1/leads` — requires `lead:read`.
- `GET /v1/opportunities` — requires `opportunity:read`.

## Production gate

The current `MemoryCrmRepository` exists only to validate API wiring. Before marketplace release it must be replaced with a PostgreSQL implementation using the migration under `infrastructure/database/001_jarvis_core.sql`.

Production must also enable database row-level security and bind the request organization to the authenticated server-side session context. A client-supplied organization ID must never override that context.

## Observability

Every authenticated request receives or generates an `x-correlation-id`. Audit events include the organization, actor, action, resource, outcome and correlation ID. Route-level logs must not contain access tokens or other secrets.
