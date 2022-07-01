import { expect, it } from 'vitest';

import fetchExtensionItemIds from './fetchExtensionItemIds';
import { describe } from './tests/fixture';
import useSchema from './tests/useSchema';
import useTestKnex from './tests/useTestKnex';

describe('fetchExtensionItemIds', () => {
  const getKnex = useTestKnex();
  useSchema(getKnex, 'test');

  // NOTE: be aware that this test depends on specifics of certain Postgres extensions.
  // If it fails there is a chance that it's because the extensions themselves have changed,
  // not necessarily the test.
  it('should fetch extension item ids', async () => {
    const db = getKnex();

    await db.raw('create extension if not exists pg_trgm');
    await db.raw('create extension if not exists fuzzystrmatch');
    await db.raw('create extension if not exists pg_stat_statements');
    await db.raw('create extension if not exists citext');

    const r = await fetchExtensionItemIds(db);

    const classes = [];
    for (const extClassOid of r.extClassOids) {
      const c = await db.raw(
        `select * from pg_catalog.pg_class where oid = ${extClassOid}`
      );
      classes.push(c.rows[0].relname);
    }
    expect(classes).toContain('pg_stat_statements_info');
    expect(classes).toContain('pg_stat_statements');

    const types = [];
    for (const extTypeOid of r.extTypeOids) {
      const c = await db.raw(
        `select * from pg_catalog.pg_type where oid = ${extTypeOid}`
      );
      types.push(c.rows[0].typname);
    }
    expect(types).toContain('gtrgm');
    expect(types).toContain('citext');

    const procs = [];
    for (const extProcOid of r.extProcOids) {
      const c = await db.raw(
        `select * from pg_catalog.pg_proc where oid = ${extProcOid}`
      );
      procs.push(c.rows[0].proname);
    }
    expect(procs).toContain('pg_stat_statements_info');
    expect(procs).toContain('pg_stat_statements');
    expect(procs).toContain('gtrgm_in');
    expect(procs).toContain('gtrgm_out');
    expect(procs).toContain('citextin');
    expect(procs).toContain('citextout');

    await db.raw('drop extension pg_trgm');
    await db.raw('drop extension fuzzystrmatch');
    await db.raw('drop extension pg_stat_statements');
    await db.raw('drop extension citext');
  });
});
