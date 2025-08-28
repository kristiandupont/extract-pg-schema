import type { Knex } from "knex";

import type InformationSchemaRoutine from "../information_schema/InformationSchemaRoutine";
import { parsePostgresArray } from "./parsePostgresArray";
import type PgType from "./PgType";

// Reuse these from extractFunction.ts
const parameterModeMap = {
  i: "IN",
  o: "OUT",
  b: "INOUT",
  v: "VARIADIC",
  t: "TABLE",
} as const;

type ParameterMode = (typeof parameterModeMap)[keyof typeof parameterModeMap];

export type ProcedureParameter = {
  name: string;
  type: string;
  mode: ParameterMode;
  hasDefault: boolean;
  ordinalPosition: number;
};

const parallelSafetyMap = {
  s: "SAFE",
  r: "RESTRICTED",
  u: "UNSAFE",
} as const;

type FunctionParallelSafety =
  (typeof parallelSafetyMap)[keyof typeof parallelSafetyMap];

export type ProcedureDetails = {
  name: string;
  schemaName: string;
  kind: "procedure";
  comment: string | null;
  parameters: ProcedureParameter[];
  language: string;
  definition: string;
  isSecurityDefiner: boolean;
  isLeakProof: boolean;
  parallelSafety: FunctionParallelSafety;
  estimatedCost: number;
  informationSchemaValue: InformationSchemaRoutine;
};

async function extractProcedure(
  db: Knex,
  pgType: PgType<"procedure">,
): Promise<ProcedureDetails> {
  const { rows } = await db.raw(
    `SELECT 
      p.proname,
      l.lanname AS language,
      p.prosrc AS definition,
      p.prosecdef AS is_security_definer,
      p.proleakproof AS is_leak_proof,
      p.proparallel,
      p.procost AS estimated_cost,
      d.description AS comment,
      p.proargmodes,
      p.proargnames,
      array_to_string(COALESCE(p.proallargtypes::regtype[], p.proargtypes::regtype[]), ',') AS arg_types,
      p.pronargdefaults
    FROM pg_proc p
    LEFT JOIN pg_namespace n ON n.oid = p.pronamespace
    LEFT JOIN pg_description d ON d.objoid = p.oid
    LEFT JOIN pg_language l ON l.oid = p.prolang
    WHERE n.nspname = ? AND p.proname = ? AND p.prokind = 'p'`,
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

  const parameters: ProcedureParameter[] = argTypes.map(
    (type: string, i: number) => ({
      name: paramNames[i],
      type: type,
      mode: parameterModeMap[paramModes[i] as keyof typeof parameterModeMap],
      hasDefault: i >= argTypes.length - (row.pronargdefaults ?? 0),
      ordinalPosition: i + 1,
    }),
  );

  const [informationSchemaValue] = await db
    .select("*")
    .from("information_schema.routines")
    .where({
      routine_schema: pgType.schemaName,
      routine_name: pgType.name,
      routine_type: "PROCEDURE",
    });

  return {
    ...pgType,
    parameters,
    language: row.language,
    definition: row.definition,
    isSecurityDefiner: row.is_security_definer,
    isLeakProof: row.is_leak_proof,
    parallelSafety: parallelSafetyMap[
      row.proparallel as keyof typeof parallelSafetyMap
    ] as FunctionParallelSafety,
    estimatedCost: row.estimated_cost,
    comment: row.comment,
    informationSchemaValue,
  };
}

export default extractProcedure;
