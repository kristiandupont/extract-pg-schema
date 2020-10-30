import Knex from 'knex'; // import type
import extractColumns from './extract-columns';
import parseComment from './parseComment';

/**
 * @param {string} schemaName
 * @param {Knex} db
 * @returns {Promise<import('./types').TableOrView[]>}
 */
async function extractTables(schemaName, db) {
  /** @type {import('./types').TableOrView[]} */
  const tables = [];
  const dbTables = await db
    .select('tablename')
    .from('pg_catalog.pg_tables')
    .where('schemaname', schemaName);

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

export default extractTables;
