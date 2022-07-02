import { Knex } from 'knex';

import PgType from './PgType';

export interface EnumDetails {
  values: string[];
}

const extractEnum = async (
  db: Knex,
  pgEnum: PgType<'enum'>
): Promise<EnumDetails> => {
  const query = await db.raw(
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
    { type_name: pgEnum.name, schema_name: pgEnum.schemaName }
  );

  const enumDetails: EnumDetails = query.rows[0];

  return enumDetails;
};

export default extractEnum;
