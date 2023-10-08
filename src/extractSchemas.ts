import knex, { Knex } from "knex";
import { ConnectionConfig } from "pg";
import * as R from "ramda";

import extractCompositeType, {
  CompositeTypeDetails,
} from "./kinds/extractCompositeType";
import extractDomain, { DomainDetails } from "./kinds/extractDomain";
import extractEnum, { EnumDetails } from "./kinds/extractEnum";
import extractMaterializedView, {
  MaterializedViewDetails,
} from "./kinds/extractMaterializedView";
import extractRange, { RangeDetails } from "./kinds/extractRange";
import extractTable, { TableDetails } from "./kinds/extractTable";
import extractView, { ViewDetails } from "./kinds/extractView";
import fetchTypes from "./kinds/fetchTypes";
import PgType, { Kind } from "./kinds/PgType";
import resolveViewColumns from "./resolveViewColumns";

interface DetailsMap {
  domain: DomainDetails;
  enum: EnumDetails;
  range: RangeDetails;
  table: TableDetails;
  materializedView: MaterializedViewDetails;
  view: ViewDetails;
  compositeType: CompositeTypeDetails;
}

/**
 * extractSchemas generates a record of all the schemas extracted, indexed by schema name.
 * The schemas are instances of this type.
 */
export type Schema = {
  name: string;
  domains: DomainDetails[];
  enums: EnumDetails[];
  ranges: RangeDetails[];
  tables: TableDetails[];
  views: ViewDetails[];
  materializedViews: MaterializedViewDetails[];
  compositeTypes: CompositeTypeDetails[];
};

const emptySchema: Omit<Schema, "name"> = {
  domains: [],
  enums: [],
  ranges: [],
  tables: [],
  views: [],
  materializedViews: [],
  compositeTypes: [],
};

type Populator = <K extends Kind>(
  db: Knex,
  pgType: PgType<K>,
) => Promise<DetailsMap[K]>;

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

/**
 * This is the options object that can be passed to `extractSchemas`.
 * @see extractSchemas
 */
export interface ExtractSchemaOptions {
  /**
   * Will contain an array of schema names to extract.
   * If undefined, all non-system schemas will be extracted.
   */
  schemas?: string[];

  /**
   * Filter function that you can use if you want to exclude
   * certain items from the schemas.
   */
  typeFilter?: (pgType: PgType) => boolean;

  /**
   * extractShemas will always attempt to parse view definitions to
   * discover the "source" of each column, i.e. the table or view that it
   * is derived from.
   * If this option is set to `true`, it will attempt to follow this
   * source and copy values like indices, isNullable, etc.
   * so that the view data is closer to what the database reflects.
   */
  resolveViews?: boolean;

  /**
   * Called with the number of types to extract.
   */
  onProgressStart?: (total: number) => void;

  /**
   * Called once for each type that is extracted.
   */
  onProgress?: () => void;

  /**
   * Called when all types have been extracted.
   */
  onProgressEnd?: () => void;
}

/**
 * Perform the extraction
 * @param connectionConfig - Connection string or configuration object for Postgres connection
 * @param options - Optional options
 * @returns A record of all the schemas extracted, indexed by schema name.
 */
async function extractSchemas(
  connectionConfig: string | ConnectionConfig,
  options?: ExtractSchemaOptions,
): Promise<Record<string, Schema>> {
  const connection = connectionConfig as string | Knex.PgConnectionConfig;
  const db = knex({ client: "postgres", connection });

  const q = await db
    .select<{ nspname: string }[]>("nspname")
    .from("pg_catalog.pg_namespace")
    .whereNot("nspname", "=", "information_schema")
    .whereNot("nspname", "LIKE", "pg_%");
  const allSchemaNames = R.pluck("nspname", q);

  const schemaNames = options?.schemas ?? allSchemaNames;
  if (options?.schemas) {
    const missingSchemas = schemaNames.filter(
      (schemaName) => !allSchemaNames.includes(schemaName),
    );

    if (missingSchemas.length > 0) {
      throw new Error(`No schemas found for ${missingSchemas.join(", ")}`);
    }
  }

  const pgTypes = await fetchTypes(db, schemaNames);

  const typesToExtract = options?.typeFilter
    ? pgTypes.filter((element) => options.typeFilter!(element))
    : pgTypes;

  options?.onProgressStart?.(typesToExtract.length);

  const populated = await Promise.all(
    typesToExtract.map(async (pgType) => {
      const result = await populatorMap[pgType.kind](db, pgType);
      options?.onProgress?.();
      return result;
    }),
  );

  const schemas: Record<string, Schema> = {};
  for (const p of populated) {
    if (!(p.schemaName in schemas)) {
      schemas[p.schemaName] = {
        name: p.schemaName,
        ...emptySchema,
      };
    }
    // @ts-ignore
    schemas[p.schemaName][`${p.kind}s`] = [
      ...schemas[p.schemaName][`${p.kind}s`],
      p,
    ];
  }

  const result = options?.resolveViews ? resolveViewColumns(schemas) : schemas;

  options?.onProgressEnd?.();

  await db.destroy();
  return result;
}

export default extractSchemas;
