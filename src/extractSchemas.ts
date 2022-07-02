import knex, { Knex } from 'knex';
import { ConnectionConfig } from 'pg';
import * as R from 'ramda';

import extractCompositeType from './kinds/extractCompositeType';
import extractDomain from './kinds/extractDomain';
import extractEnum from './kinds/extractEnum';
import extractMaterializedView from './kinds/extractMaterializedView';
import extractRange from './kinds/extractRange';
import extractTable from './kinds/extractTable';
import extractView from './kinds/extractView';
import fetchTypes from './kinds/fetchTypes';
import PgType, { Kind } from './kinds/PgType';
// import resolveViewColumns from './resolveViewColumns';

const makePopulator =
  <K extends Kind, T>(populate: (db: Knex, pgType: PgType<K>) => Promise<T>) =>
  async (db: Knex, pgTypes: PgType<K>[], onProgress?: () => void) => {
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

const extractDomains = makePopulator(extractDomain);
const extractEnums = makePopulator(extractEnum);
const extractRanges = makePopulator(extractRange);

const extractTables = makePopulator(extractTable);
const extractViews = makePopulator(extractView);
const extractMaterializedViews = makePopulator(extractMaterializedView);
const extractCompositeTypes = makePopulator(extractCompositeType);

export type ExtractSchemaOptions = {
  schemas?: string[];
  typeFilter?: (pgType: PgType) => boolean;
  resolveViews?: boolean;
  onProgressStart?: (total: number) => void;
  onProgress?: () => void;
  onProgressEnd?: () => void;
};

type Schema = any;

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

  const domains = await extractDomains(
    db,
    groups.domain as PgType<'domain'>[],
    options?.onProgress
  );
  const enums = await extractEnums(
    db,
    groups.enum as PgType<'enum'>[],
    options?.onProgress
  );
  const ranges = await extractRanges(
    db,
    groups.range as PgType<'range'>[],
    options?.onProgress
  );

  const tables = await extractTables(
    db,
    groups.table as PgType<'table'>[],
    options?.onProgress
  );
  const views = await extractViews(
    db,
    groups.view as PgType<'view'>[],
    options?.onProgress
  );
  const materializedViews = await extractMaterializedViews(
    db,
    groups.materializedView as PgType<'materializedView'>[],
    options?.onProgress
  );
  const compositeTypes = await extractCompositeTypes(
    db,
    groups.compositeType as PgType<'compositeType'>[],
    options?.onProgress
  );

  await db.destroy();

  return {
    domains,
    enums,
    ranges,
    tables,
    views,
    materializedViews,
    compositeTypes,
  };

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
