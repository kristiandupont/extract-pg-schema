import { type DbConnection, query } from "../db";

import type PgType from "./PgType";

/**
 * Enum type in a schema.
 */
export interface EnumDetails extends PgType<"enum"> {
  /**
   * Array of enum values in order.
   */
  values: string[];
}

const extractEnum = async (
  db: DbConnection,
  pgEnum: PgType<"enum">,
): Promise<EnumDetails> => {
  const rows = await query(
    db,
    `
    SELECT
      json_agg(pg_enum.enumlabel ORDER BY pg_enum.enumsortorder) as "values"
    FROM
      pg_type
      JOIN pg_namespace ON pg_type.typnamespace = pg_namespace.oid
      JOIN pg_enum ON pg_type.oid = pg_enum.enumtypid
    WHERE
      pg_type.typtype = 'e'
      AND pg_namespace.nspname = :schema_name
      AND typname = :type_name
    `,
    { type_name: pgEnum.name, schema_name: pgEnum.schemaName },
  );

  return {
    ...pgEnum,
    ...rows[0],
  };
};

export default extractEnum;
