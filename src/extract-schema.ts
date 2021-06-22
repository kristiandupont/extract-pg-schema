import knex, { Knex } from 'knex';
import { ConnectionConfig } from 'pg';
import R from 'ramda';
import extractTables from './extract-tables';
import extractTypes from './extract-types';
import extractViews from './extract-views';
import resolveViewColumns from './resolve-view-columns';
import { Schema } from './types';

async function extractSchema(
  schemaName: string,
  resolveViews: boolean,
  connectionConfig: ConnectionConfig
): Promise<Schema> {
  const connection = connectionConfig as Knex.PgConnectionConfig;
  const db = knex({ client: 'postgres', connection });

  const tables = await extractTables(schemaName, db);
  const rawViews = await extractViews(schemaName, db);
  const types = await extractTypes(schemaName, db);

  const views = resolveViews
    ? resolveViewColumns(rawViews, tables, schemaName)
    : rawViews;

  await db.destroy();

  return {
    tables: R.sortBy(R.prop('name'), tables),
    views: R.sortBy(R.prop('name'), views),
    types: R.sortBy(R.prop('name'), types),
  };
}

export default extractSchema;
