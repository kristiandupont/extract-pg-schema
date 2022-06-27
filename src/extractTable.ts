import { Knex } from 'knex';

import { PgType } from './fetchTypes';

type YesNo = 'YES' | 'NO';

type InformationSchemaTable = {
  table_catalog: string;
  table_schema: string;
  table_name: string;
  table_type: 'BASE TABLE' | 'VIEW' | 'FOREIGN' | 'LOCAL TEMPORARY';
  self_referencing_column_name: string | null;
  reference_generation: string | null;
  user_defined_type_catalog: string | null;
  user_defined_type_schema: string | null;
  user_defined_type_name: string | null;
  is_insertable_into: YesNo;
  is_typed: YesNo;
  commit_action: any;
};

type InformationSchemaColumn = {
  table_catalog: string;
  table_schema: string;
  table_name: string;
  column_name: string;
  ordinal_position: number;
  column_default: any;
  is_nullable: YesNo;
  data_type: string;
  character_maximum_length: number | null;
  character_octet_length: number | null;
  numeric_precision: number | null;
  numeric_precision_radix: number;
  numeric_scale: number | null;
  datetime_precision: number | null;
  interval_type: string | null;
  interval_precision: number | null;
  character_set_catalog: string | null;
  character_set_schema: string | null;
  character_set_name: string | null;
  collation_catalog: string | null;
  collation_schema: string | null;
  collation_name: string | null;
  domain_catalog: string | null;
  domain_schema: string | null;
  domain_name: string | null;
  udt_catalog: string;
  udt_schema: string;
  udt_name: string;
  scope_catalog: string | null;
  scope_schema: string | null;
  scope_name: string | null;
  maximum_cardinality: null;
  dtd_identifier: string;
  is_self_referencing: YesNo;
  is_identity: YesNo;
  identity_generation: 'ALWAYS' | 'BY DEFAULT' | null;
  identity_start: string | null;
  identity_increment: string | null;
  identity_maximum: string | null;
  identity_minimum: string | null;
  identity_cycle: string;
  is_generated: 'ALWAYS' | 'NEVER';
  generation_expression: any;
  is_updatable: YesNo;
};

const updateActionMap = {
  a: 'NO ACTION',
  r: 'RESTRICT',
  c: 'CASCADE',
  n: 'SET NULL',
  d: 'SET DEFAULT',
} as const;

type UpdateAction = typeof updateActionMap[keyof typeof updateActionMap];

type ColumnReference = {
  schemanName: string;
  tableName: string;
  columnName: string;
  onDelete: UpdateAction;
  onUpdate: UpdateAction;
};

type Index = {
  name: string;
  isPrimary: boolean;
};

type Column = {
  name: string;
  type: string;
  isArray: boolean;
  reference: ColumnReference | null;
  indices: Index[];
  isNullable: boolean;
  isPrimaryKey: boolean;
  isUnique: boolean;
  isForeignKey: boolean;
  generated: 'ALWAYS' | 'NEVER' | 'BY DEFAULT';
  isUpdatable: boolean;
  isIdentity: boolean;
  ordinalPosition: number;

  /**
   * For views, this will contain the original column, if it could be determined.
   * If schema is undefined, it means "same schema as the view".
   */
  source?: { schema: string | undefined; table: string; column: string };

  informationSchemaValue: InformationSchemaColumn;
};

export type TableDetails = {
  informationSchemaValue: InformationSchemaTable;
  columns: Column[];
};

const extractTable = async (
  db: Knex,
  tableOrView: PgType
): Promise<TableDetails> => {
  const [informationSchemaValue] = await db
    .from('information_schema.tables')
    .where({
      table_name: tableOrView.name,
      table_schema: tableOrView.schemaName,
    })
    .select<InformationSchemaTable[]>('*');

  const columnsQuery = await db.raw(
    `
    WITH reference_map AS (
      SELECT
        source_attr.attname AS "column_name",
        json_build_object(
            'schema', expanded_constraint.target_schema,
            'table', expanded_constraint.target_table,
          'column', target_attr.attname,
          'onUpdate', case expanded_constraint.confupdtype
            ${Object.entries(updateActionMap)
              .map(([key, action]) => `when '${key}' then '${action}'`)
              .join('\n')}
            end,
          'onDelete', case expanded_constraint.confdeltype
            ${Object.entries(updateActionMap)
              .map(([key, action]) => `when '${key}' then '${action}'`)
              .join('\n')}
            end
          ) AS reference
      FROM (
        SELECT
          unnest(conkey) AS "source_attnum",
          unnest(confkey) AS "target_attnum",
          target_namespace.nspname as "target_schema",
          target_class.relname as "target_table",
          confrelid,
          conrelid,
          conname,
          confupdtype,
          confdeltype
        FROM
          pg_constraint
          JOIN pg_class source_class ON conrelid = source_class.oid
          JOIN pg_namespace source_namespace ON source_class.relnamespace = source_namespace.oid
    
          JOIN pg_class target_class ON confrelid = target_class.oid
          JOIN pg_namespace target_namespace ON target_class.relnamespace = target_namespace.oid
        WHERE
          source_class.relname = :table_name
          AND source_namespace.nspname = :schema_name
          AND contype = 'f') expanded_constraint
        JOIN pg_attribute target_attr ON target_attr.attrelid = expanded_constraint.confrelid
          AND target_attr.attnum = expanded_constraint.target_attnum
        JOIN pg_attribute source_attr ON source_attr.attrelid = expanded_constraint.conrelid
          AND source_attr.attnum = expanded_constraint.source_attnum
        JOIN pg_class target_class ON target_class.oid = expanded_constraint.confrelid
      WHERE
        target_class.relispartition = FALSE
    ),
    index_map AS (
      SELECT
        a.attname AS column_name,
        bool_or(ix.indisprimary) AS is_primary,
        json_agg(json_build_object(
            'name', i.relname,
            'isPrimary', ix.indisprimary)
            ) AS indices
      FROM
        pg_class t,
        pg_class i,
        pg_index ix,
        pg_attribute a
      WHERE
        t.oid = ix.indrelid
        AND i.oid = ix.indexrelid
        AND a.attrelid = t.oid
        AND a.attnum = ANY (ix.indkey)
        AND t.relkind = 'r'
        AND t.relname = :table_name
      GROUP BY
        a.attname
    )
    SELECT
      columns.column_name AS name,
      CASE WHEN data_type = 'ARRAY' THEN 
        ('"' || "udt_schema" || '"."' || "udt_name" || '"')::regtype::text
      ELSE
        udt_name::text
      END AS "type", 
      udt_name AS "subType", 
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
      COALESCE(index_map.is_primary, FALSE) AS "isPrimaryKey", 
      COALESCE(index_map.indices, '[]'::json) AS "indices", 
      reference_map.reference AS "reference", 
      
      row_to_json(columns.*) AS "informationSchemaValue"
    FROM
      information_schema.columns
      LEFT JOIN index_map ON index_map.column_name = columns.column_name
      LEFT JOIN reference_map ON reference_map.column_name = columns.column_name
    WHERE
      table_name = :table_name
      AND table_schema = :schema_name;
    
  `,
    { table_name: tableOrView.name, schema_name: tableOrView.schemaName }
  );

  const columns = columnsQuery.rows;

  return { informationSchemaValue, columns };
};

export default extractTable;
