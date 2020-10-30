import Knex from 'knex'; // import type
import R from 'ramda';
import extractTables from './extract-tables';
import extractTypes from './extract-types';
import extractViews from './extract-views';

/**
 * @param {string} schemaName
 * @param {Knex} db
 * @returns {Promise<import('./types').Schema>}
 */
export async function extractSchema(schemaName, db) {
  const tables = await extractTables(schemaName, db);
  const views = await extractViews(schemaName, db);
  const types = await extractTypes(schemaName, db);
  db.destroy();

  return {
    tables: R.sortBy(R.prop('name'), tables),
    views: R.sortBy(R.prop('name'), views),
    types: R.sortBy(R.prop('name'), types),
  };
}
