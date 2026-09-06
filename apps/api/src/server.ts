import { createServer, type IncomingMessage } from 'node:http';
import { randomUUID } from 'node:crypto';
import { AuthError, Authenticator, requirePermission, type AuthPrincipal } from './auth.js';
import { audit, ConsoleAuditSink, type AuditSink } from './audit.js';
import { MemoryCrmRepository, type CrmRepository, type CreateLeadInput, type CreateOpportunityInput } from './repository.js';
import { createPostgresPool, PostgresCrmRepository } from './postgres-repository.js';
import { PostgresAuditSink } from './postgres-audit.js';
import { FixedWindowRateLimiter } from './rate-limit.js';

const port = Number(process.env.PORT ?? 8787);
const authenticator = new Authenticator();
const usePostgres = Boolean(process.env.DATABASE_URL);
const pool = usePostgres ? createPostgresPool() : undefined;
const repository: CrmRepository = pool ? new PostgresCrmRepository(pool) : new MemoryCrmRepository();
const auditSink: AuditSink = pool ? new PostgresAuditSink(pool) : new ConsoleAuditSink();
const startedAt = Date.now();
const maxBodyBytes = Number(process.env.MAX_BODY_BYTES ?? 64 * 1024);
const rateLimiter = new FixedWindowRateLimiter(Number(process.env.RATE_LIMIT_PER_MINUTE ?? 120));
const allowedOrigins = new Set((process.env.CORS_ALLOWED_ORIGINS ?? '').split(',').map(value => value.trim()).filter(Boolean));
const leadStages = new Set(['new', 'qualified', 'opportunity', 'won', 'lost']);
const opportunityStages = new Set(['discovery', 'qualification', 'proposal', 'negotiation', 'won', 'lost']);

function json(status: number, body: unknown, correlationId: string): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-correlation-id': correlationId } });
}
function securityHeaders(res: Response, origin?: string): Response {
  res.headers.set('x-content-type-options', 'nosniff'); res.headers.set('x-frame-options', 'DENY');
  res.headers.set('referrer-policy', 'no-referrer'); res.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  if (origin && allowedOrigins.has(origin)) {
    res.headers.set('access-control-allow-origin', origin);
    res.headers.set('access-control-allow-methods', 'GET,POST,OPTIONS');
    res.headers.set('access-control-allow-headers', 'Authorization,Content-Type,X-Correlation-Id');
    res.headers.set('access-control-max-age', '600');
    res.headers.set('vary', 'Origin');
  }
  return res;
}
async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  let size = 0; const chunks: Buffer[] = [];
  for await (const chunk of req) { const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk); size += part.length; if (size > maxBodyBytes) throw new AuthError(413, 'Request body too large'); chunks.push(part); }
  if (!size) throw new AuthError(400, 'Request body is required');
  let parsed: unknown; try { parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new AuthError(400, 'Invalid JSON'); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new AuthError(400, 'JSON object required');
  return parsed as Record<string, unknown>;
}
function text(value: unknown, field: string, max = 200): string { if (typeof value !== 'string' || !value.trim() || value.length > max) throw new AuthError(400, `Invalid ${field}`); return value.trim(); }
function finiteNumber(value: unknown, field: string, min = 0, max = Number.MAX_SAFE_INTEGER): number { if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new AuthError(400, `Invalid ${field}`); return value; }
function enumValue<T extends string>(value: unknown, field: string, allowed: Set<string>, fallback: T): T { if (value === undefined) return fallback; if (typeof value !== 'string' || !allowed.has(value)) throw new AuthError(400, `Invalid ${field}`); return value as T; }

async function handle(req: IncomingMessage): Promise<Response> {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`); const correlationId = req.headers['x-correlation-id']?.toString() || randomUUID(); const origin = req.headers.origin?.toString();
  if (origin && !allowedOrigins.has(origin)) return securityHeaders(json(403, { error: 'Origin not allowed', correlationId }, correlationId));
  if (req.method === 'OPTIONS') return securityHeaders(new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } }), origin);
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const limit = rateLimiter.consume(req.socket.remoteAddress ?? 'unknown');
    if (!limit.allowed) { const response = json(429, { error: 'Rate limit exceeded', correlationId, retryAfterSeconds: limit.retryAfterSeconds }, correlationId); response.headers.set('retry-after', String(limit.retryAfterSeconds)); response.headers.set('x-ratelimit-remaining', '0'); return securityHeaders(response, origin); }
  }
  if (req.method === 'GET' && url.pathname === '/healthz') return securityHeaders(json(200, { status: 'ok', service: 'jarvis-api', uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000), persistence: usePostgres ? 'postgres' : 'memory-dev' }, correlationId), origin);
  if (req.method === 'GET' && url.pathname === '/readyz') { if (pool) { try { await pool.query('select 1'); } catch { return securityHeaders(json(503, { status: 'not-ready' }, correlationId), origin); } } return securityHeaders(json(200, { status: 'ready' }, correlationId), origin); }
  const request = new Request(url, { method: req.method, headers: new Headers(Object.entries(req.headers).flatMap(([key, value]) => value == null ? [] : [[key, Array.isArray(value) ? value.join(',') : value]])) });
  let principal: AuthPrincipal;
  try { principal = await authenticator.authenticate(request); } catch (error) { if (error instanceof AuthError) return securityHeaders(json(error.status, { error: error.message, correlationId }, correlationId), origin); console.error(error); return securityHeaders(json(401, { error: 'Authentication failed', correlationId }, correlationId), origin); }
  try {
    if (req.method === 'GET' && url.pathname === '/v1/me') { await audit(auditSink, principal, { correlationId, action: 'identity.read', resourceType: 'user', resourceId: principal.userId, outcome: 'success', metadata: {} }); return securityHeaders(json(200, { userId: principal.userId, organizationId: principal.organizationId, roles: principal.roles, permissions: principal.permissions }, correlationId), origin); }
    if (req.method === 'GET' && url.pathname === '/v1/leads') { requirePermission(principal, 'lead:read'); const leads = await repository.listLeads(principal.organizationId); await audit(auditSink, principal, { correlationId, action: 'lead.list', resourceType: 'lead', outcome: 'success', metadata: { count: leads.length } }); return securityHeaders(json(200, { data: leads }, correlationId), origin); }
    if (req.method === 'POST' && url.pathname === '/v1/leads') { requirePermission(principal, 'lead:write'); const body = await readJson(req); const input: CreateLeadInput = { name: text(body.name, 'name'), company: text(body.company, 'company'), email: text(body.email, 'email', 320), source: text(body.source, 'source'), score: body.score === undefined ? 0 : finiteNumber(body.score, 'score', 0, 100), stage: enumValue(body.stage, 'stage', leadStages, 'new') }; const lead = await repository.createLead(principal.organizationId, input); await audit(auditSink, principal, { correlationId, action: 'lead.create', resourceType: 'lead', resourceId: lead.id, outcome: 'success', metadata: {} }); return securityHeaders(json(201, { data: lead }, correlationId), origin); }
    if (req.method === 'GET' && url.pathname === '/v1/opportunities') { requirePermission(principal, 'opportunity:read'); const opportunities = await repository.listOpportunities(principal.organizationId); await audit(auditSink, principal, { correlationId, action: 'opportunity.list', resourceType: 'opportunity', outcome: 'success', metadata: { count: opportunities.length } }); return securityHeaders(json(200, { data: opportunities }, correlationId), origin); }
    if (req.method === 'POST' && url.pathname === '/v1/opportunities') { requirePermission(principal, 'opportunity:write'); const body = await readJson(req); const input: CreateOpportunityInput = { name: text(body.name, 'name'), company: text(body.company, 'company'), value: finiteNumber(body.value, 'value'), stage: enumValue(body.stage, 'stage', opportunityStages, 'discovery'), probability: body.probability === undefined ? 0 : finiteNumber(body.probability, 'probability', 0, 100), ownerUserId: text(body.ownerUserId ?? principal.userId, 'ownerUserId') }; const opportunity = await repository.createOpportunity(principal.organizationId, input); await audit(auditSink, principal, { correlationId, action: 'opportunity.create', resourceType: 'opportunity', resourceId: opportunity.id, outcome: 'success', metadata: {} }); return securityHeaders(json(201, { data: opportunity }, correlationId), origin); }
    return securityHeaders(json(404, { error: 'Not found', correlationId }, correlationId), origin);
  } catch (error) {
    if (error instanceof AuthError) { await audit(auditSink, principal, { correlationId, action: 'request.authorize', resourceType: 'api', outcome: 'denied', metadata: { status: error.status } }); return securityHeaders(json(error.status, { error: error.message, correlationId }, correlationId), origin); }
    console.error(error); await audit(auditSink, principal, { correlationId, action: 'request.process', resourceType: 'api', outcome: 'failure', metadata: {} }); return securityHeaders(json(500, { error: 'Internal server error', correlationId }, correlationId), origin);
  }
}
const server = createServer(async (req, res) => { try { const response = await handle(req); res.statusCode = response.status; response.headers.forEach((value, key) => res.setHeader(key, value)); res.end(await response.text()); } catch (error) { console.error(error); res.statusCode = 500; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ error: 'Internal server error' })); } });
server.listen(port, () => console.info(`JARVIS API listening on :${port} (${usePostgres ? 'postgres' : 'development-memory'} persistence)`));
