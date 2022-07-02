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

type Populator = <K extends Kind>(db: Knex, pgType: PgType<K>) => Promise<any>;

const populatorMap: Record<Kind, Populator<Kind>> = {
  domain: extractDomain,
  enum: extractEnum,
  range: extractRange,

  table: extractTable,
  view: extractView,
  materializedView: extractMaterializedView,
  compositeType: extractCompositeType,
} as const;

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

  const q = await db
    .select<{ nspname: string }[]>('nspname')
    .from('pg_catalog.pg_namespace')
    .whereNot('nspname', '=', 'information_schema')
    .whereNot('nspname', 'LIKE', 'pg_%');
  const allSchemaNames = R.pluck('nspname', q);

  const schemaNames = options?.schemas ?? allSchemaNames;
  if (options?.schemas) {
    if (schemaNames.length === 0) {
      throw new Error(`No schemas found for ${options.schemas}`);
    }

    const missingSchemas = schemaNames.filter(
      (schemaName) => !allSchemaNames.includes(schemaName)
    );

    if (missingSchemas.length > 0) {
      throw new Error(`No schemas found for ${missingSchemas}`);
    }
  }

  const pgTypes = await fetchTypes(db, schemaNames);

  const typesToExtract = options?.typeFilter
    ? pgTypes.filter(options.typeFilter)
    : pgTypes;

  if (options?.onProgressStart) {
    options.onProgressStart(typesToExtract.length);
  }

  // const groups = R.groupBy(R.prop('kind'), typesToExtract);

  const populated = await Promise.all(
    typesToExtract.map(async (pgType) => {
      const populator = populatorMap[pgType.kind];
      if (!populator) {
        throw new Error(`No populator for kind ${pgType.kind}`);
      }
      const p = await populator(db, pgType);
      return { ...pgType, ...p };
    })
  );

  const schemas: Record<string, Schema> = R.pipe(
    // @ts-ignore
    R.groupBy(R.prop('schemaName')),
    // @ts-ignore
    R.map(R.groupBy(R.prop('kind')))
  )(populated) as Record<string, Record<Kind, PgType<Kind>>>;

  await db.destroy();

  return schemas;

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
