import { Knex } from 'knex';

import InformationSchemaDomain from '../information_schema/InformationSchemaDomain';
import PgType from './PgType';

export type EnumDetails = {
  name: string;
  values: string[];

  informationSchemaValue: InformationSchemaDomain;
};

const extractEnum = async (
  db: Knex,
  domain: PgType<'domain'>
): Promise<EnumDetails> => {
  const query = await db.raw(
    `
    SELECT
      domain_name as "name",
      udt_name as "type",
      row_to_json(.*) AS "informationSchemaValue"
    FROM
      information_schema.domains
    WHERE
      domain_name = :domain_name
      AND domain_schema = :schema_name;
    `,
    { domain_name: domain.name, schema_name: domain.schemaName }
  );

  const enumDetails: EnumDetails = query.rows[0];

  return enumDetails;
};

export default extractEnum;
