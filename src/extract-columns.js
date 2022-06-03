import * as R from 'ramda';

import parseComment from './parse-comment';

/**
 * @typedef {{ name: string, isPrimary: boolean }} Index
 * @typedef {{ [index: string]: string | boolean }} TagMap
 * @typedef {{ name: string, parent: string, indices: Index[], maxLength: number, nullable: boolean, defaultValue: any, isPrimary: boolean, type: string, comment: string, tags: TagMap, rawInfo: object }} Column
 */

/**
 * @param {string} schemaName
 * @param {string} tableOrViewName
 * @param {import('knex').Knex<any, unknown[]>} db
 * @returns {Promise<Column[]>}
 */
async function extractColumns(schemaName, tableOrViewName, db) {
  const dbColumns = await db
    .select(
      db.raw(
        `*, ('"' || "udt_schema" || '"."' || "udt_name" || '"')::regtype as regtype`
      )
    )
    .from('information_schema.columns')
    .where('table_schema', schemaName)
    .where('table_name', tableOrViewName);
  const relationsQuery = await db.schema.raw(`
SELECT
  att2.attname AS "column_name",
  con.confrelid :: regclass :: text as table_path,
  att.attname as column,
  con.confupdtype,
  con.confdeltype,
  concat_ws('.', cl.relname, att.attname) AS "parent"
FROM
  (
      SELECT
          unnest(con1.conkey) AS "parent",
          unnest(con1.confkey) AS "child",
          con1.confrelid,
          con1.conrelid,
          con1.conname,
          con1.confupdtype,
          con1.confdeltype
      FROM
          pg_class cl
          JOIN pg_namespace ns ON cl.relnamespace = ns.oid
          JOIN pg_constraint con1 ON con1.conrelid = cl.oid
      WHERE
          cl.relname = '${tableOrViewName}'
          AND ns.nspname = '${schemaName}'
          AND con1.contype = 'f'
  ) con
  JOIN pg_attribute att ON att.attrelid = con.confrelid
  AND att.attnum = con.child
  JOIN pg_class cl ON cl.oid = con.confrelid
  JOIN pg_attribute att2 ON att2.attrelid = con.conrelid
  AND att2.attnum = con.parent
  where cl.relispartition = false;
    `);
  const relationsMap = R.indexBy(R.prop('column_name'), relationsQuery.rows);
  const parentMap = R.pluck('parent', relationsMap);
  const referenceMap = R.map(
    ({ table_path, column, confupdtype, confdeltype }) => {
      let schema = schemaName;
      let table = table_path;
      if (table.indexOf('.') !== -1) {
        [schema, table] = table.split('.');
      }

      const updateActionMap = {
        a: 'NO ACTION',
        r: 'RESTRICT',
        c: 'CASCADE',
        n: 'SET NULL',
        d: 'SET DEFAULT',
      };

      const trim = (s) => s.replace(/^"(.*)"$/, '$1');

      return {
        schema: trim(schema),
        table: trim(table),
        column: trim(column),
        onDelete: updateActionMap[confupdtype],
        onUpdate: updateActionMap[confdeltype],
      };
    },
    relationsMap
  );

  const indexQuery = await db.schema.raw(`
      SELECT i.relname as index_name, ix.indisprimary as is_primary, a.attname as column_name
      FROM pg_class t, pg_class i, pg_index ix, pg_attribute a
      WHERE
        t.oid = ix.indrelid and i.oid = ix.indexrelid
        and a.attrelid = t.oid and a.attnum = ANY(ix.indkey)
        and t.relkind = 'r' and t.relname = '${tableOrViewName}'
      ORDER BY t.relname, i.relname;
    `);
  const indexMap = R.reduce(
    (acc, elem) => {
      const columnName = elem['column_name'];
      acc[columnName] = [
        ...(acc[columnName] || []),
        { name: elem.index_name, isPrimary: elem.is_primary },
      ];
      return acc;
    },
    {},
    indexQuery.rows
  );
  const commentsQuery = await db.schema.raw(`
      SELECT cols.column_name, pg_catalog.col_description(c.oid, cols.ordinal_position::int)
      FROM pg_catalog.pg_class c, information_schema.columns cols
      WHERE cols.table_schema = '${schemaName}' AND cols.table_name = '${tableOrViewName}' AND cols.table_name = c.relname;
    `);
  const commentMap = R.pluck(
    'col_description',
    R.indexBy(R.prop('column_name'), commentsQuery.rows)
  );

  const columns = R.map(
    /** @returns {Column} */
    (column) => ({
      name: column.column_name,
      parent: parentMap[column.column_name],
      reference: referenceMap[column.column_name],
      indices: indexMap[column.column_name] || [],
      maxLength: column.character_maximum_length,
      nullable: column.is_nullable === 'YES',
      defaultValue: column.column_default,
      isArray: column.data_type === 'ARRAY',
      subType:
        column.data_type === 'ARRAY'
          ? column.udt_name.slice(1)
          : column.udt_name,
      isPrimary: Boolean(
        R.find(R.prop('isPrimary'), indexMap[column.column_name] || [])
      ),
      isIdentity: column.is_identity === 'YES',
      generated:
        column.is_identity === 'YES'
          ? column.identity_generation
          : column.is_generated,
      isUpdatable: column.is_updatable === 'YES',
      type: column.data_type === 'ARRAY' ? column.regtype : column.udt_name,
      ...parseComment(commentMap[column.column_name]),
      rawInfo: column,
    }),
    dbColumns
  );

  return columns;
}

export default extractColumns;
