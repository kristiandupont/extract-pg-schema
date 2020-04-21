const R = require('ramda');

/**
 * @typedef {any} Knex
 * @typedef {{ name: string, isPrimary: boolean }} Index
 * @typedef {{ [index: string]: string | boolean }} TagMap
 * @typedef {{ name: string, parent: string, indices: Index[], nullable: boolean, defaultValue: any, isPrimary: boolean, type: string, comment: string, tags: TagMap }} Column
 * @typedef {{ name: string, columns: Column[], comment: string, tags: TagMap }} Table
 * @typedef {{ name: string, columns: Column[], comment: string, tags: TagMap }} View
 * @typedef {{ name: string, type: string, values: string[], comment: string, tags: TagMap }} Type
 */

/**
 * Parse a possibly tagges string.
 * Example: "This is a comment that has tags @a and @b:123"
 * returns: { comment: "This is a comment that has tags", tags: { a: true, b: '123' }}
 * @param {string} source
 * @returns {{ comment?: string, tags: TagMap }}
 */
const parseComment = source => {
  if (!source) {
    return { comment: undefined, tags: {} };
  }

  const matches = source.match(/(@(\S*))/g) || [];
  const tags = R.fromPairs(
    R.map(
      tag =>
        tag.indexOf(':') === -1
          ? [tag.substr(1), true]
          : tag.substr(1).split(':'),
      matches
    )
  );
  const comment = R.reduce(
    (acc, match) => acc.replace(match, ''),
    source,
    matches
  ).trim();

  return {
    comment,
    tags,
  };
};

/**
 * @param {string} schemaName
 * @param {string} tableOrViewName
 * @param {Knex} db
 * @returns {Promise<Column[]>}
 */
async function extractColumns(schemaName, tableOrViewName, db) {
  const dbColumns = await db
    .select('*')
    .from('information_schema.columns')
    .where('table_schema', schemaName)
    .where('table_name', tableOrViewName);
  const relationsQuery = await db.schema.raw(`
      SELECT att2.attname AS "column_name", concat_ws('.', cl.relname, att.attname) AS "parent"
      FROM (
          SELECT
              unnest(con1.conkey) AS "parent",
              unnest(con1.confkey) AS "child",
              con1.confrelid,
              con1.conrelid,
              con1.conname
          FROM
              pg_class cl
              JOIN pg_namespace ns ON cl.relnamespace = ns.oid
              JOIN pg_constraint con1 ON con1.conrelid = cl.oid
          WHERE
              cl.relname = '${tableOrViewName}'
              AND ns.nspname = '${schemaName}'
              AND con1.contype = 'f') con
          JOIN pg_attribute att ON att.attrelid = con.confrelid
          AND att.attnum = con.child
          JOIN pg_class cl ON cl.oid = con.confrelid
          JOIN pg_attribute att2 ON att2.attrelid = con.conrelid
          AND att2.attnum = con.parent
    `);
  const relationsMap = R.pluck(
    'parent',
    R.indexBy(R.prop('column_name'), relationsQuery.rows)
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
    column => ({
      name: column.column_name,
      parent: relationsMap[column.column_name],
      indices: indexMap[column.column_name] || [],
      maxLength: column.character_maximum_length,
      nullable: column.is_nullable === 'YES',
      defaultValue: column.column_default,
      isPrimary: !!R.find(
        R.prop('isPrimary'),
        indexMap[column.column_name] || []
      ),
      type: column.udt_name,
      rawInfo: column,
      ...parseComment(commentMap[column.column_name]),
    }),
    dbColumns
  );

  return columns;
}

/**
 * @param {string} schemaName
 * @param {Knex} db
 * @returns {Promise<Table[]>}
 */
async function extractTables(schemaName, db) {
  /** @type {Table[]} */
  const tables = [];
  const dbTables = await db
    .select('tablename')
    .from('pg_catalog.pg_tables')
    .where('schemaname', schemaName)

  for (const table of dbTables) {
    const tableName = table.tablename;
    const tableCommentQuery = await db.schema.raw(
      `SELECT obj_description('"${schemaName}"."${tableName}"'::regclass)`
    );
    const rawTableComment =
      tableCommentQuery.rows.length > 0 &&
      tableCommentQuery.rows[0].obj_description;

    const columns = await extractColumns(schemaName, tableName, db);

    tables.push({
      name: tableName,
      ...parseComment(rawTableComment),
      columns,
    });
  }

  return tables;
}

/**
 * @param {string} schemaName
 * @param {Knex} db
 * @returns {Promise<View[]>}
 */
async function extractViews(schemaName, db) {
  /** @type {View[]} */
  const views = [];
  const dbViews = await db
    .select('viewname')
    .from('pg_catalog.pg_views')
    .where('schemaname', schemaName);

  for (const view of dbViews) {
    const viewName = view.viewname;
    const viewCommentQuery = await db.schema.raw(
      `SELECT obj_description('"${schemaName}"."${viewName}"'::regclass)`
    );
    const rawViewComment =
      viewCommentQuery.rows.length > 0 &&
      viewCommentQuery.rows[0].obj_description;

    const columns = await extractColumns(schemaName, viewName, db);

    views.push({
      name: viewName,
      ...parseComment(rawViewComment),
      columns,
    });
  }
  return views;
}

/**
 * @param {Knex} db
 * @returns {Promise<Type[]>}
 */
async function extractTypes(db) {
  /** @type {Type[]} */
  const types = [];
  const enumTypes = await db
    .select(['oid', 'typname'])
    .from('pg_type')
    .where('typtype', 'e');
  for (const enumType of enumTypes) {
    const typeCommentQuery = await db.schema.raw(
      `SELECT obj_description(${enumType.oid})`
    );
    const rawTypeComment =
      typeCommentQuery.rows.length > 0 &&
      typeCommentQuery.rows[0].obj_description;
    const values = await db
      .select(['enumlabel', 'enumsortorder'])
      .from('pg_enum')
      .where('enumtypid', enumType.oid);
    types.push({
      type: 'enum',
      name: enumType.typname,
      ...parseComment(rawTypeComment),
      values: R.pluck('enumlabel', R.sortBy(R.prop('enumsortorder'), values)),
    });
  }

  return types;
}

/**
 * @param {string} schemaName
 * @param {Knex} db
 * @returns {Promise<{ tables: Table[], views: View[], types: Type[] }>}
 */
async function extractSchema(schemaName, db) {
  const tables = await extractTables(schemaName, db);
  const views = await extractViews(schemaName, db);
  const types = await extractTypes(db);
  db.destroy();

  return {
    tables: R.sortBy(R.prop('name'), tables),
    views: R.sortBy(R.prop('name'), views),
    types: R.sortBy(R.prop('name'), types),
  };
}

exports.extractSchema = extractSchema;
