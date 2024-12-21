import type { Knex } from "knex";

import type PgType from "./PgType";

export type ProcedureDetails = {
  name: string;
  schemaName: string;
  kind: "procedure";
  comment: string | null;
  argumentTypes: string[];
  argumentNames: string[];
};

async function extractProcedure(
  db: Knex,
  pgType: PgType<"procedure">,
): Promise<ProcedureDetails> {
  const { rows } = await db.raw(
    `SELECT proname, proargtypes::regtype[] AS argument_types,
            proargnames AS argument_names, description
     FROM pg_proc p
     LEFT JOIN pg_namespace n ON n.oid = p.pronamespace
     LEFT JOIN pg_description d ON d.objoid = p.oid
     WHERE n.nspname = ? AND p.proname = ? AND p.prokind = 'p'`,
    [pgType.schemaName, pgType.name],
  );

  return {
    name: rows[0].proname,
    schemaName: pgType.schemaName,
    kind: "procedure",
    comment: rows[0].description ?? null,
    argumentTypes: Array.isArray(rows[0].argument_types)
      ? rows[0].argument_types
      : [],
    argumentNames: Array.isArray(rows[0].argument_names)
      ? rows[0].argument_names
      : [],
  };
}

export default extractProcedure;
