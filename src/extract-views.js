import { Knex } from 'knex'; // import type
import parseComment from './parseComment';
import extractColumns from './extract-columns';

/**
 * @param {string} schemaName
 * @param {Knex<any, unknown[]>} db
 * @returns {Promise<import('./types').TableOrView[]>}
 */
async function extractViews(schemaName, db) {
  /** @type {import('./types').TableOrView[]} */
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

export default extractViews;
