import type { Knex } from "knex";

import type InformationSchemaColumn from "../information_schema/InformationSchemaColumn";
import type InformationSchemaTable from "../information_schema/InformationSchemaTable";
import type { InformationSchemaTrigger } from "../information_schema/InformationSchemaTrigger";
import type PgType from "./PgType";
import commentMapQueryPart from "./query-parts/commentMapQueryPart";
import indexMapQueryPart from "./query-parts/indexMapQueryPart";
import inheritsQueryPart from "./query-parts/inheritsQueryPart";

export const updateActionMap = {
  a: "NO ACTION",
  r: "RESTRICT",
  c: "CASCADE",
  n: "SET NULL",
  d: "SET DEFAULT",
} as const;

export type UpdateAction =
  (typeof updateActionMap)[keyof typeof updateActionMap];

/**
 * Column reference.
 */
export type ColumnReference = {
  /**
   * Schema name of the referenced table.
   */
  schemaName: string;
  /**
   * Table name of the referenced column.
   */
  tableName: string;
  /**
   * Name of the referenced column.
   */
  columnName: string;
  /**
   * Action to take on delete.
   */
  onDelete: UpdateAction;
  /**
   * Action to take on update.
   */
  onUpdate: UpdateAction;
  /**
   * Name of the foreign key constraint.
   */
  name: string;
};

/**
 * Index for a column.
 */
export type Index = {
  /**
   * Name of the index.
   */
  name: string;
  /**
   * Whether the index is a primary key.
   */
  isPrimary: boolean;
};

/**
 * Column type in a table.
 */
export type TableColumnType = {
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
 * Check constraint on a table.
 */
export interface TableCheck {
  /**
   * Name of the check constraint.
   */
  name: string;
  /**
   * Check constraint clause.
   */
  clause: string;
}

/**
 * Column in a table.
 */
export interface TableColumn {
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
  type: TableColumnType;
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
   * Number of dimensions of the array type. 0 if not an array.
   */
  dimensions: number;
  /**
   * Array of references from this column.
   */
  references: ColumnReference[];
  /** @deprecated use references instead */
  reference: ColumnReference | null;
  /** @deprecated use TableDetails.indices instead */
  indices: Index[];
  /**
   * Maximum length of the column.
   */
  maxLength: number | null;
  /**
   * Whether the column is nullable.
   */
  isNullable: boolean;
  /**
   * Whether the column is a primary key.
   */
  isPrimaryKey: boolean;
  /**
   * Behavior of the generated column. "ALWAYS" if always generated,
   * "NEVER" if never generated, "BY DEFAULT" if generated when value
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
   * Ordinal position of the column in the table. Starts from 1.
   */
  ordinalPosition: number;
  /**
   * Name of the table the column is inherited from if table is using inheritance
   */
  parentTable: string | null;

  /**
   * Information schema value for the column.
   */
  informationSchemaValue: InformationSchemaColumn;
}

/**
 * Column in an index.
 */
export interface TableIndexColumn {
  /**
   * Column name or null if functional index.
   */
  name: string | null;
  /**
   * Definition of index column.
   */
  definition: string;
  /**
   * Predicate of the partial index or null if regular index.
   */
  predicate: string | null;
}

/**
 * Index on a table.
 */
export interface TableIndex {
  /**
   * Name of the index.
   */
  name: string;
  /**
   * Whether the index is a primary key.
   */
  isPrimary: boolean;
  /**
   * Whether the index is unique.
   */
  isUnique: boolean;
  /**
   * Array of index columns in order.
   */
  columns: TableIndexColumn[];
}

/**
 * Security policy on a table.
 */
export interface TableSecurityPolicy {
  /**
   * Name of the security policy.
   */
  name: string;
  /**
   * Whether the policy is permissive.
   */
  isPermissive: boolean;
  /**
   * Array of roles the policy is applied to. ["public"] if applied to all
   * roles.
   */
  rolesAppliedTo: string[];
  /**
   * Command type the policy applies to. "ALL" if all commands.
   */
  commandType: "ALL" | "SELECT" | "INSERT" | "UPDATE" | "DELETE";
  /**
   * Visibility expression of the policy specified by the USING clause.
   */
  visibilityExpression: string | null;
  /**
   * Modifiability expression of the policy specified by the WITH CHECK clause.
   */
  modifiabilityExpression: string | null;
}

/**
 * Trigger on a table or view.
 */
export interface Trigger {
  /** Name of the trigger. */
  name: string;
  /** Events that fire the trigger (INSERT, UPDATE, DELETE, TRUNCATE). */
  eventManipulation: ("INSERT" | "UPDATE" | "DELETE" | "TRUNCATE")[];
  /** Timing of the trigger (BEFORE, AFTER, INSTEAD OF). */
  actionTiming: "BEFORE" | "AFTER" | "INSTEAD OF";
  /** Schema of the function called by the trigger. */
  functionSchema: string;
  /** Name of the function called by the trigger. */
  functionName: string;
  /** Arguments passed to the function. */
  functionArgs: string[];
  /** Whether the trigger is enabled. */
  enabled: boolean;
  /** WHEN condition for the trigger, if any. */
  condition: string | null;
  /** Orientation: ROW or STATEMENT. */
  orientation: "ROW" | "STATEMENT";
  /** Comment on the trigger, if any. */
  comment: string | null;
  /** Information schema value for the trigger. */
  informationSchemaValue: InformationSchemaTrigger;
}

/**
 * Table in a schema.
 */
export interface TableDetails extends PgType<"table"> {
  /**
   * Array of columns in the table.
   */
  columns: TableColumn[];
  /**
   * Array of indices in the table.
   */
  indices: TableIndex[];
  /**
   * Array of check constraints in the table.
   */
  checks: TableCheck[];
  /**
   * Whether row level security is enabled on the table.
   */
  isRowLevelSecurityEnabled: boolean;
  /**
   * Whether row level security is enforced on the table.
   */
  isRowLevelSecurityEnforced: boolean;
  /**
   * Array of security policies on the table.
   */
  securityPolicies: TableSecurityPolicy[];
  /**
   * Information schema value for the table.
   */
  informationSchemaValue: InformationSchemaTable;
  triggers: Trigger[];
}

const referenceMapQueryPart = `
      SELECT
        source_attr.attname AS "column_name",
        json_agg(json_build_object(
            'schemaName', expanded_constraint.target_schema,
            'tableName', expanded_constraint.target_table,
            'columnName', target_attr.attname,
            'onUpdate', case expanded_constraint.confupdtype
              ${Object.entries(updateActionMap)
                .map(([key, action]) => `when '${key}' then '${action}'`)
                .join("\n")}
              end,
            'onDelete', case expanded_constraint.confdeltype
              ${Object.entries(updateActionMap)
                .map(([key, action]) => `when '${key}' then '${action}'`)
                .join("\n")}
              end,
            'name', expanded_constraint.conname
            )) AS references
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
      GROUP BY
        source_attr.attname
`;

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

const extractTable = async (
  db: Knex,
  table: PgType<"table">,
): Promise<TableDetails> => {
  const [informationSchemaValue] = await db
    .from("information_schema.tables")
    .where({
      table_name: table.name,
      table_schema: table.schemaName,
    })
    .select<InformationSchemaTable[]>("*");

  const columnsQuery = await db.raw(
    `
    WITH 
    reference_map AS (
      ${referenceMapQueryPart}
    ),
    index_map AS (
      ${indexMapQueryPart}
    ),
    type_map AS (
      ${typeMapQueryPart}
    ),
    comment_map AS (
      ${commentMapQueryPart}
    ),
    inheritance_map AS (
      ${inheritsQueryPart}
    )
    SELECT
      columns.column_name AS "name",
      type_map.expanded_name AS "expandedType",
      type_map.dimensions AS "dimensions",
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
      COALESCE(index_map.is_primary, FALSE) AS "isPrimaryKey", 
      COALESCE(index_map.indices, '[]'::json) AS "indices", 
      COALESCE(reference_map.references, '[]'::json) AS "references", 
      inheritance_map.parent_name AS "parentTable",

      row_to_json(columns.*) AS "informationSchemaValue"
    FROM
      information_schema.columns
      LEFT JOIN index_map ON index_map.column_name = columns.column_name
      LEFT JOIN reference_map ON reference_map.column_name = columns.column_name
      LEFT JOIN type_map ON type_map.column_name = columns.column_name
      LEFT JOIN comment_map ON comment_map.column_name = columns.column_name
      LEFT JOIN inheritance_map ON inheritance_map.parent_column_name = columns.column_name
    WHERE
      table_name = :table_name
      AND table_schema = :schema_name;
  `,
    { table_name: table.name, schema_name: table.schemaName },
  );

  const columns = columnsQuery.rows.map((row: any) => ({
    ...row,
    // Add this deprecated field for backwards compatibility
    reference: row.references[0] ?? null,
  }));

  const indicesQuery = await db.raw(
    `
    WITH index_columns AS (
      SELECT
        ix.indexrelid,
        json_agg(json_build_object(
          'name', a.attname,
          'definition', pg_get_indexdef(ix.indexrelid, keys.key_order::integer, true),
          'predicate', pg_get_expr(ix.indpred, ix.indrelid)
        ) ORDER BY keys.key_order) AS columns
      FROM
        pg_index ix
        CROSS JOIN unnest(ix.indkey) WITH ORDINALITY AS keys(key, key_order)
        LEFT JOIN pg_attribute a ON ix.indrelid = a.attrelid AND key = a.attnum
      GROUP BY ix.indexrelid, ix.indrelid
    )
    SELECT
      i.relname AS "name",
      ix.indisprimary AS "isPrimary",
      ix.indisunique AS "isUnique",
      index_columns.columns
    FROM
      pg_index ix
      INNER JOIN pg_class i ON ix.indexrelid = i.oid
      INNER JOIN pg_class t ON ix.indrelid = t.oid
      INNER JOIN pg_namespace n ON t.relnamespace = n.oid
      INNER JOIN index_columns ON ix.indexrelid = index_columns.indexrelid
    WHERE
      t.relname = :table_name
      AND n.nspname = :schema_name
    `,
    { table_name: table.name, schema_name: table.schemaName },
  );

  const indices = indicesQuery.rows as TableIndex[];

  const checkQuery = await db.raw(
    `
    SELECT
      source_namespace.nspname as "schema",
      source_class.relname as "table",
      json_agg(json_build_object(
                 'name', con.conname,
                 'clause', SUBSTRING(pg_get_constraintdef(con.oid) FROM 7)
      )) as checks
    FROM
     pg_constraint con,
     pg_class source_class,
     pg_namespace source_namespace 
    WHERE
     source_class.relname = :table_name
     AND source_namespace.nspname = :schema_name
     AND conrelid = source_class.oid 
     AND source_class.relnamespace = source_namespace.oid 
     AND con.contype = 'c'
    GROUP BY source_namespace.nspname, source_class.relname;
  `,
    { table_name: table.name, schema_name: table.schemaName },
  );

  const checks = checkQuery.rows
    .flatMap((row: any) => row.checks as TableCheck)
    .map(({ name, clause }: TableCheck) => {
      const numberOfBrackets =
        clause.startsWith("((") && clause.endsWith("))") ? 2 : 1;
      return {
        name,
        clause: clause.slice(
          numberOfBrackets,
          clause.length - numberOfBrackets,
        ),
      };
    });

  const rlsQuery = await db.raw(
    `
    SELECT
      c.relrowsecurity AS "isRowLevelSecurityEnabled",
      c.relforcerowsecurity AS "isRowLevelSecurityEnforced",
      coalesce(json_agg(json_build_object(
        'name', p.policyname,
        'isPermissive', p.permissive = 'PERMISSIVE',
        'rolesAppliedTo', p.roles,
        'commandType', p.cmd,
        'visibilityExpression', p.qual,
        'modifiabilityExpression', p.with_check
      )) FILTER (WHERE p.policyname IS NOT NULL), '[]'::json) AS "securityPolicies"
    FROM
      pg_class c
      INNER JOIN pg_namespace n ON c.relnamespace = n.oid
      LEFT JOIN pg_policies p ON c.relname = p.tablename AND n.nspname = p.schemaname
    WHERE
      c.relname = :table_name
      AND n.nspname = :schema_name
    GROUP BY c.relrowsecurity, c.relforcerowsecurity
    `,
    { table_name: table.name, schema_name: table.schemaName },
  );

  const rls = rlsQuery.rows[0] as {
    isRowLevelSecurityEnabled: boolean;
    isRowLevelSecurityEnforced: boolean;
    securityPolicies: TableSecurityPolicy[];
  };

  // --- Trigger extraction ---
  // 1. Get all trigger rows for this table from information_schema.triggers
  const triggersQuery = await db<InformationSchemaTrigger>(
    "information_schema.triggers",
  )
    .where({
      event_object_table: table.name,
      event_object_schema: table.schemaName,
    })
    .select();

  // 2. Group by trigger_name (since one trigger can have multiple event_manipulation rows)
  const triggersByName: Record<string, InformationSchemaTrigger[]> = {};
  for (const trig of triggersQuery) {
    if (!triggersByName[trig.trigger_name])
      triggersByName[trig.trigger_name] = [];
    triggersByName[trig.trigger_name].push(trig);
  }

  // 3. For each trigger, get extra info from pg_trigger, pg_proc, pg_namespace, and pg_description
  const triggers: Trigger[] = [];
  for (const [triggerName, triggerRows] of Object.entries(triggersByName)) {
    // Use the first row for static info
    const first = triggerRows[0];
    // Get pg_trigger row for this trigger
    const pgTriggerRow = await db
      .select("tgenabled", "tgfoid", "tgargs")
      .from("pg_trigger")
      .join("pg_class", "pg_class.oid", "=", "pg_trigger.tgrelid")
      .join("pg_namespace", "pg_namespace.oid", "=", "pg_class.relnamespace")
      .where("pg_class.relname", table.name)
      .andWhere("pg_namespace.nspname", table.schemaName)
      .andWhere("pg_trigger.tgname", triggerName)
      .first();
    if (!pgTriggerRow) continue;
    // Get function info
    const pgProcRow = await db
      .select("proname", "pronamespace", "proargnames")
      .from("pg_proc")
      .where("oid", pgTriggerRow.tgfoid)
      .first();
    let functionSchema = null;
    let functionName = null;
    let functionArgs: string[] = [];
    if (pgProcRow) {
      // Get schema name
      const ns = await db
        .select("nspname")
        .from("pg_namespace")
        .where("oid", pgProcRow.pronamespace)
        .first();
      functionSchema = ns ? ns.nspname : null;
      functionName = pgProcRow.proname;
      functionArgs = pgProcRow.proargnames || [];
    }
    // Get comment
    const commentRow = await db
      .select("description")
      .from("pg_description")
      .whereRaw(
        `objoid = (
          SELECT oid FROM pg_trigger
          WHERE tgname = ?
          AND tgrelid = (
            SELECT c.oid FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE c.relname = ? AND n.nspname = ?
          )
        )`,
        [triggerName, table.name, table.schemaName],
      )
      .first();
    // Enabled status
    // tgenabled: 'O' = enabled, 'D' = disabled
    const enabled = pgTriggerRow.tgenabled === "O";
    // Compose Trigger object
    triggers.push({
      name: triggerName,
      eventManipulation: triggerRows.map((r) => r.event_manipulation as any),
      actionTiming: first.action_timing as any,
      functionSchema: functionSchema || "",
      functionName: functionName || "",
      functionArgs,
      enabled,
      condition: first.action_condition,
      orientation: first.action_orientation as any,
      comment: commentRow ? commentRow.description : null,
      informationSchemaValue: first,
    });
  }

  return {
    ...table,
    indices,
    checks,
    informationSchemaValue,
    columns,
    ...rls,
    triggers,
  };
};

export default extractTable;
