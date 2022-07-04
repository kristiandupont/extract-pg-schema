import { Knex } from 'knex';

import PgType from './PgType';

export interface RangeDetails extends PgType<'range'> {
  innerType: string;
}

const extractRange = async (
  db: Knex,
  range: PgType<'range'>
): Promise<RangeDetails> => {
  const query = await db.raw(
    `
    SELECT
      subtype.typname as "innerType"
    FROM
      pg_type range_type
      JOIN pg_namespace ON range_type.typnamespace = pg_namespace.oid
      JOIN pg_range ON range_type.oid = pg_range.rngtypid
      JOIN pg_type subtype ON pg_range.rngsubtype = subtype.oid
    WHERE
      pg_namespace.nspname = :schema_name
      AND range_type.typname = :type_name
    `,
    { type_name: range.name, schema_name: range.schemaName }
  );

  return {
    ...range,
    ...query.rows[0],
  };
};

export default extractRange;
