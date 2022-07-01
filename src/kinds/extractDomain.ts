import { Knex } from 'knex';

import InformationSchemaDomain from '../information_schema/InformationSchemaDomain';
import PgType from './PgType';

export type DomainDetails = {
  name: string;
  innerType: string;

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
      i.typnamespace::regnamespace::text||'.'||i.typname as "innerType",
      row_to_json(domains.*) AS "informationSchemaValue"
    FROM
      information_schema.domains,
      pg_type t
    JOIN pg_type i on t.typbasetype = i.oid
    WHERE
      domain_name = :domain_name
      AND t.typname = :domain_name
      AND t.typtype = 'd'
      AND domain_schema = :schema_name
      AND t.typnamespace::regnamespace::text = :schema_name
    `,
    { domain_name: domain.name, schema_name: domain.schemaName }
  );

  const domainDetails: DomainDetails = query.rows[0];

  return domainDetails;
};

export default extractDomain;
