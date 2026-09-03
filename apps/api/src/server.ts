import { createServer, type IncomingMessage } from 'node:http';
import { randomUUID } from 'node:crypto';
import { AuthError, Authenticator, requirePermission, type AuthPrincipal } from './auth.js';
import { audit, ConsoleAuditSink, type AuditSink } from './audit.js';
import { MemoryCrmRepository, type CrmRepository, type CreateLeadInput, type CreateOpportunityInput } from './repository.js';
import { createPostgresPool, PostgresCrmRepository } from './postgres-repository.js';
import { PostgresAuditSink } from './postgres-audit.js';

const port = Number(process.env.PORT ?? 8787);
const authenticator = new Authenticator();
const usePostgres = Boolean(process.env.DATABASE_URL);
const pool = usePostgres ? createPostgresPool() : undefined;
const repository: CrmRepository = pool ? new PostgresCrmRepository(pool) : new MemoryCrmRepository();
const auditSink: AuditSink = pool ? new PostgresAuditSink(pool) : new ConsoleAuditSink();
const startedAt = Date.now();
const maxBodyBytes = Number(process.env.MAX_BODY_BYTES ?? 64 * 1024);

function json(status: number, body: unknown, correlationId: string): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-correlation-id': correlationId } });
}
function securityHeaders(res: Response): Response {
  res.headers.set('x-content-type-options', 'nosniff'); res.headers.set('x-frame-options', 'DENY');
  res.headers.set('referrer-policy', 'no-referrer'); res.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
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

async function handle(req: IncomingMessage): Promise<Response> {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`); const correlationId = req.headers['x-correlation-id']?.toString() || randomUUID();
  if (req.method === 'GET' && url.pathname === '/healthz') return securityHeaders(json(200, { status: 'ok', service: 'jarvis-api', uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000), persistence: usePostgres ? 'postgres' : 'memory-dev' }, correlationId));
  if (req.method === 'GET' && url.pathname === '/readyz') { if (pool) { try { await pool.query('select 1'); } catch { return securityHeaders(json(503, { status: 'not-ready' }, correlationId)); } } return securityHeaders(json(200, { status: 'ready' }, correlationId)); }
  const request = new Request(url, { method: req.method, headers: new Headers(Object.entries(req.headers).flatMap(([key, value]) => value == null ? [] : [[key, Array.isArray(value) ? value.join(',') : value]])) });
  let principal: AuthPrincipal;
  try { principal = await authenticator.authenticate(request); } catch (error) { if (error instanceof AuthError) return securityHeaders(json(error.status, { error: error.message, correlationId }, correlationId)); console.error(error); return securityHeaders(json(401, { error: 'Authentication failed', correlationId }, correlationId)); }
  try {
    if (req.method === 'GET' && url.pathname === '/v1/me') { await audit(auditSink, principal, { correlationId, action: 'identity.read', resourceType: 'user', resourceId: principal.userId, outcome: 'success', metadata: {} }); return securityHeaders(json(200, { userId: principal.userId, organizationId: principal.organizationId, roles: principal.roles, permissions: principal.permissions }, correlationId)); }
    if (req.method === 'GET' && url.pathname === '/v1/leads') { requirePermission(principal, 'lead:read'); const leads = await repository.listLeads(principal.organizationId); await audit(auditSink, principal, { correlationId, action: 'lead.list', resourceType: 'lead', outcome: 'success', metadata: { count: leads.length } }); return securityHeaders(json(200, { data: leads }, correlationId)); }
    if (req.method === 'POST' && url.pathname === '/v1/leads') { requirePermission(principal, 'lead:write'); const body = await readJson(req); const input: CreateLeadInput = { name: text(body.name, 'name'), company: text(body.company, 'company'), email: text(body.email, 'email', 320), source: text(body.source, 'source'), score: body.score === undefined ? 0 : finiteNumber(body.score, 'score', 0, 100), stage: body.stage as CreateLeadInput['stage'] ?? 'new' }; const lead = await repository.createLead(principal.organizationId, input); await audit(auditSink, principal, { correlationId, action: 'lead.create', resourceType: 'lead', resourceId: lead.id, outcome: 'success', metadata: {} }); return securityHeaders(json(201, { data: lead }, correlationId)); }
    if (req.method === 'GET' && url.pathname === '/v1/opportunities') { requirePermission(principal, 'opportunity:read'); const opportunities = await repository.listOpportunities(principal.organizationId); await audit(auditSink, principal, { correlationId, action: 'opportunity.list', resourceType: 'opportunity', outcome: 'success', metadata: { count: opportunities.length } }); return securityHeaders(json(200, { data: opportunities }, correlationId)); }
    if (req.method === 'POST' && url.pathname === '/v1/opportunities') { requirePermission(principal, 'opportunity:write'); const body = await readJson(req); const input: CreateOpportunityInput = { name: text(body.name, 'name'), company: text(body.company, 'company'), value: finiteNumber(body.value, 'value'), stage: body.stage as CreateOpportunityInput['stage'] ?? 'discovery', probability: body.probability === undefined ? 0 : finiteNumber(body.probability, 'probability', 0, 100), ownerUserId: text(body.ownerUserId ?? principal.userId, 'ownerUserId') }; const opportunity = await repository.createOpportunity(principal.organizationId, input); await audit(auditSink, principal, { correlationId, action: 'opportunity.create', resourceType: 'opportunity', resourceId: opportunity.id, outcome: 'success', metadata: {} }); return securityHeaders(json(201, { data: opportunity }, correlationId)); }
    return securityHeaders(json(404, { error: 'Not found', correlationId }, correlationId));
  } catch (error) {
    if (error instanceof AuthError) { await audit(auditSink, principal, { correlationId, action: 'request.authorize', resourceType: 'api', outcome: 'denied', metadata: { status: error.status } }); return securityHeaders(json(error.status, { error: error.message, correlationId }, correlationId)); }
    console.error(error); await audit(auditSink, principal, { correlationId, action: 'request.process', resourceType: 'api', outcome: 'failure', metadata: {} }); return securityHeaders(json(500, { error: 'Internal server error', correlationId }, correlationId));
  }
}
const server = createServer(async (req, res) => { try { const response = await handle(req); res.statusCode = response.status; response.headers.forEach((value, key) => res.setHeader(key, value)); res.end(await response.text()); } catch (error) { console.error(error); res.statusCode = 500; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ error: 'Internal server error' })); } });
server.listen(port, () => console.info(`JARVIS API listening on :${port} (${usePostgres ? 'postgres' : 'development-memory'} persistence)`));
