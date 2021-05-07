import { Knex } from 'knex'; // import type
import parseComment from './parseComment';
import extractColumns from './extract-columns';
import parseViewDefinition from './parseViewDefinition';

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
    const name = view.viewname;
    const viewCommentQuery = await db.schema.raw(
      `SELECT obj_description('"${schemaName}"."${name}"'::regclass)`
    );
    const rawViewComment =
      viewCommentQuery.rows.length > 0 &&
      viewCommentQuery.rows[0].obj_description;

    const columns = await extractColumns(schemaName, name, db);

    const { comment, tags } = parseComment(rawViewComment);

    console.error('VIEW: ', name);
    // if (tags.inferColumnReferences) {
    const viewDefinitionQuery = await db.schema.raw(
      `select pg_get_viewdef('"${schemaName}"."${name}"', true)`
    );
    const viewDefinitionString = viewDefinitionQuery.rows[0].pg_get_viewdef;
    const originalColumns = await parseViewDefinition(viewDefinitionString);
    // }

    views.push({
      name,
      comment,
      tags,
      columns,
    });
  }
  return views;
}

export default extractViews;
