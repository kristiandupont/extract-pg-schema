import knex, { Knex } from 'knex';
import { ConnectionConfig } from 'pg';
import * as R from 'ramda';

import extractTables from './extract-tables';
import extractTypes from './extract-types';
import extractViews from './extract-views';
import resolveViewColumns from './resolve-view-columns';
import { Schema } from './types';

async function extractSchema(
  schemaName: string,
  connectionConfig: string | ConnectionConfig,
  resolveViews: boolean,
  tables?: string[]
): Promise<Schema> {
  const connection = connectionConfig as string | Knex.PgConnectionConfig;
  const db = knex({ client: 'postgres', connection });

  const extractedTables = await extractTables(schemaName, db, tables);
  const rawViews = await extractViews(schemaName, db);
  const types = await extractTypes(schemaName, db);

  const views = resolveViews
    ? resolveViewColumns(rawViews, extractedTables, schemaName)
    : rawViews;

  await db.destroy();

  return {
    tables: R.sortBy(R.prop('name'), extractedTables),
    views: R.sortBy(R.prop('name'), views),
    types: R.sortBy(R.prop('name'), types),
  };
}

export default extractSchema;
