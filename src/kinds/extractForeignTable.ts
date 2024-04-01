import type { Knex } from "knex";

import type InformationSchemaColumn from "../information_schema/InformationSchemaColumn";
import type InformationSchemaView from "../information_schema/InformationSchemaView";
import type PgType from "./PgType";
import commentMapQueryPart from "./query-parts/commentMapQueryPart";

/**
 * Column type in a foreign table.
 */
export type ForeignTableColumnType = {
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
 * Column in a foreign table.
 */
export interface ForeignTableColumn {
  /**
   * Column name.
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
  type: ForeignTableColumnType;
  /**
   * Comment on the column.
   */
  comment: string | null;
  /**
   * Default value of the column.
   */
  defaultValue: any;
  /**
   * Whether the column is an array.
   */
  isArray: boolean;
  /**
   * Maximum length of the column.
   */
  maxLength: number | null;
  /**
   * Behavior of the generated column. "ALWAYS" if always generated,
   * "NEVER" if never generated, "BY DEFAULT" if generated when a value
   * is not provided.
   */
  generated: "ALWAYS" | "NEVER" | "BY DEFAULT";
  /**
   * Whether the column is updatable.
   */
  isUpdatable: boolean;
  /**
   * Whether the column is an identity column.
   */
  isIdentity: boolean;
  /**
   * Ordinal position of the column in the view. Starts from 1.
   */
  ordinalPosition: number;

  /**
   * This will contain a "link" to the source table or view and column,
   * if it can be determined.
   */
  source: { schema: string; table: string; column: string } | null;

  /**
   * Whether the column is nullable. This is only present if the view is
   * resolved.
   */
  isNullable?: boolean;
  /**
   * Whether the column is a primary key. This is only present if the view is
   * resolved.
   */
  isPrimaryKey?: boolean;

  /**
   * Information schema value for the column.
   */
  informationSchemaValue: InformationSchemaColumn;
}

/**
 * Foreign table in a schema.
 */
export interface ForeignTableDetails extends PgType<"foreignTable"> {
  /**
   * Information schema value for the view.
   */
  informationSchemaValue: InformationSchemaView;
  /**
   * Columns in the view.
   */
  columns: ForeignTableColumn[];
}

const typeMapQueryPart = `
select
  pg_attribute.attname as "column_name",
  typnamespace::regnamespace::text||'.'||substring(typname, (case when attndims > 0 then 2 else 1 end))::text||repeat('[]', attndims) as "expanded_name",
  attndims as "dimensions",
  json_build_object(
	  'fullName', typnamespace::regnamespace::text||'.'||substring(typname, (case when attndims > 0 then 2 else 1 end))::text,
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

const extractForeignTable = async (
  db: Knex,
  foreignTable: PgType<"foreignTable">,
): Promise<ForeignTableDetails> => {
  const [informationSchemaValue] = await db
    .from("information_schema.tables")
    .where({
      table_name: foreignTable.name,
      table_schema: foreignTable.schemaName,
    })
    .select<InformationSchemaView[]>("*");

  const columnsQuery = await db.raw(
    `
    WITH 
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
      data_type = 'ARRAY' AS "isArray", 
      is_identity = 'YES' AS "isIdentity", 
      is_updatable = 'YES' AS "isUpdatable", 
      ordinal_position AS "ordinalPosition", 
      CASE WHEN is_identity = 'YES' THEN
        identity_generation
      ELSE
        is_generated
      END AS "generated", 
      
      row_to_json(columns.*) AS "informationSchemaValue"
    FROM
      information_schema.columns
      LEFT JOIN type_map ON type_map.column_name = columns.column_name
      LEFT JOIN comment_map ON comment_map.column_name = columns.column_name
    WHERE
      table_name = :table_name
      AND table_schema = :schema_name;
  `,
    { table_name: foreignTable.name, schema_name: foreignTable.schemaName },
  );

  const columns: ForeignTableColumn[] = columnsQuery.rows;

  return {
    ...foreignTable,
    informationSchemaValue,
    columns,
  };
};

export default extractForeignTable;
