import knex, { Knex } from 'knex';
import { ConnectionConfig } from 'pg';
import * as R from 'ramda';

import extractTable from './extractTable';
import fetchTypes, { PgType } from './fetchTypes';
import resolveViewColumns from './resolve-view-columns';
import { Schema } from './types';

const makePopulator =
  <T>(populate: (db: Knex, pgType: PgType) => Promise<T>) =>
  async (db: Knex, pgTypes: PgType[], onProgress?: () => void) => {
    const res = await Promise.all(
      pgTypes.map(async (pgType) => {
        const populatedResult = await populate(db, pgType);
        onProgress?.();
        return {
          ...pgType,
          ...populatedResult,
        };
      })
    );
    return res;
  };

const extractTables = makePopulator(extractTable);
// const extractDomains = hydratePgTypes(extractDomain);

export type ExtractSchemaOptions = {
  schemas?: string[];
  typeFilter?: (pgType: PgType) => boolean;
  resolveViews?: boolean;
  onProgressStart?: (total: number) => void;
  onProgress?: () => void;
  onProgressEnd?: () => void;
};

async function extractSchemas(
  connectionConfig: string | ConnectionConfig,
  options?: ExtractSchemaOptions
): Promise<Record<string, Schema>> {
  const connection = connectionConfig as string | Knex.PgConnectionConfig;
  const db = knex({ client: 'postgres', connection });

  let schemaNames = options?.schemas;
  if (!schemaNames) {
    const q = await db
      .select<{ nspname: string }[]>('nspname')
      .from('pg_catalog.pg_namespace')
      .whereNot('nspname', '=', 'information_schema')
      .whereNot('nspname', 'LIKE', 'pg_%');
    schemaNames = R.pluck('nspname', q);
  }

  const pgTypes = await fetchTypes(db, schemaNames);

  const typesToExtract = options?.typeFilter
    ? pgTypes.filter(options.typeFilter)
    : pgTypes;

  if (options?.onProgressStart) {
    options.onProgressStart(typesToExtract.length);
  }

  const groups = R.groupBy(R.prop('kind'), typesToExtract);

  const tables = extractTables(db, groups.table, options?.onProgress);
  const domains = extractDomains(db, groups.domain, options?.onProgress);

  console.log(groups);
  return {};

  // schemas.forEach(async (schema) => {
  //   const schemaName = typeof schema === 'string' ? schema : schema.name;
  //   const tables = typeof schema === 'string' ? undefined : schema.tables;

  //   const extractedTables = await extractTables(schemaName, db, tables);
  //   const rawViews = await extractViews(schemaName, db);
  //   const types = await extractTypes(schemaName, db);

  //   const views = options?.resolveViews
  //     ? resolveViewColumns(rawViews, extractedTables, schemaName)
  //     : rawViews;
  // });

  // await db.destroy();

  // return {
  //   tables: R.sortBy(R.prop('name'), extractedTables),
  //   views: R.sortBy(R.prop('name'), views),
  //   types: R.sortBy(R.prop('name'), types),
  // };
}

export default extractSchemas;
