import type { Knex } from "knex";

import type InformationSchemaRoutine from "../information_schema/InformationSchemaRoutine";
import { parsePostgresArray } from "./parsePostgresArray";
import type PgType from "./PgType";

const parameterModeMap = {
  i: "IN",
  o: "OUT",
  b: "INOUT",
  v: "VARIADIC",
  t: "TABLE",
} as const;

type ParameterMode = (typeof parameterModeMap)[keyof typeof parameterModeMap];

export type FunctionParameter = {
  name: string;
  type: string;
  mode: ParameterMode;
  hasDefault: boolean;
  ordinalPosition: number;
};

const volatilityMap = {
  i: "IMMUTABLE",
  s: "STABLE",
  v: "VOLATILE",
} as const;

type FunctionVolatility = (typeof volatilityMap)[keyof typeof volatilityMap];

const parallelSafetyMap = {
  s: "SAFE",
  r: "RESTRICTED",
  u: "UNSAFE",
} as const;

type FunctionParallelSafety =
  (typeof parallelSafetyMap)[keyof typeof parallelSafetyMap];

interface TableColumn {
  name: string;
  type: string;
}

interface TableReturnType {
  type: "table";
  columns: TableColumn[];
}

export interface FunctionDetails extends PgType<"function"> {
  parameters: FunctionParameter[];
  returnType: string | TableReturnType;
  language: string;
  definition: string;
  isStrict: boolean;
  isSecurityDefiner: boolean;
  isLeakProof: boolean;
  returnsSet: boolean;
  volatility: FunctionVolatility;
  parallelSafety: FunctionParallelSafety;
  estimatedCost: number;
  estimatedRows: number | null;
  comment: string | null;
  informationSchemaValue: InformationSchemaRoutine;
}

async function extractFunction(
  db: Knex,
  pgType: PgType<"function">,
): Promise<FunctionDetails> {
  const [informationSchemaValue] = await db
    .from("information_schema.routines")
    .where({
      routine_name: pgType.name,
      routine_schema: pgType.schemaName,
    })
    .select("*");

  const { rows } = await db.raw(
    `
    SELECT 
      p.proname,
      p.prorettype::regtype::text AS return_type,
      l.lanname AS language,
      p.prosrc AS definition,
      p.proisstrict AS is_strict,
      p.prosecdef AS is_security_definer,
      p.proleakproof AS is_leak_proof,
      p.proretset AS returns_set,
      p.provolatile,
      p.proparallel,
      p.procost AS estimated_cost,
      CASE WHEN p.proretset THEN p.prorows ELSE NULL END AS estimated_rows,
      d.description AS comment,
      p.proargmodes,
      p.proargnames,
      array_to_string(COALESCE(p.proallargtypes::regtype[], p.proargtypes::regtype[]), ',') AS arg_types,
      p.pronargdefaults,
      pg_get_function_arguments(p.oid) AS arg_list,
      pg_get_function_identity_arguments(p.oid) AS identity_args,
      pg_get_function_result(p.oid) as full_return_type
    FROM pg_proc p
    LEFT JOIN pg_namespace n ON n.oid = p.pronamespace
    LEFT JOIN pg_description d ON d.objoid = p.oid
    LEFT JOIN pg_language l ON l.oid = p.prolang
    WHERE n.nspname = ? AND p.proname = ?`,
    [pgType.schemaName, pgType.name],
  );

  const row = rows[0];

  const argTypes = (row.arg_types ? row.arg_types.split(",") : []) as string[];

  const paramModes = row.proargmodes
    ? parsePostgresArray(String(row.proargmodes))
    : argTypes.map(() => "i");

  const paramNames = row.proargnames
    ? parsePostgresArray(String(row.proargnames))
    : argTypes.map((_, i) => `$${i + 1}`);

  const parameters: FunctionParameter[] = argTypes.map(
    (type: string, i: number) => ({
      name: paramNames[i],
      type: type,
      mode: parameterModeMap[paramModes[i] as keyof typeof parameterModeMap],
      hasDefault: i >= argTypes.length - (row.pronargdefaults || 0),
      ordinalPosition: i + 1,
    }),
  );

  let returnType: string | TableReturnType = row.return_type;
  if (
    row.full_return_type &&
    row.full_return_type.toLowerCase().includes("table")
  ) {
    const tableMatch = (row.full_return_type as string).match(/TABLE\((.*)\)/i);
    if (tableMatch) {
      const columnDefs = tableMatch[1].split(",").map((col) => {
        const [name, type] = col.trim().split(/\s+/);
        return { name, type };
      });

      returnType = {
        type: "table",
        columns: columnDefs,
      };
    }
  }

  return {
    ...pgType,
    parameters,
    returnType,
    language: row.language,
    definition: row.definition,
    isStrict: row.is_strict,
    isSecurityDefiner: row.is_security_definer,
    isLeakProof: row.is_leak_proof,
    returnsSet: row.returns_set,
    volatility: volatilityMap[
      row.provolatile as keyof typeof volatilityMap
    ] as FunctionVolatility,
    parallelSafety: parallelSafetyMap[
      row.proparallel as keyof typeof parallelSafetyMap
    ] as FunctionParallelSafety,
    estimatedCost: row.estimated_cost,
    estimatedRows: row.estimated_rows,
    comment: row.comment,
    informationSchemaValue,
  };
}

export default extractFunction;
