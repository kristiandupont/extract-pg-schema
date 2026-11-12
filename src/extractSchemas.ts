import type { ConnectionConfig } from "pg";
import { Client } from "pg";

import { type DbConnection, query } from "./db";

import type { CompositeTypeDetails } from "./kinds/extractCompositeType";
import extractCompositeType from "./kinds/extractCompositeType";
import type { DomainDetails } from "./kinds/extractDomain";
import extractDomain from "./kinds/extractDomain";
import type { EnumDetails } from "./kinds/extractEnum";
import extractEnum from "./kinds/extractEnum";
import type { ForeignTableDetails } from "./kinds/extractForeignTable";
import extractForeignTable from "./kinds/extractForeignTable";
import type { FunctionDetails } from "./kinds/extractFunction";
import extractFunction from "./kinds/extractFunction";
import type { MaterializedViewDetails } from "./kinds/extractMaterializedView";
import extractMaterializedView from "./kinds/extractMaterializedView";
import type { ProcedureDetails } from "./kinds/extractProcedure";
import extractProcedure from "./kinds/extractProcedure";
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
  foreignTable: ForeignTableDetails;
  materializedView: MaterializedViewDetails;
  view: ViewDetails;
  compositeType: CompositeTypeDetails;
  function: FunctionDetails;
  procedure: ProcedureDetails;
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
  foreignTables: ForeignTableDetails[];
  views: ViewDetails[];
  materializedViews: MaterializedViewDetails[];
  compositeTypes: CompositeTypeDetails[];
  functions: FunctionDetails[];
  procedures: ProcedureDetails[];
};

const emptySchema: Omit<Schema, "name"> = {
  domains: [],
  enums: [],
  ranges: [],
  tables: [],
  foreignTables: [],
  views: [],
  materializedViews: [],
  compositeTypes: [],
  functions: [],
  procedures: [],
};

type Populator<K extends Kind> = (
  db: DbConnection,
  pgType: PgType<K>,
) => Promise<DetailsMap[K] | DetailsMap[K][]>;

const populatorMap: { [K in Kind]: Populator<K> } = {
  domain: extractDomain,
  enum: extractEnum,
  range: extractRange,
  table: extractTable,
  foreignTable: extractForeignTable,
  view: extractView,
  materializedView: extractMaterializedView,
  compositeType: extractCompositeType,
  function: extractFunction,
  procedure: extractProcedure,
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
  const { db, close } = await connect(connectionConfig);
  try {
    return await extractFromConnection(db, options);
  } finally {
    await close();
  }
}

/**
 * Opens a PGlite database for `file:` connection strings, and a `pg` client
 * for everything else.
 */
async function connect(
  connectionConfig: string | ConnectionConfig,
): Promise<{ db: DbConnection; close: () => Promise<void> }> {
  if (
    typeof connectionConfig === "string" &&
    connectionConfig.startsWith("file:")
  ) {
    const { PGlite } = await import("@electric-sql/pglite");
    const pglite = new PGlite(connectionConfig.slice("file:".length));
    return { db: pglite, close: () => pglite.close() };
  }

  const client = new Client(connectionConfig);
  await client.connect();
  return { db: client, close: () => client.end() };
}

async function extractFromConnection(
  db: DbConnection,
  options?: ExtractSchemaOptions,
): Promise<Record<string, Schema>> {
  const schemaRows = await query<{ nspname: string }>(
    db,
    `SELECT nspname FROM pg_catalog.pg_namespace
    WHERE nspname <> 'information_schema'
      AND nspname NOT LIKE 'pg\\_%'`,
  );
  const allSchemaNames = schemaRows.map((row) => row.nspname);

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

  // The extractors run one at a time, because a single connection can only
  // run one query at a time.
  const populated: DetailsMap[Kind][] = [];
  for (const pgType of typesToExtract) {
    const result = await (
      populatorMap[pgType.kind] as Populator<typeof pgType.kind>
    )(db, pgType);
    populated.push(...(Array.isArray(result) ? result : [result]));
    options?.onProgress?.();
  }

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

  return result;
}

export default extractSchemas;
