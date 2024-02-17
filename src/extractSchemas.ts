import type { Knex } from "knex";
import knex from "knex";
import type { ConnectionConfig } from "pg";
import * as R from "ramda";

import type { CompositeTypeDetails } from "./kinds/extractCompositeType";
import extractCompositeType from "./kinds/extractCompositeType";
import type { DomainDetails } from "./kinds/extractDomain";
import extractDomain from "./kinds/extractDomain";
import type { EnumDetails } from "./kinds/extractEnum";
import extractEnum from "./kinds/extractEnum";
import type { MaterializedViewDetails } from "./kinds/extractMaterializedView";
import extractMaterializedView from "./kinds/extractMaterializedView";
import type { RangeDetails } from "./kinds/extractRange";
import extractRange from "./kinds/extractRange";
import type { TableDetails } from "./kinds/extractTable";
import extractTable from "./kinds/extractTable";
import type { ViewDetails } from "./kinds/extractView";
import extractView from "./kinds/extractView";
import fetchTypes from "./kinds/fetchTypes";
import type { Kind } from "./kinds/PgType";
import type PgType from "./kinds/PgType";
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

type Populator<K extends Kind> = (
  db: Knex,
  pgType: PgType<K>,
) => Promise<DetailsMap[K]>;

const populatorMap: { [K in Kind]: Populator<K> } = {
  domain: extractDomain,
  enum: extractEnum,
  range: extractRange,
  table: extractTable,
  view: extractView,
  materializedView: extractMaterializedView,
  compositeType: extractCompositeType,
};

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
      const result = await (
        populatorMap[pgType.kind] as Populator<typeof pgType.kind>
      )(db, pgType);
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
    (schemas[p.schemaName][`${p.kind}s`] as DetailsMap[typeof p.kind][]) = [
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
