import knex, { Knex } from 'knex';
import { ConnectionConfig } from 'pg';
import * as R from 'ramda';

import extractCompositeType, {
  CompositeTypeDetails,
} from './kinds/extractCompositeType';
import extractDomain, { DomainDetails } from './kinds/extractDomain';
import extractEnum, { EnumDetails } from './kinds/extractEnum';
import extractMaterializedView, {
  MaterializedViewDetails,
} from './kinds/extractMaterializedView';
import extractRange, { RangeDetails } from './kinds/extractRange';
import extractTable, { TableDetails } from './kinds/extractTable';
import extractView, { ViewDetails } from './kinds/extractView';
import fetchTypes from './kinds/fetchTypes';
import PgType, { Kind } from './kinds/PgType';
// import resolveViewColumns from './resolveViewColumns';

export type Details =
  | DomainDetails
  | EnumDetails
  | RangeDetails
  | TableDetails
  | ViewDetails
  | MaterializedViewDetails
  | CompositeTypeDetails;

export type PopulatedType = PgType & Details;

export type Schema = {
  name: string;
  domain: PopulatedType[];
  enum: PopulatedType[];
  range: PopulatedType[];
  table: PopulatedType[];
  view: PopulatedType[];
  materializedView: PopulatedType[];
  compositeType: PopulatedType[];
};

const emptySchema: Omit<Schema, 'name'> = {
  domain: [],
  enum: [],
  range: [],
  table: [],
  view: [],
  materializedView: [],
  compositeType: [],
};

type Populator = (db: Knex, pgType: PgType) => Promise<Details>;

// @ts-ignore Why is this broken? I don't understand. :-/
const populatorMap: Record<Kind, Populator> = {
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
    const missingSchemas = schemaNames.filter(
      (schemaName) => !allSchemaNames.includes(schemaName)
    );

    if (missingSchemas.length > 0) {
      throw new Error(`No schemas found for ${missingSchemas.join(', ')}`);
    }
  }

  const pgTypes = await fetchTypes(db, schemaNames);

  const typesToExtract = options?.typeFilter
    ? pgTypes.filter(options.typeFilter)
    : pgTypes;

  if (options?.onProgressStart) {
    options.onProgressStart(typesToExtract.length);
  }

  const populated = await Promise.all(
    typesToExtract.map(async (pgType) => {
      const populator = populatorMap[pgType.kind];
      const details = await populator(db, pgType);
      return { ...pgType, ...details };
    })
  );

  const schemas: Record<string, Schema> = {};
  populated.forEach((p: PgType & Details) => {
    if (!(p.schemaName in schemas)) {
      schemas[p.schemaName] = {
        name: p.schemaName,
        ...emptySchema,
      };
    }
    schemas[p.schemaName][p.kind] = [...schemas[p.schemaName][p.kind], p];
  });

  await db.destroy();
  return schemas;
}

export default extractSchemas;
