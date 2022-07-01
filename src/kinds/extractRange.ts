import { Knex } from 'knex';

import PgType from './PgType';

export type RangeDetails = {
  innerType: string;
};

const extractRange = async (
  db: Knex,
  pgRange: PgType<'range'>
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
    { type_name: pgRange.name, schema_name: pgRange.schemaName }
  );

  const rangeDetails: RangeDetails = query.rows[0];

  return rangeDetails;
};

export default extractRange;
