import test from 'node:test';
import assert from 'node:assert/strict';
import { Pool } from 'pg';
import { PostgresCrmRepository } from './postgres-repository.js';

const appUrl = process.env.TEST_DATABASE_URL;
const adminUrl = process.env.TEST_DATABASE_ADMIN_URL;
const enabled = Boolean(appUrl && adminUrl && process.env.TEST_DATABASE_MIGRATIONS_APPLIED === 'true');

const integration = enabled ? test : test.skip;

integration('PostgreSQL RLS prevents cross-tenant reads and writes', async () => {
  const admin = new Pool({ connectionString: adminUrl });
  const app = new Pool({ connectionString: appUrl });
  const orgA = '11111111-1111-4111-8111-111111111111';
  const orgB = '22222222-2222-4222-8222-222222222222';

  try {
    const roleCheck = await app.query<{ rolsuper: boolean; rolbypassrls: boolean }>(
      'select rolsuper, rolbypassrls from pg_roles where rolname = current_user',
    );
    assert.equal(roleCheck.rows.length, 1);
    assert.equal(roleCheck.rows[0].rolsuper, false, 'integration app role must not be superuser');
    assert.equal(roleCheck.rows[0].rolbypassrls, false, 'integration app role must not bypass RLS');

    await admin.query('begin');
    await admin.query(
      `insert into organizations (id, name) values ($1, $2), ($3, $4)
       on conflict (id) do update set name = excluded.name`,
      [orgA, 'JARVIS Test A', orgB, 'JARVIS Test B'],
    );
    await admin.query('delete from leads where organization_id in ($1, $2)', [orgA, orgB]);
    await admin.query(
      `insert into leads (id, organization_id, name, company, email, source, score, stage)
       values (gen_random_uuid(), $1, 'A Lead', 'A Corp', 'a@example.test', 'integration', 90, 'qualified'),
              (gen_random_uuid(), $2, 'B Lead', 'B Corp', 'b@example.test', 'integration', 80, 'qualified')`,
      [orgA, orgB],
    );
    await admin.query('commit');

    const repository = new PostgresCrmRepository(app);
    const aLeads = await repository.listLeads(orgA);
    const bLeads = await repository.listLeads(orgB);

    assert.equal(aLeads.length, 1);
    assert.equal(aLeads[0].organizationId, orgA);
    assert.equal(aLeads[0].company, 'A Corp');
    assert.equal(bLeads.length, 1);
    assert.equal(bLeads[0].organizationId, orgB);
    assert.equal(bLeads[0].company, 'B Corp');

    const direct = await app.connect();
    try {
      await direct.query('begin');
      await direct.query("select set_config('app.organization_id', $1, true)", [orgA]);
      const crossTenantRead = await direct.query('select organization_id from leads where organization_id = $1', [orgB]);
      assert.equal(crossTenantRead.rowCount, 0, 'RLS must hide another tenant');
      await assert.rejects(
        () => direct.query(
          `insert into leads (id, organization_id, name, company, email, source, score, stage)
           values (gen_random_uuid(), $1, 'Escape', 'B Corp', 'escape@example.test', 'integration', 1, 'new')`,
          [orgB],
        ),
      );
      await direct.query('rollback');
    } finally {
      direct.release();
    }
  } finally {
    await admin.query('delete from leads where organization_id in ($1, $2)', [orgA, orgB]);
    await admin.query('delete from organizations where id in ($1, $2)', [orgA, orgB]);
    await Promise.all([app.end(), admin.end()]);
  }
});
