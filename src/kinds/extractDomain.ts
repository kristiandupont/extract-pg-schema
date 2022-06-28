import { Knex } from 'knex';

import InformationSchemaDomain from '../information_schema/InformationSchemaDomain';
import PgType from './PgType';

export type DomainDetails = {
  name: string;
  type: string;

  informationSchemaValue: InformationSchemaDomain;
};

const extractDomain = async (
  db: Knex,
  domain: PgType<'domain'>
): Promise<DomainDetails> => {
  const query = await db.raw(
    `
    SELECT
      domain_name as "name",
      udt_name as "type",
      row_to_json(domains.*) AS "informationSchemaValue"
    FROM
      information_schema.domains
    WHERE
      domain_name = :domain_name
      AND domain_schema = :schema_name;
    `,
    { domain_name: domain.name, schema_name: domain.schemaName }
  );

  const domainDetails: DomainDetails = query.rows[0];

  return domainDetails;
};

export default extractDomain;
