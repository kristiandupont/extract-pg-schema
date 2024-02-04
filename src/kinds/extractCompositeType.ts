import { Knex } from "knex";

import InformationSchemaColumn from "../information_schema/InformationSchemaColumn";
import PgType from "./PgType";
import commentMapQueryPart from "./query-parts/commentMapQueryPart";
import fakeInformationSchemaColumnsQueryPart from "./query-parts/fakeInformationSchemaColumnsQueryPart";

/**
 * Attribute type in a composite type.
 */
export type AttributeType = {
  /**
   * Qualified name of the type.
   */
  fullName: string;
  /**
   * Kind of the type.
   */
  kind: "base" | "range" | "domain" | "composite" | "enum";
};

/**
 * Attribute of a composite type.
 */
export interface CompositeTypeAttribute {
  /**
   * Attribute name.
   */
  name: string;
  /**
   * Expanded type name. If the type is an array, brackets will be appended
   * to the type name.
   */
  expandedType: string;
  /**
   * Type information.
   */
  type: AttributeType;
  /**
   * Comment on the attribute.
   */
  comment: string | null;
  /**
   * Default value of the attribute.
   */
  defaultValue: any;
  /**
   * Whether the attribute is an array.
   */
  isArray: boolean;
  /**
   * Maximum length of the attribute.
   */
  maxLength: number | null;
  /**
   * Whether the attribute is nullable.
   */
  isNullable: boolean;
  /**
   * Behavior of the generated attribute. "ALWAYS" if always generated,
   * "NEVER" if never generated, "BY DEFAULT" if generated when a value
   * is not provided.
   */
  generated: "ALWAYS" | "NEVER" | "BY DEFAULT";
  /**
   * Whether the attribute is updatable.
   */
  isUpdatable: boolean;
  /**
   * Whether the attribute is an identity attribute.
   */
  isIdentity: boolean;
  /**
   * Ordinal position of the attribute in the composite type. Starts from 1.
   */
  ordinalPosition: number;

  /**
   * The Postgres information_schema views do not contain info about materialized views.
   * This value is the result of a query that matches the one for regular views.
   * Use with caution, not all fields are guaranteed to be meaningful and/or accurate.
   */
  fakeInformationSchemaValue: InformationSchemaColumn;
}

/**
 * Composite type in a schema.
 */
export interface CompositeTypeDetails extends PgType<"compositeType"> {
  /**
   * Attributes of the composite type.
   */
  attributes: CompositeTypeAttribute[];
}

// NOTE: This is NOT identical for the one for tables.
// The dimension field is not present for materialized views, so we
// deduce whether or not it is an array by checking the type.
const typeMapQueryPart = `
  select
    pg_attribute.attname as "column_name",
    typnamespace::regnamespace::text||'.'||(case when (t.typelem <> 0::oid AND t.typlen = '-1'::integer) then substring(typname, 2)||'[]' else typname end)::text as "expanded_name",
    json_build_object(
      'fullName', typnamespace::regnamespace::text||'.'||substring(typname, (case when (t.typelem <> 0::oid AND t.typlen = '-1'::integer) then 2 else 1 end))::text,
      'kind', case 
        when typtype = 'd' then 'domain'
        when typtype = 'r' then 'range'
        when typtype = 'c' then 'composite'
        when typtype = 'e' then 'enum'
        when typtype = 'b' then COALESCE((select case 
          when i.typtype = 'r' then 'range' 
          when i.typtype = 'd' then 'domain' 
          when i.typtype = 'c' then 'composite' 
          when i.typtype = 'e' then 'enum' 
        end as inner_kind from pg_type i where i.oid = t.typelem), 'base')
      ELSE 'unknown'
      end
    ) as "type_info"
  from pg_type t
  join pg_attribute on pg_attribute.atttypid = t.oid
  join pg_class on pg_attribute.attrelid = pg_class.oid
  join pg_namespace on pg_class.relnamespace = pg_namespace.oid
  WHERE
    pg_namespace.nspname = :schema_name
    and pg_class.relname = :table_name
`;

const extractCompositeType = async (
  db: Knex,
  compositeType: PgType<"compositeType">,
): Promise<CompositeTypeDetails> => {
  const columnsQuery = await db.raw(
    `
    WITH 
    fake_info_schema_columns AS (
      ${fakeInformationSchemaColumnsQueryPart}
    ),
    type_map AS (
      ${typeMapQueryPart}
    ),
    comment_map AS (
      ${commentMapQueryPart}
    )
    SELECT
      columns.column_name AS "name",
      type_map.expanded_name AS "expandedType",
      type_map.type_info AS "type",
      comment_map.comment AS "comment",
      character_maximum_length AS "maxLength", 
      column_default AS "defaultValue", 
      is_nullable = 'YES' AS "isNullable", 
      data_type = 'ARRAY' AS "isArray", 
      is_identity = 'YES' AS "isIdentity", 
      is_updatable = 'YES' AS "isUpdatable", 
      ordinal_position AS "ordinalPosition", 
      CASE WHEN is_identity = 'YES' THEN
        identity_generation
      ELSE
        is_generated
      END AS "generated", 
      
      row_to_json(columns.*) AS "fakeInformationSchemaValue"
    FROM
      fake_info_schema_columns columns
      LEFT JOIN type_map ON type_map.column_name = columns.column_name
      LEFT JOIN comment_map ON comment_map.column_name = columns.column_name
    WHERE
      table_name = :table_name
      AND table_schema = :schema_name;
  `,
    { table_name: compositeType.name, schema_name: compositeType.schemaName },
  );

  const attributes = columnsQuery.rows;

  return { ...compositeType, attributes };
};

export default extractCompositeType;
