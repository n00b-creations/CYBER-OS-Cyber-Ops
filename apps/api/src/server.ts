import { createServer, type IncomingMessage } from 'node:http';
import { randomUUID } from 'node:crypto';
import { AuthError, Authenticator, requirePermission, type AuthPrincipal } from './auth.js';
import { audit, ConsoleAuditSink } from './audit.js';
import { MemoryCrmRepository } from './repository.js';

const port = Number(process.env.PORT ?? 8787);
const authenticator = new Authenticator();
const repository = new MemoryCrmRepository();
const auditSink = new ConsoleAuditSink();
const startedAt = Date.now();

function json(status: number, body: unknown, correlationId: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-correlation-id': correlationId }
  });
}

async function handle(req: IncomingMessage): Promise<Response> {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const correlationId = req.headers['x-correlation-id']?.toString() || randomUUID();

  if (req.method === 'GET' && url.pathname === '/healthz') {
    return json(200, { status: 'ok', service: 'jarvis-api', uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000) }, correlationId);
  }
  if (req.method === 'GET' && url.pathname === '/readyz') {
    return json(200, { status: 'ready' }, correlationId);
  }

  const request = new Request(url, {
    method: req.method,
    headers: new Headers(Object.entries(req.headers).flatMap(([key, value]) => value == null ? [] : [[key, Array.isArray(value) ? value.join(',') : value]]))
  });

  let principal: AuthPrincipal;
  try {
    principal = await authenticator.authenticate(request);
  } catch (error) {
    if (error instanceof AuthError) return json(error.status, { error: error.message, correlationId }, correlationId);
    console.error(error);
    return json(401, { error: 'Authentication failed', correlationId }, correlationId);
  }

  try {
    if (req.method === 'GET' && url.pathname === '/v1/me') {
      await audit(auditSink, principal, { correlationId, action: 'identity.read', resourceType: 'user', resourceId: principal.userId, outcome: 'success', metadata: {} });
      return json(200, { userId: principal.userId, organizationId: principal.organizationId, roles: principal.roles, permissions: principal.permissions }, correlationId);
    }
    if (req.method === 'GET' && url.pathname === '/v1/leads') {
      requirePermission(principal, 'lead:read');
      const leads = await repository.listLeads(principal.organizationId);
      await audit(auditSink, principal, { correlationId, action: 'lead.list', resourceType: 'lead', outcome: 'success', metadata: { count: leads.length } });
      return json(200, { data: leads }, correlationId);
    }
    if (req.method === 'GET' && url.pathname === '/v1/opportunities') {
      requirePermission(principal, 'opportunity:read');
      const opportunities = await repository.listOpportunities(principal.organizationId);
      await audit(auditSink, principal, { correlationId, action: 'opportunity.list', resourceType: 'opportunity', outcome: 'success', metadata: { count: opportunities.length } });
      return json(200, { data: opportunities }, correlationId);
    }
    return json(404, { error: 'Not found', correlationId }, correlationId);
  } catch (error) {
    if (error instanceof AuthError) {
      await audit(auditSink, principal, { correlationId, action: 'request.authorize', resourceType: 'api', outcome: 'denied', metadata: { status: error.status } });
      return json(error.status, { error: error.message, correlationId }, correlationId);
    }
    console.error(error);
    await audit(auditSink, principal, { correlationId, action: 'request.process', resourceType: 'api', outcome: 'failure', metadata: {} });
    return json(500, { error: 'Internal server error', correlationId }, correlationId);
  }
}

createServer(async (req, res) => {
  try {
    const response = await handle(req);
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(await response.text());
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}).listen(port, () => console.info(`JARVIS API listening on :${port}`));
