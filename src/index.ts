import knex, { Knex } from 'knex';
import { ConnectionConfig } from 'pg';
import R from 'ramda';
import extractTables from './extract-tables';
import extractTypes from './extract-types';
import extractViews from './extract-views';
import { Schema } from './types';

export * from './types';

export async function extractSchema(
  schemaName: string,
  connectionConfig: ConnectionConfig
): Promise<Schema> {
  const connection = connectionConfig as Knex.PgConnectionConfig;
  const db = knex({ client: 'postgres', connection });

  const tables = await extractTables(schemaName, db);
  const views = await extractViews(schemaName, db);
  const types = await extractTypes(schemaName, db);

  await db.destroy();

  return {
    tables: R.sortBy(R.prop('name'), tables),
    views: R.sortBy(R.prop('name'), views),
    types: R.sortBy(R.prop('name'), types),
  };
}
