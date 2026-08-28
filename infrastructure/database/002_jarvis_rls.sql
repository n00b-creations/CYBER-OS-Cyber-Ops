-- JARVIS-SEC tenant isolation.
-- The API executes tenant-scoped database work inside a transaction and sets
-- app.organization_id with SET LOCAL. The application role must NOT own these
-- tables and must NOT have BYPASSRLS.

alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table leads enable row level security;
alter table opportunities enable row level security;
alter table lead_enrichment enable row level security;
alter table audit_events enable row level security;

drop policy if exists organizations_tenant_select on organizations;
create policy organizations_tenant_select on organizations
  for select using (id::text = current_setting('app.organization_id', true));

drop policy if exists organization_members_tenant_select on organization_members;
create policy organization_members_tenant_select on organization_members
  for select using (organization_id::text = current_setting('app.organization_id', true));

drop policy if exists leads_tenant_access on leads;
create policy leads_tenant_access on leads
  using (organization_id::text = current_setting('app.organization_id', true))
  with check (organization_id::text = current_setting('app.organization_id', true));

drop policy if exists opportunities_tenant_access on opportunities;
create policy opportunities_tenant_access on opportunities
  using (organization_id::text = current_setting('app.organization_id', true))
  with check (organization_id::text = current_setting('app.organization_id', true));

drop policy if exists lead_enrichment_tenant_access on lead_enrichment;
create policy lead_enrichment_tenant_access on lead_enrichment
  using (organization_id::text = current_setting('app.organization_id', true))
  with check (organization_id::text = current_setting('app.organization_id', true));

drop policy if exists audit_events_tenant_access on audit_events;
create policy audit_events_tenant_access on audit_events
  using (organization_id::text = current_setting('app.organization_id', true))
  with check (organization_id::text = current_setting('app.organization_id', true));

-- Fail closed when the request context is absent. The empty setting cannot
-- match a UUID organization ID, so cross-tenant reads return zero rows and
-- writes fail.
