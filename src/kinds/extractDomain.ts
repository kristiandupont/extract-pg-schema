import { type DbConnection, query } from "../db";

import type InformationSchemaDomain from "../information_schema/InformationSchemaDomain";
import type PgType from "./PgType";

/**
 * Domain type in a schema.
 */
export interface DomainDetails extends PgType<"domain"> {
  /**
   * Qualified name of the inner type of the domain.
   */
  innerType: string;

  /**
   * Information schema value for the domain.
   */
  informationSchemaValue: InformationSchemaDomain;
}

const extractDomain = async (
  db: DbConnection,
  domain: PgType<"domain">,
): Promise<DomainDetails> => {
  const rows = await query(
    db,
    `
    SELECT
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
    { domain_name: domain.name, schema_name: domain.schemaName },
  );

  return {
    ...domain,
    ...rows[0],
  };
};

export default extractDomain;
