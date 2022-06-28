import { Knex } from 'knex';

import InformationSchemaColumn from '../information_schema/InformationSchemaColumn';
import InformationSchemaTable from '../information_schema/InformationSchemaTable';
import PgType from './PgType';

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
  comment: string;
  defaultValue: any;
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
  table: PgType<'table'>
): Promise<TableDetails> => {
  const [informationSchemaValue] = await db
    .from('information_schema.tables')
    .where({
      table_name: table.name,
      table_schema: table.schemaName,
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
      ('"' || "domain_schema" || '"."' || "domain_name" || '"')::regtype::text AS "domain__",
      udt_name::text,
        ('"' || "udt_schema" || '"."' || "udt_name" || '"')::regtype::text as __type__,
      CASE WHEN data_type = 'ARRAY' THEN 
        ('"' || "udt_schema" || '"."' || "udt_name" || '"')::regtype::text
      ELSE
        udt_name::text
      END AS "type", 
      CASE WHEN data_type = 'ARRAY' THEN 
        SUBSTRING(udt_name::text, 2)
      ELSE
        udt_name::text
      END AS "subType", 
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
    { table_name: table.name, schema_name: table.schemaName }
  );

  const columns = columnsQuery.rows;

  return { informationSchemaValue, columns };
};

export default extractTable;
